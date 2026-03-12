"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { askRagQuestion } from "../../service/ragService";
import Header from "../../components/Header/Header";
import ChatMsg from "../../components/chat/ChatMsg";
import ChatPreviewModal from "../../components/chat/ChatPreviewModal";
import ChatInput from "../../components/chat/ChatInput";
import { TypedText } from "../../utils/FormattedAnswer";
import FrugalHUD from "../../components/chat/FrugalHUD";
import {
  agentRouteMap,
  chatService,
  type Conversation,
} from "../../service/chatService";
import { askSearchQuestion } from "../../service/searchService";
import { askTradingQuestion } from "../../service/tradingService";

import AnimatedPrism from "../../utils/AnimatedPrism";
import {
  askVisionQuestion,
  cleanupVisionFile,
  getAnnotatedImageFromSAS,
  saveVisionAnnotations,
  type VisionAnnotation,
  type VisionBBox,
  type VisionEditSavePayload,
} from "../../service/visionService";
import { askPlaqueQuestion } from "../../service/plaqueService";
import { askDevQuestion } from "../../service/devService";
import { useNavigate } from "react-router-dom";

import { getPreviewUrl } from "../../service/previewService";
import { askFinanceQuestion } from "../../service/financeService";
import ToolsButton from "../../components/tools/ToolsButton";
import ToolsSidebar from "../../components/tools/ToolsSidebar";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import ChatTour from "../../components/Guide/ChatTour";
import { Check, Copy, X } from "lucide-react";
import VisionEditModal from "../../components/chat/VisionEditModal";

/** --- Types --- */
export type Message = {

  text: string;
  isUser: boolean;
  sources?: { title: string; path: string }[];
  file?: File;
  rows?: Record<string, any>[];
  timestamp?: string;
  agent?: AgentType;
  // Vision
  surfaces?: Record<string, number>;
  perimeters?: Record<string, number>;
  detections?: Array<{
    tag_name: string;
    probability: number;
    bounding_box?: any;
  }>;
  annotations?: VisionAnnotation[];
  annotations_version?: number;
  annotated_image_b64?: string | null;
  vision_file_path?: string;
  vision_annotated_blob_path?: string;
  vision_annotated_sas?: string;

  // Aïna DOC images
  images?: string[];

  // Aïna Finance chart
  chart?: FinanceChart;
  model?: string;
};

type AgentType =
  | "doc"
  | "finance"
  | "search"
  | "trading"
  | "vision"
  | "plaques"
  | "dev";
// Types pour les graphs Aïna Finance
export type ChartType =
  | "bar"
  | "horizontal_bar"
  | "line"
  | "pie"
  | "bubble"
  | "none";

export type ChartPoint = {
  x: string;
  y: number;
};

export type ChartSeries = {
  label: string;
  points: ChartPoint[];
};

