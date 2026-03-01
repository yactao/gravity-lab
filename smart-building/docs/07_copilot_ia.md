# 7. Documentation du Copilote IA UBBEE

Le Copilote IA UBBEE est un assistant conversationnel intelligent intégré à la plateforme GTB (Gestion Technique du Bâtiment). Il permet aux utilisateurs d'interagir avec les données de leur parc immobilier et de contrôler des équipements en langage naturel.

## 1. Fonctionnalités Principales

- **Contexte Dynamique :** L'Agent connaît en temps réel l'utilisateur connecté, son rôle (Client, Technicien, Energy Manager) et son tenant (`tenantId`).
- **Compréhension du Langage Naturel :** Traduit une phrase humaine (ex: "Coupe l'éclairage de Casa Rivoli") en une action technique structurée sur le bon bâtiment.
- **Récupération de Données :** Capacité à récupérer l'historique et l'état des capteurs/compteurs.
- **Moteur de Recherche Intégrée :** Grâce à des algorithmes de filtrage en base de données, l'IA scrute d'abord les équipements associés au domaine du client avant de proposer une action.

## 2. Architecture Technique

- **Frontend (Widget Client) :**
  - Composant React `CopilotWidget.tsx` intégré dans le layout général.
  - Fenêtre de chat flottante (Glassmorphism UI).
  - Gestion des requêtes utilisateur, état de chargement et persistance temporaire des messages.
  - **Human-in-the-Loop (HITL) :** Affichage d'une carte d'alerte pour les actions de contrôle (Modification de consigne, allumage/extinction). L'IA ne lance **jamais** de commande électrique en autonomie totale.
  - Communication asynchrone avec l'API Backend `/api/copilot/chat`.

- **Backend (Service & Orchestration) :**
  - `CopilotController` & `CopilotService` (NestJS).
  - Sécurité des Endpoints (Bloqué par `JwtAuthGuard`).
  - Filtrage RBAC (Role-Based Access Control) : Un utilisateur "Viewer" ne sera pas autorisé à muter l'état d'un équipement, le backend rejettera l'exécution.
  - Interaction avec **DeepSeek API** (LLM externe, remplaçable par Llama ou Qwen local).

## 3. Mécanisme de Function Calling (Outils LLM)

Le Copilote n'hallucine pas l'état du bâtiment, il exécute des requêtes de découverte (Tools) via le backend :

1. **`list_my_available_devices`** : Permet au LLM de chercher l'ID technique d'un équipement en fonction d'un champ sémantique saisi par l'humain (`searchText` = Nom, Pièce, Zone, Site).
2. **`get_sensor_history`** : Permet au modèle d'analyser l'historique récent d'une série chronologique de températures ou consommations énergétiques.
3. **`set_device_state`** : Prépare la structure d'une commande (ON/OFF/Consigne). L'agent a l'instruction **de ne pas le demander en texte**, mais de simplement appeler cette fonction de manière "silencieuse" pour déclencher la Pop-up UI côté client (HITL).

## 4. Sécurité & Bonnes Pratiques

- **Aucun accès BDD en direct** : Le LLM n'écrit aucune requête SQL. Il ne peut utiliser que les 3 fonctions strictement définies et contrôlées décrites ci-dessus.
- **Human-in-the-Loop garanti :** Même si le LLM est trompé par un prompt malveillant, toute exécution de `set_device_state` est suspendue par l'orchestrateur Backend (Status : `pending_human_confirmation`) ce qui délègue la validation à un bouton clické par l'humain.
- **Variable d'Environnement :** La `DEEPSEEK_API_KEY` est injectée silencieusement au niveau OS et non dans le code source pour éviter toute fuite sur GitHub.

## 5. Déploiement

Le démarrage du service nécessite l'injection stricte de la variable d'environnement au lancement du processus Node/PM2.

\`\`\`bash
# Injection propre de la variable d'environnement (Exemple VPS)
pm2 start ecosystem.config.cjs --only gtb-backend --env production --update-env
\`\`\`
