import { getChannel } from "../services/broker";
import { prisma } from "../lib/db";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { z } from "zod";

// On simule une URL d'API SLM (ex: Ollama local, Mistral 7B)
const API_BASE = process.env.SLM_API_BASE || "http://localhost:11434/api/generate";

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
                authorization_header: z.string().optional()
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

            const { conversation_id, question, tenant_id, authorization_header } = payload;

            const lastUserMessage = await prisma.chatEvent.findFirst({
                where: { conversationId: conversation_id, role: "user" },
                orderBy: { createdAt: "desc" },
            });
            const userId =
                lastUserMessage?.userId || "0b820766-9a83-4d16-b84b-ac8643986f75"; // fallback

            const simulate_ai = process.env.SIMULATE_AI === "true";

            // 1. Lire dynamiquement les instructions du fichier .agents/contexts/aina-frugal-expert.md
            let systemPrompt = "Tu es un assistant tech.";
            try {
                // 🛡️ [CISO FIX] Path Traversal colmaté ! 
                // Utilisation d'un répertoire métier sécurisé ou fallback.
                const agentsDir = process.env.AGENTS_CONTEXT_DIR || path.resolve(__dirname, "../../../../../.agents/contexts");
                const requestedFile = "aina-frugal-expert.md"; 
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

            try {
                apiResponse = await fetch(API_BASE, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authorization_header ? { Authorization: authorization_header } : {}),
                    },
                    body: JSON.stringify({
                        model: "mistral",
                        prompt: `${systemPrompt}\n\nUser Question: ${question}`,
                        stream: false
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
                responseData = {
                    answer: rawJson.response || "Reponse vide du SLM",
                    used_docs: [],
                    model: rawJson.model || "Mistral 7B (SLM Local)"
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
