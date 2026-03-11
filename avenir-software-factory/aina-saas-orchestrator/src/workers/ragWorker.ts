import { getChannel } from "../services/broker";
import { prisma } from "../lib/db";
import fetch from "node-fetch";

const API_BASE = process.env.PYTHON_API_BASE || "https://app-rag-its-new2.azurewebsites.net"; // L'API Python Aïna

export const startRagWorker = async () => {
  const channel = getChannel();
  if (!channel) {
    console.error(
      "[Worker RAG] ❌ RabbitMQ channel non disponible. Worker non démarré.",
    );
    return;
  }

  const queueName = "agent_rag_queue";
  await channel.assertQueue(queueName, { durable: true });

  console.log(`[Worker RAG] 🎧 En écoute sur la file: ${queueName}`);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      console.log(`[Worker RAG] 📥 Tâche reçue:`, payload);

      const { conversation_id, question, tenant_id, top_k, authorization_header } = payload;

      // On retrouve l'utilisateur lié à cette conversation (le dernier qui a posé une question)
      // Ceci est nécessaire pour l'enregistrer dans prisma. Alternativement, le payload de MQ aurait pu contenir userId.
      const lastUserMessage = await prisma.chatEvent.findFirst({
        where: { conversationId: conversation_id, role: "user" },
        orderBy: { createdAt: "desc" },
      });
      const userId =
        lastUserMessage?.userId || "0b820766-9a83-4d16-b84b-ac8643986f75"; // fallback

      // Si le backend Python n'a pas encore toutes ses clés locales (.env) ou qu'on force la démo :
      const simulate_ai = process.env.SIMULATE_AI === "true";

      if (simulate_ai || authorization_header === "Bearer mock-token" || !authorization_header) {
        console.log(`[Worker RAG] ⚠️ Mode Simulation IA activé. Génération de la réponse mock pour conv: ${conversation_id}...`);

        // Simuler un léger délai réseau
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResponseData = {
          answer: `[Mode Simulation IA activé] Identité vérifiée avec succès (JWT SaaS Auth). La vraie question transmise à l'Orchestrateur était : "${question}".`,
          used_docs: [{ title: "Mock Document Cloud", path: "https://mock.azure.storage/file.pdf" }],
          model: "Aïna RAG Mock Worker"
        };

        // 2. Enregistrer la réponse dans la base de données de l'Orchestrateur SaaS
        await prisma.chatEvent.create({
          data: {
            conversationId: conversation_id,
            tenantId: tenant_id,
            userId: userId,
            role: "assistant",
            route: "rag",
            message: mockResponseData.answer,
            meta: JSON.stringify({
              used_docs: mockResponseData.used_docs,
              model: mockResponseData.model,
            }),
          },
        });

        console.log(`[Worker RAG] 💾 Réponse mock enregistrée en base SaaS pour: ${conversation_id}`);

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

      console.log(
        `[Worker RAG] 🚀 Envoi de la requête à l'API Python pour conv: ${conversation_id}...`,
      );

      const apiResponse = await fetch(`${API_BASE}/api/rag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authorization_header ? { Authorization: authorization_header } : {}),
        },
        body: JSON.stringify({
          question,
          top_k: top_k || 3,
          conversation_id,
        }),
      });

      let responseData: any;

      if (!apiResponse.ok) {
        if (apiResponse.status === 401) {
          console.error(`[Worker RAG] ❌ API Python a refusé le token (401 Unauthorized).`);
          responseData = {
            answer: "Je suis désolé, je n'ai pas pu vous authentifier auprès du système d'analyse RAG. Votre session a peut-être expiré, ou vous êtes connecté en mode développement avec un faux jeton. Veuillez vous reconnecter.",
            used_docs: [],
            model: "Aïna RAG Error"
          };
        } else {
          console.error(`[Worker RAG] ❌ Erreur API Python: ${apiResponse.status} ${apiResponse.statusText}`);
          responseData = {
            answer: `Une erreur (${apiResponse.status}) est survenue lors de l'appel à l'agent Aïna DOC.`,
            used_docs: [],
            model: "Aïna RAG Error"
          };
        }
      } else {
        responseData = (await apiResponse.json()) as any;
        console.log(`[Worker RAG] ✅ Réponse de l'API Python reçue avec succès.`);
      }

      // 2. Enregistrer la réponse dans la base de données de l'Orchestrateur SaaS
      await prisma.chatEvent.create({
        data: {
          conversationId: conversation_id,
          tenantId: tenant_id,
          userId: userId,
          role: "assistant",
          route: "rag",
          message: responseData.answer,
          meta: JSON.stringify({
            used_docs: responseData.used_docs,
            model: responseData.model,
          }),
        },
      });

      console.log(
        `[Worker RAG] 💾 Réponse enregistrée en base SaaS pour: ${conversation_id}`,
      );

      // 3. (Optionnel) Envoyer un message de notification dans 'saas_orchestrator_responses'
      // pour que l'orchestrateur déclenche un événement SSE au client
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

      // Acknoledge (acquitter) la tâche car elle est traitée (même en erreur fonctionnelle)
      channel.ack(msg);
    } catch (error) {
      console.error(
        "[Worker RAG] ❌ Erreur critique lors du traitement de la tâche:",
        error,
      );
      // ACK the message to prevent mock-amqplib from crashing the whole backend due to deadLetter bug on nack
      channel.ack(msg);
    }
  });
};
