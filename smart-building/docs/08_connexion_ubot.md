# 8. Guide d'Enrôlement et de Connexion U-Bot (Gateway)

Ce document décrit le cycle de vie complet de l'installation physique d'une passerelle **U-Bot** (le routeur IoT maître) et sa première mise en relation avec le cloud UBBEE. Ce processus a été pensé pour être 100% **Plug & Play** (Zero-Touch Provisioning) pour le technicien sur le terrain, supervisé par l'Energy Manager ou le logisticien.

---

## 🏗️ Phase 1 : Provisionnement en Atelier (Superviseur / Energy Manager)

Avant même l'expédition du matériel sur le site du client, l'équipement doit être déclaré informatiquement sur la plateforme UBBEE pour des raisons de sécurité (White-listing) et d'automatisation. Son identification unique repose sur son **Adresse MAC** Ethernet (ex: `b8:27:eb:12:34:56`), inscrite sur l'étiquette au dos ou sur la boîte.

1. **Accès :** Se connecter via un compte Administrateur / Energy Manager et se rendre dans **Network Monitoring > Inventaire Matériel (Gateways)**.
2. **Déclaration :** Cliquer sur *Provisionner un U-Bot* ou *Nouvelle Gateway*.
3. **Identification :** 
   - Renseigner le **Modèle** (ex: *U-Bot Pro v2*).
   - Renseigner l'**Identifiant / MAC** de la machine scrupuleusement.
   - **Nom** : Utilisez la nomenclature officielle `Ubot-[Nom du Client]-[ID Unique]` (ex: `Ubot-Aziza-001`).
