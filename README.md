# ScoreContrée - README de reprise et de maintenance

Ce document sert à deux choses :

- permettre au propriétaire de l'application de se rappeler comment elle fonctionne ;
- permettre à Codex de reprendre rapidement le projet lors d'une future correction, optimisation ou évolution.

Il doit être mis à jour à chaque modification fonctionnelle, visuelle ou technique de l'application.

Dernière mise à jour du README : 18 juin 2026.

Version applicative actuellement documentée : `v20260611_1707`.

---

## 1. Résumé de l'application

ScoreContrée est une application web/PWA de comptage des points pour la belote contrée.

Elle permet de :

- configurer les joueurs et les équipes ;
- choisir le donneur ;
- gérer une partie de belote contrée ;
- saisir les contrats ;
- saisir les points réalisés ;
- calculer automatiquement les scores selon le contrat, la belote, le capot, la chute, le contre et le surcontre ;
- suivre la feuille de score ;
- consulter l'historique ;
- afficher des statistiques ;
- gérer un mode tournoi ;
- sauvegarder localement l'état de l'application ;
- exporter/importer les données ;
- synchroniser via GitHub Gist ;
- fonctionner comme application installable sur iPhone/iPad via PWA.

L'application est aujourd'hui volontairement livrée sous forme de deux fichiers principaux :

- `index.html`
- `service-worker.js`

Les tests de non-régression sont séparés dans le dossier `tests/`.

---

## 2. Fichiers du projet

Emplacement du projet :

```text
C:\Users\cdesmottes\Documents\ScoreBelote
```

Structure actuelle :

```text
ScoreBelote/
  index.html
  service-worker.js
  README.md
  tests/
    scoring-regression.html
    scoring-regression.js
    player-names-regression.html
    storage-regression.html
    tournament-regression.html
    navigation-regression.html
    screen-modal-regression.html
    game-state-regression.html
    rendering-regression.html
    final-audit-regression.html
```

Ancien emplacement des fichiers fournis au début de la conversation :

```text
C:\Users\cdesmottes\Downloads\index.html
C:\Users\cdesmottes\Downloads\service-worker.js
```

Emplacement de travail actuel et recommandé :

```text
C:\Users\cdesmottes\Documents\ScoreBelote\index.html
C:\Users\cdesmottes\Documents\ScoreBelote\service-worker.js
```

---

## 3. Fonctionnement général

### 3.1 Écrans principaux

L'application est organisée autour de plusieurs écrans HTML.

Les principaux écrans sont :

- `screen-setup` : configuration initiale ;
- `screen-game` : jeu en cours ;
- `screen-winner` : victoire ;
- `screen-settings` : réglages ;
- `screen-tournoi` : gestion tournoi ;
- `screen-marque` : feuille de marque plein écran ;
- `screen-help` : aide.

L'écran `screen-game` contient plusieurs onglets internes :

- `tab-enjeu` : page TABLE, avec la table, le score et les actions principales ;
- `tab-contrat` : saisie du contrat ;
- `tab-saisie` : saisie du résultat ;
- `tab-history` : historique de la partie en cours ;
- `tab-parties` : parties sauvegardées et historiques ;
- `tab-stats` : statistiques ;
- `tab-feuille` : feuille de score ;
- `tab-marque` : marque détaillée.

La navigation repose sur des helpers communs, notamment :

- `showScreen(...)`
- `showTab(...)`
- `getActiveScreenName(...)`
- `getActiveGameTab(...)`
- `updateGameNavigation(...)`
- `syncGameScreenVisibility(...)`

Ces helpers ont été ajoutés ou consolidés pour éviter les incohérences d'affichage entre écrans et onglets.

### 3.2 Parcours standard d'une partie

Parcours typique :

1. L'utilisateur arrive sur l'écran de configuration.
2. Il choisit ou modifie les joueurs.
3. Il lance une partie.
4. L'application affiche la page TABLE.
5. L'utilisateur saisit un contrat.
6. Il saisit ensuite le score de la donne.
7. L'application calcule le score réel.
8. La donne est ajoutée à l'historique de la partie.
9. Les scores totaux sont mis à jour.
10. La partie continue jusqu'à atteindre l'objectif ou être terminée manuellement.

### 3.3 Modes de victoire

Deux modes existent :

