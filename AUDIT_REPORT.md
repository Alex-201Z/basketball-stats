# Rapport d'Audit Complet - Palette 🎨

Ce rapport couvre la sécurité, la qualité du code et l'expérience utilisateur (UX/Accessibilité).

## 1. 🛡️ Audit de Sécurité

**Statut Global :** ⚠️ Attention requise

**Vulnérabilités détectées (`npm audit`) :**
*   **Total :** 9 vulnérabilités (5 modérées, 4 hautes).
*   **Hautes (High) :**
    *   `hono` (via dépendances de développement Prisma) : Problèmes liés aux tokens JWT, XSS et lecture arbitraire de clés.
    *   `next` : Déni de service (DoS) via l'optimiseur d'image et consommation mémoire illimitée.
*   **Modérées (Moderate) :**
    *   `lodash` : Prototype Pollution.

**Recommandations :**
1.  Mettre à jour `next` vers la dernière version stable patchée (v16.1.6 recommandée par l'audit, mais vérifier la compatibilité).
2.  Mettre à jour `prisma` pour résoudre les vulnérabilités de `hono` dans les dépendances de développement.

---

## 2. 💻 Audit de Qualité du Code

**Statut Global :** ⚠️ Quelques problèmes critiques

**Problèmes détectés (`eslint`) :**
*   **Violation React Hook Critique :**
    *   `src/hooks/useRealtime.ts` (Ligne 74) : Accès à `channelRef.current` pendant le rendu. C'est une violation des règles des Hooks React qui peut causer des bugs imprévisibles.
*   **Importations :**
    *   `server.js` : Utilisation d'imports style `require()` interdits par la configuration TypeScript/ESLint actuelle.
*   **HTML/JSX :**
    *   `src/app/players/page.tsx` : Caractères non échappés (guillemets) pouvant casser le rendu.
*   **Performance :**
    *   Utilisation de la balise `<img>` standard au lieu du composant `<Image />` de Next.js dans plusieurs fichiers (`players/page.tsx`, `teams/page.tsx`), ce qui nuit aux performances (LCP, bande passante).
*   **Code mort :**
    *   Imports inutilisés (`useState` dans Sidebar, icônes non utilisées) qui alourdissent le bundle.

---

## 3. 🎨 Audit UX & Accessibilité (Mission Palette)

**Statut Global :** 🟡 Bonnes bases, améliorations nécessaires

**Accessibilité (A11y) :**
*   **Boutons sans étiquette (Critical) :** Plusieurs boutons interactifs ne contiennent que des icônes et n'ont pas d'attribut `aria-label`. Les lecteurs d'écran liront "bouton" sans contexte.
    *   `Sidebar.tsx` : Bouton de menu mobile et bouton de fermeture.
    *   `RecentMatches.tsx` : Bouton "Play" (Démarrer/Continuer).
    *   `MatchesPage` : Bouton de suppression (Corbeille).
*   **Navigation au clavier :**
    *   Les éléments interactifs semblent être des `<button>` ou `<a>` natifs, ce qui est bien.

**Expérience Utilisateur (UX) :**
*   **Internationalisation :** Textes en français codés en dur ("Menu principal", "Voir tout").
*   **Feedback visuel :**
    *   ✅ Les médailles ajoutées dans le tableau de classement améliorent la hiérarchie visuelle.
    *   ⚠️ Les états de chargement sont basiques (spinners). Des "Skeletons" seraient plus agréables pour réduire le décalage visuel (Layout Shift).

**Prochaine étape recommandée pour Palette :**
Ajouter les `aria-label` manquants sur tous les boutons "icône seule" pour garantir que l'application est utilisable par tous.
