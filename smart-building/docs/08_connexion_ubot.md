# 8. Protocole de Connexion du Premier U-Bot (Gateway)

Ce document décrit le cycle de vie complet de l'installation physique d'une passerelle **U-Bot** (le routeur IoT maître) et sa première mise en relation avec le cloud UBBEE. Ce processus a été pensé pour être 100% **Plug & Play** pour le technicien sur le terrain.

---

## 🏗️ Phase 1 : Provisionnement en Atelier (Superviseur)

Avant même l'expédition du matériel sur le site du client, l'équipement doit être déclaré informatiquement sur la plateforme UBBEE pour des raisons de sécurité (White-listing) et d'automatisation.

1. **Accès :** Se connecter via un compte `SUPER_ADMIN` et se rendre dans **Network Monitoring > Inventaire Matériel**.
2. **Déclaration :** Cliquer sur *Provisionner un U-Bot*.
3. **Identification :** 
   - Renseigner le **Modèle** (ex: *U-Bot Pro v2*).
   - Renseigner l'**Adresse MAC** ou le Numéro de Série unique de la machine (ex: `A1:B2:C3:D4:E5:F6`).
4. **Pré-assignation (Le secret du Plug & Play) :** 
   - Associer directement la passerelle au **Bâtiment (Site)** du client cible.
   - En validant, le U-Bot passe au statut **"Pré-configuré" (Orange)**. Il est prêt à être mis dans son carton d'expédition.

---

## 🔌 Phase 2 : Installation Physique (Technicien Terrain)

L'intervention sur le site physique du bâtiment ne requiert aucune compétence en programmation.

1. **Fixation :** Installer le U-Bot dans les locaux techniques (TGBT, salle serveurs) ou au centre du bâtiment en hauteur.
2. **Connectivité Réseau :**
   - Brancher un câble RJ45 (Ethernet) relié au réseau IT du bâtiment (DHCP activé).
   - *Ou* insérer une carte SIM si c'est un modèle U-Bot 4G.
3. **Alimentation :** Brancher le boîtier sur secteur. Le U-Bot démarre (LED bleue clignotante).

---

## 📡 Phase 3 : Le "Handshake" MQTT Automatique

Dès que le U-Bot obtient un accès Internet, la magie "Cloud" opère sans aucune intervention humaine :

1. **Initiation MQTT :** Le U-Bot tente de se connecter au Broker MQTT d'UBBEE avec un certificat de sécurité et son adresse MAC comme identifiant unique.
2. **Acceptation & Résolution :** 
   - Le Backend UBBEE reçoit la requête et interroge la base de données de l'**Inventaire Matériel**.
   - Il trouve l'adresse MAC et voit qu'elle a été *Pré-assignée* au "Site de Lyon".
3. **Mise à jour d'état :** 
   - Le statut du U-Bot passe instantanément à **"Déployé" (Vert)**.
   - La LED de l'appareil s'allume en Vert Fixe (Connecté).
4. **Descente de Configuration (Over-The-Air) :** UBBEE renvoie au U-Bot les clés cryptographiques de sécurité, les fréquences d'écoute (LoRa/Zigbee) et les règles réseaux spécifiques au site.

---

## ✅ Phase 4 : Vérification de Bon Fonctionnement

L'Energy Manager distant (ou le Superviseur UBBEE) peut immédiatement valider l'installation via la plateforme :

1. **Supervision Réseau :** Dans l'onglet *Network Monitoring*, le nouveau U-Bot apparaît désormais "En Ligne" avec son taux de signal et sa charge CPU.
2. **Console IoT (Live) :** L'opérateur peut ouvrir la console pour voir les trames *Ping/Heartbeat* (battements de cœur) remontées toutes les X minutes par le U-Bot, certifiant que la route est ouverte.
3. **Enrôlement des Capteurs :** (Voir Documentation 06_appairage_iot.md). Une fois le U-Bot en place, les capteurs de la salle de réunion peuvent être allumés, le U-Bot attrapera leurs trames et les relaiera à la plateforme.
