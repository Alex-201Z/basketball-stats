# PRD - Basketball Stats Application

## Product Requirements Document
**Version:** 4.0
**Date:** 15 janvier 2026
**Statut:** ✅ COMPLET - Thème sombre style Revolut/balldontlie

---

## 1. Vue d'ensemble du produit

### 1.1 Description
Application web de classement de joueurs de basketball permettant de :
- Classer les joueurs par statistiques (points, rebonds, passes, interceptions, contres)
- Gérer des matchs en temps réel pour une ligue locale
- Synchroniser les données NBA via l'API balldontlie.io
- Générer des rapports hebdomadaires (PDF)

### 1.2 Problème résolu
Les ligues locales de basketball n'ont pas d'outil simple pour :
- Suivre les performances individuelles des joueurs
- Maintenir des classements en temps réel
- Enregistrer les statistiques de match sans accès à une API externe
- Comparer les joueurs locaux avec les joueurs NBA

### 1.3 Utilisateurs cibles
- **Administrateurs de ligue** : Gestion des équipes et joueurs
- **Marqueurs/Statisticiens** : Saisie des stats en temps réel pendant les matchs
- **Coachs et joueurs** : Consultation des classements et performances

### 1.4 Objectif métier clé
> **Les statistiques collectées pendant la semaine doivent être prêtes pour envoi chaque mercredi**
> - Classement mis à jour en temps réel
> - Export PDF hebdomadaire des classements
> - Affichage du nom du joueur ET de son équipe dans les classements

---

## 2. État des fonctionnalités

### 2.1 Fonctionnalités complètes ✅

| Fonctionnalité | Description | Route/Fichier |
|----------------|-------------|---------------|
| Dashboard moderne | Vue d'ensemble avec sidebar, stats cards et graphiques | `/` (page.tsx) |
| Classements par catégorie | Points, rebonds, passes, interceptions, contres, global | `RankingTable.tsx` |
| Graphiques interactifs | Visualisation Chart.js des top 10 | `StatsChart.tsx` |
| Sélecteur de ligue | Filtrage NBA/Local/Tous | `LeagueSelector.tsx` |
| Sync NBA | Synchronisation via balldontlie.io | `POST /api/nba` |
| Export PDF | Rapport hebdomadaire téléchargeable | `GET /api/reports` |
| Temps réel | Mise à jour via Supabase Realtime | `useRealtime.ts` |
| CRUD Équipes | Interface moderne avec cartes | `/teams` |
| CRUD Joueurs | Gérer les joueurs avec attribution aux équipes | `/players` |
| CRUD Matchs | Planifier et gérer les matchs | `/matches` |
| Saisie en direct | Interface pour entrer les stats pendant le match | `/matches/[id]/live` |
| Boutons stats rapides | +1, +2, +3 pour points, +1 pour autres stats | `LiveScoringPage` |
| APIs complètes | Teams, Players, Matches, Stats CRUD | `/api/*` |

### 2.2 Nouveautés v4.0 (15/01/2026) ✅

