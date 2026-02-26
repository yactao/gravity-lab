# 2. Documentation Technique

## Stack Technologique Globale
L'application est construite autour du framework Javascript **React** coté Frontend et **Node.js / Express** coté Backend.

### Frontend
- **Framework :** Next.js 14+ (App Router) en React (TypeScript).
- **Style CSS :** Tailwind CSS avec plugin "Tailwind Animate". Prise en charge stricte du Dark/Light mode via la classe `dark:` et design ultra-moderne (*Glassmorphism*).
- **Librairies Graphiques (DataViz) :**
  - **Recharts :** Génération des courbes temporelles, des graphiques multi-axes (ComposedChart avec Line/Area).
  - **React-Leaflet :** Intégration de OpenStreetMap pour la cartographie des sites. Composants chargés dynamiquement (`next/dynamic`) pour éviter les conflits SSR (Server-Side Rendering).
  - **Three.js / React Three Fiber :** Rendu du Jumeau Numérique 3D hardware-accelerated. Utilisation de `@react-three/drei` pour les contrôles orbitaux de caméra et l'incrustation HTML de la domotique.
- **Temps Réel :** `socket.io-client` pour le maintien d'une connexion persistante avec le Backend permettant la mise à jour des jauges sans refresh.
- **Icônes :** Lucide React.
- **UI Builders :** DnD-Kit pour le Drag&Drop des widgets du dashboard. Customisation poussée avec `clsx` et `tailwind-merge` (`cn` utility).

### Backend
- **Serveur :** Node.js avec Express.
- **ORM & Base de données :** TypeORM avec SQLite (Moteur local, prêt à être switché sur PostgreSQL en production par simple modification de la chaîne de connexion).
- **Authentification :** JSON Web Tokens (JWT) générés au login.
- **Temps Réel :** `socket.io` branché sur le serveur HTTP Express. Un worker émet des payloads aléatoires ou réels vers les clients abonnés pour simuler le trafic IoT.
- **Scripts Utilitaires :** Utilisation intensive de scripts CommonJS (`.cjs`) pour le seeding de base de données, la génération massive de fausses alertes, et les déploiements (SSH scripts).

## Structure des Fichiers (Frontend)
```text
src/
├── app/                  # Routeur Next.js
│   ├── page.tsx          # Tableau de bord Global
│   ├── clients/          # Annuaire et Dashboard clients B2B spécifiques
│   ├── map/              # Cartographie plein écran
│   ├── energy/           # Rapports de consommations
│   ├── rules/            # Moteur IFTTT domotique
│   └── settings/         # Configuration Marque Blanche et Utilisateurs
├── components/
│   ├── dashboard/        # Widgets et visualisations (Charts, Three.js BuildingModel)
│   ├── layout/           # Sidebar, Header avec le 'Tenant Switcher'
│   └── ui/               # Éléments réutilisables (Select, Inputs, etc.)
├── lib/
│   ├── TenantContext.tsx # Cerveau de la Multi-tenancy (Rôle + Organisation courante)
│   └── utils.ts          # Helpers Tailwind (cn)
└── globals.css           # Variables CSS, Classes personnalisées (Glassmorphism, Scrollbars)
```

## Gestion de l'Etat de Session (TenantContext)
L'authentification et le multi-tenant repose fortement sur `TenantContext`.
A chaque appel API (`authFetch`), le frontend injecte automatiquement l'identifiant de l'organisation courante et le jeton sécurisé. Si l'utilisateur est un `SUPER_ADMIN`, il peut manipuler la variable `currentTenant` pour se faire passer temporairement pour une autre entreprise et visionner la plateforme telle que le client la voit.
