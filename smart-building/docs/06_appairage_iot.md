# 6. Procédure d'Appairage IoT (Guide Energy Manager)

L'appairage d'équipements sur la plateforme UBBEE se réalise via le module **Appairage & Hub IoT** (Interopérabilité No-Code). Ce module offre deux approches distinctes selon le niveau technique du matériel à intégrer.

## Pré-requis communs
Avant toute manipulation sur la plateforme, l'Energy Manager doit s'assurer de :
1. **Couverture réseau** : Une Gateway UBBEE (ou LoraWan/Zigbee tierce) doit être active et couvrir physiquement la zone d'installation prévue du capteur.
2. **Alimentation** : Le capteur doit être sous tension (sur pile ou raccordé au secteur) et en mode appairage (généralement indiqué par une LED clignotante selon la notice du fabricant).
3. **Hiérarchie Spatiale** : Le Client (Organisation), le Bâtiment (Site) et la Zone (Espace) cible doivent préalablement exister dans l'annuaire UBBEE.

---

## Méthode 1 : Provisionnement Rapide (Capteurs Standardisés / Plug & Play)
*Cas d'usage : Déploiement de capteurs modernes, certifiés UBBEE ou reconnus nativement par la plateforme.*

Cette méthode est conçue pour être extrêmement rapide, idéale pour les déploiements massifs.

1. **Accès :** Se rendre sur l'onglet `Nouveaux Équipements (Parc Simple)` du module d'appairage.
2. **Déclaration du Matériel :**
    *   **Type / Modèle :** Sélectionner la catégorie de l'équipement dans le menu déroulant (ex: Sonde Multimédia UBBEE, Détecteur de Présence PIR, Compteur d'Énergie Modbus/IP).
    *   **Identifiant Réseau :** Saisir ou scanner l'identifiant unique de l'équipement (Adresse MAC, DevEUI pour le LoRaWAN, etc.). Ce code est généralement inscrit sur une étiquette située sur, ou à l'intérieur du capteur.
3. **Positionnement Physique :**
    *   Utiliser la section "Positionnement du Capteur" en bas de page.
    *   Sélectionner successivement le **Client (Organisation)** ciblé, puis le **Bâtiment (Site)**, et enfin préciser la **Zone (Espace)** exacte où le capteur est physiquement installé (au mur, au plafond, etc.).
4. **Validation :**
    *   Cliquer sur le bouton "Lancer le Provisionning".
    *   La plateforme initie alors une procédure d'auto-découverte sur le réseau (Handshake) via la Gateway. Une fois le capteur détecté, il est immédiatement associé à la zone configurée et remontera ses premières valeurs sur les tableaux de bord.

---

## Méthode 2 : Interopérabilité Avancée (Capteurs Existants / Custom MQTT)
*Cas d'usage : Récupération d'un parc de capteurs existants, intégration de matériels non standards, ou gestion de flux de données JSON spécifiques (ex: via Zigbee2MQTT).*

Cette méthode permet à un technicien ou un intégrateur d'adapter n'importe quel payload de données aux formats standardisés d'UBBEE, sans écrire une seule ligne de code.

1. **Accès :** Se rendre sur l'onglet `Équipements Existants (Interop. Avancée)` du module d'appairage.
2. **Positionnement Physique :**
    *   Même procédure que la méthode 1 : Définir le positionnement du capteur (Client > Site > Zone).
3. **Configuration du Flux Source :**
    *   **Nom du Flux :** Donner un nom explicite à cette configuration (ex: "Anciennes sondes Chaufferie").
    *   **Topic MQTT :** Renseigner le topic MQTT exact sur lequel le capteur externe publie ses données brutes (ex: `zigbee2mqtt/0x00158d00045ab`). La plateforme se met à l'écoute de ce topic.
4. **Le Mapping Visuel Automatique (Drag & Drop) :**
    *   **Payload Brut Source :** L'utilisateur copie-colle un échantillon complet des données brutes du capteur (format JSON) capté via la *Console IoT*. Le composant va alors *parser dynamiquement* ce JSON et extraire chaque paramètre final (même imbriqué comme `parameters.data.temp`) sous forme de blocs draggables (Étiquettes Source).
    *   **Colonne Cible (Droite) :** Cette colonne affiche la liste des "Modèles Cibles UBBEE", soit les champs standards attendus par notre base de données (ex: `Température (°C)`, `Humidité (%)`, `Batterie Équipement (%)`).
    *   **Action :** Avec la souris, l'Energy Manager doit simplement "glisser-déposer" chaque bloc de la colonne Source vers son équivalent dans la colonne Cible. (Ex: Glisser la clé `{ payload.v_bat }` vers le champ "Batterie Équipement (%)").
5. **Validation :**
    *   Un bloc correctement lié affiche un statut vert "Connecté : [nom_de_la_cle]".
    *   Enregistrer la configuration. Désormais, chaque donnée brute arrivant sur ce Topic sera traduite à la volée dans le format universel UBBEE et liée à la Zone définie.
