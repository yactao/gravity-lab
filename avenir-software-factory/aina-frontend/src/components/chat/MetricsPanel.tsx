export default function MetricsPanel() {
    const CpuIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

    return (
        <div className="relative h-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-30 border-l border-gray-200 dark:border-gray-700 flex flex-col w-[200px]">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Metrics</h2>
                <div className="text-lg font-black text-gray-900 dark:text-white">Performances</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Frugalité Score */}
                <div className="bg-white/60 dark:bg-black/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl p-3 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Frugalité</span>
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">A+</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
                        0 KB JS / CSS Natif
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                </div>

                {/* Edge Processing */}
                <div className="bg-white/60 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-blue-500">
                            <CpuIcon />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Latence SLM</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">
                        12ms <span className="text-[10px] text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.5 rounded ml-1">Edge</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
