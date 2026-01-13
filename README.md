# Basketball Stats App

Application web de classement de joueurs de basketball avec statistiques en temps réel.

## Fonctionnalités

### Dashboard principal
- **Classements en temps réel** : Points, rebonds, passes, interceptions, contres, score global
- **Visualisation** : Graphiques interactifs avec Chart.js
- **Rapport PDF** : Génération hebdomadaire téléchargeable
- **Temps réel** : Mise à jour automatique des classements via Supabase Realtime

### Gestion de la ligue locale
- **Équipes** (`/teams`) : Création, modification, suppression d'équipes locales
- **Joueurs** (`/players`) : Gestion des joueurs avec attribution aux équipes
- **Matchs** (`/matches`) : Planification et gestion des matchs

### Saisie en temps réel
- **Interface de scoring** (`/matches/[id]/live`) : Saisie des statistiques pendant le match
- **Boutons rapides** : +1, +2, +3 points, rebonds, passes, etc.
- **Mise à jour instantanée** : Score et classements mis à jour en temps réel

### Synchronisation NBA
- **API balldontlie.io** : Import automatique des données NBA
- **Comparaison** : Comparez vos joueurs locaux aux joueurs NBA

## Stack Technique

- **Frontend** : Next.js 16, React 19, TypeScript
- **UI** : Tailwind CSS 4, shadcn/ui, Lucide icons
- **Backend** : Next.js API Routes + Supabase
- **Base de données** : PostgreSQL (Supabase)
- **Temps réel** : Supabase Realtime
- **Visualisation** : Chart.js, react-chartjs-2
- **PDF** : jsPDF

## Installation

### 1. Installer les dépendances

```bash
cd basketball-stats
npm install
```

### 2. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Exécutez le script SQL dans `supabase/schema.sql` via l'éditeur SQL de Supabase
3. Copiez vos clés API

### 3. Configurer les variables d'environnement

Modifiez le fichier `.env.local` avec vos vraies clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service
NBA_API_KEY=votre-clé-balldontlie  # Optionnel
```

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3000

## Guide d'utilisation

### Configurer votre ligue locale

1. **Créer des équipes** : Allez dans `/teams` et créez vos équipes
2. **Ajouter des joueurs** : Allez dans `/players` et ajoutez les joueurs à chaque équipe
3. **Planifier un match** : Allez dans `/matches` et créez un nouveau match

### Saisir les stats d'un match

1. Allez dans `/matches` et cliquez sur "Démarrer" pour un match programmé
2. L'interface de saisie en direct s'affiche avec les joueurs des deux équipes
3. Utilisez les boutons +1, +2, +3 pour les points et +1 pour les autres stats
4. Le score se met à jour automatiquement
5. Cliquez sur "Terminer le match" quand c'est fini

### Consulter les classements

- Le dashboard affiche les classements par catégorie (points, rebonds, etc.)
- Utilisez le sélecteur de ligue pour filtrer NBA/Local/Tous
- Exportez le rapport PDF hebdomadaire avec le bouton dédié

## API Endpoints

### Équipes
- `GET /api/teams` : Liste des équipes
- `POST /api/teams` : Créer une équipe
- `PUT /api/teams/[id]` : Modifier une équipe
- `DELETE /api/teams/[id]` : Supprimer une équipe

### Joueurs
- `GET /api/players` : Liste des joueurs (params: league, team_id)
- `POST /api/players` : Créer un joueur
- `PUT /api/players/[id]` : Modifier un joueur
- `DELETE /api/players/[id]` : Supprimer un joueur

### Matchs
- `GET /api/matches` : Liste des matchs (params: league, status, team_id)
- `POST /api/matches` : Créer un match
- `PUT /api/matches/[id]` : Modifier un match (status, score)
- `DELETE /api/matches/[id]` : Supprimer un match
- `POST /api/matches/[id]/stats` : Ajouter/modifier les stats d'un joueur

### Statistiques
- `PUT /api/stats/[id]` : Modifier une stat (mode increment ou mise à jour complète)
- `DELETE /api/stats/[id]` : Supprimer une stat

### Classements et rapports
- `GET /api/rankings` : Classements (params: category, league, limit)
- `POST /api/nba` : Synchronisation NBA
- `GET /api/reports` : Rapport hebdomadaire

## Documentation

- **PRD complet** : Voir `docs/PRD.md` pour les spécifications détaillées
- **Schéma SQL** : Voir `supabase/schema.sql` pour la structure de la base de données

## Déploiement

```bash
npm run build
npm start
```

Ou déployez sur Vercel avec les variables d'environnement configurées.