- victoire aux points ;
- victoire au nombre de manches.

Les valeurs sont configurables dans les réglages :

- objectif de points ;
- nombre de manches.

### 3.4 Contrat et score

La logique de score prend en compte :

- équipe preneuse ;
- valeur du contrat ;
- couleur ;
- sans atout / tout atout selon les options présentes dans l'application ;
- contre ;
- surcontre ;
- belote ;
- capot ;
- chute.

La fonction centrale de calcul est testée par `tests/scoring-regression.js`.

---

## 4. Organisation de `index.html`

`index.html` contient :

- les métadonnées PWA ;
- les styles CSS ;
- la structure HTML ;
- le JavaScript de l'application.

Le fichier contient une table des matières interne en commentaire au début. Elle est importante et doit rester à jour après de grosses modifications.

Organisation documentée dans le fichier :

```text
CSS           ~ lignes 125-1260
HTML          ~ lignes 1260-2045
JavaScript    ~ lignes 2045-7550
```

Les numéros de lignes sont approximatifs et peuvent évoluer.

### 4.1 CSS

Le CSS est organisé par blocs de media queries.

Règle importante : ne pas corriger un appareil dans le bloc d'un autre appareil.

Blocs principaux :

```text
Variables & reset globaux
iPhone portrait
iPhone paysage
iPad portrait
iPad paysage A - styles généraux
PC / Desktop
iPad paysage B - page TABLE uniquement
```

Point particulièrement important :

- le bloc iPad paysage B est placé après le bloc desktop ;
- il sert uniquement à la page TABLE ;
- il gagne volontairement la cascade CSS sur le bloc PC ;
- les règles iPad paysage pour la page TABLE doivent aller dans ce bloc, pas dans le bloc iPad paysage A.

### 4.2 HTML

La partie HTML contient les écrans et onglets.

Les éléments sont encore souvent reliés au JavaScript par :

- `id="..."` ;
- `onclick="..."` ;
- `onchange="..."` ;
- `onkeydown="..."`.

Ce choix est historique. Il fonctionne, mais impose de conserver certaines fonctions dans le scope global.

### 4.3 JavaScript

Le JavaScript est organisé par sections :

```text
State & initialisation
Joueurs & setup
Game UI
Contrat
Score & validation
Historique & stats
Tournoi
Canvas & partage
Utils
Layout fixes
Fin de partie
Reconnaissance vocale
Thème & aide
Sync export/import/Gist
Réglages
Initialisation finale
```

L'état applicatif principal est porté par l'objet global `S`.

Il contient notamment :

- les joueurs ;
- les équipes ;
- le score ;
- le contrat courant ;
- l'historique de la partie ;
- le mode de jeu ;
- les informations de tournoi ;
- l'état d'affichage.

---

## 5. Service worker et PWA

Le fichier `service-worker.js` permet le fonctionnement PWA et le cache.

Nom du cache actuel :

```js
scorecontree-v20260611_1707
```

Le service worker utilise une stratégie :

```text
network first, cache fallback
```

Cela signifie :

- si le réseau est disponible, l'application tente de charger la version la plus récente ;
- si le réseau échoue, elle retombe sur le cache ;
- à l'activation, les anciens caches `scorecontree-*` sont supprimés.

Fichiers mis en cache explicitement :

```text
/scorecontree/
/scorecontree/index.html
```

Règle de maintenance importante :

À chaque livraison applicative, il faut synchroniser le numéro de version à deux endroits :

1. dans `index.html`, en bas de l'écran Réglages ;
2. dans `service-worker.js`, dans `CACHE_NAME`.

Format attendu :

```text
vAAAAMMJJ_HHMM
```

Exemple :

```text
v20260611_1707
```

Pourquoi c'est important :

- l'utilisateur voit la version dans les réglages ;
- le service worker invalide correctement l'ancien cache ;
- iPhone/iPad récupèrent plus proprement la nouvelle version.

---

## 6. Données sauvegardées

L'application utilise `localStorage`.

Clés connues :

```text
belote_history
belote_tournois_history
belote_autosave
belote_last_config
belote_tournoi
belote_players
bct_theme
tournoi_mode
gist_token
gist_id
```

Signification :

