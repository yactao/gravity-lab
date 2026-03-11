import React, { useState } from 'react';

export default function FrugalHUD({ activeTool }: { activeTool?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    const CodeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    );

    const ShieldIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
    );

    const CpuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            <rect x="9" y="9" width="6" height="6"></rect>
            <line x1="9" y1="1" x2="9" y2="4"></line>
            <line x1="15" y1="1" x2="15" y2="4"></line>
            <line x1="9" y1="20" x2="9" y2="23"></line>
            <line x1="15" y1="20" x2="15" y2="23"></line>
            <line x1="20" y1="9" x2="23" y2="9"></line>
            <line x1="20" y1="14" x2="23" y2="14"></line>
            <line x1="1" y1="9" x2="4" y2="9"></line>
            <line x1="1" y1="14" x2="4" y2="14"></line>
        </svg>
    );

    const ChevronIcon = ({ open }: { open: boolean }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );

    return (
        <div className="w-full max-w-3xl mx-auto mt-2">
            {/* Bouton Toggle discret */}
            <div className="flex justify-center -mb-3 relative z-10">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm transition-all"
                >
                    <span>Aïna System HUD</span>
                    <ChevronIcon open={isOpen} />
                </button>
            </div>

            {/* Accordéon de contenu */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 pt-6 shadow-lg mt-1 mx-2 flex flex-col md:flex-row gap-4">

                    {/* Colonne Gauche: Agents */}
                    <div className="flex-1">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Agents en mission</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Lead Tech */}
                            <div className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-2.5 flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                        <CodeIcon />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Lead Tech</div>
                                        <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_1.5s_ease-in-out_infinite]" /> En attente
                                        </div>
                                    </div>
                                </div>
                                <div className="px-1.5 py-0.5 rounded
 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] font-bold">⚡ x15</div>
                            </div>

                            {/* Pentester */}
                            <div className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-2.5 flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50"></div>
                                <div className="flex items-center gap-2 opacity-70">
                                    <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                        <ShieldIcon />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Pentester</div>
                                        <div className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Veille
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Séparateur */}
                    <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700"></div>

                    {/* Colonne Droite: Metrics */}
                    <div className="w-full md:w-[200px]">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Performances</h3>
                        <div className="space-y-2">
                            <div className="bg-white/60 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-lg p-2 flex justify-between items-center">
                                <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Frugalité UI</span>
                                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">0 KB JS (A+)</span>
                            </div>
                            <div className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 rounded-lg p-2 flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    <span className="text-blue-500"><CpuIcon /></span>
                                    Latence
                                </div>
                                <div className="text-[10px] font-mono text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1">
                                    12ms <span className="text-[8px] border border-emerald-500/30 text-emerald-500 px-1 rounded">Edge</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
