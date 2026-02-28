# Documentation Officielle - UBBEE Smart Building (V1)

Bienvenue dans la documentation officielle du projet **UBBEE**, la plateforme SaaS B2B de Gestion Technique de Bâtiment (GTB) intelligente.

Ce répertoire contient tous les documents de référence pour comprendre, déployer et maintenir la plateforme.

## Sommaire de la documentation

1. **[Documentation Fonctionnelle](./01_fonctionnelle.md)**
   Ce document décrit le produit, ses cas d'usage, le système de multi-tenancy (Mode Global vs Mode Client) et la liste détaillée des modules disponibles dans l'application.

2. **[Documentation Technique](./02_technique.md)**
   Détail des technologies utilisées, de l'organisation du code (Frontend React/Next.js & Backend Node.js), et des choix d'intégration de librairies pour la 3D, les graphiques et le mapping.

3. **[Architecture Système & IoT](./03_architecture.md)**
   Schémas de l'architecture serveur globale, de la boucle Temps Réel via WebSockets, de l'intégration attendue avec les courtiers MQTT pour l'IoT, et du modèle de données de base.

4. **[Dossier d'Exploitation (RUN)](./04_exploitation.md)**
   Guide de déploiement, de redémarrage des services, et environnement d'exécution (PM2). Procédures standard de maintien en conditions opérationnelles (MCO).

5. **[Hébergement, Réseau & Infrastructure](./05_hebergement_et_reseau.md)**
   Topologie Serveur sur le VPS (DigitalOcean), sécurisation des ports, proxy frontal (NGINX), maintien en processus croisés via PM2 et stratégie de gestion de la BDD actuelle.

6. **[Copilote IA UBBEE](./06_copilot_ia.md)**
   Fonctionnalités avancées du module IA, orchestration du Function Calling LLM, et sécurisation du contrôle des équipements (Human-in-the-Loop).

7. **[Appairage IoT (Guide Energy Manager)](./06_appairage_iot.md)**
   Procédure détaillée pour l'intégration de capteurs sur la plateforme, incluant le provisionnement rapide (Plug & Play) et le mapping MQTT avancé (drag & drop).

---

*Généré pour la livraison de la Version 1 (V1) du produit.*
