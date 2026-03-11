// src/pages/Home/Home.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import BlurText from "../../utils/BlurText";
import SpotlightCard from "../../components/SpotlightCard/SpotlightCard";
import TypedText from "../../components/TypedText/TypedText";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronDown, Pause, Play, Sparkles, Monitor, Briefcase, Factory, ShieldCheck, Database, Zap, Users, X } from "lucide-react";
import FeaturesModal from "../../components/FeaturesModal/FeaturesModal";
import Header from "../../components/Header/Header";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import HomeTour from "../../components/Guide/HomeTour";
import StorySection from "../../components/StorySection/StorySection";
import PricingSection from "../../components/PricingSection/PricingSection";

// Configuration centralisée de la Marketplace SaaS (Avenir Software Factory)
const MARKETPLACE_CONFIG = [
  {
    id: "briefing",
    department: "📍 Démarrage : La Salle de Briefing",
    icon: Briefcase,
    desc: "Définissez votre architecture et lancez la bonne équipe de production sur votre projet.",
    gradient: "from-indigo-600 to-blue-600",
    agents: [
      {
        id: "product_owner",
        title: "Aïna Architecte & PO",
        role: "Chef de Projet / Orchestrateur",
        desc: "Discutez de votre besoin en langage naturel. Je concevrai l'architecture et je déploierai la bonne escouade d'experts sur votre environnement.",
        img: "/standard-bot.webm",
        size: "large" as const,
        gradient: "from-indigo-600 to-blue-600",
        level: "Lead",
      }
    ]
  },
  {
    id: "squad_refactoring",
    department: "Escouade Frugalité & FinOps",
    icon: Monitor,
    desc: "Optimisation de Code & Réduction drastique de votre facture Cloud.",
    gradient: "from-emerald-500 to-teal-600",
    agents: [
      {
        id: "finops_lead",
        title: "Aïna FinOps Lead",
        role: "Expert Optimisation Cloud",
        desc: "Analyse votre infrastructure et vos requêtes pour diviser vos coûts par trois.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-emerald-500 to-teal-600",
        level: "Senior",
      },
      {
        id: "refactoring_dev",
        title: "Aïna Clean Coder",
        role: "Développeur Senior",
        desc: "Réécrit vos algorithmes lents et supprime la dette technique sans régression.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-green-500 to-emerald-600",
        level: "Senior",
      }
    ]
  },
  {
    id: "squad_cyber",
    department: "Escouade Pentest & Cybersécu",
    icon: ShieldCheck,
    desc: "Audit de Sécurité Stricte, recherche de failles et remédiation automatique.",
    gradient: "from-red-500 to-rose-700",
    agents: [
      {
        id: "ciso_agent",
        title: "Aïna CISO",
        role: "Directeur Sécurité (Blue Team)",
        desc: "Vérifie la conformité RGPD et les politiques de mots de passe.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-red-500 to-rose-700",
        level: "Lead",
      },
      {
        id: "pentester_agent",
        title: "Aïna Pentester",
        role: "Hacker Éthique (Red Team)",
        desc: "Teste les failles XSS, Injections SQL et génère les correctifs (PRs).",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-orange-500 to-red-600",
        level: "Senior",
      }
    ]
  },
  {
    id: "squad_data",
    department: "Escouade Data & Gouvernance RAG",
    icon: Database,
    desc: "Connexion, nettoyage et gouvernance de vos données pour une IA interne fiable.",
    gradient: "from-purple-500 to-fuchsia-600",
    agents: [
      {
        id: "data_engineer",
        title: "Aïna Data Engineer",
        role: "Pipeline ETL & RAG",
        desc: "Connecte, vectorise et orchestre l'ingestion de vos données vers les LLMs de manière sécurisée.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-purple-500 to-fuchsia-600",
        level: "Senior",
      },
      {
        id: "data_quality",
        title: "Aïna Data Quality",
        role: "Analyste Qualité Data",
        desc: "Détecte les doublons, corrige les valeurs aberrantes et nettoie vos datasets (zéro data-trash).",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-fuchsia-500 to-pink-600",
        level: "Junior",
      },
      {
        id: "data_governance",
        title: "Aïna Data Governance",
        role: "DPO & Conformité",
        desc: "Cartographie les flux, gère les habilitations d'accès et audite la conformité RGPD de vos bases.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-pink-500 to-rose-500",
        level: "Lead",
      }
    ]
  },
  {
    id: "squad_fast_track",
    department: "Le Bâtisseur Fast-Track",
    icon: Zap,
    desc: "Besoins urgents ? C'est le développeur qui code et livre la PR ce soir.",
    gradient: "from-amber-500 to-orange-600",
    agents: [
      {
        id: "coder_fast",
        title: "Aïna Fullstack Node/React",
        role: "Développeur Feature",
        desc: "Code votre fonctionnalité urgente. Testé en Sandbox Azure avant livraison.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-amber-500 to-orange-600",
        level: "Junior",
      }
    ]
  },
  {
    id: "squad_admin",
    department: "Escouade Admin & RH",
    icon: Users,
    desc: "Soulagez vos équipes back-office : facturation, on-boarding et pilotage.",
    gradient: "from-cyan-500 to-blue-500",
    agents: [
      {
        id: "compta_agent",
        title: "Aïna Compta",
        role: "Contrôleur de Gestion",
        desc: "Rapprochement bancaire, génération de factures et relances automatiques.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-cyan-500 to-blue-500",
        level: "Junior",
      },
      {
        id: "rh_agent",
        title: "Aïna RH & Recrutement",
        role: "Responsable On-boarding",
        desc: "Pré-filtrage de CVs, création de fiches de poste, et suivi d'intégration.",
        img: "/standard-bot.webm",
        size: "medium" as const,
        gradient: "from-blue-400 to-cyan-500",
        level: "Junior",
      }
    ]
  }
];

