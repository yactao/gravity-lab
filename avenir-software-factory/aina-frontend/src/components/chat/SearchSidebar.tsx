import { useState, useRef, useEffect } from "react";
import { Search, X, Send, Mic,  User, Clock, FileText, Trash2, Sparkles } from "lucide-react";
import { askSearchQuestion } from "../../service/searchService";

interface SearchMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: { title: string; url: string }[];
}

interface SearchSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentAgentResponses: string[];
}

export default function SearchSidebar({ 
  isOpen, 
  onToggle, 
}: SearchSidebarProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchMessages, setSearchMessages] = useState<SearchMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gestion du clic extérieur - version améliorée
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isOpen, onToggle]);

  // Empêcher le scroll du body quand le SearchSidebar est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [searchMessages]);

  // Focus sur l'input quand la sidebar s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Fonction pour envoyer une requête de recherche
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: SearchMessage = {
      id: Date.now().toString(),
      text: query,
      isUser: true,
      timestamp: new Date()
    };

    setSearchMessages(prev => [...prev, userMessage]);
    setSearchInput("");
    setLoading(true);

    try {
      const response = await askSearchQuestion(query);
      
      const botMessage: SearchMessage = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false,
        timestamp: new Date(),
        sources: response.citations?.map(citation => ({
          title: citation.title,
          url: citation.url
        })) || [],
      };
      
      setSearchMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Erreur recherche:", error);
      const errorMessage: SearchMessage = {
        id: (Date.now() + 1).toString(),
        text: "❌ Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        isUser: false,
        timestamp: new Date(),
      };
      setSearchMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Reconnaissance vocale
  const handleVoiceSearch = () => {
    if (!recording) {
      if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        alert("Reconnaissance vocale non supportée par votre navigateur.");
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      setRecording(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchInput(transcript);
      };

      recognition.onend = () => setRecording(false);
      recognition.onerror = () => setRecording(false);
    } else {
      if (recognitionRef.current) recognitionRef.current.stop();
      setRecording(false);
    }
  };

  // Effacer l'historique des recherches
  const clearHistory = () => {
    setSearchMessages([]);
  };

  // Suggestions rapides
  const quickSuggestions = [
    "Rechercher des informations complémentaires",
    "Explorer des sources en ligne", 
    "Contextualiser avec des données récentes",
    "Vérifier des informations externes"
  ];

  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'site';
    }
  };
  
  const getFaviconUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '/default-favicon.png';
    }
  };
  
  const getSiteInitial = (url: string): string => {
    const domain = getDomainFromUrl(url);
    return domain.charAt(0).toUpperCase();
  };

  // Fonction pour formater le texte avec mise en forme basique
  const formatMessageText = (text: string) => {
    return text
      .split('**')
      .map((part, index) => 
        index % 2 === 1 
          ? `<strong class="font-semibold text-blue-700 dark:text-blue-300">${part}</strong>`
          : part
      )
      .join('')
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('•')) {
          return `<div class="flex items-start gap-2"><span class="text-blue-500 mt-1">•</span><span>${line.substring(1)}</span></div>`;
        }
        return line;
      })
      .join('<br/>');
  };

  return (
    <>
      <>
        {/* Overlay avec z-index contrôlé */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-20 cursor-pointer backdrop-blur-sm transition-opacity duration-300 z-[40]"
            onClick={onToggle} />
        )}

        {/* Sidebar avec z-index le plus élevé */}
        <div
          ref={sidebarRef}
          className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 z-[9999]">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Aïna Search</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Recherche contextuelle intelligente
                  </p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors duration-200 hover:scale-105"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Statistiques et actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{searchMessages.length} message{searchMessages.length !== 1 ? 's' : ''}</span>
              </div>
              {searchMessages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Effacer tout
                </button>
              )}
            </div>
          </div>

          {/* Messages avec design amélioré */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-800/50">
            {searchMessages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3 text-xl">
                  Recherche Contextuelle
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed mb-6">
                  Analysez et explorez les conversations existantes pour obtenir des insights complémentaires et des recherches approfondies.
                </p>
                
                {/* Suggestions rapides */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">SUGGESTIONS RAPIDES</p>
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchInput(suggestion)}
                      className="block w-full text-left px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 text-gray-700 dark:text-gray-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              searchMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                      message.isUser 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                    }`}>
                      {message.isUser ? <User className="w-5 h-5" /> : <img src="/logo-blue.png" alt="Aïna" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />}
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`rounded-2xl p-4 shadow-sm backdrop-blur-sm ${
                          message.isUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white shadow-lg'
                        }`}
                      >
                        {/* Contenu du message - Affichage direct sans TypedText */}
                        <div 
                          className={`whitespace-pre-line text-sm leading-relaxed ${
                            message.isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}
                          dangerouslySetInnerHTML={{ 
                            __html: message.isUser ? message.text : formatMessageText(message.text)
                          }}
                        />

                        {/* Sources */}
                        {!message.isUser && message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-600">
                            <p className="text-xs font-semibold text-white/80 dark:text-gray-400 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Sources ({message.sources.length}) :
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.slice(0, 5).map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative"
                                  title={`${source.title}\n${getDomainFromUrl(source.url)}`}
                                >
                                  <div className="w-6 h-6 rounded-full bg-white/20 dark:bg-gray-700/50 border border-white/30 dark:border-gray-600/50 flex items-center justify-center hover:bg-white/30 dark:hover:bg-gray-600/50 hover:scale-110 transition-all duration-200 shadow-sm">
                                    {/* Favicon ou initiale */}
                                    <img 
                                      src={getFaviconUrl(source.url)} 
                                      alt={getDomainFromUrl(source.url)}
                                      className="w-4 h-4 rounded-sm"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextSibling && ((target.nextSibling as HTMLElement).style.display = 'flex');
                                      }}
                                    />
                                    <div className="hidden text-xs font-bold text-white">
                                      {getSiteInitial(source.url)}
                                    </div>
                                  </div>
                                  
                                  {/* Tooltip au survol */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {getDomainFromUrl(source.url)}
                                  </div>
                                </a>
                              ))}
                              
                              {/* Indicateur s'il y a plus de 5 sources */}
                              {message.sources.length > 5 && (
                                <div className="relative group">
                                  <div className="w-8 h-8 rounded-full bg-gray-400/30 border border-gray-500/50 flex items-center justify-center text-xs text-gray-300 font-medium">
                                    +{message.sources.length - 5}
                                  </div>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    {message.sources.length - 5} autres sources
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className={`flex items-center gap-2 mt-2 text-xs ${
                        message.isUser ? 'justify-end text-blue-300' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Indicateur de chargement amélioré */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <img src="/logo-blue.png" alt="Aïna" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="font-medium">Recherche en cours...</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Analyse des conversations et recherche d'informations complémentaires
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de recherche amélioré */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Rechercher dans le contexte des conversations..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSearch(searchInput);
                    }
                  }}
                  disabled={loading}
                />
              </div>
              <button
                onClick={handleVoiceSearch}
                className={`p-3 rounded-xl transition-all duration-200 shadow-sm ${
                  recording
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse shadow-red-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-lg'
                }`}
                disabled={loading}
                title="Recherche vocale"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSearch(searchInput)}
                disabled={loading || !searchInput.trim()}
                className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
                title="Envoyer la recherche"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </>
    </>
  );
}