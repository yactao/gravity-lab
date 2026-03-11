// src/components/Guide/ChatTourConfig.ts
export interface ChatTourStep {
    id: string;
    title: string;
    description: string;
    targetId: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }
  
  export const CHAT_TOUR_STEPS: ChatTourStep[] = [
    {
      id: 'sidebar-toggle',
      title: 'Gérez vos conversations',
      description: 'Cliquez ici pour ouvrir le menu des conversations, voir l\'historique, ou créer une nouvelle discussion.',
      targetId: 'chat-sidebar-toggle',
      position: 'right' // Type littéral explicite
    },
    {
      id: 'agent-selector',
      title: 'Choisissez votre agent IA',
      description: 'Sélectionnez l\'agent Aïna adapté à votre besoin : DOC pour les documents, Finance pour les chiffres, Vision pour les images, etc.',
      targetId: 'agent-selector-button',
      position: 'bottom' // Type littéral explicite
    },
    {
      id: 'chat-input',
      title: 'Posez votre question',
      description: 'Tapez votre question ici. Vous pouvez aussi joindre des fichiers, utiliser la reconnaissance vocale, ou changer d\'agent.',
      targetId: 'chat-input-field',
      position: 'top' // Type littéral explicite
    },
    {
      id: 'tools-button',
      title: 'Outils avancés',
      description: 'Accédez à des outils supplémentaires comme la recherche web et l\'assistant email.',
      targetId: 'tools-button',
      position: 'left' // Type littéral explicite
    },
    {
        id: 'voice-recording',
        title: 'Reconnaissance vocale',
        description: 'Cliquez ici pour utiliser la reconnaissance vocale. Parlez et Aïna transcrira votre voix en texte automatiquement.',
        targetId: 'voice-recording',
        position: 'top'
    },
    {
        id: 'file-upload',
        title: 'Joindre des fichiers',
        description: 'Cliquez ici pour joindre un fichier (PDF, image, etc.) à votre question. Aïna analysera le contenu du fichier.',
        targetId: 'file-upload',
        position: 'bottom'
      },
    {
      id: 'send-button',
      title: 'Envoyez votre message',
      description: 'Cliquez ici pour envoyer votre question à Aïna. Vous pouvez aussi appuyer sur Entrée.',
      targetId: 'send-button',
      position: 'right' // Type littéral explicite
    },
    // {
    //   id: 'search-sidebar',
    //   title: 'Recherche contextuelle',
    //   description: 'Utilisez la recherche intelligente pour explorer et analyser vos conversations existantes.',
    //   targetId: 'search-sidebar',
    //   position: 'left' // Type littéral explicite
    // }
  ];