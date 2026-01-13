# PRD - Basketball Stats Application

## Product Requirements Document
**Version:** 1.0  
**Date:** 13 janvier 2026  
**Statut:** En développement

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

---

## 2. Fonctionnalités

### 2.1 Fonctionnalités existantes ✅

| Fonctionnalité | Description | Statut |
|----------------|-------------|--------|
| Dashboard principal | Vue d'ensemble des classements | ✅ Complet |
| Classements par catégorie | Points, rebonds, passes, interceptions, contres, global | ✅ Complet |
| Graphiques interactifs | Visualisation Chart.js des top 10 | ✅ Complet |
| Sélecteur de ligue | Filtrage NBA/Local/Tous | ✅ Complet |
| Sync NBA | Synchronisation via balldontlie.io | ✅ Complet |
| Export PDF | Rapport hebdomadaire téléchargeable | ✅ Complet |
| Temps réel | Mise à jour via Supabase Realtime | ✅ Complet |

### 2.2 Fonctionnalités à développer 🚧

#### 2.2.1 Gestion des équipes locales (Priorité: HAUTE)
- **CRUD complet** : Créer, modifier, supprimer des équipes
- **Informations** : Nom, logo, description
- **Interface** : Page `/teams` avec liste et formulaires

#### 2.2.2 Gestion des joueurs locaux (Priorité: HAUTE)
- **CRUD complet** : Créer, modifier, supprimer des joueurs
- **Informations** : Nom, prénom, numéro, position, équipe, photo
- **Interface** : Page `/players` avec filtres par équipe

#### 2.2.3 Saisie manuelle des matchs (Priorité: CRITIQUE)
- **Création de match** : Sélection équipes, date/heure
- **Saisie en temps réel** : Interface pour entrer les stats pendant le match
- **Stats rapides** : Boutons +1 pour points, rebonds, etc.
- **Minuterie** : Timer de match intégré (4 quarts-temps)
- **Interface** : Page `/matches/new` et `/matches/[id]/live`

#### 2.2.4 API de saisie manuelle (Priorité: CRITIQUE)
- `POST /api/teams` : Créer une équipe
- `PUT /api/teams/[id]` : Modifier une équipe
- `DELETE /api/teams/[id]` : Supprimer une équipe
- `POST /api/players` : Créer un joueur
- `PUT /api/players/[id]` : Modifier un joueur
- `DELETE /api/players/[id]` : Supprimer un joueur
- `POST /api/matches` : Créer un match
- `PUT /api/matches/[id]` : Modifier un match (score, statut)
- `POST /api/matches/[id]/stats` : Ajouter/modifier stats d'un joueur
- `PUT /api/stats/[id]` : Modifier une stat individuelle

#### 2.2.5 Page de détails des matchs (Priorité: MOYENNE)
- **Vue match** : Score, équipes, date, statut
- **Stats par joueur** : Tableau avec toutes les stats individuelles
- **Box score** : Comparaison équipe vs équipe

#### 2.2.6 Historique et archives (Priorité: BASSE)
- **Liste des matchs** : Filtres par date, équipe, statut
- **Statistiques de saison** : Moyennes sur période personnalisée

---

## 3. Architecture technique

