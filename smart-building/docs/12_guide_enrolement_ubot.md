# Guide d'Enrôlement et d'Installation U-Bot (Zero-Touch)

Ce guide décrit la procédure officielle, étape par étape, pour déployer un hub IoT "U-Bot" sur un site client. Destiné aux Energy Managers et aux sous-traitants (installateurs), ce processus repose sur l'architecture "Plug & Play" (Zero-Touch Provisioning) de la plateforme Ubbee.

---

## Phase 1 : Réception et Pré-configuration (En Bureau)
*À réaliser par l'Energy Manager ou le logisticien avant l'envoi sur site.*

À la réception d'un nouveau Raspberry Pi (U-Bot), l'appareil ne connaît pas encore sa destination finale. Son identification unique repose sur son **Adresse MAC** Ethernet (ex: `b8:27:eb:12:34:56`).

1. **Identifier l'appareil** : Notez l'adresse MAC (Hardware ID) inscrite sur l'étiquette au dos ou sur la boîte du U-Bot.
2. **Déclarer sur la Plateforme Ubbee** :
   - Connectez-vous à la plateforme avec un compte Administrateur / Energy Manager.
   - Rendez-vous dans le menu **Réseau & Équipements > Gateways**.
   - Cliquez sur **Nouvelle Gateway**.
   - Remplissez le formulaire de "Network Monitoring" :
     - **Nom** : Utilisez la nomenclature officielle `Ubot-[Nom du Client]-[ID Unique]` (ex: `Ubot-Aziza-001`).
     - **Identifiant / MAC** : Renseignez scrupuleusement l'adresse MAC.
     - **Site d'affectation** : Sélectionnez le site final prévu. *(Note: S'il part en stock, laissez "Non assigné").*
3. **Validation** : Le U-Bot apparaît désormais dans la liste avec le statut <span style="color:orange">**Pré-configuré / En attente**</span>.

> [!TIP]
> **Préparation Matérielle** : Vous pouvez étiqueter le boîtier avec le nom du site final pour faciliter le travail du sous-traitant. Le U-Bot est déjà flashé avec l'OS Smart Building. Aucune programmation n'est requise.

---

## Phase 2 : Installation sur Site (Terrain)
*À réaliser par le sous-traitant ou technicien sur place.*

Le technicien se rend sur le site client (ex: supermarché ou bureaux) avec le boîtier.

1. **Connexion Physique** : 
   - Branchez le U-Bot sur une prise de courant standard (Alimentation USB-C fournie).
   - Raccordez le câble Ethernet fourni entre le port RJ45 du U-Bot et le routeur / switch du site (connexion DHCP recommandée). Alternativement, la connectivité 4G/LTE s'activera si un routeur cellulaire est inclus.
2. **Démarrage** : Le U-Bot s'allume. Attendez environ 1 à 2 minutes pour la séquence de boot (`Smart Building OS`).
3. **Vérification LED** : La LED de statut doit cesser de clignoter rapidement et se stabiliser, indiquant l'obtention d'une adresse IP locale.

> [!IMPORTANT]
> **Règles Pare-feu (Firewall)** : Assurez-vous que le réseau informatique du client autorise le trafic sortant sur le **port 8883 (MQTT TLS)** ou **1883** vers l'IP du Cloud Ubbee (`76.13.59.115`).

---

## Phase 3 : Handshake et Autoconfiguration (Automatique)
*Processus Cloud invisible - Zero-Touch.*

Dès que le U-Bot a accès à Internet, il initie son processus d'enrôlement :
1. **Appel vers le Cloud** : Le U-Bot envoie un message "Handshake" au serveur contenant son adresse MAC.
2. **Résolution Cloud** : Le backend vérifie l'inventaire pré-saisi (Phase 1).
3. **Descente de Configuration** : Le Cloud reconnaît le MAC et renvoie au U-Bot l'ID de son "Building" (Site de destination) et ses canaux de discussion encryptés.
4. **Basculement Opérationnel** : Le U-Bot passe en mode Actif et écoute désormait les capteurs locaux (Zigbee, LoRa, Modbus, etc.).

---

## Phase 4 : Appairage des Capteurs et Vérification Globale
*À réaliser par l'installateur avec l'Energy Manager au téléphone, ou directement via l'accès plateforme mobile.*

Maintenant que le U-Bot est opérationnel, il agit comme pont.
1. **Activation des Capteurs** : Retirez la languette des piles des capteurs d'ambiance (température, mouvement, etc.) ou branchez les compteurs d'énergie.
2. **Détection** : Les capteurs s'associent au U-Bot s'ils sont dans la zone de couverture. 
3. **Mise à Jour de la Plateforme (Jumeau Numérique / Tableau de bord)** :
   - Allez sur la page du **Site** concerné sur la plateforme Ubbee.
   - Les données des capteurs (Température, Humidité, Présence) commencent à remonter en temps réel.
   - Le statut du U-Bot (Gateway) passe de <span style="color:orange">En attente</span> à <span style="color:green">**Actif / Déployé**</span>.

> [!WARNING]
> **Que faire si le U-Bot reste "Hors-ligne" (Rouge) ?**
> Vérifiez en priorité le câble Ethernet et le routeur du client. Une absence de connexion au serveur indique souvent un problème réseau local ou de blocage du port MQTT.

---

## Récapitulatif du Cycle de Vie (Statuts Plateforme)
- 🟠 **Pré-configuré** : Le Hardware ID existe dans l'inventaire mais la box n'a pas encore "appelé" le cloud.
- 🟢 **Déployé (Actif)** : Le handshake a réussi, la télémétrie locale est acheminée.
- 🔴 **Hors-Ligne** : Connexion perdue (Aucun battement de cœur / heartbeat depuis > 5 minutes).

**Fin de la procédure**. Pour tout support avancé, le technicien peut remonter les logs locaux MQTT directement à l'équipe IT Antigravity.
