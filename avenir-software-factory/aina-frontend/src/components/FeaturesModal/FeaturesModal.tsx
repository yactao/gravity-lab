// src/components/FeaturesModal/FeaturesModal.tsx
import { X, Shield, Zap,  Users,  Bot, MessageCircle, FileText } from 'lucide-react';

interface FeaturesModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  const FeaturesModal: React.FC<FeaturesModalProps> = ({ isOpen, onClose }) => {
    const features = [
      {
        icon: <Bot className="w-8 h-8" />,
        title: "Agents Spécialisés",
        description: "Des agents IA dédiés à chaque service, entraînés spécifiquement sur vos données métier pour une expertise sectorielle unique.",
        gradient: "from-purple-500 to-pink-500",
        details: [
          "Entraînement sur vos données métier",
          "Expertise par service spécialisée",
          "Réponses contextuelles précises"
        ]
      },
      {
        icon: <Zap className="w-8 h-8" />,
        title: "Intégration Fluide",
        description: "Intégrez facilement nos agents IA dans vos processus existants pour automatiser et optimiser vos opérations quotidiennes.",
        gradient: "from-yellow-500 to-orange-500",
        details: [
          "Connecteurs API prêts à l'emploi",
          "Intégration avec vos outils",
          "Déploiement rapide et sécurisé"
        ]
      },
      {
        icon: <Shield className="w-8 h-8" />,
        title: "Données Privées & Sécurisées",
        description: "Vos données restent 100% confidentielles. Chaque agent est entraîné exclusivement sur vos données et hébergé dans votre environnement.",
        gradient: "from-green-500 to-emerald-500",
        details: [
          "Hébergement sur votre infrastructure",
          "Aucune donnée partagée avec des tiers",
          "Conformité RGPD et sectorielle"
        ]
      },
      {
        icon: <Users className="w-8 h-8" />,
        title: "Collaboration Inter-Services",
        description: "Faites collaborer vos agents IA entre différents services pour une vision unifiée et des décisions coordonnées.",
        gradient: "from-blue-500 to-cyan-500",
        details: [
          "Agents communicants entre services",
          "Workflows transversaux optimisés",
          "Partage sécurisé d'insights"
        ]
      },
      {
        icon: <MessageCircle className="w-8 h-8" />,
        title: "Support Client Intelligent",
        description: "Un agent dédié au support client, formé sur votre base de connaissances pour des réponses précises et instantanées.",
        gradient: "from-indigo-500 to-purple-500",
        details: [
          "Réponses basées sur votre documentation",
          "Résolution de problèmes en temps réel",
          "Historique des interactions clients"
        ]
      },
      {
        icon: <FileText className="w-8 h-8" />,
        title: "Analyse Commerciale Avancée",
        description: "L'agent analyse vos données commerciales pour identifier des tendances, opportunités et recommandations actionnables.",
        gradient: "from-red-500 to-pink-500",
        details: [
          "Analyse prédictive des ventes",
          "Recommandations personnalisées",
          "Rapports automatiques mensuels"
        ]
      }
    ];
  
    const stats = [
      { value: "24/7", label: "Disponibilité des agents" },
      { value: "<2s", label: "Temps de réponse moyen" },
      { value: "95%", label: "Précision des réponses" },
      { value: "100%", label: "Données privées" }
    ];
  
    return (
      <>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto"
              onClick={onClose}>
              {/* Modal Container */}
              <div
                className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 p-4"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center py-6">
                    <div>
                      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
                        La puissance des agents IA spécialisés
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-3xl">
                        Découvrez comment les agents IA d'Aïna, entraînés spécifiquement sur vos données métier, 
                        transforment l'efficacité de chaque service de votre entreprise.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200">
                      <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
  
                  {/* Stats Section */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
  
                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                      <div
                        key={feature.title}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group">
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {feature.icon}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {feature.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        
                        {/* Details List */}
                        <ul className="space-y-2">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} mr-3`} />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
  
                  {/* CTA Section */}
                  <div className="text-center py-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                      Prêt à déployer vos agents IA spécialisés ?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                      Rejoignez les entreprises qui utilisent déjà des agents IA Aïna, entraînés sur leurs données métier 
                      pour transformer l'efficacité de chaque service.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={onClose}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                        Découvrir nos agents
                      </button>
                      <button
                        onClick={onClose}
                        className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-2xl font-semibold border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300">
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </>
    );
  };
  
  export default FeaturesModal;