"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTenant } from "@/lib/TenantContext";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    requires_human_confirmation?: boolean;
    pending_action?: {
        toolCallId: string;
        deviceId: string;
        action: string;
        value: string;
    };
    isSystemAction?: boolean; // For showing the result of confirmation
}

export function CopilotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Bonjour. Je suis le Copilote métier UBBEE. Que puis-je faire pour vous et votre parc immobilier ? 🏢"
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { authFetch } = useTenant();

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await authFetch('/api/copilot/chat', {
                method: 'POST',
                body: JSON.stringify({ message: userMsg.content })
            });
            const data = await res.json();

            if (data.error) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `Erreur: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: data.content || "Je lance l'action...",
                    requires_human_confirmation: data.requires_human_confirmation,
                    pending_action: data.pending_action
                }]);
            }
        } catch (err: any) {
            console.error('Error in chat:', err);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Désolé, une erreur de communication est survenue." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAction = async (msgId: string, action: any, confirm: boolean) => {
        // Optimistically update UI to show action was taken
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, requires_human_confirmation: false } : m));

        const systemMsg: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            isSystemAction: true,
            content: confirm ? `✔️ Action confirmée et transmise à la Gateway (${action.deviceId} -> ${action.value}).` : `❌ Action annulée par l'utilisateur.`
        };
        setMessages(prev => [...prev, systemMsg]);

        if (confirm) {
            // Here you would normally dispatch an event to the backend to actually execute the hold action.
            // For now, in our POC, we'll just simulate the success.
            // e.g., authFetch('/api/copilot/execute', { body: { toolCallId: action.toolCallId } })
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* The Chat Window */}
            {isOpen && (
                <div
                    className="mb-4 w-[380px] sm:w-[450px] shadow-2xl rounded-2xl overflow-hidden glass-card flex flex-col border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right"
                    style={{ height: '600px', maxHeight: 'calc(100vh - 120px)' }}
                >
                    {/* Header */}
                    <div className="h-16 px-4 flex items-center justify-between bg-gradient-to-r from-violet-600/10 to-indigo-600/10 dark:from-violet-500/20 dark:to-indigo-500/20 border-b border-slate-200 dark:border-white/5">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center p-[1px]">
                                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Copilote IA</h3>
                                <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                                    En Ligne
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {msg.role === 'user' ? (
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-1">
                                                <User className="w-3 h-3 text-slate-500 dark:text-slate-300" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-1 border border-violet-200 dark:border-violet-500/30">
                                                <Bot className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.isSystemAction ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 italic border border-slate-200 dark:border-white/5' :
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-br-sm'
                                                : 'bg-white dark:bg-[#1A2235] text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/5 rounded-bl-sm'
                                            }`}>
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 my-1 space-y-0.5" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 my-1 space-y-0.5" {...props} />,
                                                    li: ({ node, ...props }) => <li className="" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-violet-700 dark:text-violet-400" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Execution Confirmation card (Human in the loop) */}
                                        {msg.requires_human_confirmation && msg.pending_action && (
                                            <div className="mt-2 w-full glass-card p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold mb-2 text-xs">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 animate-ping" />
                                                    Autorisation Requise
                                                </div>
                                                <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 leading-snug">
                                                    Voulez-vous exécuter l'action <strong>{msg.pending_action.action}</strong> sur l'équipement <span className="font-mono text-orange-600 dark:text-orange-400">{msg.pending_action.deviceId}</span> avec la valeur <strong>{msg.pending_action.value}</strong> ?
                                                </p>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleConfirmAction(msg.id, msg.pending_action, true)}
                                                        className="flex-1 flex justify-center items-center py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmer
                                                    </button>
                                                    <button
                                                        onClick={() => handleConfirmAction(msg.id, msg.pending_action, false)}
                                                        className="flex-1 flex justify-center items-center py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-lg transition-colors"
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" /> Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex w-full justify-start">
                                <div className="flex max-w-[85%] flex-row items-end gap-2">
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center mb-1 border border-violet-200 dark:border-violet-500/30">
                                            <Bot className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 bg-white dark:bg-[#1A2235] text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/5 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-2">
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 relative z-10">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/50 transition-all"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Demandez une action au copilote..."
                                className="flex-1 bg-transparent border-none text-sm px-3 focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                            </button>
                        </form>
                        <div className="text-center mt-2">
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 mr-1" /> Propulsé par UBBEE AI
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* The Floating Bubble Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center p-0 w-14 h-14 bg-gradient-to-br from-slate-900 to-black dark:from-violet-600 dark:to-indigo-900 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] hover:scale-105 transition-all duration-300 border border-slate-800 dark:border-white/20 cursor-pointer overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <Sparkles className="w-6 h-6 text-white group-hover:animate-pulse" />

                    {/* Ripple effect */}
                    <span className="absolute w-full h-full rounded-full border-2 border-violet-500/30 animate-ping" style={{ animationDuration: '3s' }}></span>
                </button>
            )}
        </div>
    );
}