4. **Pré-assignation (Le secret du Plug & Play) :** 
   - Associer directement la passerelle au **Bâtiment (Site)** du client cible. *(Note: S'il part en stock, laissez "Non assigné").*
   - En validant, le U-Bot passe au statut <span style="color:orange">**"Pré-configuré" / En attente (Orange)**</span>. Il est prêt à être expédié.

> [!TIP]
> **Préparation Matérielle** : Vous pouvez étiqueter le boîtier avec le nom du site final pour faciliter le travail du sous-traitant. Le U-Bot est déjà flashé avec l'OS Smart Building. Aucune programmation n'est requise.

---

## 🔌 Phase 2 : Installation Physique (Technicien Terrain)

L'intervention sur le site physique du bâtiment ne requiert aucune compétence en programmation.

1. **Fixation :** Installer le U-Bot dans les locaux techniques (TGBT, salle serveurs) ou au centre du bâtiment en hauteur.
2. **Connectivité Réseau :**
   - Brancher un câble RJ45 (Ethernet) relié au réseau IT du bâtiment (DHCP activé). *Alternativement, la connectivité 4G/LTE s'activera si un routeur cellulaire est inclus.*
3. **Alimentation & Démarrage :** Brancher le boîtier sur secteur (Alimentation USB-C). Le U-Bot démarre (LED bleue clignotante). Attendez environ 1 à 2 minutes pour la séquence de boot (`Smart Building OS`).
4. **Vérification LED :** La LED de statut doit cesser de clignoter rapidement et se stabiliser en indiquant l'obtention d'une adresse IP locale.

> [!IMPORTANT]
> **Règles Pare-feu (Firewall)** : Assurez-vous que le réseau informatique du client autorise le trafic sortant sur le **port 8883 (MQTT TLS)** ou **1883** vers l'IP du Cloud UBBEE (`76.13.59.115`).

---

## 📡 Phase 3 : Le "Handshake" MQTT et Autoconfiguration

Dès que le U-Bot obtient un accès Internet, la magie "Cloud" opère (Processus invisible - Zero-Touch) :

1. **Initiation MQTT :** Le U-Bot tente de se connecter au Broker MQTT d'UBBEE. Il envoie un message "Handshake" au serveur contenant son adresse MAC.
2. **Acceptation & Résolution :** 
   - Le Backend UBBEE reçoit la requête et interroge la base de données de l'**Inventaire Matériel**.
   - Il trouve l'adresse MAC et voit qu'elle a été *Pré-assignée* au site cible.
3. **Descente de Configuration (Over-The-Air) :** UBBEE renvoie au U-Bot l'ID de son "Building" (Site de destination) et ses canaux de discussion encryptés.
4. **Basculement Opérationnel :** 
   - Le U-Bot passe en mode Actif et écoute désormais les capteurs locaux (Zigbee, LoRa, Modbus, etc.).
   - Le statut du U-Bot passe instantanément à <span style="color:green">**"Déployé" / Actif (Vert)**</span> sur la plateforme.

---

## 🛠️ Phase 3b : Logique Code et Installation Système (Le "Cerveau" du U-Bot)

*Cette section est destinée aux ingénieurs préparant les OS des routeurs pour information sur le fonctionnement interne du handshake.*

L'Agent U-Bot ne connaît pas son Bâtiment à l'avance. Il ne connaît que sa propre adresse MAC. Voici le workflow codé en Python :

```python
import paho.mqtt.client as mqtt
import json
import time
from getmac import get_mac_address

# Récupération automatique de l'identité
MAC_ADDRESS = get_mac_address() # Ex: a1:b2:c3:d4:e5:f6
BROKER = "mqtt.ubbee.cloud" # (ou adresse IP explicite en production)

def on_connect(client, userdata, flags, rc):
    print(f"U-Bot connecté ! Demande de configuration pour MAC: {MAC_ADDRESS}")
    # 1. Le U-Bot s'abonne à son propre canal de configuration privée
    client.subscribe(f"ubbee/provisioning/{MAC_ADDRESS}/config")
    
    # 2. Il envoie un "Bonjour, je suis là" (Handshake) au Cloud
    client.publish("ubbee/provisioning/handshake", json.dumps({"mac": MAC_ADDRESS}))

def on_message(client, userdata, msg):
    # 3. Le Cloud répond et donne les accès 
    if msg.topic.endswith("/config"):
        config = json.loads(msg.payload)
        building_id = config["building_id"]
        print(f"✅ Assigné avec succès au bâtiment : {building_id} !")
        
        # Le script passe en mode "Exploitation"
        # Il écoute les capteurs locaux et publie les données :
        # -> f"smartbuilding/telemetry/{building_id}/{MAC_ADDRESS}"

client = mqtt.Client(client_id=MAC_ADDRESS)
client.on_connect = on_connect
client.on_message = on_message
client.connect(BROKER, 1883)
client.loop_forever()
```

Ce script est enregistré comme un Service `Systemd` sous Linux. Le système d'exploitation le démarre en arrière plan dès le lancement sans écran ni clavier.

---

## ✅ Phase 4 : Appairage des Capteurs et Vérification Globale

Maintenant que le U-Bot est opérationnel, il agit comme pont. L'Energy Manager distant (ou le Superviseur UBBEE) peut valider avec le technicien :

1. **Supervision Réseau :** Dans l'onglet *Network Monitoring*, le nouveau U-Bot apparaît désormais "En Ligne" (Statut : Déployé). Console IoT : l'opérateur observe les *Ping/Heartbeat* (battements de cœur).
2. **Activation des Capteurs :** Le technicien sur site retire la languette des piles des capteurs d'ambiance ou branche les compteurs d'énergie.
3. **Détection :** Les capteurs s'associent automatiquement au U-Bot s'ils sont dans la zone de couverture.
4. **Mise à Jour de la Plateforme (Jumeau Numérique / Tableau de bord) :**
   - Sur la page du **Site** concerné sur la plateforme Ubbee, les données des capteurs (Température, Humidité, Présence) commencent à remonter en temps réel.

> [!WARNING]
> **Que faire si le U-Bot reste "Hors-ligne" (Rouge) ?**
> Vérifiez en priorité le câble Ethernet et le routeur du client. Une absence de connexion au serveur indique souvent un problème réseau local ou de blocage du port MQTT.

---

## Récapitulatif du Cycle de Vie (Statuts Plateforme)
- 🟠 **Pré-configuré** : Le Hardware ID existe dans l'inventaire mais la box n'a pas encore "appelé" le cloud.
- 🟢 **Déployé (Actif)** : Le handshake a réussi, la télémétrie locale est acheminée.
- 🔴 **Hors-Ligne** : Connexion perdue (Aucun battement de cœur / heartbeat depuis > 5 minutes).

**Fin de la procédure**. Pour tout support avancé, le technicien peut remonter les logs locaux MQTT directement à l'équipe IT Antigravity.
