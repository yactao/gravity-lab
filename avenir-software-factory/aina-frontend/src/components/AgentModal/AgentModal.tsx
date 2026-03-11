import { useNavigate } from "react-router-dom";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    name: string;
    image: string;
    description: React.ReactNode;
    href?: string;
  } | null;
}

export default function AgentModal({ isOpen, onClose, agent }: AgentModalProps) {
  const navigate = useNavigate();

  if (!agent) return null;

  const handleGoToAgent = () => {
    if (agent.href) {
      navigate(agent.href);
      onClose();
    }
  };

  // Configuration des icônes d'arrière-plan par agent
  const getAgentConfig = (agentName: string) => {
    const configs = {
      "Aïna DOC": {
        gradient: "from-blue-600 to-indigo-600",
        icons: ["📄", "📑", "📊", "📈", "🔍", "📋"],
        iconColor: "text-blue-200",
      },
      "Aïna Finance": {
        gradient: "from-green-600 to-emerald-600",
        icons: ["💰", "💹", "📊", "💳", "🏦", "💸"],
        iconColor: "text-green-200",
      },
      "Aïna Vision": {
        gradient: "from-purple-600 to-violet-600",
        icons: ["👁️", "📷", "🖼️", "🔍", "✨", "🌟"],
        iconColor: "text-purple-200",
      },
      "Aïna Search": {
        gradient: "from-orange-500 to-red-500",
        icons: ["🔍", "📌", "📍", "🎯", "🚀", "⚡"],
        iconColor: "text-orange-200",
      },
      "Aïna Vision Plaques": {
        gradient: "from-indigo-600 to-blue-600",
        icons: ["📷", "🏷️", "📐", "📏", "🧱", "🔍"],
        iconColor: "text-indigo-200",
      },
    };

    return configs[agentName as keyof typeof configs] || configs["Aïna DOC"];
  };

  const agentConfig = getAgentConfig(agent.name);

  // Composant pour les icônes flottantes animées
  const FloatingIcons = () => {
    const icons = agentConfig.icons;
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {icons.map((icon, index) => (
          <div
            key={index}
            className={`absolute ${agentConfig.iconColor} text-2xl opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}>
            {icon}
          </div>
        ))}
        {/* Icônes supplémentaires plus petites */}
        {icons.map((icon, index) => (
          <div
            key={`small-${index}`}
            className={`absolute ${agentConfig.iconColor} text-lg opacity-15`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}>
            {icon}
          </div>
        ))}
      </div>
    );
  };

  // Composant pour les particules animées
  const AnimatedParticles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, index) => (
          <div
            key={index}
            className={`absolute w-2 h-2 rounded-full ${agentConfig.iconColor} opacity-10`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }} />
        ))}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          key="agent-modal"
          className="fixed inset-0 bg-slate-900/30 backdrop-blur
                     grid place-items-center cursor-pointer"
          onClick={onClose}>
          {/* ✅ Image de l'agent */}
          <img
            src={agent.image}
            alt={agent.name}
            className="absolute top-20 w-60 h-100 object-contain" />

          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-gradient-to-br ${agentConfig.gradient} text-white
                       p-6 rounded-lg w-full max-w-lg shadow-xl relative overflow-hidden pt-44`}>
            {/* ✅ Icônes animées en arrière-plan */}
            <FloatingIcons />
            <AnimatedParticles />

            {/* Effet de brillance animé */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative z-10 text-left">
              <h3 className="text-3xl font-bold mb-4">
                {agent.name}
              </h3>
              
              <p className="mb-6 whitespace-pre-line leading-relaxed">
                {agent.description}
              </p>

              <div className="flex gap-3">
                {/* ✅ Bouton vers l'agent */}
                <button
                  onClick={handleGoToAgent}
                  className="bg-white text-gray-800 font-semibold px-4 py-2
                             rounded hover:bg-gray-100 transition shadow-lg
                             hover:scale-105 transform duration-200
                             border-2 border-white/50"
                >
                  Aller vers {agent.name}
                </button>

                {/* Fermer */}
                <button
                  onClick={onClose}
                  className="bg-transparent border-2 border-white text-white
                             font-semibold px-4 py-2 rounded hover:bg-white
                             hover:text-gray-800 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}