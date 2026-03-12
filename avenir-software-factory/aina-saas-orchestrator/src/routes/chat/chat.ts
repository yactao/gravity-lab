import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../lib/db";
import { enqueueTask, getChannel, responseHandlers } from "../../services/broker";
import { requireAuth, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

// Endpoint pour simuler l'envoi d'un message RAG (Aïna DOC)
router.post("/rag", async (req: Request, res: Response) => {
  try {
    const { question, top_k, conversation_id } = req.body;
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;
    const userId = (req as AuthenticatedRequest).user!.id;
    const convId = conversation_id || uuidv4();

    console.log(
      `[Orchestrator] Message RAG reçu pour la conversation: ${convId}`,
    );
    console.log(`[Orchestrator] Question: ${question}`);

    // Sauvegarder la question de l'utilisateur
    await prisma.chatEvent.create({
      data: {
        conversationId: convId,
        tenantId: tenantId,
        userId: userId,
        role: "user",
        route: "rag",
        message: question,
        meta: JSON.stringify({ top_k }),
      },
    });

    // Envoyer la tâche à RabbitMQ - Le worker RAG écoutera sur `agent_rag_queue`
    const correlationId = await enqueueTask("agent_rag_queue", {
      conversation_id: convId,
      question,
      tenant_id: tenantId,
      top_k: top_k || 3,
      authorization_header: req.headers.authorization // transmit token to python
    });

    // 🟢 ATTENDRE LA RÉPONSE DE RABBITMQ (Mode Synchrone / Proxy)
    // Créer une promesse qui se résout quand on reçoit la réponse avec le bon correlationId
    const responseData = await new Promise<any>((resolve, reject) => {
      // Timeout de 60 secondes pour éviter de bloquer indéfiniment
      const timeout = setTimeout(() => {
        responseHandlers.delete(correlationId); // Clean up on timeout
        reject(new Error("Timeout d'attente de la réponse de l'agent."));
      }, 60000);

      responseHandlers.set(correlationId, (msg) => {
        clearTimeout(timeout);
        resolve(JSON.parse(msg.content.toString()));
      });
    });

    // Le Worker a DÉJÀ enregistré la réponse dans la BDD Orchestrateur !
    // Il suffit de la relayer au client React Frontend :
    res.status(200).json(responseData.data);
  } catch (error) {
    console.error("Erreur post /rag", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Endpoint pour envoyer un message au devWorker (Aïna Dev / Lead Tech)
router.post("/dev", async (req: Request, res: Response) => {
  try {
    const { question, conversation_id, moduleName } = req.body;
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;
    const userId = (req as AuthenticatedRequest).user!.id;
    const convId = conversation_id || uuidv4();

    console.log(
      `[Orchestrator] Message Dev (Lead Tech) reçu pour la conversation: ${convId}, agent: ${moduleName}`,
    );
    console.log(`[Orchestrator] Question: ${question}`);

    await prisma.chatEvent.create({
      data: {
        conversationId: convId,
        tenantId: tenantId,
        userId: userId,
        role: "user",
        route: "dev",
        message: question,
      },
    });

    const correlationId = await enqueueTask("agent_leadtech_queue", {
      conversation_id: convId,
      question,
      module_name: moduleName,
      tenant_id: tenantId,
      authorization_header: req.headers.authorization
    });

    const responseData = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        responseHandlers.delete(correlationId);
        reject(new Error("Timeout d'attente de la réponse de l'agent Lead Tech."));
      }, 120000); // 2 minutes just in case SLM is slow

      responseHandlers.set(correlationId, (msg) => {
        clearTimeout(timeout);
        resolve(JSON.parse(msg.content.toString()));
      });
    });

    res.status(200).json(responseData.data);
  } catch (error) {
    console.error("Erreur post /dev", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Endpoint pour l'historique d'une conversation (DB réelle via Prisma)
router.get("/history", async (req: Request, res: Response) => {
  try {
    let { conversation_id } = req.query;
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;

    if (!conversation_id) {
      res.status(400).json({ error: "conversation_id manquant" });
      return;
    }

    console.log(
      `[Orchestrator] Récupération de l'historique de la DB pour: ${conversation_id}`,
    );

    const history = await prisma.chatEvent.findMany({
      where: {
        conversationId: String(conversation_id),
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        route: true,
        message: true,
        createdAt: true,
        meta: true,
      },
    });

    const messages = history.map((item: any) => ({
      role: item.role,
      route: item.route,
      message: item.message,
      timestamp_utc: item.createdAt.toISOString(),
      meta: item.meta ? JSON.parse(item.meta as string) : null,
    }));

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Erreur history:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste des conversations selon une route depuis la base
router.get("/list/:routeName", async (req: Request, res: Response) => {
  try {
    const { routeName } = req.params;
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;

    console.log(
      `[Orchestrator] Liste (DB) des conversations pour route: ${routeName}`,
    );

    const distinctConversations = await prisma.chatEvent.findMany({
      where: {
        route: String(routeName),
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["conversationId"],
      select: {
        conversationId: true,
        message: true,
        createdAt: true,
      },
    });

    const conversations = distinctConversations.map((c: any) => ({
      conversation_id: c.conversationId,
      title: c.message.substring(0, 30) + (c.message.length > 30 ? "..." : ""),
      last_activity_utc: c.createdAt.toISOString(),
      last_route: routeName,
    }));

    res.status(200).json({ conversations });
  } catch (error) {
    console.error("Erreur list", error);
    res.status(500).json({ error: "Erreur métier" });
  }
});

// Suppression d'une conversation (DB réelle via Prisma)
router.delete("/clear", async (req: Request, res: Response) => {
  try {
    const { conversation_id } = req.query;
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;
    console.log(
      `[Orchestrator] Suppression de la conversation en DB: ${conversation_id}`,
    );

    await prisma.chatEvent.deleteMany({
      where: {
        conversationId: String(conversation_id),
        tenantId: tenantId,
      },
    });

    res.status(200).json({ deleted: true });
  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ error: "Erreur de suppression" });
  }
});

// Suppression de toutes les conversations d'une route (DB réelle via Prisma)
router.delete("/clear-all/:routeName", async (req: Request, res: Response) => {
  try {
    const { routeName } = req.params;
    const tenantId = (req as AuthenticatedRequest).user!.tenantId;

    console.log(
      `[Orchestrator] Suppression DB toutes conversations de: ${routeName}`,
    );

    const result = await prisma.chatEvent.deleteMany({
      where: {
        route: String(routeName),
        tenantId: tenantId,
      },
    });

    res
      .status(200)
      .json({ deleted: true, route: routeName, items: result.count });
  } catch (error) {
    console.error("Erreur suppression de masse:", error);
    res.status(500).json({ error: "Erreur de suppression" });
  }
});

export default router;
