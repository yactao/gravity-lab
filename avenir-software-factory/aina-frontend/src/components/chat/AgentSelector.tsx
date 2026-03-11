// src/components/chat/AgentSelector.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Agent {
  name: string;
  key: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const agents: Agent[] = [
  {
    name: "DOC",
    key: "Aïna DOC",
    icon: <DocumentTextIcon className="h-4 w-4" />,
    description: "Recherche et analyse de documents",
    color: "blue",
  },
  {
    name: "Finance",
    key: "Aïna Finance",
    icon: <CurrencyDollarIcon className="h-4 w-4" />,
    description: "Analyse de données financières",
    color: "green",
  },
  {
    name: "Vision",
    key: "Aïna Vision",
    icon: <EyeIcon className="h-4 w-4" />,
    description: "Analyse d'images et vision",
    color: "purple",
  },
  {
    name: "Search",
    key: "Aïna Search",
    icon: <MagnifyingGlassIcon className="h-4 w-4" />,
    description: "Recherche intelligente",
    color: "indigo",
  },
];

interface AgentSelectorProps {
  currentAgent: string;
  onAgentChange: (agent: string) => void;
  position?: "left" | "right";
}

export default function AgentSelector({ 
  currentAgent, 
  onAgentChange, 
  position = "left" 
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldOpenUpward, setShouldOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentAgentData = agents.find(a => a.key === currentAgent) || agents[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const dropdownHeight = 300; // Hauteur estimée du dropdown

      // Si l'espace en dessous est insuffisant et qu'il y a plus d'espace au-dessus
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setShouldOpenUpward(true);
      } else {
        setShouldOpenUpward(false);
      }
    }
  }, [isOpen]);

  const handleAgentSelect = (agentKey: string) => {
    onAgentChange(agentKey);
    setIsOpen(false);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/30",
      green: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/30",
      purple: "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/30",
      indigo: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="agent-selector-button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                   ${getColorClasses(currentAgentData.color)}
                   ${isOpen ? "shadow-md" : "shadow-sm hover:shadow-md"}`}
        title={`${currentAgentData.name} - ${currentAgentData.description}`}
      >
        <div className="flex items-center gap-2">
          {currentAgentData.icon}
          <span className="text-sm font-medium truncate">
            {currentAgentData.name}
          </span>
        </div>
        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} 
                       ${shouldOpenUpward ? 'bottom-full mb-1' : 'top-full mt-1'} w-64
                       bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                       rounded-lg shadow-lg z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95
                       transition-all duration-200 origin-center`}>
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Sélectionner un agent
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Choisissez l'agent adapté à votre besoin
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {agents.map((agent) => (
              <button
                key={agent.key}
                onClick={() => handleAgentSelect(agent.key)}
                className={`w-full text-left p-3 transition-all duration-200 group flex items-center gap-3
                           ${currentAgent === agent.key 
                             ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-2 border-l-indigo-500' 
                             : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                           }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                              ${getColorClasses(agent.color)}`}>
                  {agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center mb-0.5 text-xs ${currentAgent === agent.key
                      ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-900 dark:text-gray-100 font-medium'
                    }`}>
                    {agent.name}
                    {currentAgent === agent.key && (
                      <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-[8px] font-medium">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-light text-gray-500 dark:text-gray-400 leading-snug">
                    {agent.description}
                    </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}