### 3.1 Stack actuel
```
Frontend:     Next.js 16.1.1, React 19, TypeScript
UI:           Tailwind CSS 4, shadcn/ui, Lucide icons
Backend:      Next.js API Routes + Supabase
Base données: PostgreSQL (Supabase)
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

### 3.3 Structure des fichiers (cible)

```
src/
├── app/
│   ├── page.tsx                    # Dashboard (existant)
│   ├── layout.tsx                  # Layout (existant)
│   ├── teams/
│   │   ├── page.tsx               # Liste des équipes
│   │   └── [id]/page.tsx          # Détails équipe
│   ├── players/
│   │   ├── page.tsx               # Liste des joueurs
│   │   └── [id]/page.tsx          # Profil joueur
│   ├── matches/
│   │   ├── page.tsx               # Liste des matchs
│   │   ├── new/page.tsx           # Créer un match
│   │   └── [id]/
│   │       ├── page.tsx           # Détails du match
│   │       └── live/page.tsx      # Saisie en direct
│   └── api/
│       ├── rankings/route.ts      # (existant)
│       ├── nba/route.ts           # (existant)
│       ├── reports/route.ts       # (existant)
│       ├── teams/
│       │   ├── route.ts           # GET/POST équipes
│       │   └── [id]/route.ts      # GET/PUT/DELETE équipe
│       ├── players/
│       │   ├── route.ts           # GET/POST joueurs
│       │   └── [id]/route.ts      # GET/PUT/DELETE joueur
│       ├── matches/
│       │   ├── route.ts           # GET/POST matchs
│       │   └── [id]/
│       │       ├── route.ts       # GET/PUT/DELETE match
│       │       └── stats/route.ts # POST stats du match
│       └── stats/
│           └── [id]/route.ts      # PUT/DELETE stat
├── components/
│   ├── ui/                        # shadcn (existant)
│   ├── LeagueSelector.tsx         # (existant)
│   ├── RankingTable.tsx           # (existant)
│   ├── StatsChart.tsx             # (existant)
│   ├── TeamForm.tsx               # Formulaire équipe
│   ├── PlayerForm.tsx             # Formulaire joueur
│   ├── MatchForm.tsx              # Formulaire match
│   ├── LiveScoring.tsx            # Interface saisie live
│   ├── PlayerStatInput.tsx        # Boutons +/- stats
│   ├── MatchTimer.tsx             # Minuterie de match
│   └── BoxScore.tsx               # Tableau box score
├── hooks/
│   ├── useRankings.ts             # (existant)
│   ├── useRealtime.ts             # (existant)
│   ├── useTeams.ts                # Hook équipes
│   ├── usePlayers.ts              # Hook joueurs
│   └── useMatches.ts              # Hook matchs
└── lib/
    ├── supabase.ts                # (existant)
    ├── pdf-generator.ts           # (existant)
    └── utils.ts                   # (existant)
```

---

## 4. Spécifications des API

### 4.1 API Teams

#### GET /api/teams
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "local-team-1",
      "name": "Paris Basket",
      "logo_url": null,
      "league": "local",
      "created_at": "2026-01-13T10:00:00Z"
    }
  ]
}
```

#### POST /api/teams
```json
// Request
{
  "name": "Marseille Hoops",
  "logo_url": "https://...",
  "league": "local"
}

// Response
{
  "success": true,
  "data": { "id": "local-team-3", ... }
}
```

### 4.2 API Players

#### GET /api/players
```json
// Query params: ?team_id=xxx&league=local
// Response
{
  "success": true,
  "data": [
    {
      "id": "local-player-1",
      "first_name": "Jean",
      "last_name": "Dupont",
      "jersey_number": 23,
      "position": "PG",
      "team_id": "local-team-1",
      "team": { "id": "local-team-1", "name": "Paris Basket" },
      "league": "local"
    }
  ]
}
```

#### POST /api/players
```json
// Request
{
  "first_name": "Paul",
  "last_name": "Durand",
  "jersey_number": 15,
  "position": "SF",
  "team_id": "local-team-1"
}
```

### 4.3 API Matches

#### POST /api/matches
```json
// Request
{
  "home_team_id": "local-team-1",
  "away_team_id": "local-team-2",
  "match_date": "2026-01-15T19:00:00Z"
}

// Response
{
  "success": true,
  "data": { "id": "local-match-2", "status": "scheduled", ... }
}
```

#### PUT /api/matches/[id]
```json
// Request - Démarrer le match
{
  "status": "in_progress"
}

// Request - Mettre à jour le score
{
  "home_score": 45,
  "away_score": 42
}

// Request - Terminer le match
{
  "status": "completed"
}
```

### 4.4 API Stats (saisie en direct)

#### POST /api/matches/[id]/stats
```json
// Request - Ajouter/Mettre à jour stats d'un joueur
{
  "player_id": "local-player-1",
  "points": 25,
  "rebounds": 5,
  "assists": 8,
  "steals": 2,
  "blocks": 0
}

// Response
{
  "success": true,
  "data": { "id": "local-stat-5", ... }
}
```

