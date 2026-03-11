import { useEffect, useRef, useState } from "react";
import { EllipsisVerticalIcon, PencilIcon, PlusIcon, TrashIcon } from "lucide-react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import type { Conversation } from "../../service/chatService";
import DeleteConfirmationModal from "../DeleteConfirmationModal/DeleteConfirmationModal";


type ChatSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onRefresh: () => void;
  onDeleteAllConversations: () => void; // Nouvelle prop
  currentRoute: string; // Ajout de la route courante
};

// Type pour grouper les conversations par date
type GroupedConversations = {
  today: Conversation[];
  yesterday: Conversation[];
  lastWeek: Conversation[];
  older: Conversation[];
};

export default function ChatSidebar({
  isOpen,
  onToggle,
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onRefresh,
  onDeleteAllConversations, // Nouvelle prop
}: ChatSidebarProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<{ id: string, title: string } | null>(null);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false); // Nouvel état pour la suppression de tout
  const [isDeletingAll, setIsDeletingAll] = useState(false); // État pour le chargement

  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fonction pour tronquer le titre avec "..." après 40 caractères
  const truncateTitle = (title: string, maxLength: number = 40) => {
    if (title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength) + '...';
  };

  // Fonction pour grouper les conversations par date
  const groupConversationsByDate = (convs: Conversation[]): GroupedConversations => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const grouped: GroupedConversations = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: []
    };

    convs.forEach(conv => {
      const convDate = new Date(conv.last_activity_utc);
      const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

      if (convDay.getTime() === today.getTime()) {
        grouped.today.push(conv);
      } else if (convDay.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(conv);
      } else if (convDay.getTime() >= lastWeek.getTime()) {
        grouped.lastWeek.push(conv);
      } else {
        grouped.older.push(conv);
      }
    });

    return grouped;
  };

  // Fermer le dropdown ET la sidebar quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Fermer le dropdown si on clique ailleurs
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }

      // Fermer la sidebar si on clique à l'extérieur ET qu'elle est ouverte
      if (isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)) {
        onToggle();
      }

      // Appliquer le renommage si on clique en dehors du champ de saisie
      if (renamingId &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)) {
        handleRenameSave(renamingId);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle, renamingId]);

  // Focus sur l'input quand le renommage commence
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Sélectionner tout le texte
    }
  }, [renamingId]);

  const handleRenameStart = (conv: Conversation) => {
    setRenamingId(conv.conversation_id);
    setEditTitle(conv.title);
    setDropdownOpen(null); // Fermer le dropdown
  };

  const handleRenameSave = (conversationId: string) => {
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    setRenamingId(null);
    setEditTitle("");
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, conversationId: string) => {
    if (e.key === 'Enter') {
      handleRenameSave(conversationId);
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleDeleteClick = (conversationId: string, conversationTitle: string) => {
    setConversationToDelete({ id: conversationId, title: conversationTitle });
    setDeleteModalOpen(true);
    setDropdownOpen(null); // Fermer le dropdown
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete.id);
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const handleDeleteAllClick = () => {
    setDeleteAllModalOpen(true);
  };

  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await onDeleteAllConversations();
      setDeleteAllModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de toutes les conversations:", error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleCancelDeleteAll = () => {
    setDeleteAllModalOpen(false);
  };

  const toggleDropdown = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le déclenchement de onSelectConversation
    setDropdownOpen(dropdownOpen === conversationId ? null : conversationId);
  };

  // Grouper les conversations
  const groupedConversations = groupConversationsByDate(conversations);

  // Composant pour afficher un groupe de conversations
  const ConversationGroup = ({
    title,
    conversations: groupConvs
  }: {
    title: string;
    conversations: Conversation[]
  }) => {
    if (groupConvs.length === 0) return null;

    return (
      <div className="mb-4">
        {/* En-tête de groupe avec ligne fine */}
        <div className="flex items-center mb-2 px-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 z-10">
            {title}
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2"></div>
        </div>
        {/* Liste des conversations du groupe */}
        <div className="space-y-1">
          {groupConvs.map((conv) => (
            <div
              key={conv.conversation_id}
              className={`group p-2 rounded-lg cursor-pointer transition-all relative flex items-center min-h-[40px] ${activeConversation === conv.conversation_id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              onClick={() => {
                // Ne pas sélectionner la conversation si on est en train de renommer
                if (!renamingId) {
                  onSelectConversation(conv.conversation_id);
                }
              }}
            >
              {renamingId === conv.conversation_id ? (
                // Champ de saisie sans boutons de confirmation
                (<div className="w-full">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, conv.conversation_id)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nouveau nom..."
                  />
                </div>)
              ) : (
                <>
                  {/* Bouton trois points - visible au survol */}
                  <button
                    onClick={(e) => toggleDropdown(conv.conversation_id, e)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    title="Options"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  {/* Dropdown menu avec texte plus petit */}
                  <>
                    {dropdownOpen === conv.conversation_id && (
                      <div
                        ref={dropdownRef}
                        className="absolute top-8 right-2 z-50 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(conv);
                          }}
                          className="w-full px-2 py-1.5 text-xs text-left text-gray-700 bg-transparent dark:text-gray-300 hover:bg-transparent dark:hover:bg-transparent flex items-center gap-1.5 transition-colors duration-200"
                        >
                          <PencilIcon className="w-3 h-3" />
                          Renommer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(conv.conversation_id, conv.title);
                          }}
                          className="w-full px-2 py-1.5 text-xs text-left text-red-600 bg-transparent dark:text-red-400 hover:bg-transparent dark:hover:bg-transparent flex items-center gap-1.5 transition-colors duration-200"
                        >
                          <TrashIcon className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </>

                  <div className="flex-1 flex items-center justify-between pr-8">
                    {/* Texte de la conversation  */}
                    <h3
                      className={`text-xs truncate flex-1 text-left leading-relaxed ${activeConversation === conv.conversation_id
                        ? 'font-semibold text-gray-900 dark:text-white' // Gras pour active
                        : 'font-normal text-gray-700 dark:text-gray-300' // Normal pour inactive
                        }`}
                      title={conv.title}
                    >
                      {truncateTitle(conv.title)}
                    </h3>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                {/* <span className={`px-2 py-1 rounded-full ${
                  conv.last_route === 'rag' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  conv.last_route === 'finance' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {conv.last_route || 'general'}
                </span> */}
                {/* <span>{formatDate(conv.last_activity_utc)}</span> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <>
        {/* Sidebar toujours visible à 20% */}
        <div
          ref={sidebarRef}
          className={`relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-40 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "w-80" : "w-0 border-r-0"
            }`}
        >
          {/* Header avec bouton de toggle en haut à droite - CACHÉ quand ouvert */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 relative min-w-[320px]">
            {/* Bouton de toggle en haut à droite - VISIBLE UNIQUEMENT QUAND FERMÉ */}
            {!isOpen && (
              <button
                id="chat-sidebar-toggle"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="absolute -right-5 top-1/2 transform -translate-y-1/2 z-50 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 shadow-lg"
                title="Ouvrir"
              >
                <ArchiveBoxIcon className="w-4 h-4" />
              </button>
            )}

            <div className="flex justify-between items-center mb-4 ">
              <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                Conversations
              </h2>
              <div className="flex gap-2">
                {conversations.length > 0 && (
                  <button
                    onClick={handleDeleteAllClick}
                    className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Supprimer toutes les conversations"
                    disabled={isDeletingAll}
                  >
                    {isDeletingAll ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={onRefresh}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Actualiser"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={onNewConversation}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  title="Nouvelle conversation"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation active */}
            {activeConversation && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate pr-4">
                Conversation active: <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {truncateTitle(conversations.find(c => c.conversation_id === activeConversation)?.title || activeConversation)}
                </span>
              </div>
            )}
          </div>

          {/* Liste des conversations groupées par date */}
          <div className="flex-1 overflow-y-auto p-2 min-w-[320px]">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">Aucune conversation</p>
                <button
                  onClick={onNewConversation}
                  className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                >
                  Commencer une nouvelle discussion
                </button>
              </div>
            ) : (
              <>
                {/* Aujourd'hui */}
                <ConversationGroup
                  title="Aujourd'hui"
                  conversations={groupedConversations.today}
                />

                {/* Hier */}
                <ConversationGroup
                  title="Hier"
                  conversations={groupedConversations.yesterday}
                />

                {/* Cette semaine */}
                <ConversationGroup
                  title="Cette semaine"
                  conversations={groupedConversations.lastWeek}
                />

                {/* Plus anciennes */}
                <ConversationGroup
                  title="Plus anciennes"
                  conversations={groupedConversations.older}
                />
              </>
            )}
          </div>
        </div>
      </>
      {/* Overlay pour fermer la sidebar - TOUJOURS ACTIF QUAND OUVERTE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 lg:hidden cursor-pointer"
          onClick={onToggle}
        />
      )}
      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        conversationTitle={conversationToDelete?.title || ""}
      />
      {/* Modal de confirmation de suppression de toutes les conversations */}
      <DeleteConfirmationModal
        isOpen={deleteAllModalOpen}
        onClose={handleCancelDeleteAll}
        onConfirm={handleConfirmDeleteAll}
        conversationTitle="toutes les conversations"
      />
    </>
  );
}