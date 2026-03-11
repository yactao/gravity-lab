// src/components/tools/ToolsSidebar.tsx
import { XMarkIcon } from "@heroicons/react/24/outline";
import SearchSidebar from "../chat/SearchSidebar";
import EmailTool from "./EmailTool";

interface ToolsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTool: string | null;
  currentAgentResponses: string[];
}

export default function ToolsSidebar({ 
  isOpen, 
  onToggle, 
  activeTool, 
  currentAgentResponses 
}: ToolsSidebarProps) {
  
  const getToolTitle = () => {
    switch (activeTool) {
      case 'search':
        return 'Recherche intelligente';
      case 'email':
        return 'Assistant Email';
      default:
        return 'Outils Aïna';
    }
  };

  const getToolGradient = () => {
    switch (activeTool) {
      case 'search':
        return 'from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20';
      case 'email':
        return 'from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900';
    }
  };

  const getToolIcon = () => {
    switch (activeTool) {
      case 'search':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        );
      case 'email':
        return (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 cursor-pointer backdrop-blur-sm z-[40]"
            onClick={onToggle} />

          {/* Sidebar des outils */}
          <div
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 z-[41]">
            {/* Header dynamique selon l'outil */}
            <div className={`p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r ${getToolGradient()}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getToolIcon()}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {getToolTitle()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {activeTool === 'search' 
                        ? 'Recherche contextuelle intelligente'
                        : 'Assistant d\'emails intelligent'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200 hover:scale-105"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Contenu de l'outil sélectionné */}
            <div className="flex-1 overflow-hidden">
              {activeTool === 'search' && (
                <SearchSidebar
                  isOpen={true}
                  onToggle={onToggle}
                  currentAgentResponses={currentAgentResponses}
                />
              )}
              {activeTool === 'email' && (
                <div className="h-full overflow-y-auto">
                  <EmailTool
                    isOpen={true}
                    onToggle={onToggle}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}