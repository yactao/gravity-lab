# Modèle de Confiance et de Tarification (Trust & Pricing Model)

Ce document définit la philosophie de facturation, de gradation de l'expertise et de certification qualitative de l'Aïna Software Factory. La Factory n'est pas un abonnement SaaS classique, mais un modèle de facturation capacitaire "Pay-per-Skill" basé sur l'efficience et la sécurité.

## 1. Niveaux de Seniorité et Gradation de l'Expertise
Dans la Factory, un agent n'est pas figé. Sa "seniorité" dépend de la puissance du modèle alloué (SLM vs LLM) et de la profondeur contextuelle qu'il maîtrise.

- **Agent Junior (Exécution Frugale - SLM)** : Utilise des modèles légers (Mistral 7B, DeepSeek) pour des tâches unitaires. Mots-clés : Boilerplate, tests unitaires simples, documentation automatique. L'empreinte carbone et la consommation de tokens sont minimes.
- **Agent Senior (Expertise Métier - LLM/RAG)** : Utilise des modèles à large fenêtre de contexte pour intégrer l'historique complet du projet. Mots-clés : Analyse multi-fichiers, refactoring complexe, optimisation algorithmique.
- **Agent Lead / Architecte (Direction Technique)** : Pilote l'orchestration des autres agents (Squads), tranche les conflits techniques et garantit le respect du *Mandat de Frugalité* à l'échelle du projet.

## 2. Le "Badge de Confiance" Avenir (Trust Seal)
Afin de garantir que le code livré par les agents IA est de qualité industrielle, la plateforme délivre un **Badge de Confiance** pour chaque livrable (PR, module). Ce badge repose sur trois scores immuables :

1. 🛡️ **Score de Sécurité (Pentest)** : Certifie que le code est exempt de failles majeures (XSS, SQLi, RCE, Path Traversal) via validation par l'escouade Cybersécu.
2. 🍃 **Indice de Frugalité** : Note sur 10 validant l'absence de bibliothèques lourdes inutiles, une empreinte CPU optimisée et un bundle size minimal.
3. 🏗️ **Score de Conformité Architecturale** : Valide l'absence de dette technique et l'insertion parfaite dans la structure existante (composants réutilisables, conventions de nommage).

## 3. Mécanisme d'Expérience Contextuelle (Tenant-Isolation)
L'intelligence des agents s'affine, mais de manière strictement cloisonnée :
- **Mémoire de Projet (Prisma Isolation)** : Chaque client (Tenant) possède un historique isolé. Les agents apprennent les préférences de codage spécifiques du client (ex: conventions de Hubbee ou d'Aurae) sans aucune fuite de données vers d'autres clients.
- **Feedback Loop** : Chaque correction humaine post-livraison est logguée. L'agent gagne en seniorité contextuelle sur ce projet.
- **Journal d'Expertise (Proof of Work)** : Le client accède à la traçabilité complète des compétences acquises par ses agents dédiés.

## 4. Business Model & "Pay-per-Skill"
La tarification s'adapte à la "chaîne de montage" mobilisée :
- **Tarification par Seniorité** : Une tâche routinière (Agent Junior via SLM) coûtera quelques centimes. Une analyse de refoulement critique par un Agent Lead sera facturée selon l'effort de calcul.
- **Option "Production-Ready"** : L'activation du *Badge de Confiance* (audit CISO + Pentester + FinOps) engendre un surcoût assumé, garantissant une absence de dette technique à la livraison.
- **Forfaits (Starter vs Enterprise)** :
  - *Starter* : Accès aux agents Juniors et Seniors à la demande.
  - *Enterprise* : Inclusion native de la Lead Team et du Badge de Confiance systématique (Garantie de qualité industrielle).
- **Traçabilité des Invoices** : Chaque interaction est signée `[Agent: Nom | Engine: LLM]`, offrant une facturation transparente et justifiable au centime près.
