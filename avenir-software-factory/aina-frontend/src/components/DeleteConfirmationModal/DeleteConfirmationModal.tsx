// components/chat/DeleteConfirmationModal.tsx
import { AlertTriangle, Shield, Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  conversationTitle: string;
  isDeleteAll?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  conversationTitle,
  isDeleteAll = false
}: DeleteConfirmationModalProps) {
  return (
    <>
      {isOpen && (
        <>
          {/* Overlay avec backdrop blur */}
          <div
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}>
            {/* Modal */}
            <div
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95"
              onClick={(e) => e.stopPropagation()}>
              {/* Header avec icône animée */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {isDeleteAll ? "Supprimer toutes les conversations" : "Supprimer la conversation"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Action irréversible
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 hover:scale-110"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content avec mise en page améliorée */}
              <div className="mb-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                        Attention requise
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        {isDeleteAll 
                          ? "Toutes vos conversations seront définitivement supprimées. Cette action ne peut pas être annulée."
                          : "Cette conversation sera définitivement supprimée. Cette action ne peut pas être annulée."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {!isDeleteAll && (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      Êtes-vous sûr de vouloir supprimer cette conversation ?
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Conversation à supprimer :
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        "{conversationTitle}"
                      </p>
                    </div>
                  </div>
                )}

                {isDeleteAll && (
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Êtes-vous sûr de vouloir supprimer toutes vos conversations ?
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                        <Trash2 className="w-5 h-5" />
                        <p className="text-sm font-semibold">
                          {conversationTitle} conversation{conversationTitle !== "1" ? 's' : ''} seront supprimées
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions avec design amélioré */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border border-gray-300 dark:border-gray-600 shadow-sm">
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 text-base font-medium text-white bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 flex items-center justify-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  {isDeleteAll ? "Tout supprimer" : "Supprimer"}
                </button>
              </div>

              {/* Note de sécurité */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Vos données sont sécurisées pendant la suppression
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}