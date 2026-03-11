import React from 'react';

export default function CommandSidebar({ activeTool }: { activeTool?: string }) {
    // SVG Icons purs (Frugalité)
    const CodeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    );

    const ShieldIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    );

    return (
        <div className="relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30 border-r border-gray-200 dark:border-gray-700 flex flex-col w-[250px]">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Command Center</h2>
                <div className="text-lg font-black text-gray-900 dark:text-white">Pilotage</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Widget Agents en mission */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Agents en mission</h3>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>

                    <div className="space-y-3">
                        {/* Agent Coder */}
                        <div className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <CodeIcon />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Lead Tech</span>
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                    ⚡ x15
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                                En attente (RabbitMQ)
                            </div>
                        </div>

                        {/* Agent Sécu */}
                        <div className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50"></div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                        <ShieldIcon />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 opacity-70">Pentester</span>
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold">
                                    Veille
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                Inactif
                            </div>
                        </div>
                    </div>
                </div>

                {/* Espace pour d'autres widgets (historique simplifié etc) si besoin plus tard */}
            </div>
        </div>
    );
}