#### PUT /api/stats/[id]
```json
// Request - Incrémenter une stat
{
  "action": "increment",
  "stat": "points",
  "value": 2
}

// Request - Mise à jour complète
{
  "points": 27,
  "rebounds": 6
}
```

---

## 5. Interface utilisateur

### 5.1 Navigation principale
```
┌──────────────────────────────────────────────────────┐
│ 🏀 Basketball Stats    [NBA/Local/All ▼]  [Sync] [PDF]│
├──────────────────────────────────────────────────────┤
│  Dashboard  │  Équipes  │  Joueurs  │  Matchs        │
└──────────────────────────────────────────────────────┘
```

### 5.2 Page de saisie en direct (/matches/[id]/live)
```
┌──────────────────────────────────────────────────────┐
│         Paris Basket  45 - 42  Lyon Basketball       │
│                    Q2  05:23                         │
├──────────────────────────────────────────────────────┤
│ [▶ Start] [⏸ Pause] [⏹ End Quarter] [🏁 End Match]  │
├───────────────────────┬──────────────────────────────┤
│ PARIS BASKET          │ LYON BASKETBALL              │
├───────────────────────┼──────────────────────────────┤
│ #23 J. Dupont         │ #11 M. Bernard               │
│ PTS: 12 [+1][+2][+3]  │ PTS: 8  [+1][+2][+3]        │
│ REB: 3  [+1]          │ REB: 5  [+1]                 │
│ AST: 4  [+1]          │ AST: 2  [+1]                 │
│ STL: 1  [+1]          │ STL: 2  [+1]                 │
│ BLK: 0  [+1]          │ BLK: 1  [+1]                 │
├───────────────────────┼──────────────────────────────┤
│ #7 P. Martin          │ #34 L. Petit                 │
│ PTS: 8  [+1][+2][+3]  │ PTS: 10 [+1][+2][+3]        │
│ ...                   │ ...                          │
└───────────────────────┴──────────────────────────────┘
```

---

## 6. Plan de développement

### Phase 1 - APIs de base (Actuel)
- [x] API Rankings
- [x] API NBA Sync
- [x] API Reports
- [ ] API Teams CRUD
- [ ] API Players CRUD
- [ ] API Matches CRUD
- [ ] API Stats CRUD

### Phase 2 - Interfaces de gestion
- [ ] Page /teams avec liste et formulaire
- [ ] Page /players avec liste et formulaire
- [ ] Page /matches avec liste

### Phase 3 - Saisie en direct
- [ ] Page /matches/new (création de match)
- [ ] Page /matches/[id]/live (saisie en direct)
- [ ] Composant LiveScoring
- [ ] Composant MatchTimer

### Phase 4 - Améliorations
- [ ] Page profil joueur détaillé
- [ ] Historique des matchs par équipe
- [ ] Statistiques avancées (efficacité, +/-)
- [ ] Mode hors-ligne avec synchronisation

---

## 7. Critères d'acceptation

### 7.1 Fonctionnalités critiques
- [ ] Un administrateur peut créer une équipe locale
- [ ] Un administrateur peut ajouter des joueurs à une équipe
- [ ] Un marqueur peut créer un match et le démarrer
- [ ] Un marqueur peut saisir les stats en temps réel pendant le match
- [ ] Les classements se mettent à jour automatiquement après chaque saisie
- [ ] Le rapport PDF inclut les données de la ligue locale

### 7.2 Performance
- Temps de chargement initial < 2s
- Mise à jour temps réel < 500ms
- Support mobile (responsive)

### 7.3 Fiabilité
- Validation des données côté serveur
- Gestion des erreurs avec messages clairs
- Pas de perte de données en cas de déconnexion

---

## 8. Contraintes et dépendances

### 8.1 Dépendances externes
- **Supabase** : Base de données et temps réel
- **balldontlie.io** : API NBA (optionnel, nécessite clé API)

### 8.2 Contraintes techniques
- Next.js 16+ (pas de `next lint` intégré)
- React 19 avec Server Components
- Supabase Realtime requiert configuration des publications

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