- `belote_history` : historique des parties normales ;
- `belote_tournois_history` : historique des tournois ;
- `belote_autosave` : sauvegarde automatique de la partie en cours ;
- `belote_last_config` : dernière configuration de joueurs ;
- `belote_tournoi` : tournoi en cours ;
- `belote_players` : liste des joueurs ;
- `bct_theme` : thème couleur ;
- `tournoi_mode` : activation du mode tournoi ;
- `gist_token` : token GitHub Gist ;
- `gist_id` : identifiant du Gist utilisé pour la sauvegarde.

Les fonctions de lecture/écriture ont été sécurisées pour mieux gérer :

- JSON invalide ;
- données absentes ;
- anciens formats ;
- imports partiels ;
- snapshots d'autosave hérités.

---

## 7. Tests existants

Les tests ne sont pas intégrés dans l'application livrée.

Ils sont dans :

```text
C:\Users\cdesmottes\Documents\ScoreBelote\tests
```

Ils servent uniquement au développement et aux vérifications avant livraison.

### 7.1 Liste des tests

| Fichier | Rôle | Nombre de contrôles lors de la dernière campagne |
|---|---:|---:|
| `scoring-regression.html` | calcul des scores | 10 |
| `player-names-regression.html` | noms de joueurs, caractères spéciaux, sécurité d'affichage | 4 |
| `storage-regression.html` | localStorage, import/export, formats invalides | 9 |
| `tournament-regression.html` | appariements, classement, résultats tournoi | 16 |
| `navigation-regression.html` | navigation, onglets, rotation, écran actif | 15 |
| `screen-modal-regression.html` | écrans secondaires, modales, réglages, aide | 30 |
| `game-state-regression.html` | état de partie, autosave, normalisation | 28 |
| `rendering-regression.html` | rendu HTML, sécurité, table, historique, feuille | 21 |
| `final-audit-regression.html` | audit final structurel | 25 |

Total dernière campagne :

```text
158 contrôles réussis
```

### 7.2 Ce que les tests vérifient

Les tests vérifient notamment :

- les règles de calcul de score ;
- la compatibilité avec les noms de joueurs contenant des caractères spéciaux ;
- l'absence d'injection HTML évidente dans certains rendus ;
- la robustesse de `localStorage` ;
- les imports/exports ;
- la navigation entre les écrans ;
- la rotation portrait/paysage ;
- l'unicité des écrans actifs ;
- l'absence d'onglets concurrents visibles ;
- les fonctions publiques attendues par les handlers inline ;
- l'absence de certains anciens symboles supprimés ;
- la structure DOM de base.

### 7.3 Quand rejouer les tests

Pendant le développement :

- rejouer au minimum les tests liés à la zone modifiée.

Avant chaque livraison :

- rejouer toute la campagne de tests.

Même si une modification semble visuelle, il faut rester prudent : le CSS, l'état, la navigation et le service worker peuvent avoir des effets indirects.

### 7.4 Limite des tests

Les tests apportent une bonne sécurité, mais ils ne remplacent pas totalement :

- un essai réel sur iPhone ;
- un essai réel sur iPad ;
- un essai en mode PWA installée ;
- un essai tactile ;
- une vérification d'orientation physique portrait/paysage.

Pour les sujets iOS/Safari/PWA, une validation réelle reste importante.

---

## 8. Historique des corrections et améliorations déjà faites

Cette section résume les décisions importantes prises pendant la conversation.

### 8.1 Bug iPhone paysage vers portrait

Bug initial :

1. l'utilisateur est sur la page TABLE en iPhone paysage ;
2. il clique sur `Saisir score` ;
3. il arrive sur la page de saisie ;
4. il tourne le téléphone en portrait ;
5. il clique sur `Annuler` ;
6. il revient sur la page TABLE en portrait ;
7. la table est vide.

Correction :

- consolidation de la navigation entre onglets ;
- resynchronisation de l'écran actif et de l'onglet actif ;
- correction pour éviter que la TABLE reste dans un état masqué ou incohérent après rotation.

Prise en compte :

- iPhone ;
- iPad ;
- scénarios de rotation ;
- retour depuis saisie vers table.

### 8.2 Organisation et nettoyage du code

Plusieurs améliorations de maintenance ont été réalisées :

