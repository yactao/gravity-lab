import { v4 as uuidv4 } from "uuid";
import amqp from "amqplib";
const mockAmqp = require("mock-amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
export const getChannel = () => channel;

export const connectRabbitMQ = async () => {
    try {
        const conn = await amqp.connect(RABBITMQ_URL);
        connection = conn as any;
        channel = await conn.createChannel();
        console.log("[Broker] 🐰 Connecté à RabbitMQ");

        // Assurez-vous que la queue d'orchestration de réponses existe
        await channel.assertQueue("saas_orchestrator_responses", { durable: true });

    } catch (error) {
        console.log("[Broker] ⚠️ RabbitMQ non disponible localement. Utilisation d'un mock en mémoire (mock-amqplib).");
        const conn = await mockAmqp.connect(RABBITMQ_URL);
        connection = conn as any;
        channel = await conn.createChannel();
        await channel?.assertQueue("saas_orchestrator_responses", { durable: true });
    }

    // Set up a single persistent listener for returning RAG tasks
    if (channel) {
        channel.consume("saas_orchestrator_responses", (msg) => {
            if (!msg) return;
            const corrId = msg.properties.correlationId;
            if (corrId && responseHandlers.has(corrId)) {
                channel?.ack(msg);
                const handler = responseHandlers.get(corrId);
                if (handler) handler(msg);
                responseHandlers.delete(corrId);
            } else {
                // We acknowledge unmapped messages to prevent queue blocking locally
                channel?.ack(msg);
            }
        });
    }
};

export const responseHandlers = new Map<string, (msg: any) => void>();

export const enqueueTask = async (queueName: string, payload: any): Promise<string> => {
    if (!channel) {
        throw new Error("RabbitMQ channel not initialized");
    }
    const correlationId = uuidv4();

    // On s'assure que la queue du worker existe
    await channel.assertQueue(queueName, { durable: true });

    // Envoi du message avec un id de corrélation et l'indication de la queue de réponse
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
        correlationId,
        replyTo: "saas_orchestrator_responses"
    });

    // 🏗️ [LEAD TECH FIX] Memory Leak Colmaté : Nettoyage automatique du cache (Timeout: 120s)
    setTimeout(() => {
        if (responseHandlers.has(correlationId)) {
            console.warn(`[Broker] ⚠️ Timeout (120s) atteint pour JobId: ${correlationId}. Suppression du handler pour éviter un Memory Leak (OOM).`);
            responseHandlers.delete(correlationId);
        }
    }, 120000);

    console.log(`[Broker] 📤 Tâche envoyée dans la file: ${queueName} [JobId: ${correlationId}]`);
    return correlationId;
};