| Fonctionnalité | Description |
|----------------|-------------|
| Thème sombre Revolut | Design noir moderne (#0a0a0b background, accents orange) |
| Page joueurs réorganisée | Affichage par équipe avec navigation drill-down |
| Recherche de joueurs | Barre de recherche globale avec filtrage en temps réel |
| Suppression API NBA | Plus de dépendance externe, données locales uniquement |
| Design système cohérent | Variables CSS sémantiques (foreground, background, etc.) |
| UI Moderne | Bords arrondis (border-radius xl), transitions fluides |

### 2.3 Nouveautés v3.0 (15/01/2026) ✅

| Fonctionnalité | Description |
|----------------|-------------|
| Sidebar de navigation | Navigation latérale fixe avec design moderne |
| Dashboard Stats Cards | 4 cartes de statistiques avec animations |
| Top Players Widget | Affichage des top 3 scoreurs |
| Recent Matches Widget | Liste des matchs récents avec statuts |
| Design système cohérent | Interface uniforme sur toutes les pages |
| Données de démonstration | 4 équipes, 15 joueurs, 4 matchs, 30 stats |

---

## 3. Architecture technique

### 3.1 Stack actuel
```
Frontend:     Next.js 16.1.1, React 19, TypeScript
UI:           Tailwind CSS 4, shadcn/ui, Lucide icons
Backend:      Next.js API Routes
Base données: MySQL (XAMPP/MariaDB)
ORM:          Prisma 7.2 avec adapter MariaDB
Temps réel:   Supabase Realtime (optionnel)
Graphiques:   Chart.js + react-chartjs-2
PDF:          jsPDF
```

### 3.2 Base de données MySQL (XAMPP)
```
Hôte:         localhost
Port:         3306
Utilisateur:  root
Mot de passe: (vide)
Base:         basketball_stats
```

### 3.3 Schéma de base de données

```
┌─────────────┐     ┌─────────────┐
│   teams     │     │   players   │
├─────────────┤     ├─────────────┤
│ id (PK)     │◄────┤ team_id     │
│ name        │     │ first_name  │
│ logo_url    │     │ last_name   │
│ league      │     │ jersey_num  │
│ nba_team_id │     │ position    │
└─────────────┘     │ league      │
                    │ nba_player_id│
                    │ photo_url   │
                    └──────┬──────┘
                           │
                           ▼
┌─────────────┐     ┌─────────────┐
│   matches   │     │player_stats │
├─────────────┤     ├─────────────┤
│ id (PK)     │◄────┤ match_id    │
│ home_team_id│     │ player_id   │
│ away_team_id│     │ points      │
│ match_date  │     │ rebounds    │
│ status      │     │ assists     │
│ home_score  │     │ steals      │
│ away_score  │     │ blocks      │
│ league      │     │ turnovers   │
│ nba_game_id │     │ minutes     │
└─────────────┘     │ fg_made/att │
                    │ 3pt_made/att│
                    │ ft_made/att │
                    └─────────────┘
```

### 3.4 Structure des fichiers

```
src/
├── app/
│   ├── page.tsx                    ✅ Dashboard moderne
│   ├── layout.tsx                  ✅ Layout global
│   ├── globals.css                 ✅ Styles Tailwind
│   ├── teams/
│   │   └── page.tsx               ✅ CRUD équipes (nouveau design)
│   ├── players/
│   │   └── page.tsx               ✅ CRUD joueurs
│   ├── matches/
│   │   ├── page.tsx               ✅ Liste matchs (nouveau design)
│   │   └── [id]/
│   │       ├── page.tsx           ✅ Détails du match
│   │       └── live/page.tsx      ✅ Saisie en direct
│   └── api/
│       ├── rankings/route.ts      ✅ Classements
│       ├── nba/route.ts           ✅ Sync NBA
│       ├── reports/route.ts       ✅ Rapports PDF
│       ├── teams/                 ✅ CRUD équipes
│       ├── players/               ✅ CRUD joueurs
│       ├── matches/               ✅ CRUD matchs + stats
│       └── stats/                 ✅ CRUD stats
├── components/
│   ├── ui/                        ✅ shadcn components
│   ├── Sidebar.tsx                ✅ NOUVEAU - Navigation latérale
│   ├── PageLayout.tsx             ✅ NOUVEAU - Layout partagé
│   ├── DashboardStats.tsx         ✅ NOUVEAU - Stats cards
│   ├── RecentMatches.tsx          ✅ NOUVEAU - Matchs récents
│   ├── TopPlayersCard.tsx         ✅ NOUVEAU - Top joueurs
│   ├── LeagueSelector.tsx         ✅ Sélecteur de ligue
│   ├── RankingTable.tsx           ✅ Tableau classements
│   └── StatsChart.tsx             ✅ Graphiques
├── hooks/
│   ├── useRankings.ts             ✅ Hook classements
│   ├── useRealtime.ts             ✅ Hook temps réel
│   ├── useTeams.ts                ✅ Hook équipes
│   ├── usePlayers.ts              ✅ Hook joueurs
│   └── useMatches.ts              ✅ Hook matchs
├── lib/
│   ├── supabase.ts                ✅ Client Supabase
│   ├── prisma.ts                  ✅ Client Prisma/MySQL
│   ├── pdf-generator.ts           ✅ Génération PDF
│   └── utils.ts                   ✅ Utilitaires
└── types/
    └── index.ts                   ✅ Types TypeScript
```

---

## 4. Design UI/UX

### 4.1 Palette de couleurs (Thème sombre)
- **Principal**: Orange (#f97316) - Boutons et accents
- **Fond**: Noir (#0a0a0b) - Background principal
- **Cartes**: Gris foncé (#111113) - Conteneurs
- **Secondaire**: Gris (#1a1a1d) - Hover states, inputs
- **Bordures**: Gris subtil (#27272a)
- **Texte**: Blanc (#fafafa) - Principal, Gris (#71717a) - Secondaire

### 4.2 Composants principaux
- **Sidebar**: Fond sombre avec bordure, icônes Lucide
- **Cards**: Bords arrondis (xl), transitions au hover
- **Boutons**: Orange pour actions principales, outline subtil pour secondaires
- **Tables**: Design épuré avec hover states sombres
- **Inputs**: Fond secondaire, bordures subtiles, focus orange

---

## 5. Données de démonstration

### 5.1 Équipes (6 total)
- Paris Basketball
- Lyon Asvel
- AS Monaco Basket
- LDLC Asvel
- + 2 équipes initiales

### 5.2 Joueurs (16 total)
- 5 joueurs par équipe principale
- Positions variées (PG, SG, SF, PF, C)

### 5.3 Matchs (5 total)
- 3 matchs terminés avec stats
- 1 match programmé
- 1 match initial

### 5.4 Statistiques (30+ entrées)
- Stats complètes pour tous les matchs terminés
- Points, rebonds, passes, interceptions, contres

---

## 6. Configuration et déploiement

### 6.1 Variables d'environnement (.env)
```env
# MySQL via XAMPP
DATABASE_URL="mysql://root:@localhost:3306/basketball_stats"
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=basketball_stats

# Supabase (optionnel pour temps réel)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon

# NBA API (optionnel)
NBA_API_KEY=votre-clé-balldontlie
```

### 6.2 Commandes utiles
```bash
# Démarrer XAMPP MySQL d'abord !

# Développement
npm run dev

# Build production
npm run build

# Lancement production
npm start

# Génération Prisma
npx prisma generate
```

---

## 7. Workflow utilisateur

### 7.1 Configuration initiale
1. Démarrer XAMPP (MySQL)
2. Lancer `npm run dev`
3. Ouvrir http://localhost:3000

### 7.2 Jour de match
1. Créer un match via `/matches` (sélectionner équipes, date/heure)
2. Cliquer "Démarrer" pour ouvrir l'interface de saisie en direct
3. Utiliser les boutons +1/+2/+3 pour les points, +1 pour les autres stats
4. Le score se met à jour automatiquement
5. Cliquer "Terminer le match" quand c'est fini

### 7.3 Consultation hebdomadaire (mercredi)
1. Dashboard principal avec classements à jour
2. Filtrer par ligue (Local, NBA, Tous)
3. Télécharger le rapport PDF pour envoi

---

## 8. Notes de session

### Session du 15 janvier 2026 (v4.0 - Thème sombre)
- ✅ Nouveau thème sombre style Revolut/balldontlie
- ✅ Page joueurs réorganisée : vue par équipe avec drill-down
- ✅ Recherche de joueurs globale avec filtrage temps réel
- ✅ Suppression du bouton Sync NBA et LeagueSelector
- ✅ Mise à jour de tous les composants avec variables CSS sémantiques
- ✅ Build Next.js 16.1.1 réussi sans erreurs

### Session précédente (v3.0 - Dashboard moderne)
- ✅ Nouveau design dashboard avec sidebar
- ✅ Composants modulaires (DashboardStats, RecentMatches, TopPlayersCard)
- ✅ Interface cohérente sur toutes les pages
- ✅ Données de démonstration ajoutées
- ✅ Base de données MySQL fonctionnelle via XAMPP

### 🎉 PROJET COMPLET v4.0
L'application est prête pour la production avec :
- **Thème sombre moderne** style Revolut/balldontlie
- **Page joueurs intuitive** avec navigation par équipe
- **Recherche rapide** pour trouver n'importe quel joueur
- Interface utilisateur professionnelle et cohérente
- Classement des joueurs avec leur équipe
- Saisie des stats en temps réel
- Export PDF hebdomadaire avec équipes
- CRUD complet (équipes, joueurs, matchs)

---

## 9. Améliorations futures (optionnelles)

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Timer de match | Minuterie 4 quarts-temps intégrée | BASSE |
| Historique/Archives | Filtres avancés par date, saison | BASSE |
| Statistiques avancées | Efficacité, +/-, moyennes sur période | BASSE |
| Mode sombre | Thème dark pour l'application | BASSE |
| Export Excel | Export des données au format XLSX | BASSE |
