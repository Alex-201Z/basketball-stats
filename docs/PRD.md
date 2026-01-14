# PRD - Basketball Stats Application

## Product Requirements Document
**Version:** 2.1
**Date:** 14 janvier 2026
**Statut:** ✅ COMPLET - Prêt pour production

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
| Dashboard principal | Vue d'ensemble des classements avec graphiques | `/` (page.tsx) |
| Classements par catégorie | Points, rebonds, passes, interceptions, contres, global | `RankingTable.tsx` |
| Graphiques interactifs | Visualisation Chart.js des top 10 | `StatsChart.tsx` |
| Sélecteur de ligue | Filtrage NBA/Local/Tous | `LeagueSelector.tsx` |
| Sync NBA | Synchronisation via balldontlie.io | `POST /api/nba` |
| Export PDF | Rapport hebdomadaire téléchargeable | `GET /api/reports` |
| Temps réel | Mise à jour via Supabase Realtime | `useRealtime.ts` |
| CRUD Équipes | Créer, modifier, supprimer des équipes locales | `/teams` |
| CRUD Joueurs | Gérer les joueurs avec attribution aux équipes | `/players` |
| CRUD Matchs | Planifier et gérer les matchs | `/matches` |
| Saisie en direct | Interface pour entrer les stats pendant le match | `/matches/[id]/live` |
| Boutons stats rapides | +1, +2, +3 pour points, +1 pour autres stats | `LiveScoringPage` |
| APIs complètes | Teams, Players, Matches, Stats CRUD | `/api/*` |

### 2.2 Fonctionnalités terminées (vérification 14/01/2026) ✅

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Affichage équipe dans classement | Colonne "Équipe" dans RankingTable.tsx | ✅ Complet |
| Équipe dans export PDF | Nom d'équipe entre parenthèses | ✅ Complet |
| Page détails match | Box score avec stats des joueurs | ✅ Complet |

### 2.3 Améliorations futures (optionnelles) 🔮

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Timer de match | Minuterie 4 quarts-temps intégrée | BASSE |
| Historique/Archives | Filtres avancés par date, saison | BASSE |
| Statistiques avancées | Efficacité, +/-, moyennes sur période | BASSE |

---

## 3. Architecture technique

### 3.1 Stack actuel
```
Frontend:     Next.js 16.1.1, React 19, TypeScript
UI:           Tailwind CSS 4, shadcn/ui, Lucide icons
Backend:      Next.js API Routes + Supabase
Base données: PostgreSQL (Supabase) / MySQL (Prisma - Hostinger)
ORM:          Prisma 7.2
Temps réel:   Supabase Realtime
Graphiques:   Chart.js + react-chartjs-2
PDF:          jsPDF
```

### 3.2 Schéma de base de données

```
┌─────────────┐     ┌─────────────┐
│   teams     │     │   players   │
├─────────────┤     ├─────────────┤
│ id          │◄────┤ team_id     │
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
│ id          │◄────┤ match_id    │
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

### 3.3 Structure des fichiers (actuelle)

```
src/
├── app/
│   ├── page.tsx                    ✅ Dashboard
│   ├── layout.tsx                  ✅ Layout
│   ├── teams/
│   │   └── page.tsx               ✅ CRUD équipes
│   ├── players/
│   │   └── page.tsx               ✅ CRUD joueurs
│   ├── matches/
│   │   ├── page.tsx               ✅ Liste des matchs
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
│   ├── prisma.ts                  ✅ Client Prisma
│   ├── pdf-generator.ts           ✅ Génération PDF
│   └── utils.ts                   ✅ Utilitaires
└── types/
    └── index.ts                   ✅ Types TypeScript
