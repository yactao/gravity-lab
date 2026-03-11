// src/components/tools/ToolsButton.tsx
import { useState, useRef, useEffect } from "react";
import { 
  WrenchIcon, 
  MagnifyingGlassIcon, 
  EnvelopeIcon
} from "@heroicons/react/24/outline";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const tools: Tool[] = [
  {
    id: "search",
    name: "Recherche intelligente",
    icon: <MagnifyingGlassIcon className="w-5 h-5" />,
    color: "blue",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    id: "email",
    name: "Assistant Email",
    icon: <EnvelopeIcon className="w-5 h-5" />,
    color: "purple",
    gradient: "from-purple-500 to-pink-500"
  }
];

interface ToolsButtonProps {
  onToolSelect: (toolId: string) => void;
  activeTool: string | null;
}

export default function ToolsButton({ onToolSelect, activeTool }: ToolsButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToolClick = (toolId: string) => {
    onToolSelect(toolId);
    setIsHovered(false);
  };

  return (
    <div className="relative" ref={buttonRef} >
      {/* Bouton principal avec design cohérent */}
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!buttonRef.current?.matches(':hover')) {
              setIsHovered(false);
            }
          }, 100);
        }}
        onClick={() => onToolSelect(activeTool || 'search')}
        className="fixed right-4 bottom-24 z-[39] p-3 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 dark:from-indigo-600 dark:via-blue-700 dark:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
        title="Outils Aïna">
        <WrenchIcon className="w-5 h-5" />
      </button>
      {/* Dropdown vers le haut - VERSION ULTRA COMPACT */}
      <>
        {isHovered && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed right-4 bottom-32 z-[40] w-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
            {/* Indicateur visuel vers le bas */}
            <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white dark:bg-gray-900 border-r border-b border-gray-200 dark:border-gray-700 rotate-45"></div>

            {/* Liste des outils en VERTICAL - ULTRA COMPACT */}
            <div className="p-1.5 space-y-1">
              {tools.map((tool) => {
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    title={tool.name}>
                    {/* Icône avec dégradé cohérent - TAILLE RÉDUITE */}
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                      {tool.icon}
                    </div>
                    {/* Indicateur actif - PETIT POINT */}
                    {isActive && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </>
    </div>
  );
}