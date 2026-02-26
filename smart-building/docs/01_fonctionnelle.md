# 1. Documentation Fonctionnelle UBBEE (V1)

## Vision du Produit
**UBBEE** est une plateforme SaaS (Software as a Service) B2B permettant la supervision, le pilotage et l'analyse intelligente des bâtiments d'entreprise (Smart Building). 
Elle s'adresse aux *Facility Managers*, aux responsables d'exploitation et aux gestionnaires d'énergie pour optimiser la consommation, réduire l'empreinte carbone et assurer le confort des occupants grâce à des capteurs IoT et des règles domotiques.

## Multi-Tenancy et Rôles
Le système est pensé pour gérer de multiples sociétés (Tenants). Il supporte deux grands contextes :

### 1. Contexte Opérateur (Super Admin / UBBEE)
- **Rôle :** `SUPER_ADMIN`
- **Périmètre :** A la vision de **tous les clients** de la plateforme.
- **Actions :** Peut créer/supprimer des clients, ajouter des sites, forcer des configurations réseau. C'est l'interface de "Gestion de Parc" globale.

### 2. Contexte Client (B2B)
- **Rôles :** `ENERGY_MANAGER` (Admin Client), `TECHNICIAN`, `CLIENT` (Lecteur/Invité).
- **Périmètre :** Restreint aux **sites et utilisateurs de sa propre organisation** (Ex: Decathlon ne voit que les magasins Decathlon).
- **Actions :** Pilotage des sites, lecture des consommations, paramétrage des règles de ses bâtiments.

## Modules Fonctionnels (Fonctions Clés)

### A. Tableau de Bord Global
- **Supervision temps réel :** KPIs dynamiques de santé des bâtiments, coût énergétique estimé, émissions CO2 évitées.
- **Répartition :** Graphiques de split consommation CVC (Chauffage, Ventilation, Clim) vs le reste. Modulable Temporellement (Jour/Mois).
- **Mises à jour asynchrones :** Les métriques fluctuent en direct via WebSockets reflétant la réalité des capteurs.

### B. Gestion de Parc (Sites & Zones)
- **Typologie :** Organisation hiérarchique : Client -> Sites (Bâtiments géolocalisés) -> Zones (Pièces / Étages).
- **Carte Globale :** Interface cartographique mondiale listant les sites actifs avec une vue filtrable.

### C. Jumeau Numérique (Digital Twin)
- **Vue 3D Dynamique :** Modélisation isométrique 3D du plancher d'un site.
- **Couches DataViz :** Possibilité de voir la donnée colorisée sur le plan 3D : 
  - *Thermique* (Bleu/Vert/Rouge selon la T°).
  - *Qualité d'Air* (Orange si > 800ppm CO2).
  - *Occupation* (Mise en évidence des salles occupées).

### D. Moteur de Règles & Alertes
- **Logique SI/ALORS (IFTTT) :** Interfaces visuelle (drag & drop) de conditionnement IoT (Ex: "Si T° > 25°C ALORS allumer Climatisation").
- **Tableau des Alertes :** Journalisation des erreurs de communication réseau ou des dépassements de seuils critiques.

### E. Paramètres & Marque Blanche
- **SSO / Utilisateurs :** Gestion interne des collaborateurs du client.
- **Plages Horaires :** Définition des modes "Ouvert / Fermé" pour le pilotage automatique ÉCO.
- **Marque Blanche :** Personnalisation des couleurs de l'espace au logo de l'entreprise B2B (Mise en place de tokens UI).
- **Intégrations :** Webhooks sortants et lecture de Clés API pour intégration avec PowerBI ou un ERP tiers.