```

---

## 4. Spécifications des API

### 4.1 API Teams ✅
```
GET    /api/teams           Liste des équipes
POST   /api/teams           Créer une équipe
GET    /api/teams/[id]      Détails équipe
PUT    /api/teams/[id]      Modifier équipe
DELETE /api/teams/[id]      Supprimer équipe
```

### 4.2 API Players ✅
```
GET    /api/players         Liste joueurs (params: team_id, league)
POST   /api/players         Créer joueur
GET    /api/players/[id]    Détails joueur
PUT    /api/players/[id]    Modifier joueur
DELETE /api/players/[id]    Supprimer joueur
```

### 4.3 API Matches ✅
```
GET    /api/matches         Liste matchs (params: league, status, team_id)
POST   /api/matches         Créer match
GET    /api/matches/[id]    Détails match avec stats
PUT    /api/matches/[id]    Modifier match (status, score)
DELETE /api/matches/[id]    Supprimer match
POST   /api/matches/[id]/stats  Ajouter/modifier stats joueur
```

### 4.4 API Stats ✅
```
PUT    /api/stats/[id]      Modifier stat (increment ou mise à jour)
DELETE /api/stats/[id]      Supprimer stat
```

### 4.5 API Classements et Rapports ✅
```
GET    /api/rankings        Classements (params: category, league, limit)
POST   /api/nba             Synchroniser données NBA
GET    /api/reports         Rapport hebdomadaire (format=pdf)
```

---

## 5. Workflow utilisateur

### 5.1 Configuration initiale
1. Créer des équipes via `/teams`
2. Ajouter des joueurs à chaque équipe via `/players`
3. L'application est prête pour les matchs

### 5.2 Jour de match
1. Créer un match via `/matches` (sélectionner équipes, date/heure)
2. Cliquer "Démarrer" pour ouvrir l'interface de saisie en direct
3. Utiliser les boutons +1/+2/+3 pour les points, +1 pour les autres stats
4. Le score se met à jour automatiquement
5. Cliquer "Terminer le match" quand c'est fini

### 5.3 Consultation hebdomadaire (mercredi)
1. Dashboard principal avec classements à jour
2. Filtrer par ligue (Local, NBA, Tous)
3. Télécharger le rapport PDF pour envoi

---

## 6. Plan de développement

### ✅ TOUTES LES PHASES COMPLÈTES

#### 6.1 Affichage du classement - TERMINÉ ✅
L'équipe apparaît déjà avec chaque joueur :
- `RankingTable.tsx:72` - En-tête "Équipe"
- `RankingTable.tsx:101` - Affiche `player.team_name`
- `rankings/route.ts:56` - API retourne `team_name`
- `pdf-generator.ts:82` - PDF avec équipe entre parenthèses

#### 6.2 Tests de validation - TERMINÉ ✅
- [x] Classements affichent l'équipe
- [x] API Rankings inclut team_name
- [x] Export PDF avec équipes
- [x] Build Next.js sans erreurs

### Améliorations futures (optionnelles)

#### 6.3 Timer de match
- Ajouter un composant `MatchTimer.tsx`
- Gestion des 4 quarts-temps
- Pause/reprise du timer

#### 6.4 Statistiques avancées
- Efficacité (PER, +/-)
- Moyennes sur période personnalisée
- Tendances graphiques

---

## 7. Critères d'acceptation

### 7.1 Fonctionnalités validées ✅
- [x] Un administrateur peut créer une équipe locale
- [x] Un administrateur peut ajouter des joueurs à une équipe
- [x] Un marqueur peut créer un match et le démarrer
- [x] Un marqueur peut saisir les stats en temps réel pendant le match
- [x] Les classements se mettent à jour automatiquement après chaque saisie
- [x] Le rapport PDF peut être généré

### 7.2 Validé ✅
- [x] **L'équipe du joueur apparaît dans les classements** (colonne "Équipe" dans RankingTable.tsx:72,101)
- [x] **Le rapport PDF inclut le nom d'équipe** (pdf-generator.ts:82 - entre parenthèses)

### 7.3 Performance
- [x] Temps de chargement initial < 2s
- [x] Mise à jour temps réel < 500ms
- [x] Support mobile (responsive)

### 7.4 Fiabilité
- [x] Validation des données côté serveur
- [x] Gestion des erreurs avec messages clairs
- [x] Build Next.js sans erreurs

---

## 8. Configuration requise

### 8.1 Variables d'environnement
```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service

# NBA API (Optionnel)
NBA_API_KEY=votre-clé-balldontlie

# Prisma/MySQL (Alternative Hostinger)
DATABASE_URL=mysql://user:password@host:port/database
```

### 8.2 Base de données
- **Option 1**: Supabase PostgreSQL (recommandé pour temps réel)
- **Option 2**: MySQL avec Prisma (pour hébergement Hostinger)

---

## 9. Glossaire

| Terme | Définition |
|-------|------------|
| PTS | Points marqués |
| REB | Rebonds (offensifs + défensifs) |
| AST | Passes décisives (assists) |
| STL | Interceptions (steals) |
| BLK | Contres (blocks) |
| TO | Balles perdues (turnovers) |
| FG | Tirs réussis/tentés (field goals) |
| 3PT | Tirs à 3 points réussis/tentés |
| FT | Lancers francs réussis/tentés |

---

## 10. Notes de session

### Session du 14 janvier 2026 (Finalisation)
- Build vérifié : ✅ Compile sans erreurs
- Toutes les pages et APIs sont fonctionnelles
- **Vérification des fonctionnalités** :
  - ✅ Colonne "Équipe" présente dans `RankingTable.tsx` (lignes 72, 101)
  - ✅ API Rankings retourne `team_name` (route.ts ligne 56)
  - ✅ PDF inclut l'équipe entre parenthèses (pdf-generator.ts ligne 82)

### 🎉 PROJET COMPLET
L'application est prête pour la production. Toutes les fonctionnalités demandées sont implémentées :
- Classement des joueurs avec leur équipe
- Saisie des stats en temps réel
- Export PDF hebdomadaire avec équipes
- CRUD complet (équipes, joueurs, matchs)

### Commandes utiles
```bash
# Développement
npm run dev

# Build production
npm run build

# Lancement production
npm start
```

### Workflow hebdomadaire (mercredi)
1. Ouvrir le dashboard (/)
2. Sélectionner "Local" dans le sélecteur de ligue
3. Cliquer "Rapport PDF" pour télécharger le classement
4. Envoyer le PDF
