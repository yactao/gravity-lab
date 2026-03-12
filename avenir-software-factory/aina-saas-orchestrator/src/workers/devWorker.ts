import { getChannel } from "../services/broker";
import { prisma } from "../lib/db";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { z } from "zod";

// On simule une URL d'API SLM (ex: Ollama local, Mistral 7B)
const API_BASE = process.env.SLM_API_BASE || "https://api.mistral.ai/v1/chat/completions";

export const startDevWorker = async () => {
    const channel = getChannel();
    if (!channel) {
        console.error(
            "[Worker Dev] ❌ RabbitMQ channel non disponible. Worker non démarré.",
        );
        return;
    }

    const queueName = "agent_leadtech_queue";
    await channel.assertQueue(queueName, { durable: true });

    console.log(`[Worker Dev] 🎧 En écoute sur la file: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            // 🏗️ [LEAD TECH FIX] Blocage des Crashs Silencieux (Schemas Zod)
            const payloadSchema = z.object({
                conversation_id: z.string().uuid().or(z.string()),
                question: z.string().min(1),
                tenant_id: z.string(),
                authorization_header: z.string().optional(),
                module_name: z.string().optional()
            }).passthrough();

            let payload;
            try {
                payload = payloadSchema.parse(JSON.parse(msg.content.toString()));
            } catch (validationErr) {
                console.error(`[Worker Dev] ❌ Rejet de message corrompu (Zod Validation Error) :`, validationErr);
                channel.ack(msg); // Acquittance forcée pour sortir de la file
                return;
            }

            console.log(`[Worker Dev] 📥 Tâche reçue:`, payload);

            const { conversation_id, question, tenant_id, authorization_header, module_name } = payload;

            const lastUserMessage = await prisma.chatEvent.findFirst({
                where: { conversationId: conversation_id, role: "user" },
                orderBy: { createdAt: "desc" },
            });
            const userId =
                lastUserMessage?.userId || "0b820766-9a83-4d16-b84b-ac8643986f75"; // fallback

            const simulate_ai = process.env.SIMULATE_AI === "true";

            // 1. Lire dynamiquement les instructions du fichier
            let systemPrompt = "Tu es un assistant tech.";
            try {
                // Utilisation d'un répertoire métier sécurisé localement au backend
                const agentsDir = process.env.AGENTS_CONTEXT_DIR || path.resolve(__dirname, "../../agents");
                const agentMap: Record<string, string> = {
                    "Aïna Architecte & PO": "core-architect.md",
                    "Aïna Clean Coder": "core-coder.md",
                    "Aïna Pentester": "cyber-red-team.md",
                    "Aïna CISO": "cyber-ciso.md",
                    "Aïna FinOps Lead": "core-researcher.md", // placeholder until finops md exists
                    "Aïna Data Engineer": "core-coder.md", // placeholder
                };
                const requestedFile = module_name ? (agentMap[module_name] || "aina-frugal-expert.md") : "aina-frugal-expert.md"; 
                const promptPath = path.join(agentsDir, requestedFile);
                
                // Sécurité : Vérifier que le chemin résolu reste strictement dans le dossier agentsDir (Sandbox IO)
                if (promptPath.startsWith(agentsDir) && fs.existsSync(promptPath)) {
                    systemPrompt = fs.readFileSync(promptPath, "utf-8");
                    console.log(`[Worker Dev] 📄 Prompt système chargé depuis ${requestedFile}`);
                } else {
                    console.log(`[Worker Dev] ⚠️ Fichier ${requestedFile} introuvable ou chemin illégal : ${promptPath}`);
                }
            } catch (err) {
                console.error("[Worker Dev] Erreur lors de la lecture du prompt:", err);
            }

            // 🛡️ [CISO FIX] Bypass d'Autorisation (Facturation) colmaté !
            if (!authorization_header) {
                console.warn(`[Worker Dev] ❌ Accès Refusé : Header d'autorisation manquant pour conv: ${conversation_id}`);
                channel.sendToQueue(
                    msg.properties.replyTo || "saas_orchestrator_responses",
                    Buffer.from(JSON.stringify({
                        status: "error",
                        conversation_id,
                        error: "Unauthorized: Missing Authorization Header"
                    })),
                    { correlationId: msg.properties.correlationId }
                );
                channel.ack(msg);
                return;
            }

            if (simulate_ai || authorization_header === "Bearer mock-token") {
                console.log(`[Worker Dev] ⚠️ Mode Simulation IA activé. Génération de la réponse mock pour conv: ${conversation_id}...`);

                await new Promise(resolve => setTimeout(resolve, 1500));

                const mockResponseData = {
                    answer: `[Mode Simulation Dev] Injection du system prompt réussie. Voici une analyse de code simulée selon les guidelines frugales.`,
                    used_docs: [],
                    model: "Aïna Dev Mock Worker (SLM Simulé)"
                };

                // Enregistrer la réponse dans la base de données
                await prisma.chatEvent.create({
                    data: {
                        conversationId: conversation_id,
                        tenantId: tenant_id,
                        userId: userId,
                        role: "assistant",
                        route: "dev",
                        message: mockResponseData.answer,
                        meta: JSON.stringify({
                            used_docs: mockResponseData.used_docs,
                            model: mockResponseData.model,
                        }),
                    },
                });

                console.log(`[Worker Dev] 💾 Réponse mock enregistrée en base SaaS pour: ${conversation_id}`);

                channel.sendToQueue(
                    msg.properties.replyTo || "saas_orchestrator_responses",
                    Buffer.from(JSON.stringify({
                        status: "success",
                        conversation_id,
                        data: mockResponseData,
                    })),
                    { correlationId: msg.properties.correlationId },
                );
                channel.ack(msg);
                return;
            }

            console.log(`[Worker Dev] 🚀 Envoi de la requête au SLM pour conv: ${conversation_id}...`);

            let apiResponse;
            // 🏗️ [LEAD TECH FIX] Tolérance aux Pannes SLM (AbortController Timeout)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 110000); // Timeout = 1min50s

            const LLM_API_KEY = process.env.MISTRAL_API_KEY || process.env.OPENAI_API_KEY || "";

            try {
                apiResponse = await fetch(API_BASE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${LLM_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: process.env.SLM_MODEL || "mistral-small-latest",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: question }
                        ]
                    }),
                    signal: controller.signal as any
                });
                clearTimeout(timeoutId);
            } catch (fetchErr: any) {
                clearTimeout(timeoutId);
                console.error(`[Worker Dev] ❌ Timeout / Erreur de Connexion SLM :`, fetchErr);
                channel.sendToQueue(
                    msg.properties.replyTo || "saas_orchestrator_responses",
                    Buffer.from(JSON.stringify({
                        status: "error",
                        conversation_id,
                        error: "SLM API injoignable ou timeout d'exécution dépassé."
                    })),
                    { correlationId: msg.properties.correlationId }
                );
                channel.ack(msg);
                return;
            }

            let responseData: any;

            if (!apiResponse.ok) {
                console.error(`[Worker Dev] ❌ Erreur API SLM: ${apiResponse.status} ${apiResponse.statusText}`);
                responseData = {
                    answer: `Une erreur (${apiResponse.status}) est survenue lors de l'appel au modèle SLM.`,
                    used_docs: [],
                    model: "Aïna Dev Error"
                };
            } else {
                const rawJson = await apiResponse.json() as any;
                const responseContent = rawJson.choices?.[0]?.message?.content || rawJson.response || "Reponse vide du SLM";
                responseData = {
                    answer: responseContent,
                    used_docs: [],
                    model: rawJson.model || "Mistral 7B (API)"
                };
                console.log(`[Worker Dev] ✅ Réponse du SLM reçue avec succès.`);
            }

            await prisma.chatEvent.create({
                data: {
                    conversationId: conversation_id,
                    tenantId: tenant_id,
                    userId: userId,
                    role: "assistant",
                    route: "dev",
                    message: responseData.answer,
                    meta: JSON.stringify({
                        used_docs: responseData.used_docs,
                        model: responseData.model,
                    }),
                },
            });

            console.log(`[Worker Dev] 💾 Réponse enregistrée en base SaaS pour: ${conversation_id}`);

            channel.sendToQueue(
                msg.properties.replyTo || "saas_orchestrator_responses",
                Buffer.from(
                    JSON.stringify({
                        status: "success",
                        conversation_id,
                        data: responseData,
                    }),
                ),
                { correlationId: msg.properties.correlationId },
            );

            channel.ack(msg);
        } catch (error) {
            console.error("[Worker Dev] ❌ Erreur critique lors du traitement de la tâche:", error);
            channel.ack(msg);
        }
    });
};
