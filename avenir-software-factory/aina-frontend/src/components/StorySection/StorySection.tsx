import React from 'react';
import { Sparkles, Code, Shield, BrainCircuit } from 'lucide-react';
import { useRef } from 'react';

const StorySection = () => {
    const sectionRef = useRef(null);

    return (
        <section
            ref={sectionRef}
            className="py-32 relative bg-white dark:bg-[#050814] overflow-hidden"
        >
            {/* Premium glow backgrounds */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            {/* Decorative grid */}
            <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }}
            />
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Text Column */}
                    <div className="flex flex-col gap-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 w-fit backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-semibold tracking-wide text-indigo-900 dark:text-indigo-300 uppercase">
                                Une Nouvelle Ère
                            </span>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                            Imaginez avoir votre propre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">équipe d'experts</span> disponible 24/7.
                        </h2>

                        <div className="space-y-6 text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                            <p>
                                Vous travaillez sur un projet ambitieux, mais les ressources vous manquent. Recruter prend des mois, l'externalisation est complexe et les budgets explosent.
                            </p>
                            <p>
                                Et s'il suffisait d'un clic pour intégrer un <strong>Lead Tech fullstack</strong> capable d'architecturer votre code en quelques secondes ? Ou un <strong>Pentester en cybersécurité</strong> vérifiant vos failles en temps réel ?
                            </p>
                            <p className="font-medium text-gray-900 dark:text-gray-200">
                                Aïna n'est pas qu'un outil IA de plus. C'est l'extension virtuelle et ultra-spécialisée de vos équipes. Fini les compromis sur la qualité de votre production.
                            </p>
                        </div>
                    </div>

                    {/* Right Visual Column (Glassmorphism layout) */}
                    <div className="relative h-[600px] w-full hidden lg:block perspective-1000">
                        <div className="absolute inset-0 preserve-3d">
                            {/* Main abstract card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] aspect-[3/4] rounded-3xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl shadow-[0_40px_80px_rgba(0,0,0,0.07)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-blue-500/20 to-indigo-600/20" />
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 blur-[60px] rounded-full" />

                                <div className="relative h-full flex flex-col p-8 z-10">
                                    {/* Contenu supérieur pour combler l'espace vide central */}
                                    <div className="flex-1 flex flex-col pt-2">
                                        <div className="w-12 h-12 bg-white/50 dark:bg-white/10 rounded-xl mb-6 flex items-center justify-center border border-white/50 dark:border-white/10 shadow-sm">
                                            <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Analyse en continu</h3>
                                        <div className="text-sm text-gray-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/60 p-4 rounded-xl border border-white/60 dark:border-white/10 font-mono shadow-inner">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>Session ID 0xA1B2</span>
                                            </div>
                                            &gt; Initialisation du cluster.<br />
                                            &gt; Synchronisation des experts.<br />
                                            &gt; Audit global de la solution en cours...
                                        </div>
                                    </div>

                                    {/* Les Agents avec vrai texte */}
                                    <div className="mt-auto space-y-4">
                                        <div className="h-16 w-full rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 flex items-center px-4 gap-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-white/10">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                                                <Code className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Aïna Coder</div>
                                                <div className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium tracking-wide">Architecture validée et refactorisée ⚡</div>
                                            </div>
                                        </div>

                                        <div className="h-16 w-full rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 flex items-center px-4 gap-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-white/10">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Aïna Sécu</div>
                                                <div className="text-[11px] sm:text-xs text-purple-600 dark:text-purple-400 font-medium tracking-wide">0 faille critique détectée 🛡️</div>
                                            </div>
                                        </div>

                                        <div className="h-16 w-full rounded-2xl bg-white/60 dark:bg-white/5 border border-white/50 dark:border-white/10 flex items-center px-4 gap-4 backdrop-blur-md transition-all hover:bg-white/80 dark:hover:bg-white/10">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                                                <BrainCircuit className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Aïna Finance</div>
                                                <div className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">Dépenses optimisées de 32% 📉</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default StorySection;