- clarification de la table des matières interne ;
- correction de l'organisation CSS documentée ;
- nettoyage de code inutilisé ;
- suppression de wrappers inutiles ;
- suppression de logs de diagnostic non nécessaires ;
- conservation des warnings utiles pour le stockage et les erreurs vocales ;
- centralisation de certains comportements d'affichage ;
- ajout de tests de non-régression.

Exemples d'éléments supprimés car démontrés inutilisés :

- anciens helpers de score non appelés ;
- ancienne fonction de debug historique ;
- alias ou wrappers qui n'apportaient plus rien ;
- variables obsolètes.

### 8.3 Décision sur le découpage en fichiers

Un découpage avait été envisagé :

```text
index.html
css/
  base.css
  iphone.css
  ipad.css
  desktop.css
js/
  state.js
  scoring.js
  storage.js
  navigation.js
  game.js
  tournament.js
  stats.js
  voice.js
  app.js
service-worker.js
```

Décision actuelle :

Ne pas faire ce découpage maintenant.

Raison :

- l'application fonctionne correctement ;
- elle est déjà fragile par nature car beaucoup de fonctions sont liées au HTML par handlers inline ;
- déplacer beaucoup de code d'un coup créerait un risque de régression ;
- le service worker et la PWA imposent de bien gérer les chemins et le cache ;
- le gain utilisateur serait nul à court terme.

Le découpage pourrait devenir utile plus tard si :

- les évolutions deviennent fréquentes ;
- `index.html` devient trop difficile à maintenir ;
- on accepte une phase technique dédiée avec tests systématiques entre chaque extraction.

Si le découpage est fait un jour, il faudra procéder progressivement :

1. extraire le CSS sans le réorganiser ;
2. vérifier toute l'application ;
3. extraire un module JS peu dépendant ;
4. valider ;
5. seulement ensuite extraire les modules centraux.

---

## 9. Règles de maintenance importantes

### 9.1 Préserver le comportement existant

La priorité du projet est :

```text
améliorer sans casser ce qui fonctionne déjà.
```

Avant toute modification :

- comprendre la zone concernée ;
- identifier les impacts potentiels ;
- préférer les changements ciblés ;
- éviter les refactorings larges non demandés ;
- ajouter ou adapter les tests si nécessaire.

### 9.2 CSS et media queries

Ne pas modifier une media query par hasard.

Toujours identifier :

- appareil concerné ;
- orientation ;
- page concernée ;
- règle déjà existante ;
- bloc CSS approprié.

Règles :

- iPhone portrait : bloc iPhone portrait ;
- iPhone paysage : bloc iPhone paysage ;
- iPad portrait : bloc iPad portrait ;
- iPad paysage général : bloc iPad paysage A ;
- iPad paysage page TABLE : bloc iPad paysage B ;
- ordinateur : bloc PC / Desktop.

### 9.3 Styles inline

Attention :

```text
el.style.xxx écrase le CSS.
```

Pour afficher un élément masqué, préférer :

```js
element.style.display = '';
```

plutôt que :

```js
element.style.display = 'flex';
element.style.display = 'block';
```

Pourquoi :

- cela laisse le CSS et les media queries décider du bon affichage ;
- cela évite les bugs différents entre iPhone, iPad et desktop.

### 9.4 Safari iOS

Pièges connus :

- éviter les fonctions déclarées dans des blocs en mode strict ;
- être prudent avec `100dvh` en paysage ;
- préférer `disabled` à `pointer-events:none` pour bloquer un bouton ;
- tester les rotations réelles ;
- tester le mode PWA installé quand la modification touche au chargement, au cache ou à l'affichage plein écran.

### 9.5 Version

À chaque livraison applicative :

1. mettre à jour la version visible dans `index.html` ;
2. mettre à jour `CACHE_NAME` dans `service-worker.js` ;
3. conserver exactement le même identifiant aux deux endroits.

Pour une modification purement documentaire comme ce README, il n'est pas forcément nécessaire de changer la version applicative, car le comportement utilisateur ne change pas. En revanche, si `index.html` ou `service-worker.js` change pour l'application elle-même, il faut mettre à jour la version.

---

## 10. Comment formuler une future demande d'évolution

Le plus utile est de décrire le résultat attendu, sans essayer de deviner la partie du code à modifier.

Informations idéales :

