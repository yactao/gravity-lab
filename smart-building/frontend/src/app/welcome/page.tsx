"use client";

import Link from "next/link";
import { ArrowRight, Play, Server, Zap, Globe, Cpu, Cog, BarChart4, ShieldCheck } from "lucide-react";

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans selection:bg-cyan-500/30 overflow-x-hidden">

            {/* Background Glows */}
            <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none opacity-40 mix-blend-screen"
                style={{ background: "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.4), transparent 70%)" }} />
            <div className="absolute top-[40%] right-[-10%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-20 blur-[120px] bg-indigo-600 mix-blend-screen" />

            {/* HEADER */}
            <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-sm bg-[#0B1120]/50 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase">UBBEE</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <a href="#features" className="hover:text-cyan-400 transition-colors">Fonctionnalités</a>
                    <a href="#use-cases" className="hover:text-cyan-400 transition-colors">Cas d'usage</a>
                    <a href="#pricing" className="hover:text-cyan-400 transition-colors">Tarifs</a>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-semibold hover:text-white transition-colors">Connexion</Link>
                    <Link href="/login" className="px-5 py-2 text-sm font-bold rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        Démarrer
                    </Link>
                </div>
            </header>

            <main className="relative z-10">

                {/* HERO SECTION */}
                <section className="pt-40 pb-20 md:pt-52 md:pb-32 px-6 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-cyan-400 mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        V1.0 disponible en Accès Sécurisé
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl leading-tight mb-8">
                        La GTB 3.0 qui ne nécessite ni <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">câble</span>, ni <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">informaticiens</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-light leading-relaxed">
                        Visualisez, pilotez et réduisez la facture énergétique de vos bâtiments tertiaires grâce à l'Intelligence Artificielle et à un Hub Universel de déploiement en 15 minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Link href="/login" className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                            Auditer mon bâtiment <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors flex items-center gap-2">
                            <Play className="w-4 h-4" /> Voir la démo 2 min
                        </button>
                    </div>

                    {/* REAL HERO DASHBOARD UI */}
                    <div className="mt-20 w-full max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-2 md:p-4 backdrop-blur-xl shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent z-10 rounded-2xl md:h-[120%]" />
                        <div className="rounded-xl border border-white/5 bg-[#111827] overflow-hidden aspect-video relative flex items-center justify-center group">
                            <img src="/marketing/hero_isometric.png" alt="UBBEE Jumeau numerique 3D" className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000" />
                        </div>
                    </div>
                </section>

                {/* SOCIAL PROOF */}
                <section className="py-12 border-y border-white/5 bg-black/20">
                    <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Ils ont réinventé leurs espaces avec nous</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
                        <span className="text-2xl font-black tracking-tighter">ACME CORP</span>
                        <span className="text-2xl font-serif font-bold italic">Global Santé</span>
                        <span className="text-xl font-bold uppercase border-2 border-current px-2 py-1">TECH SPACE</span>
                        <span className="text-2xl font-medium tracking-tight">Eco LOGISTICS</span>
                        <span className="text-2xl font-bold uppercase tracking-widest">NEXUS</span>
                    </div>
                </section>

                {/* FEATURES (ZIG-ZAG) */}
                <section id="features" className="py-24 md:py-32 px-6 max-w-6xl mx-auto space-y-32">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Dites adieu aux usines à gaz et aux intégrateurs hermétiques.</h2>
                    </div>

                    {/* Feature 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">Vos données, enfin parlantes.</h3>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Marre des tableurs ? Localisez immédiatement une fenêtre ouverte ou une zone surchauffée grâce à la première cartographie 3D réactive du marché accessible sur navigateur web.
                            </p>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                                <img src="/marketing/globe_data.png" alt="UBBEE Hub Universel" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">Branchez. Glissez. Pilotez.</h3>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                N'importe qui dans votre entreprise peut ajouter ou moderniser un capteur sans toucher au code ou faire intervenir un prestataire spécialisé. La fonction "Drag & Drop Data Mapping" s'occupe de la traduction brute pour vous.
                            </p>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
                                <img src="/marketing/sensor_appairage.png" alt="UBBEE Appairage IoT Sensor" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" />
                            </div>
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white">Un bâtiment qui réfléchit avec vous.</h3>
                            <p className="text-lg text-slate-400 leading-relaxed">
                                Programmez vos modes "Fermé" le dimanche en détection d'absence, ou profitez du Copilote IA de manière 100% sécurisée pour assister vos opérateurs au quotidien sans perte de contrôle.
                            </p>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-square md:aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 flex items-center justify-center shadow-2xl">
                                <div className="space-y-4 w-full px-6">
                                    <div className="w-full bg-slate-800/80 rounded-lg p-4 border border-white/5 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex flex-col items-center justify-center text-emerald-400"><Cog className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium">SI [Présence] == False ALORS</span>
                                    </div>
                                    <div className="w-full bg-slate-800/80 rounded-lg p-4 border border-white/5 flex items-center gap-4 ml-6">
                                        <span className="text-sm text-cyan-200">Set Chauffage à 17°C (Mode Eco)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* METRICS / ROI */}
                <section className="py-24 bg-black/40 border-y border-white/5">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">Garantir votre conformité, sans brider votre marge.</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <div className="text-4xl md:text-5xl font-black text-white mb-2">-40%</div>
                                <h4 className="text-xl font-bold text-slate-300 mb-2">Décret Tertiaire</h4>
                                <p className="text-slate-500 text-sm">L'obligation de réduction de la consommation énergétique imposée d'ici 2030 par l'État.</p>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent" />
                                <div className="text-4xl md:text-5xl font-black text-cyan-400 mb-2 relative z-10">12 MWh</div>
                                <h4 className="text-xl font-bold text-slate-300 mb-2 relative z-10">Économisés en moyenne</h4>
                                <p className="text-slate-500 text-sm relative z-10">Par an et par bâtiment moyen surveillé grâce à l'extinction automatique hors horaires.</p>
                            </div>
                            <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <div className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">&lt; 14 mois</div>
                                <h4 className="text-xl font-bold text-slate-300 mb-2">Rentabilité Immédiate</h4>
                                <p className="text-slate-500 text-sm">Le Retour sur Investissement (ROI) moyen espéré par la suppression de l'intégration.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER CTA */}
                <section className="py-32 px-6 relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/40" />
                    <div className="max-w-3xl mx-auto relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Testez sur une seule salle. Convainquez-vous.</h2>
                        <p className="text-xl text-cyan-100/70 mb-10 font-light">
                            La vérité est dans les données. Accordez-nous 45 minutes en visio pour estimer l'état actuel de votre digitalisation patrimoniale.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="votre.email@entreprise.fr"
                                className="px-6 py-4 rounded-xl bg-black/40 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 w-full sm:w-96 backdrop-blur-sm"
                            />
                            <button className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all whitespace-nowrap shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                                Demander un Audit
                            </button>
                        </form>
                    </div>
                </section>

            </main>

            {/* FOOTER B2B */}
            <footer className="border-t border-white/10 bg-black/60 py-12 px-6 text-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Zap className="w-5 h-5 text-slate-600" />
                        <span className="font-bold uppercase tracking-widest text-white">UBBEE</span>
                        <span className="ml-2">© 2026 Tous droits réservés. Hébergé en France.</span>
                    </div>
                    <div className="flex gap-6 text-slate-500">
                        <button className="hover:text-white transition-colors">Politique RGPD</button>
                        <button className="hover:text-white transition-colors">Mentions Légales</button>
                        <button className="hover:text-white transition-colors">Contact Support</button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
