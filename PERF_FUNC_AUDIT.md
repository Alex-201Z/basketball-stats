# Audit Performance & Fonctionnalité

## 1. 🚀 Performance

### Problèmes Identifiés
1.  **Dashboard (Client-Side Rendering) :**
    *   La page d'accueil (`src/app/page.tsx`) récupère toutes les données (équipes, joueurs, matchs) via `fetch` côté client dans un `useEffect`.
    *   **Impact :** Cela retarde l'affichage du contenu (LCP - Largest Contentful Paint) et affiche des spinners de chargement inutiles, alors que Next.js permet de récupérer ces données côté serveur instantanément.
2.  **Images non optimisées :**
    *   Bien que nous ayons migré vers `next/image` dans les pages listes, d'autres composants (comme les modales ou `TopPlayersCard`) pourraient encore bénéficier d'optimisations.
3.  **Requêtes Base de Données :**
    *   Les endpoints API (`/api/rankings`, `/api/matches`) semblent faire plusieurs requêtes séquentielles.

### Recommandations
*   **Priorité 1 :** Convertir le Dashboard (`src/app/page.tsx`) en **Server Component**. Cela supprimera la cascade de requêtes et rendra la page instantanée.
*   **Priorité 2 :** Utiliser `Promise.all` pour les requêtes de données indépendantes.

---

## 2. ⚙️ Fonctionnalité

### Analyse des Fonctionnalités Clés
1.  **Synchronisation NBA (`/api/nba`) :**
    *   ✅ Le code semble robuste. Il utilise l'API `balldontlie.io` et gère correctement les `upsert` (création ou mise à jour) pour éviter les doublons.
    *   ⚠️ **Risque :** L'API `balldontlie` nécessite une clé API (`NBA_API_KEY`). Si elle est manquante, la synchro échouera silencieusement ou avec une erreur 500 générique.
2.  **Scoring en Direct (`/matches/[id]/live`) :**
    *   ✅ L'interface est fonctionnelle et intuitive.
    *   ✅ Mise à jour optimiste de l'UI (feedback immédiat avant la réponse serveur).
    *   ⚠️ **Absence de Temps Réel Entrant :** Cette page *envoie* des données, mais ne semble pas écouter les changements venant d'autres utilisateurs (via `useRealtime`). Si deux scoreurs sont sur le même match, ils ne verront pas les actions de l'autre sans recharger.
3.  **Hooks Temps Réel (`useRealtime`) :**
    *   Le correctif précédent (retourner `null`) a stabilisé l'application (plus d'erreur React), mais a désactivé l'accès direct à l'objet `channel` pour les composants consommateurs.
    *   *Note :* Après analyse, aucun composant critique n'utilisait la valeur de retour du hook, donc c'est sans conséquence immédiate.

### Recommandations
*   **Priorité 1 :** Ajouter une gestion d'erreur plus explicite pour la clé API NBA.
*   **Priorité 2 :** Implémenter le `useRealtime` sur la page de Live Scoring pour qu'elle soit collaborative (multi-utilisateurs).

---

## 3. Plan d'Action "Palette"

Je propose d'appliquer la **"Touche Palette"** sur la performance du Dashboard, car c'est la première chose que l'utilisateur voit.

**Action : Convertir le Dashboard en Server Component.**
Cela transformera l'expérience d'un "chargement..." à un affichage immédiat.
