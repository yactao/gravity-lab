# 5. Hébergement, Réseau & Infrastructure

Ce document détaille l'architecture matérielle (IaaS), la configuration réseau attendue et les choix liés à l'hébergement de la plateforme Smart Building sur notre environnement cible.

## 1. Infrastructure Cloud (IaaS)
Pour assurer une flexibilité maximale et garder la maîtrise complète de l'application et de la base de données, l'application est hébergée sur un Serveur Privé Virtuel (VPS).

- **Fournisseur Cloud :** DigitalOcean
- **Type d'instance :** Droplet
- **Système d'Exploitation :** Ubuntu Linux (LTS)
- **IP Publique Cible :** `76.13.59.115`
- **Répertoire de déploiement :** `/opt/gravity-lab/smart-building/`

## 2. Topologie Réseau & Reverse Proxy (NGINX)
Dans une configuration de production aboutie, l'accès direct aux ports applicatifs Node.js est prohibé depuis l'extérieur. Un serveur web frontral (**NGINX**) est utilisé comme *Reverse Proxy*.

### Routage NGINX
- **Trafic App Web (Frontend) :** 
  - L'application Next.js écoute sur le port `3000` (`localhost:3000`).
  - NGINX capture tout le trafic entrant public sur HTTP/HTTPS (racine `/`) et le transfère au port 3000.
- **Trafic API & WebSockets (Backend) :**
  - L'API Express ainsi que le serveur d'événements Socket.IO écoutent sur le port `3001` (`localhost:3001`).
  - NGINX capture les routes spécifiques (ex: `/api/` ou `/socket.io/`) et transfère ce trafic. Il doit être paramétré pour accepter l'en-tête `Connection: Upgrade` vitale pour le fonctionnement persistant des WebSockets.

*Alerte de Sécurité V1 : Tant que le nom de domaine B2B officiel n'est pas déployé et chiffré par un certificat SSL (Certbot / Let's Encrypt), l'application répond directement via l'IP publique sur ses ports ouverts.*

## 3. Gestionnaire de Daemons (PM2)
La robustesse du cluster Node.js est assurée par l'utilitaire **PM2**, installé de manière globale sur la machine.

Il garantit :
- Le redémarrage automatique en cas de crash applicatif.
- L'équilibrage de charge si l'on décide un jour de le passer en mode *Cluster* multi-coeurs.
- Le redémarrage au boot (*script pm2 startup*) si la machine physique DigitalOcean venait à redémarrer.

Les processus enregistrés sont :
- `gtb-frontend` (Le Next.js App Router).
- `gtb-backend` (L'API Express, Moteur de Règles et Socket.IO).

## 4. Politique de Sécurité Serveur
La sécurité de l'hébergement est construite en couches :

1. **Authentification SSH :** Fermée aux connexions par mots de passe (`PasswordAuthentication no`). Sécurisée par un jeu de clés asymétriques RSA/Ed25519 gérées sur les postes développeurs. User : `root`.
2. **Pare-feu (UFW) :** Recommandé d'activer l'UFW Ubuntu pour ne laisser ouvert que :
   - `Port 22 (SSH)` : Idéalement sur-restreint aux IP fixes de l'agence.
   - `Port 80 / 443 (HTTP/S)` : Pour les clients finaux et l'IoT qui remonte ses flux POST de télémétrie.
3. Les ports `3000`, `3001` seront verrouillés en interne (loopback `127.0.0.1`).

## 5. Stockage des Données (Database)
Dans ce premier jalon logiciel :
- **SQLite :** Le Backend TypeORM génère et gère intimement la base entière sous la forme d'un simple fichier binaire (`.sqlite`). 
- **Avantage en Hébergement :** Sauvegarder la plateforme est aussi trivial que de copier ce fichier (par exemple via une cron-tape journalière qui exécute un `rsync` ou un `scp` vers un serveur de stockage S3/froid).
- **Prochaine étape (Scale-up) :** Lorsque la plateforme embarquera des dizaines de milliers de points de données journaliers IoT, ce format limite la concurrence/verrouillage d'écriture. L'environnement sera basculé sur le service managé *PostgreSQL de DigitalOcean*, où la variable d'environement `DATABASE_URL` du démon PM2 du Backend pointera vers l'URL managée.
