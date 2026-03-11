// src/components/chat/ToolsDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { 
  WrenchIcon, 
  EnvelopeIcon, 
  MagnifyingGlassIcon,
  CheckIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

const tools: Tool[] = [
  {
    id: "search",
    name: "Recherche web",
    icon: <MagnifyingGlassIcon className="w-4 h-4" />,
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    id: "email",
    name: "Email",
    icon: <EnvelopeIcon className="w-4 h-4" />,
    gradient: "from-purple-500 to-pink-600"
  }
];

interface ToolsDropdownProps {
  activeTools: string[];
  onToolToggle: (toolId: string) => void;
}

export default function ToolsDropdown({ activeTools, onToolToggle }: ToolsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={buttonRef} id="tools-button" >
      {/* Bouton principal - Couleur harmonisée avec les autres boutons */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-lg bg-transparent text-indigo-700 
                   hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-200
                   disabled:opacity-50 shadow-sm hover:shadow-md"
        title="Outils Aïna">
        <WrenchIcon className="w-4 h-4" />
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {/* Dropdown compact */}
      <>
        {isOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl 
                       backdrop-blur-sm z-50">
            {/* Indicateur vers le bas */}
            <div className="absolute top-full left-4 w-3 h-3 bg-white dark:bg-gray-800 
                          border-r border-b border-gray-200 dark:border-gray-700 rotate-45 -mt-1.5"></div>

            {/* Liste des outils */}
            <div className="p-2 space-y-1">
              {tools.map((tool) => {
                const isActive = activeTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onToolToggle(tool.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-all duration-200 group ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    <div className="flex items-center gap-2">
                      {/* Icône avec couleur */}
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-sm`}>
                        {tool.icon}
                      </div>
                      {/* Nom */}
                      <span className={`text-xs font-medium ${
                        isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {tool.name}
                      </span>
                    </div>
                    {/* Indicateur actif */}
                    {isActive && (
                      <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                      </div>
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