export type FinanceChart = {
  type: ChartType;
  title?: string;
  x_label?: string;
  y_label?: string;
  series: ChartSeries[];
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const normalizeBBox = (bbox: any): VisionBBox | null => {
  if (!bbox) return null;

  const left = bbox.left ?? bbox.x ?? bbox.X ?? bbox.xmin ?? bbox.minX;
  const top = bbox.top ?? bbox.y ?? bbox.Y ?? bbox.ymin ?? bbox.minY;
  const width = bbox.width ?? bbox.w ?? bbox.Width ?? bbox.xmax ?? bbox.maxX;
  const height = bbox.height ?? bbox.h ?? bbox.Height ?? bbox.ymax ?? bbox.maxY;

  if (
    typeof left !== "number" ||
    typeof top !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    return null;
  }

  const x = clamp01(left);
  const y = clamp01(top);
  const w = clamp01(width);
  const h = clamp01(height);

  return { x, y, w, h };
};

const detectionsToAnnotations = (
  detections?: Array<{ tag_name: string; probability: number; bounding_box?: any }>
): VisionAnnotation[] => {
  if (!detections || detections.length === 0) return [];
  return detections
    .map((det, index) => {
      const bbox = normalizeBBox(det.bounding_box);
      if (!bbox) return null;
      return {
        id: `ai-${index}-${det.tag_name}`,
        label: det.tag_name,
        confidence: det.probability,
        bbox,
        source: "ai",
      } as VisionAnnotation;
    })
    .filter((item): item is VisionAnnotation => Boolean(item));
};

const agentServiceMap: Record<
  AgentType,
  (
    query: string,
    n?: number,
    file?: File | null,
    conversationId?: string,
    moduleName?: string
  ) => Promise<any>
> = {
  doc: (query, _n = 3, _file, conversationId) =>
    askRagQuestion(query, 3, conversationId),

  finance: (query, _n = 10, _file, conversationId) =>
    askFinanceQuestion(query, 10, conversationId),

  search: async (query, _n, _file, conversationId) => {
    const response = await askSearchQuestion(query, conversationId);
    return {
      answer: response.answer,
      citations: response.citations,
      conversation_id: response.conversation_id,
    };
  },

  trading: (query, _n = 3, _file, conversationId) =>
    askTradingQuestion(query, 3, conversationId),

  vision: async (query, _n, file, conversationId) => {
    const response = await askVisionQuestion(file, query, conversationId);
    return {
      answer: response.response_text,
      surfaces: response.surfaces,
      perimeters: response.perimeters,
      detections: response.detections,
      vision_file_sas: response.vision_file_sas,
      vision_annotated_sas: response.vision_annotated_sas,
      conversation_id: response.conversation_id,
    };
  },

  // 🆕 Nouvel agent dédié à l’API /api/vision/plaque
  plaques: async (query, _n, file, conversationId) => {
    const response = await askPlaqueQuestion(file, query, conversationId, true);

    return {
      answer: response.response_text,
      surfaces: response.surfaces,
      perimeters: response.perimeters,
      detections: response.detections,
      vision_file_sas: response.vision_file_sas,
      vision_annotated_sas: response.vision_annotated_sas,
      conversation_id: response.conversation_id,
    };
  },

  dev: async (query, _n, _file, conversationId, moduleName) => {
    const response = await askDevQuestion(query, conversationId, moduleName);
    return {
      answer: response.answer,
      conversation_id: response.conversation_id,
      model: response.model
    };
  },
};

export default function Chat() {
  const { moduleName } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    path: string;
  } | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const skipNextHistoryLoadRef = useRef(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [recording, setRecording] = useState(false);
  const [visionEditMessageIndex, setVisionEditMessageIndex] = useState<
    number | null
  >(null);

  // Get current route name for API calls
  const currentRoute = moduleName ? agentRouteMap[moduleName] : "rag";

  // ← AJOUT: États pour SearchSidebar
  const [agentResponses, setAgentResponses] = useState<string[]>([]);

  const navigate = useNavigate();
  const [activeTools, setActiveTools] = useState<string[]>([]);

  const [isTourActive, setIsTourActive] = useState(false);
  const [isShareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  //const [showTourButton, setShowTourButton] = useState(true);

  // useEffect(() => {
  //   const tourCompleted = localStorage.getItem('chat-tour-completed');
  //   if (tourCompleted === 'true') {
  //     setShowTourButton(false);
  //   }
  // }, []);

  const handleTourComplete = () => {
    setIsTourActive(false);
    //setShowTourButton(false);
  };

  const handleTourSkip = () => {
    setIsTourActive(false);
    //setShowTourButton(false);
  };

  const handleShareOpen = () => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
    setShareCopied(false);
    setShareOpen(true);
  };

  const handleShareClose = () => {
    setShareOpen(false);
  };

  const handleShareCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl || "");
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1500);
    } catch (error) {
      console.error("Erreur copie lien:", error);
    }
  };

  const visionEditMessage =
    visionEditMessageIndex !== null ? messages[visionEditMessageIndex] : null;
  const visionEditImageUrl = useMemo(() => {
    if (!visionEditMessage) return null;
    if (visionEditMessage.annotated_image_b64) {
      return `data:image/jpeg;base64,${visionEditMessage.annotated_image_b64}`;
    }
    if (visionEditMessage.vision_annotated_sas) {
      return visionEditMessage.vision_annotated_sas;
    }
    return null;
  }, [visionEditMessage]);

  useEffect(() => {
    if (visionEditMessageIndex === null) return;
    if (!visionEditMessage || !visionEditImageUrl) {
      setVisionEditMessageIndex(null);
    }
  }, [visionEditMessageIndex, visionEditMessage, visionEditImageUrl]);

  // Fonction pour gérer l'activation/désactivation des outils
  const handleToolToggle = (toolId: string) => {
    setActiveTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  // Etat d'outil
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isToolsSidebarOpen, setToolsSidebarOpen] = useState(false);

  // Fonction pour gérer la sélection d'outil
  const handleToolSelect = (toolId: string) => {
    if (activeTool === toolId) {
      // Si on clique sur l'outil actif, on ferme le sidebar
      setToolsSidebarOpen(false);
      setActiveTool(null);
    } else {
      // Sinon on ouvre le nouvel outil
      setActiveTool(toolId);
      setToolsSidebarOpen(true);
    }
  };
  // Charger les conversations au démarrage
  useEffect(() => {
    loadConversations();
  }, [currentRoute]); // Recharger quand la route change

  // Charger l'historique si une conversation est active
  useEffect(() => {
    if (activeConversation) {
      if (skipNextHistoryLoadRef.current) {
        skipNextHistoryLoadRef.current = false;
        return;
      }
      loadConversationHistory(activeConversation);
    } else {
      setMessages([]);
      setIsInitial(true);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    try {
      const convs = await chatService.list(currentRoute);
      setConversations(convs);
    } catch (error) {
      console.error("Erreur chargement conversations:", error);
    }
  };

  //fonction pour gérer le changement d'agent
  const handleAgentChange = (newAgent: string) => {
    const agentRoute = agentRouteMap[newAgent];
    if (agentRoute) {
      navigate(`/chat/${newAgent}`);
    }
  };

  // Dans Chat.tsx, mettez à jour loadConversationHistory

  const loadConversationHistory = async (conversationId: string) => {
    try {
      const history = await chatService.history(conversationId);
      const formattedMessages: Message[] = [];

      for (const msg of history.messages) {
        // On ne traite que les messages user/assistant
        if (msg.role === "user" || msg.role === "assistant") {
          const route = msg.route;

          // 1) Messages assistant Vision classique OU Vision Plaques
          if (
            (route === "vision" || route === "vision-plaque") &&
            msg.role === "assistant" &&
            msg.meta
          ) {
            let annotatedImageB64: string | null = null;

            // Essayer de récupérer l'image annotée depuis l'URL SAS
            if (msg.meta.vision_annotated_sas) {
              try {
                console.log(
                  "🖼️ Chargement de l'image annotée depuis:",
                  msg.meta.vision_annotated_sas
                );
                annotatedImageB64 = await getAnnotatedImageFromSAS(
                  msg.meta.vision_annotated_sas
                );
                console.log("✅ Image annotée chargée avec succès");
              } catch (error) {
                console.warn(
                  "❌ Impossible de charger l'image annotée:",
                  error
                );
              }
            }

            const annotations =
              msg.meta.annotations ||
              msg.meta.meta?.annotations ||
              detectionsToAnnotations(msg.meta.detections);

            formattedMessages.push({
              text: msg.message || msg.meta.response_text || "",
              isUser: false,
              surfaces: msg.meta.surfaces,
              perimeters: msg.meta.perimeters,
              detections: msg.meta.detections,
              annotations,
              annotations_version:
                msg.meta.annotations_version || msg.meta.meta?.annotations_version,
              annotated_image_b64: annotatedImageB64,
              vision_file_path: msg.meta.vision_file_path,
              vision_annotated_blob_path:
                msg.meta.meta?.vision_annotated_blob_path,
              vision_annotated_sas: msg.meta.vision_annotated_sas,
              timestamp: msg.timestamp_utc,
              agent: mapRouteToAgent(route),
            });
          }

          // 2) Messages user Vision / Vision Plaques
          else if (
            (route === "vision" || route === "vision-plaque") &&
            msg.role === "user"
          ) {
            // Nettoyer le tag [UPLOAD:xxx] si présent
            const cleanMessage = (msg.message || "").replace(
              /\[UPLOAD:[^\]]+\]\s*/,
              ""
            );
            formattedMessages.push({
              text: cleanMessage,
              isUser: true,
              timestamp: msg.timestamp_utc,
              agent: mapRouteToAgent(route),
            });
          }

          // 3) Messages assistant Aïna DOC (RAG) avec documents + images
          else if (
            (route === "rag" || route === "vet_doc") &&
            msg.role === "assistant" &&
            msg.meta
          ) {
            formattedMessages.push({
              text: msg.message || msg.meta.response_text || "",
              isUser: false,
              sources: msg.meta.used_docs || msg.meta.sources,
              rows: msg.meta.rows,
              images: msg.meta.images, // ⚡ images renvoyées par l’API DOC
              timestamp: msg.timestamp_utc,
              model: msg.meta.model || "Aïna Instant",
              agent: mapRouteToAgent(route),
            });
          }

          // 4) Tous les autres messages (finance, search, trading, etc.)
          else {
            const isFinance = route === "finance" || route === "vet_finance";
            formattedMessages.push({
              text: msg.message || msg.meta?.response_text || "",
              isUser: msg.role === "user",
              sources: msg.meta?.used_docs || msg.meta?.sources,
              // chart si route finance
              chart: isFinance ? msg.meta?.chart : undefined,
              rows: isFinance ? msg.meta?.rows : undefined,
              timestamp: msg.timestamp_utc,
              agent: mapRouteToAgent(route),
            });
          }
        }
      }

      setMessages(formattedMessages);
      setIsInitial(formattedMessages.length === 0);
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    }
  };

  const handleNewConversation = async () => {
    // Nettoyer les fichiers temporaires Vision si on a une conversation active
    if (
      activeConversation &&
      (moduleName === "Aïna Vision" || moduleName === "Aïna Vision Plaques")
    ) {
      try {
        await cleanupVisionFile(activeConversation);
      } catch (error) {
        console.error("Erreur cleanup vision:", error);
      }
    }

    setActiveConversation(null);
    setMessages([]);
    setIsInitial(true);
    setInput("");
    setAttachedFile(null);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await chatService.delete(conversationId);
      if (activeConversation === conversationId) {
        handleNewConversation();
      }
      loadConversations();
    } catch (error) {
      console.error("Erreur suppression conversation:", error);
    }
  };

  const handleRenameConversation = async (
    conversationId: string,
    newTitle: string
  ) => {
    try {
      await chatService.rename(conversationId, newTitle);
      loadConversations();
    } catch (error) {
      console.error("Erreur renommage conversation:", error);
    }
  };

  const mapRouteToAgent = (route?: string): AgentType | undefined => {
    switch (route) {
      case "rag":
        return "doc";
      case "finance":
        return "finance";
      case "trading":
        return "trading";
      case "vision":
        return "vision";
      case "vision-plaque":
        return "plaques";
      case "search":
        return "search";
      default:
        return undefined;
    }
  };

  type SendOptions = {
    skipAddUser?: boolean;
    preserveInput?: boolean;
    preserveAttachment?: boolean;
    file?: File | null;
  };

  /** --- Envoi d'une question --- */
  const handleSend = async (userQuery: string, options?: SendOptions) => {
    const trimmedQuery = userQuery.trim();
    const fileToSend = options?.file ?? attachedFile;
    if (!trimmedQuery && !fileToSend) return;

    const isAdvancedSaaS = [
      "Aïna Architecte & PO",
      "Aïna FinOps Lead",
      "Aïna Clean Coder",
      "Aïna CISO",
      "Aïna Pentester",
      "Aïna Data Engineer",
      "Aïna Data Quality",
      "Aïna Data Governance",
      "Aïna Fullstack Node/React"
    ].includes(moduleName || "");

    const agentKey: AgentType =
      moduleName === "Aïna DOC" || moduleName === "Aïna RH & Recrutement"
        ? "doc"
        : moduleName === "Aïna Finance" || moduleName === "Aïna Compta"
          ? "finance"
          : moduleName === "Aïna Search"
            ? "search"
            : moduleName === "Aïna Trading"
              ? "trading"
              : moduleName === "Aïna Vision"
                ? "vision"
                : moduleName === "Aïna Vision Plaques"
                  ? "plaques"
                  : moduleName === "Aïna Coder" || isAdvancedSaaS
                    ? "dev"
                    : "doc";

    if (!options?.skipAddUser) {
      const userMessage: Message = {
        text: trimmedQuery,
        isUser: true,
        file: fileToSend || undefined,
      };
      setMessages((prev) => [...prev, userMessage]);
    }
    if (!options?.preserveInput) {
      setInput("");
    }
    if (!options?.preserveAttachment) {
      setAttachedFile(null);
    }
    setLoading(true);
    setIsInitial(false);

    try {
      const response = await agentServiceMap[agentKey](
        trimmedQuery,
        undefined,
        fileToSend || undefined,
        activeConversation || undefined,
        moduleName
      );

      // Mettre à jour la conversation active si c'est une nouvelle conversation
      if (response.conversation_id && !activeConversation) {
        skipNextHistoryLoadRef.current = true;
        setActiveConversation(response.conversation_id);
      }
      const annotatedSas =
        response.vision_annotated_sas || response.meta?.vision_annotated_sas;
      let annotatedImageB64: string | null =
        response.annotated_image_b64 || null;

      if (!annotatedImageB64 && annotatedSas) {
        try {
          annotatedImageB64 = await getAnnotatedImageFromSAS(annotatedSas);
        } catch (error) {
          console.warn("❌ Impossible de charger l'image annotée:", error);
        }
      }

      const annotations =
        response.annotations ||
        response.meta?.annotations ||
        detectionsToAnnotations(response.detections);

      const botMessage: Message = {
        text: response.answer || response.response_text,
        isUser: false,
        agent: agentKey,
        sources: response.used_docs || response.citations,
        // Pour Aïna Finance on lit chart, pas rows
        chart: agentKey === "finance" ? response.chart : undefined,

        // Vision
        surfaces: response.surfaces,
        perimeters: response.perimeters,
        detections: response.detections,
        annotations,
        annotations_version:
          response.annotations_version || response.meta?.annotations_version,
        annotated_image_b64: annotatedImageB64,
        vision_file_path: response.vision_file_path,
        vision_annotated_blob_path: response.meta?.vision_annotated_blob_path,
        vision_annotated_sas: annotatedSas,

        images: response.images || [],
        model: response.model,
        rows: agentKey === "finance" ? response.rows : undefined,
      };

      // Ajoutez un console.log pour debugger
      console.log("📸 Images reçues:", response.images);
      setMessages((prev) => {
        const newMessages = [...prev, botMessage];
        console.log("💾 Messages après ajout:", newMessages);
        return newMessages;
      });

      //setMessages((prev) => [...prev, botMessage]);

      // ← AJOUT: Stocker la réponse pour SearchSidebar
      if (response.answer) {
        setAgentResponses((prev) => [...prev, response.answer]);
      }

      // Recharger la liste des conversations pour avoir les dernières activités
      loadConversations();
    } catch (error) {
      console.error("Erreur API:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Une erreur est survenue. Veuillez réessayer.",
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = (messageIndex: number, newText: string) => {
    const trimmedText = newText.trim();
    if (!trimmedText) return;

    const targetUserIndex = (() => {
      if (messages[messageIndex]?.isUser) {
        return messageIndex;
      }

      for (let i = messageIndex - 1; i >= 0; i -= 1) {
        if (messages[i]?.isUser) {
          return i;
        }
      }

      return -1;
    })();

    if (targetUserIndex < 0) {
      return;
    }

    setMessages((prev) => {
      const truncated = prev.slice(0, targetUserIndex + 1);
      return truncated.map((msg, index) =>
        index === targetUserIndex && msg.isUser
          ? { ...msg, text: trimmedText }
          : msg
      );
    });

    handleSend(trimmedText, {
      skipAddUser: true,
      preserveInput: true,
      preserveAttachment: true,
      file: null,
    });
  };

  const handleRetryMessage = (messageIndex: number) => {
    const targetUserIndex = (() => {
      if (messages[messageIndex]?.isUser) {
        return messageIndex;
      }

      for (let i = messageIndex - 1; i >= 0; i -= 1) {
        if (messages[i]?.isUser) {
          return i;
        }
      }

      return -1;
    })();

    if (targetUserIndex < 0) {
      return;
    }

    const targetUserMessage = messages[targetUserIndex];
    if (!targetUserMessage?.text) {
      return;
    }

    setMessages((prev) => prev.slice(0, targetUserIndex + 1));

    handleSend(targetUserMessage.text, {
      skipAddUser: true,
      preserveInput: true,
      preserveAttachment: true,
      file: null,
    });
  };

  /** Envoie au backend le JSON unique (image + dimensions + annotations) et met à jour le message */
  const handleSaveVisionEdit = async (
    messageIndex: number,
    payload: VisionEditSavePayload
  ) => {
    const targetMessage = messages[messageIndex];
    if (!targetMessage) return;

    const context = {
      conversation_id: activeConversation,
      vision_file_path: targetMessage.vision_file_path,
      vision_annotated_blob_path: targetMessage.vision_annotated_blob_path,
      message_timestamp: targetMessage.timestamp,
    };

    const result = await saveVisionAnnotations(context, payload);
    const nextAnnotations = result.annotations ?? payload.annotations.map((a) => ({
      id: a.id,
      label: a.label,
      bbox: a.bbox,
      confidence: 1 as number,
      source: "user" as const,
    }));

    setMessages((prev) =>
      prev.map((msg, index) =>
        index === messageIndex ? { ...msg, annotations: nextAnnotations } : msg
      )
    );
  };

  /** --- Texte central animé au démarrage --- */
  const typedMessage =
    moduleName === "Aïna Architecte & PO"
      ? "Salle de Briefing - En attente d'instructions"
      : ["Aïna Clean Coder", "Aïna Fullstack Node/React"].includes(moduleName || "")
        ? "Console de Développement - Prêt à coder"
        : ["Aïna CISO", "Aïna Pentester", "Aïna Data Governance"].includes(moduleName || "")
          ? "Terminal Audit & Sécurité - Prêt pour l'injection"
          : ["Aïna Data Engineer", "Aïna Data Quality"].includes(moduleName || "")
            ? "Pipeline de Données (ETL) - Initialisé"
            : moduleName === "Aïna FinOps Lead"
              ? "Audit FinOps - Prêt pour l'optimisation Cost/Cloud"
              : ["Aïna Compta", "Aïna RH & Recrutement"].includes(moduleName || "")
                ? "Interface Back-Office Sécurisée - Connectée"
                : moduleName === "Aïna DOC"
                  ? "Demandez à vos données"
                  : moduleName === "Aïna Finance"
                    ? "Demandez à vos chiffres"
                    : `Environnement : ${moduleName}`;

  const handleDeleteAllConversations = async () => {
    try {
      await chatService.deleteAll(currentRoute);
      // Réinitialiser l'état local
      setActiveConversation(null);
      setMessages([]);
      setIsInitial(true);
      // Recharger la liste des conversations (qui sera vide)
      loadConversations();
    } catch (error) {
      console.error("Erreur suppression toutes les conversations:", error);
      throw error; // Propager l'erreur pour l'affichage dans le modal
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative">
      {/* Prisme animé comme sur la Home */}
      <AnimatedPrism className="z-0" speed={45} size={600} />
      {/* Background gradient comme la Home */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 z-0"></div>
      {/* Effets de particules subtiles comme sur la Home */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-blue-400/30 rounded-full" />
        ))}
      </div>
      {/* Background pattern comme la Home */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent"></div>
      </div>
      <div className="relative flex flex-col h-[calc(100vh-80px)] mt-20 z-10 w-full" >
        <Header />
        {/* Zone principale */}
        <div className="flex-1 flex flex-col p-6 relative overflow-hidden h-full">
          {/* Zone messages */}

          {!isInitial && (
            <ChatMsg
              messages={messages}
              loading={loading}
              moduleName={moduleName}
              onEditMessage={handleEditMessage}
              onRetryMessage={handleRetryMessage}
              onShareMessage={handleShareOpen}
              onOpenVisionEdit={(messageIndex) =>
                setVisionEditMessageIndex(messageIndex)
              }
              onPreview={async (expiredUrl: string) => {
                try {
                  console.log("📄 [Chat] URL expirée reçue:", expiredUrl);

                  // ===== ÉTAPE 1: Extraire le nom du blob depuis l'URL expirée =====
                  const cleanUrl = expiredUrl.replace(/"/g, "").trim();
                  let blobName = "";
                  let title = "Document";

                  try {
                    const urlObj = new URL(cleanUrl);
                    // Format: https://st4x2hamb3rger.blob.core.windows.net/audit/44_39_mdm_plan_de_campagne_103_103_mdm_plan_de_campagne.pdf?se=...
                    const pathParts = urlObj.pathname.split("/");

                    // Ignorer le premier élément vide et le container
                    if (pathParts.length >= 3) {
                      // pathParts[0] = ""
                      // pathParts[1] = "audit" (container)
                      // pathParts[2+] = nom du fichier
                      blobName = pathParts.slice(2).join("/"); // Rejoindre au cas où il y a des sous-dossiers
                    }

                    // Décoder l'URL-encoding
                    blobName = decodeURIComponent(blobName);

                    // Utiliser le nom comme titre (sans extension)
                    title =
                      blobName
                        .replace(/\.pdf$/i, "")
                        .split("/")
                        .pop() || "Document";

                    console.log("✅ [Chat] Blob extrait:", blobName);
                    console.log("📝 [Chat] Titre:", title);
                  } catch (e) {
                    console.error(
                      "❌ [Chat] Erreur extraction nom de blob:",
                      e
                    );
                    throw new Error(
                      "Impossible d'extraire le nom du fichier depuis l'URL"
                    );
                  }

                  if (!blobName) {
                    throw new Error("Nom de blob vide");
                  }

                  // ===== ÉTAPE 2: Régénérer une URL SAS valide via /api/sas =====
                  console.log("🔄 [Chat] Génération nouvelle URL SAS...");

                  const previewUrl = await getPreviewUrl(blobName);
                  console.log(
                    "✅ [Chat] Nouvelle URL SAS générée:",
                    previewUrl
                  );

                  // ===== ÉTAPE 3: Ouvrir le modal =====
                  setPreviewDoc({ title, path: previewUrl });
                } catch (error) {
                  console.error("❌ [Chat] Erreur complète:", error);

                  // Afficher un message d'erreur à l'utilisateur
                  alert(
                    `Impossible d'afficher le document: ${error instanceof Error ? error.message : "Erreur inconnue"
                    }`
                  );
                }
              }}
            />
          )}
          {/* Modal Preview */}
          {previewDoc && (
            <ChatPreviewModal
              doc={previewDoc}
              onClose={() => setPreviewDoc(null)}
            />
          )}

          {/* --- Texte animé au centre --- */}
          {isInitial && (
            <div
              className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 w-full px-4">
              <TypedText
                className="text-gray-900 dark:text-white text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-8"
                text={typedMessage}
                speed={50}
                start
              />
              <div className="max-w-3xl mx-auto flex flex-col items-center">
                <ChatInput
                  moduleName={moduleName || ""}
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  attachedFile={attachedFile}
                  setAttachedFile={setAttachedFile}
                  loading={loading}
                  recording={recording}
                  setRecording={setRecording}
                  recognitionRef={recognitionRef}
                  currentAgent={moduleName || "Aïna DOC"}
                  onAgentChange={handleAgentChange}
                  activeTools={activeTools} // ← Ajouté
                  onToolToggle={handleToolToggle} // ← Ajouté
                />
                {/* HUD Intégré sous la barre */}
                <FrugalHUD activeTool={activeTool || undefined} />
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 font-medium tracking-wide">
                  Aïna by ITSynchronic
                </div>
              </div>
            </div>
          )}

          {/* Zone Input (quand on a déjà un historique) */}
          {!isInitial && (
            <div
              className="mt-auto w-full max-w-3xl mx-auto px-4 flex flex-col items-center relative z-20">
              <div className="w-full flex justify-center flex-col items-center">
                <ChatInput
                  moduleName={moduleName || ""}
                  input={input}
                  setInput={setInput}
                  onSend={handleSend}
                  attachedFile={attachedFile}
                  setAttachedFile={setAttachedFile}
                  loading={loading}
                  recording={recording}
                  setRecording={setRecording}
                  recognitionRef={recognitionRef}
                  currentAgent={moduleName || "Aïna DOC"}
                  onAgentChange={handleAgentChange}
                  activeTools={activeTools} // ← Ajouté
                  onToolToggle={handleToolToggle} // ← Ajouté
                />
                <FrugalHUD activeTool={activeTool || undefined} />
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-4 mb-2 font-medium tracking-wide">
                  Aïna by ITSynchronic
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {visionEditMessage && visionEditImageUrl && (
        <VisionEditModal
          isOpen={visionEditMessageIndex !== null}
          onClose={() => setVisionEditMessageIndex(null)}
          imageUrl={visionEditImageUrl}
          annotations={visionEditMessage.annotations || []}
          onSave={(payload) => {
            if (visionEditMessageIndex === null) return Promise.resolve();
            return handleSaveVisionEdit(visionEditMessageIndex, payload);
          }}
        />
      )}
      {isShareOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-80 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-900/95 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Partager la conversation
            </p>
            <button
              type="button"
              onClick={handleShareClose}
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Fermer"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            Lien de la conversation
          </p>
          <div className="flex items-center gap-2">
            <input
              value={shareUrl}
              readOnly
              className="flex-1 rounded-md border border-gray-200/60 dark:border-gray-700/60 bg-transparent px-2 py-1 text-xs text-gray-700 dark:text-gray-200"
            />
            <button
              type="button"
              onClick={handleShareCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-gray-700 dark:text-gray-200 transition-colors"
              title="Copier le lien"
              aria-label="Copier le lien"
            >
              {shareCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copier
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsTourActive(true)}
        className="fixed bottom-8 right-8 z-30 p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
        title="Lancer le guide de la page Chat">
        <QuestionMarkCircleIcon className="w-6 h-6" />
      </button>
      <ChatTour
        isActive={isTourActive}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
      />
    </div>
  );
}