- appareil : iPhone, iPad, ordinateur ;
- orientation : portrait ou paysage ;
- page concernée : TABLE, Saisie, Historique, Réglages, Tournoi, etc. ;
- étapes exactes ;
- résultat actuel ;
- résultat souhaité ;
- portée : seulement cet affichage ou tous les appareils ;
- capture d'écran si le sujet est visuel ;
- consigne de préservation du comportement actuel.

Exemple de demande de correction :

```text
Sur iPhone en portrait, depuis la page TABLE :
1. Je clique sur "Saisir score".
2. Je tourne le téléphone en paysage.
3. Je clique sur "Annuler".

Actuellement : la TABLE est mal positionnée.
Souhaité : retrouver la TABLE correctement centrée.
Le comportement sur iPad et ordinateur ne doit pas changer.
Préserve les comportements actuels, ajoute/adapte les tests nécessaires,
et mets à jour la version dans index.html et service-worker.js.
```

Exemple de demande d'évolution :

```text
Sur la page Historique, je souhaite ajouter un bouton "Modifier" à chaque donne.
Il doit rouvrir la saisie avec les anciennes valeurs, puis recalculer les scores
après validation.

Cette fonction doit être disponible sur iPhone, iPad et ordinateur.
L'apparence actuelle et les données déjà enregistrées doivent être conservées.
Ajoute/adapte les tests nécessaires et mets à jour le README.
```

---

## 11. Si l'utilisateur modifie le HTML lui-même

Si `index.html` est modifié manuellement par l'utilisateur :

1. placer la nouvelle version dans le dossier du projet ;
2. prévenir Codex avant toute nouvelle évolution.

Message conseillé :

```text
J'ai modifié index.html. Analyse mes changements avant de poursuivre.
```

À préciser si possible :

- objectif de la modification ;
- zones modifiées ;
- tests faits sur iPhone/iPad/ordinateur ;
- problèmes observés ;
- comportement attendu.

Codex devra alors :

1. comparer et comprendre les changements ;
2. vérifier les effets de bord ;
3. optimiser seulement si utile ;
4. vérifier la syntaxe ;
5. rejouer les tests ;
6. mettre à jour le service worker et la version si l'application change ;
7. mettre à jour ce README.

---

## 12. Procédure recommandée avant livraison

Avant de considérer une modification comme livrée :

1. vérifier la syntaxe JavaScript extraite de `index.html` ;
2. vérifier la syntaxe de `service-worker.js` ;
3. rejouer les tests concernés ;
4. rejouer la campagne complète ;
5. vérifier les captures ou résultats `PASS` ;
6. supprimer les captures temporaires `*-result.png` ;
7. synchroniser la version `index.html` / `service-worker.js` ;
8. mettre à jour ce README si la modification change le fonctionnement, la structure, les tests ou les règles de maintenance.

Dernière campagne complète connue :

```text
158 / 158 contrôles réussis
```

---

## 13. Notes pour Codex lors d'une reprise

À chaque reprise du projet :

1. lire ce README ;
2. lire le commentaire de table des matières au début de `index.html` ;
3. inspecter `service-worker.js` ;
4. regarder les tests existants ;
5. ne pas supposer que le découpage en fichiers est souhaité ;
6. préserver le comportement actuel par défaut ;
7. intervenir de façon ciblée ;
8. ajouter ou adapter les tests ;
9. livrer avec une version synchronisée si l'application change ;
10. mettre à jour ce README.

Points d'attention :

- beaucoup de fonctions sont appelées depuis le HTML inline ;
- certaines fonctions doivent donc rester accessibles globalement ;
- le CSS dépend fortement de l'ordre des media queries ;
- iPad paysage TABLE a un bloc CSS spécifique placé après le desktop ;
- le service worker peut masquer un problème de cache si la version n'est pas changée ;
- les tests automatisés ne remplacent pas totalement les essais réels iOS/PWA.

---

## 14. État actuel recommandé

État actuel du projet :

- application fonctionnelle ;
- structure encore monofichier mais documentée ;
- service worker simple et cohérent ;
- tests de non-régression présents ;
- version synchronisée ;
- découpage en fichiers non recommandé à court terme ;
- priorité aux évolutions ciblées et testées.

Recommandation générale :

```text
Ne pas chercher à rendre le code "parfait" au détriment de la stabilité.
Améliorer progressivement, avec tests, en conservant la qualité actuelle de l'application.
```

