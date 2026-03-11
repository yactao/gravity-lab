import React from 'react';
import { Check, Zap, Crown } from 'lucide-react';

const tiers = [
    {
        name: "Pack Starter",
        description: "Idéal pour l'automatisation de tâches basiques (boilerplate, tests unitaires, data quality).",
        price: "Pay-as-you-go",
        period: "/ usage (SLM)",
        features: [
            "Accès aux Agents Juniors (SLM)",
            "Déploiement asynchrone standard",
            "Consommation ultra-frugale",
            "Idéal pour le back-office (RH, Compta)"
        ],
        buttonText: "Commencer frugale",
        icon: <Zap className="w-6 h-6 text-gray-400" />,
        popular: false,
        gradient: "from-gray-400 to-gray-500",
    },
    {
        name: "Mode Expert",
        description: "Architectures complexes, refactoring intensif et orchestration de Squads complètes.",
        price: "Sur-mesure",
        period: "/ usage (LLM)",
        features: [
            "Agents Seniors & Lead Architect",
            "Mémoire de projet (Isolation Tenant)",
            "Signature des requêtes [Engine: LLM]",
            "Audit sécurité natif (CISO)"
        ],
        buttonText: "Activer la Factory",
        icon: <Zap className="w-6 h-6 text-blue-500" />,
        popular: true,
        gradient: "from-blue-600 to-indigo-600",
    },
    {
        name: "Enterprise + Trust Seal",
        description: "Garantie de qualité industrielle : chaque PR livrée possède son 'Badge de Confiance'.",
        price: "Forfait",
        period: "/ mois",
        features: [
            "Certification anti-failles (Pentester)",
            "Indice de frugalité & Bundle garanti",
            "Validation Conformité Architecturale",
            "Déploiement isolé sur votre infra (VPS)"
        ],
        buttonText: "Obtenir le Badge",
        icon: <Crown className="w-6 h-6 text-purple-500" />,
        popular: false,
        gradient: "from-purple-600 to-pink-600",
    }
];

const PricingSection = () => {
    return (
        <section className="py-24 relative bg-gray-50 dark:bg-[#080d1a] overflow-hidden" id="pricing">
            {/* Decorative background Elements */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">
                        Modèles Pay-per-Skill
                    </h2>
                    <h3 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
                        Votre équipe d'experts,<br />à une fraction du prix.
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Vous ne payez que le "cerveau" mobilisé. Du script frugal par SLM à l'architecture certifiée par le "Badge de Confiance". Transparence totale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
                    {tiers.map((tier, index) => (
                        <div
                            key={tier.name}
                            className={`relative rounded-[2rem] p-8 md:p-10 transition-all duration-300
                ${tier.popular
                                    ? 'bg-white dark:bg-[#0c1322] border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.2)] md:-translate-y-4'
                                    : 'bg-white/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 backdrop-blur-xl hover:shadow-xl hover:-translate-y-2'}
              `}
                        >
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md shadow-indigo-500/30">
                                        Le plus choisi
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                                    {tier.icon}
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tier.name}</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-sm h-10">{tier.description}</p>
                            </div>

                            <div className="mb-8 flex items-baseline gap-1">
                                <span className="text-4xl font-black text-gray-900 dark:text-white">{tier.price}</span>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{tier.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3.5 px-4 rounded-full font-bold transition-all duration-200
                ${tier.popular
                                    ? `bg-gradient-to-r ${tier.gradient} text-white hover:shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5`
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}
              `}>
                                {tier.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