// Textes statiques retirés, on les mettra en dur pour plus de fluidité

export default function Home() {
  const navigate = useNavigate();
  const [typedStart] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState<typeof MARKETPLACE_CONFIG[0] | null>(null);

  const heroRef = useRef<HTMLElement | null>(null);
  const modulesRef = useRef<HTMLElement | null>(null);

  const [isTourActive, setIsTourActive] = useState(false);
  const tourRef = useRef<any>(null);

  const handleTourComplete = () => {
    setIsTourActive(false);
  };

  const handleTourSkip = () => {
    setIsTourActive(false);
  };


  // Navigation par scroll désactivée pour permettre le défilement naturel
  useEffect(() => {
    // Scroll snapping was interfering with normal scrolling on large dynamic sections
  }, [currentSlide]);

  const openFeaturesModal = () => {
    setIsFeaturesModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative">
      <Header />
      {/* Effets de particules subtiles */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-blue-400/30 rounded-full" />
        ))}
      </div>
      <div className="relative z-10">
        {/* Premium Hero Section */}
        <section
          ref={heroRef}
          className="min-h-screen flex flex-col justify-center items-center px-6 lg:px-8 py-12 relative
            bg-gradient-to-br from-white via-indigo-50/50 to-blue-100/30
            dark:from-[#0a0f1c] dark:via-[#111827] dark:to-[#1e1b4b]
            overflow-hidden"
        >
          {/* Subtle grid and glows */}
          <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-6xl text-center text-white relative z-10">
            {/* Badge d'introduction */}
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              <div className="flex items-center justify-center p-1 bg-yellow-400/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200">
                Aïna SaaS Intelligence
              </span>
            </div>

            {/* Titre principal fixe pour plus de fluidité */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Avenir Software Factory. <br />
                <span className="text-blue-600 dark:text-indigo-400">Votre équipe technique à la demande.</span>
              </h1>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto">
              <TypedText
                start={typedStart}
                text="Transformez vos idées en code de production sécurisé. Discutez de votre besoin avec notre Product Owner IA, et nous déploierons l'escouade technique asynchrone idéale. Constituez votre équipe de choc ou recrutez un expert dédié selon vos besoins."
                speed={30}
                className="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-light"
              />
            </div>

            {/* CTA Buttons */}
            <div
              className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <button
                id="discover-agents-btn"
                onClick={() => navigate("/chat/Aïna Architecte & PO")}
                className="group relative rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                          w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-[0_0_40px_rgba(79,70,229,0.3)]
                          hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="flex items-center justify-center gap-3 relative z-10">
                  Entrer en Salle de Briefing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                id="learn-more-btn"
                onClick={openFeaturesModal}
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 hover:scale-[1.02] transition-all duration-300 shadow-sm font-semibold text-lg"
              >
                <span>Documentation</span>
                <ChevronDown className="w-5 h-5 opacity-60 group-hover:translate-y-1 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div
              className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
            </div>
          </div>
        </section>

        {/* Premium Story Section */}
        <StorySection />

        {/* Modules Section améliorée */}
        <section
          ref={modulesRef}
          className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8
            bg-white dark:bg-[#050814]
            flex flex-col justify-start items-center relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10" >
            {/* Animated Title */}
            {true && (
              <div className="text-center mb-10">
                <BlurText
                  text="Votre Digital Labor à portée de main."
                  delay={100}
                  animateBy="words"
                  direction="top"
                  className="text-3xl sm:text-4xl lg:text-5xl mb-4
                    text-gray-900 dark:text-white font-bold"
                />
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Entrez en salle de brief avec l'Architecte, ou déployez directement une de nos 4 escouades de production.
                </p>
              </div>
            )}

            {/* Grid des Escouades */}
            <div className="grid gap-8 sm:gap-10 grid-cols-1 lg:grid-cols-2 max-w-7xl px-2 sm:px-4 relative z-10 mx-auto" id="agents-section">
              {MARKETPLACE_CONFIG.map((dept) => (
                <div 
                  key={dept.id} 
                  className="w-full relative group cursor-pointer"
                  onClick={() => setSelectedSquad(dept)}
                >
                  <div className={`absolute -inset-[1px] bg-gradient-to-r ${dept.gradient} rounded-[2rem] opacity-30 group-hover:opacity-100 blur-sm transition-opacity duration-500`} />
                  <SpotlightCard
                    imageSrc={dept.agents[0].img}
                    size="medium"
                    className={`h-full min-h-[300px] w-full bg-slate-50 dark:bg-[#0c111d] transition-all duration-500 border border-white/50 dark:border-white/5 backdrop-blur-2xl rounded-[2rem] overflow-hidden`}
                  >
                    <div className="flex flex-col justify-between h-full p-8 relative overflow-hidden bg-white/40 dark:bg-transparent">
                      <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${dept.gradient} blur-[64px] opacity-10 group-hover:opacity-40 transition-opacity duration-700 rounded-full pointer-events-none`} />

                      <div className="z-20 relative">
                        <div className={`w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center text-white shadow-lg shadow-${dept.gradient.split('-')[1]}-500/40`}>
                          <dept.icon className="w-7 h-7" />
                        </div>
                        <h3 className={`text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4`}>
                          {dept.department}
                        </h3>
                        <p className="text-base text-gray-700 dark:text-gray-400 leading-relaxed font-medium">
                          {dept.desc}
                        </p>
                      </div>

                      <div className="mt-8 flex items-center justify-between z-20 relative pt-6 border-t border-gray-200 dark:border-gray-800">
                        <span className="text-sm font-bold text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                          {dept.agents.length} expert{dept.agents.length > 1 ? 's' : ''} dans l'équipe
                        </span>
                        <div className={`w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center transform group-hover:scale-110 group-hover:bg-gradient-to-br ${dept.gradient} group-hover:border-transparent transition-all duration-500 shadow-sm group-hover:shadow-lg text-gray-400 group-hover:text-white`}>
                          <ArrowRight className="w-5 h-5 transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Prêt à transformer votre façon de travailler ?
              </p>
              {/* <button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToModules}
                className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900 px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Commencer l'aventure Aïna
              </button> */}
            </div>
          </div>
        </section>

        {/* Tableau Giga Premium Pricing */}
        <PricingSection />
      </div>

      {/* MODAL EQUIPE DE FOOT (DÉTAIL SQUAD) */}
      {selectedSquad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm">
          <div 
            className="absolute inset-0"
            onClick={() => setSelectedSquad(null)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-10 animate-fade-in-up">
            <button 
              onClick={() => setSelectedSquad(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedSquad.gradient} flex items-center justify-center text-white shadow-lg`}>
                <selectedSquad.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {selectedSquad.department}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                  Membres de l'équipe disponibles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {selectedSquad.agents.map((agent) => (
                <Link 
                  key={agent.id}
                  to={`/chat/${encodeURIComponent(agent.title)}`} 
                  className="block h-full group"
                >
                  <div className={`h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                    <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${agent.gradient}`} />
                    <div className="pl-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {agent.title}
                            {agent.level === "Lead" && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" title="Expertise : Lead Architecte">
                                <ShieldCheck className="w-3 h-3" />
                              </span>
                            )}
                          </h4>
                          <span className={`inline-block px-3 py-1 mr-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${agent.gradient}`}>
                            {agent.role}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                            ${agent.level === "Lead" ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800" :
                              agent.level === "Senior" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" :
                              "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}>
                            {agent.level === "Lead" ? "🧠 Lead LLM" : agent.level === "Senior" ? "⚙️ Senior LLM" : "⚡ Junior SLM"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {agent.desc}
                      </p>
                      
                      <div className="mt-6 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                        <span>Recruter l'expert</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Modal */}
      <FeaturesModal
        isOpen={isFeaturesModalOpen}
        onClose={() => setIsFeaturesModalOpen(false)}
      />
      <button
        onClick={() => setIsTourActive(true)}
        className="fixed bottom-8 right-8 z-30 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300">
        <QuestionMarkCircleIcon className="w-6 h-6" />
      </button>
      {/* Composant HomeTour avec refs */}
      <HomeTour
        ref={tourRef}
        isActive={isTourActive}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        heroRef={heroRef}
        modulesRef={modulesRef}
      />
    </div>
  );
}