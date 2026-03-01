# 3. Architecture Logicielle & Modèle Conceptuel de Données

## Modèle de Données (MCD - ORM)
L'architecture de base repose sur un schéma entité-relation rigide permettant la multi-tenancy :

1. **Organization (Client)** : Entité Racine (ex: "UBBEE" ou "Decathlon").
2. **User (Utilisateurs)** : Les employés d'une Organisation (Rôle, Email, Mot de Passe haché).
3. **Site (Bâtiment)** : Les infrastructures physiques liées à une Organisation (ex: "Station-Service Genève").
4. **Zone (Pièce / Étages)** : Les différents espaces cartographiés d'un site (utilisés par le Jumeau Numérique pour positionner les capteurs).
5. **Rule (Règles Domotiques IFTTT)** : Liées à une organisation pour conditionnaliser les événements.

## Architecture Matérielle / Flux de Données (IoT)

### 1. Ingestion de Données (Acquisition & Connectivité)
Les *gateways U-Bots* ou concentrateurs IoT situés dans les bâtiments des clients émettent des données agrégées (Température, Consommation CVC, CO2).
- **Inventaire (Gateways) :** L'interface d'Inventaire Matériel permet de provisionner et "pré-assigner" une gateway (par adresse MAC) à un Site avant même sa mise sous tension.
- **Protocole Nominal:** MQTT pour les U-Bots ou HTTP POST vers le Backend UBBEE.
- **Worker de Simulation & Console Live:** La `Console IoT (Live)` (Frontend) permet à un opérateur réseau d'intercepter et visualiser en temps réel les payloads JSON transmis par un capteur sur ce flux MQTT, facilitant énormément le débogage (format, batterie, pertes de connexion).
- Un service de simulation interne (voir `/backend/index.js` `simulateData()`) crache aléatoirement de la donnée sur le Socket IO et la Console Live pour simuler la charge en développement.

### 2. Traitement (Processing & Rule Engine)
Le Backend reçoit la trame IoT:
1. Enregistrement en base de données SQL (TSDB native / Historisation).
2. Évaluation face au **Moteur de Règles** (`Rules`). Si une condition est remplie (Ex: *Consommation > X kWh*), une **Alerte** est générée en base.
3. Le Backend "pousse" instantanément la nouvelle donnée vers le réseau de serveurs Frontend connectés via WebSocket (`socket.emit('refresh_data')`).

### 3. Restitution (Dashboard Client)
1. Le Frontend abonné au WebSockets reçoit les signaux de rafraîchissement au fil de l'eau.
2. Les graphes React (Recharts / Three.js) se mettent à jour réactivement sans recharger le DOM.
3. Les Notifications In-App remontent visuellement l'alerte traitée par le moteur.

```mermaid
graph TD
    A[Capteurs IoT / U-Bots] -->|MQTT / API REST| B(Backend UBBEE - Node.js)
    B -->|TypeORM / Insert| C[(Base TypeDB SQLite/Postgres)]
    B -->|Check Sécurité / IFTTT| D{Moteur de Règles}
    D -->|Si Dépassement| E[Génération Alertes / Webhooks Externes]
    B -->|WebSocket Pub/Sub| F[Frontend Next.js React]
    B -.->|Interception Brute| H[Console IoT Live / Debug]
    F <-->|Demande Info Client (JWT)| B
    F --> G[Render Dashboard HTML/3D Jumeau]
```

## Concept de Jumeau Numérique B2B (DataViz 3D)
Afin de ne pas surcharger la page avec 50 sites simultanés :
- Chaque maquette 3D est rattaché à Un Seul Bâtiment (`Site`).
- Les zones sont modélisées dynamiquement (Box3D) selon la table `Zone` de la base SQL (les tailles `size` et `position` des zones SQL définissent où elles se trouvent en 3D).
- Le Frontend applique un "matériau" de couleur transparente par-dessus (Layer) selon ce qu'il écoute (Thermique, CO2, Occupation) transformant de la Data Textuelle en une carte de chaleur immersive (Heatmap spatiale).
