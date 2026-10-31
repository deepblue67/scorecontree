# ScoreContrée - README de reprise et de maintenance

Ce document sert à deux choses :

- permettre au propriétaire de l'application de se rappeler comment elle fonctionne ;
- permettre à Codex de reprendre rapidement le projet lors d'une future correction, optimisation ou évolution.

Il doit être mis à jour à chaque modification fonctionnelle, visuelle ou technique de l'application.

Dernière mise à jour du README : 31 octobre 2026.

Version applicative actuellement documentée : `v20261031_2335`.

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
- proposer une mise à jour PWA par prompt utilisateur quand une nouvelle version est disponible ;
- annuler rapidement la dernière donne saisie depuis la page TABLE.
- modifier une donne depuis l'historique ou la feuille de score, avec recalcul automatique des totaux ;
- afficher une reprise de partie interrompue plus explicite ;
- afficher un résumé enrichi en fin de partie ;
- afficher des statistiques joueur plus détaillées.
- exporter les données par code texte, partage natif ou fichier JSON, sans option QR Code.
- afficher une aide utilisateur mise à jour avec des visuels explicatifs intégrés ;
- guider le retour depuis les écrans Aide et Aide à la marque avec un bouton `Retour` clignotant.

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
    iphone-table-actions-regression.html
    ameliorations-20261031-regression.html
    saisie-rapide-regression.html
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
scorecontree-v20260618_1542
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

1. dans `index.html`, dans l'encart situé en haut du contenu de l'écran Réglages ;
2. dans `service-worker.js`, dans `CACHE_NAME`.

Format attendu :

```text
vAAAAMMJJ_HHMM
```

Exemple :

```text
v20260618_1542
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
| `storage-regression.html` | localStorage, import/export, formats invalides, sauvegarde pré-import | 15 |
| `tournament-regression.html` | appariements, classement, résultats tournoi | 16 |
| `navigation-regression.html` | navigation, onglets, rotation, écran actif | 15 |
| `screen-modal-regression.html` | écrans secondaires, modales, réglages, aide, export et boutons Retour clignotants | 37 |
| `game-state-regression.html` | état de partie, autosave, normalisation, annulation/modification donne et permutation des places | 54 |
| `rendering-regression.html` | rendu HTML, sécurité, table, historique, feuille, stats et zones joueurs interactives | 27 |
| `final-audit-regression.html` | audit final structurel, emplacement de la version et actions TABLE | 45 |
| `iphone-table-actions-regression.html` | actions TABLE, lisibilité de la modale d'édition, scroll saisie score iPhone paysage, ajustements iPhone résultat/contrat et écran Manche en cours | 62 |
| `offline-pwa-regression.js` | cohérence PWA, cache, version, dépendances hors ligne et cycle de mise à jour | 58 |
| `saisie-rapide-regression.html` | mode rapide : réglage, contrat validé par la couleur, pavé, calcul en direct, contre rattrapé, capot, édition, actions avec Annuler, bandeau du bas masqué, écran allumé, retour au classique | 53 |
| `ameliorations-20261031-regression.html` | édition via écran Résultat, suppression de donne, passe sur la TABLE, annulation après passe, couleurs feuille, victoire, archive sans doublon, règle capot + belote, saisie clavier | 37 |

Total des contrôles disponibles :

```text
343 contrôles disponibles
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

### 8.4 Prompt de mise à jour PWA

Évolution ajoutée en version `v20260618_1502`.

Avant cette version, l'application activait silencieusement le nouveau service worker et rechargeait automatiquement la page quand une nouvelle version était détectée.

Désormais :

- une nouvelle version installée en attente déclenche un prompt dans l'application ;
- le message affiché est `Nouvelle version disponible.` ;
- l'utilisateur choisit `Mettre à jour` ou `Plus tard` ;
- le message `SKIP_WAITING` n'est envoyé au service worker que si l'utilisateur valide ;
- la page ne se recharge qu'après cette validation.

Le service worker ne force donc plus `skipWaiting()` pendant l'événement `install`. Il attend l'ordre envoyé par l'application.

### 8.5 Annulation de la dernière donne

Évolution ajoutée en version `v20260618_1502`.

Un bouton `Annuler dernière donne` est disponible sur la page TABLE lorsqu'au moins une donne existe dans l'historique de la partie en cours.

Comportement :

- demande de confirmation détaillée ;
- suppression uniquement de la dernière donne ;
- recalcul des totaux cumulés ;
- restauration du score global ;
- retour du numéro de manche à la valeur précédente ;
- retour du donneur au donneur précédent ;
- suppression du contrat courant et du score en attente ;
- sauvegarde automatique de l'état corrigé.

Cette fonction est volontairement distincte de la suppression d'une manche depuis la feuille de score. L'annulation rapide restaure aussi le donneur, ce qui n'est cohérent que pour la dernière donne.

Depuis la version `v20260625_1624`, la confirmation indique avant l'annulation :

- le numéro de manche ;
- le contrat et sa couleur ;
- le contre ou surcontre éventuel ;
- l'équipe preneuse ;
- le résultat `Fait` ou `Chuté` ;
- les points attribués aux deux équipes pendant cette donne ;
- le score actuel et le score qui sera restauré après l'annulation.

Les anciennes données incomplètes restent acceptées avec des mentions neutres comme `Sans contrat` ou `Non renseigné`.

### 8.6 Évolutions gameplay prioritaires

Évolutions ajoutées en version `v20260618_1524`.

Modifier une donne :

- l'édition d'une manche est maintenant accessible depuis l'historique de la partie en cours et depuis la feuille de score ;
- la modification recalcule les totaux cumulés ;
- le score global est restauré à partir de l'historique recalculé ;
- l'autosave est mise à jour après modification ;
- les rendus historique, feuille, table et statistiques sont rafraîchis.

Reprise de partie :

- le prompt d'autosave affiche plus clairement qu'une partie en cours a été détectée ;
- l'action principale est maintenant `Reprendre cette partie` ;
- l'action secondaire indique qu'elle ignore la sauvegarde et revient à la configuration.

Fin de partie :

- l'écran de victoire affiche un résumé enrichi ;
- le résumé indique nombre de donnes, réussites, chutes, plus gros contrat et meilleure série gagnante.

Stats joueur :

- ajout du nombre de chutes ;
- ajout de la moyenne de points quand le joueur est preneur ;
- ajout du partenaire le plus fréquent ;
- conservation des statistiques déjà présentes : parties, victoires, prises, taux de réussite, capots.

### 8.7 Suppression de l'export QR Code

Évolution ajoutée en version `v20260618_1542`.

Le mode QR Code a été retiré de l'export des données.

Raisons :

- l'historique réel peut être trop volumineux pour un QR Code fiable ;
- l'application affichait déjà souvent un message de données trop volumineuses ;
- le QR Code nécessitait une dépendance externe CDN ;
- l'export texte, le partage natif, le fichier JSON et la synchronisation GitHub Gist sont plus adaptés.

Ce qui reste disponible :

- copie du code texte `BCT1:...` ;
- partage natif du code quand disponible ;
- export en fichier JSON quand le navigateur le permet ;
- import du code `BCT1:...` ;
- synchronisation GitHub Gist.

### 8.8 Vérification hors ligne automatisée

Évolution ajoutée en version `v20260618_1549`.

Le test `tests/offline-pwa-regression.js` vérifie maintenant :

- la synchronisation entre la version visible dans `index.html` et `CACHE_NAME` ;
- la présence de `/scorecontree/` et `/scorecontree/index.html` dans le cache d'installation ;
- l'absence de dépendance externe bloquante pour le chargement de l'application ;
- l'absence de dépendance QR Code résiduelle ;
- le comportement simulé du service worker quand le réseau est coupé ;
- le fallback hors ligne vers `/scorecontree/index.html` ;
- la suppression des anciens caches ;
- l'activation contrôlée par le prompt de mise à jour.

Les fonctions connectées restent volontairement dépendantes du réseau :

- synchronisation GitHub Gist ;
- (l'appel IA de reconnaissance vocale a été supprimé en v20261031_2135).

Une validation réelle sur PWA installée iPhone/iPad reste utile quand le service worker, le cache ou l'installation sont modifiés.

### 8.9 Backup avant import

Évolution ajoutée en version `v20260618_1604`.

Avant tout import qui modifie les données locales, l'application crée une sauvegarde de sécurité dans `localStorage`, sous la clé :

```text
belote_pre_import_backup
```

Cette sauvegarde contient l'état local avant import :

- joueurs ;
- historique des parties ;
- historique des tournois ;
- autosave ;
- dernière configuration ;
- thème.

Chemins protégés :

- import par code texte `BCT1:...` ;
- import/fusion depuis GitHub Gist.

Si la sauvegarde ne peut pas être créée, l'import est annulé. C'est volontaire : mieux vaut refuser l'import que risquer de remplacer les données sans filet.

Quand une sauvegarde pré-import existe, l'écran d'import affiche un bouton `Restaurer cette sauvegarde`.

### 8.10 Tests PWA/cache

Évolution ajoutée en version `v20260618_1617`.

Le test `tests/offline-pwa-regression.js` couvre maintenant aussi le cycle de mise à jour PWA :

- présence du prompt `Nouvelle version disponible.` ;
- présence des boutons `Mettre à jour` et `Plus tard` ;
- détection d'un service worker déjà en attente via `reg.waiting` ;
- détection d'une nouvelle version via `updatefound` puis `statechange` ;
- affichage du prompt seulement si une version précédente contrôle déjà la page ;
- envoi de `SKIP_WAITING` seulement après clic sur `Mettre à jour` ;
- absence de `SKIP_WAITING` sur `Plus tard` ;
- rechargement de la page seulement après validation utilisateur ;
- conservation du comportement prudent : pas de `skipWaiting()` automatique pendant l'installation.

Ce test complète la vérification hors ligne, mais ne remplace pas un essai réel sur PWA installée iPhone/iPad quand on veut valider l'expérience utilisateur complète.

### 8.11 Mode erreur de saisie

Évolution ajoutée en version `v20260618_1626`.

Fonctionnalité retirée en version `v20260625_1601` à la demande de l'utilisateur.

Après validation d'une donne, l'application affiche brièvement un bandeau :

```text
Donne enregistrée
Modifier | Annuler
```

Objectif :

- corriger rapidement une erreur de doigt ;
- éviter de chercher la fonction dans l'historique juste après la saisie ;
- garder le comportement normal si l'utilisateur ne fait rien.

Comportement :

- le bandeau s'affiche après une validation de donne non finale ;
- il disparaît automatiquement au bout de quelques secondes ;
- `Modifier` ouvre directement la modale d'édition de la donne qui vient d'être validée ;
- `Annuler` retire immédiatement la dernière donne et restaure score, manche et donneur via la fonction existante ;
- le bandeau se ferme dès qu'une action est utilisée.

Ce mode réutilise les mécanismes déjà présents :

- `openEdit()` pour modifier une donne ;
- `undoLastRound()` pour annuler la dernière donne ;
- `autoSave()` via les chemins existants.

État actuel :

- le bandeau `Donne enregistrée / Erreur de saisie ?` n'est plus affiché ;
- la modification d'une donne reste disponible depuis l'historique et la feuille de score ;
- `Annuler dernière donne` reste disponible sur la TABLE.

### 8.12 Version en haut des Réglages

Évolution ajoutée en version `v20260625_1457`.

Le numéro de version n'est plus affiché dans le bandeau supérieur de l'écran Réglages. Le bandeau conserve uniquement le bouton `Retour` et le titre centré.

Un encart `Application` est désormais placé tout en haut du contenu des Réglages. Il présente :

- le nom `Belote Contrée` ;
- la version applicative visible ;
- la prise en charge du fonctionnement hors ligne ;
- le principe de notification lorsqu'une mise à jour est disponible.

La carte utilise une largeur fluide et un retour à la ligne automatique afin de rester lisible sur les cinq contextes suivis : PC, iPad portrait, iPad paysage, iPhone portrait et iPhone paysage.

### 8.13 Boutons secondaires de la TABLE sur iPhone

Évolution ajoutée en version `v20260625_1457`.

Uniquement sur iPhone portrait et iPhone paysage, les actions de la TABLE sont organisées sur deux colonnes :

```text
Contrat                  | Saisir score
Annuler dernière donne   | Terminer la partie
```

Le bouton `Annuler dernière donne` reste visible sur iPhone. Lorsqu'aucune donne ne peut être annulée, il est grisé, désactivé et signalé comme indisponible aux technologies d'assistance.

Sur iPad portrait, iPad paysage et PC, l'organisation et la visibilité précédentes sont conservées : le bouton d'annulation reste masqué tant qu'aucune donne n'a été jouée.

### 8.14 Permutation des partenaires depuis la TABLE

Évolution ajoutée en version `v20260625_1522`.

Un appui ou un clic sur le nom d'un joueur autour de la TABLE ouvre une confirmation proposant d'échanger sa place avec celle de son partenaire :

- Nord avec Sud ;
- Est avec Ouest.

Aucun bouton ni aucune flèche permanente n'est ajouté à l'écran. Les quatre badges joueurs existants servent directement de zones interactives.

La permutation :

- modifie uniquement `S.pos` ;
- ne change pas la composition ni le nom des équipes ;
- conserve les scores, l'historique et le contrat en cours ;
- conserve la même personne comme donneur en ajustant `S.dealerIdx` à sa nouvelle position ;
- est enregistrée immédiatement dans la sauvegarde automatique ;
- fonctionne au toucher, à la souris et au clavier.

### 8.15 Lisibilité de la modification d'une donne sur iPhone portrait

Correction ajoutée en version `v20260625_1544`.

Sur iPhone portrait, les valeurs de la fenêtre `Modifier la manche` étaient rognées, car le padding général appliqué aux champs numériques occupait presque toute la largeur disponible entre les boutons `−` et `+`.

La correction est limitée au media query iPhone portrait :

- padding horizontal des deux valeurs réduit à `2px` ;
- taille des chiffres ajustée à `28px` ;
- largeur tactile des boutons conservée à `44px` ;
- espace entre les deux équipes légèrement réduit ;
- contrôles numériques natifs masqués afin de ne pas réduire la zone de lecture.

L'organisation reste en deux colonnes. iPhone paysage, iPad portrait, iPad paysage et PC conservent leurs styles précédents.

### 8.16 Guide utilisateur et retours d'aide

Évolution ajoutée en version `v20260630_1615`.

La page `Comment utiliser l'application` a été reprise pour tenir compte des évolutions récentes :

- version et mises à jour depuis l'encart Réglages ;
- organisation de la page TABLE et actions iPhone ;
- permutation des partenaires par appui sur un joueur ;
- validation directe d'une donne sans ancien bandeau `Erreur de saisie ?` ;
- modification d'une donne depuis la feuille ou l'historique ;
- annulation de la dernière donne avec récapitulatif détaillé avant confirmation ;
- sauvegarde avant import ;
- suppression de l'option QR Code ;
- fonctionnement hors ligne et stockage local.

La page reste intégrée dans `index.html` et utilise des visuels SVG explicatifs, comme les captures déjà présentes dans l'aide. Trois visuels ont été ajoutés :

- page TABLE et actions principales ;
- correction ou annulation d'une donne ;
- données, sauvegarde, import/export et hors ligne.

Le bouton `Retour` de `Comment utiliser l'application` et celui de `Aide à la marque` clignotent désormais comme le bouton `Retour` des Réglages. L'animation démarre à l'ouverture de la page secondaire et s'arrête à sa fermeture.

### 8.17 Scroll de la saisie score sur iPhone paysage

Correction ajoutée en version `v20260630_1638`.

Uniquement sur iPhone paysage, l'écran `Résultat / Saisir score` pouvait se retrouver figé : la partie basse de la saisie n'était pas atteignable correctement malgré le contenu plus haut que la zone disponible.

La correction est limitée au media query iPhone paysage et à `#tab-saisie` :

- scroll vertical forcé sur l'écran de saisie ;
- `touch-action: pan-y` pour laisser le geste vertical piloter le contenu ;
- suppression du `transform` sur ce panneau, car il peut gêner le scroll des éléments fixes sur iOS ;
- marge basse interne augmentée pour éviter que la barre de navigation masque la fin du contenu ;
- carte de saisie autorisée à laisser apparaître son contenu au lieu de le couper.

iPhone portrait, iPad portrait, iPad paysage, PC et les autres onglets ne sont pas modifiés par cette correction.

### 8.18 Ajustements visuels Contrat/Résultat sur iPhone

Évolution ajoutée en version `v20260701_1051`.

Les ajustements sont volontairement limités aux media queries citées dans la demande.

Sur iPhone portrait uniquement :

- page `Contrat` : les noms d'équipes des boutons `Équipe preneuse` sont affichés sur deux lignes quand le nom contient ` & ` ;
- ligne 1 : premier joueur + `&` ;
- ligne 2 : deuxième joueur ;
- page `Résultat` : les boutons `-1` et `+1` sont réduits ;
- le libellé `point exact` est masqué ;
- la case `Belote` est légèrement réduite ;
- pop-up `Modifier la manche` : les noms d'équipes passent aussi sur deux lignes afin d'aligner les deux steppers de score.

Sur iPhone paysage uniquement :

- page `Résultat` : les boutons `-1` et `+1` sont réduits ;
- les boutons rapides de score (`80`, `100`, `120`, `140`, `Capot`) sont agrandis pour être plus lisibles.

La logique de score, de contrat, de belote et de modification de manche n'est pas changée.

Précision ajoutée en version `v20260701_1114` :

- sur la page `Contrat` en iPhone portrait, le découpage des équipes est strictement `Nom1 &` en première ligne puis `Nom2` en seconde ligne ;
- les boutons rapides de contrat sont alignés en deux lignes de cinq boutons de même largeur : `90 100 110 120 130`, puis `140 150 160 170 Capot`.

Correction ajoutée en version `v20260701_1133` :

- le découpage `Nom1 &` / `Nom2` est désormais généré explicitement pour iPhone portrait, afin d'éviter que le `&` passe seul sur une ligne ;
- hors iPhone portrait, les noms d'équipes restent en texte simple et ne sont pas découpés.

Correction ajoutée en version `v20260701_1253` :

- sur la page `Contrat` en iPhone portrait, la largeur utile du texte des boutons preneurs est réduite afin que même un rendu en texte brut force visuellement `Nom1 &` puis `Nom2` ;
- cette correction reste limitée au media query iPhone portrait et aux boutons `Équipe preneuse` de la page `Contrat`.

Correction ajoutée en version `v20260701_1308` :

- ajustement fin, toujours uniquement dans le media query iPhone portrait de la page `Contrat`, pour que le `&` reste sur la première ligne avec le premier prénom au lieu de descendre seul.

Correction ajoutée en version `v20260701_1317` :

- ajout de `white-space: nowrap` sur les deux lignes générées des boutons preneurs, uniquement dans le media query iPhone portrait de la page `Contrat`, afin que `Nom1 &` ne puisse plus être coupé en `Nom1` puis `&`.

Correction ajoutée en version `v20260701_1326` :

- les boutons preneurs de la page `Contrat` passent explicitement en colonne, uniquement dans le media query iPhone portrait, afin que les deux lignes générées soient réellement empilées dans le bouton.

Correction ajoutée en version `v20260701_1355` :

- sur l'écran `Manche en cours` en iPhone portrait, les boîtes de score affichent toujours le score sous le nom de l'équipe dès le premier affichage, sans dépendre d'une rotation paysage puis portrait.

### 8.19 Reprise du projet le 31 octobre 2026 (Claude)

Version `v20261031_2135`, réalisée par Claude à partir de la version GitHub `v20260701_1355` (dossier local `From Github 20261031`).

Liste de demandes traitée (retours de jeu) :

- édition d'une donne : remettre l'écran de saisie de score ;
- suppression d'une donne : rafraîchir la liste ;
- couleur sur la feuille de score ;
- « Tout le monde passe » : revoir le positionnement ;
- cinématique de fin plus simple.

Point resté ouvert : « afficher directement la table à la saisie du contrat » (à préciser : après `Confirmer le contrat`, l'application revient déjà directement sur la TABLE).

### 8.20 Édition d'une donne avec l'écran Résultat

Le crayon ✏️ (feuille ou historique) ne rouvre plus la petite fenêtre de points finaux : il rouvre l'écran `Résultat` complet, pré-rempli, avec un bandeau `Modification de la manche N`.

- chaque donne validée conserve désormais sa saisie brute (`h.raw` : points des cartes, belote, capot, total 160/170) et son contrat détaillé (`h.c`) ;
- le contrat de la donne est rechargé temporairement dans `S.contract` ; le contrat en cours est sauvegardé dans `editRoundCtx` puis restauré ;
- `Calculer & Prévisualiser` puis `Enregistrer la modification` recalcule la donne selon le contrat, puis tous les cumuls ;
- `Annuler la modification`, ou toute navigation hors de l'écran Résultat, restaure le contrat en cours sans rien modifier ;
- `autoSave()` n'enregistre jamais le contrat temporaire de l'édition ;
- donnes enregistrées avant cette version (sans `h.raw`) : l'écran s'ouvre vide avec l'invitation `Ressaisissez les points des cartes` ;
- lignes de correction sans contrat : l'ancienne petite fenêtre (`openEditPointsModal`) est conservée.

Fonctions : `openEdit`, `contractFromRound`, `contractSnapshot`, `applyEditedRound`, `cancelEditRound`, `cancelSaisie`, `restoreEditRoundContext`, `refreshAfterRoundChange`.

### 8.21 Suppression d'une donne : feuille rafraîchie

Cause : `deleteManche()` ne redessinait que l'historique ; la feuille `En cours` (sous-onglet par défaut) restait affichée avec la donne supprimée et les anciens totaux.

Correction : toutes les modifications de donnes passent par `refreshAfterRoundChange()` (recalcul, sauvegarde, feuille, historique, table, stats, sous-onglet actif). `renderFeuille()` et `renderHistory()` ignorent désormais un conteneur absent au lieu de planter.

Historique des parties précédentes : les jours et parties dépliés restent dépliés après une suppression (`openPastDays`, `openPastGames`), et un message `Partie supprimée` confirme l'action.

### 8.22 Couleurs sur la feuille de score

- symboles de couleur colorés : ♥ ♦ en rouge, ♠ ♣ en noir (`colorSuitsHtml`) ;
- une couleur par équipe, comme le graphique des stats (`TEAM_COLORS` : Nord/Sud vert `#1a6b3c`, Est/Ouest bleu `#1a5295`) pour les noms, en-têtes de colonnes, preneur, points et totaux ;
- points à 0 en gris clair ; le badge `Chute` reste rouge ;
- libellé `Total manche` remplacé par `Total` ;
- appliqué à la feuille en cours, à l'historique de la partie et au détail des parties archivées.

### 8.23 « Tout le monde passe » sur la TABLE

Le bouton a quitté la page Contrat. Sur la TABLE, sans contrat, la case `Saisir score` (inutilisable sans contrat) affiche `🤷 Tout le monde passe` ; dès qu'un contrat est confirmé, elle redevient `Saisir score`. Même emplacement sur les 5 contextes (règles `#btn-action-saisie, #btn-action-passe` dans les blocs iPhone portrait et paysage).

### 8.24 Fin de partie simplifiée

L'écran de victoire propose directement :

- `🔁 Nouvelle partie — mêmes équipes` (`confirmEndGame('same')`) ;
- `👥 Changer les équipes` (`confirmEndGame('change')`) ;
- `📋 Voir la feuille de score`.

Le trophée ne rebondit plus. Plus besoin de passer par la feuille puis `Terminer la partie`.

Archive sans doublon : `savePastGame()` mémorise l'identifiant de la partie archivée (`S._savedGameId`). Si une donne est modifiée, supprimée ou annulée après la victoire, la même entrée est mise à jour au lieu d'en créer une seconde.

### 8.25 Corrections du tour complet

- **Règle Aide à la marque** : « si une équipe est capot et dépasse 2001 points grâce à la belote, la partie n'est pas terminée » est désormais appliquée ;
- **Annuler dernière donne après une passe générale** : le donneur et la manche sont restaurés depuis l'état mémorisé avant la donne (`h.before`, retrouvé par le nom du donneur même après une permutation de places) ; avant, le donneur restauré était décalé d'un cran ;
- **Saisie au clavier** des points : l'autre équipe est complétée automatiquement (160/170, ou 162/172 au point près), comme avec les boutons ;
- **Reconnaissance vocale supprimée** (~340 lignes) : aucun bouton ne l'affichait et l'appel à l'API Anthropic, sans clé, ne pouvait pas fonctionner ;
- fonction interne homonyme `addPlayer` des statistiques renommée `ensurePlayerStats` ;
- noms d'équipes échappés dans l'historique des parties archivées ;
- guide utilisateur mis à jour (TABLE, saisie, correction, fin de partie).

### 8.26 Saisie rapide (option dans les Réglages)

Version `v20261031_2305`. Objectif : le moins d'appuis possible pendant la partie. Une donne normale passe de 9 appuis minimum à 6.

Réglages › **Saisie pendant le jeu** :

- **Mode de saisie** : `Classique` (par défaut, saisie inchangée) ou `Rapide`. Clé `localStorage` : `bct_input_mode` (`classic` / `fast`). Le mode se traduit par la classe `fast-input` sur `body`.
- **Garder l'écran allumé** : Screen Wake Lock (`navigator.wakeLock`), indépendant du mode de saisie. Clé : `bct_wake_lock` (`1` / `0`). Le verrou est repris au retour au premier plan et au premier appui (iOS). Sans prise en charge, le réglage l'indique.

Mode rapide :

- **Contrat** (`#fast-contrat`) : équipe, hauteur (80 à 170 et Capot en boutons directs, aucune présélection), contre (Aucun par défaut), puis **la couleur valide le contrat** (`fastPickSuit` → `confirmContract`). Il n'y a plus de bouton Confirmer. Le bandeau du haut rappelle donneur / 1er à jouer. Pour corriger : bouton Contrat (page rouverte déjà remplie). `S.form.valueChosen` indique qu'une hauteur a été choisie.
- **Résultat** (`#fast-saisie`) : pavé numérique intégré, saisie sur l'équipe preneuse par défaut (toucher l'autre case pour saisir la défense), complément automatique 160/170 ou 162/172, Belote / Capot en un appui, résultat FAIT / CHUTE **calculé en direct** avec `calculateBeloteScore`, un seul bouton Valider (`fastValidate` → `validateScore`). Contre rattrapable en haut de l'écran (`fastSetContre`). Les boutons rapides 80/100/120/140 ne sont pas repris (décision du 31/10/2026).
- **Actions immédiates** : `Tout le monde passe` et `Annuler dernière donne` s'exécutent sans fenêtre de confirmation. Un message `Annuler` reste 6 s (`showUndoToast`, `snapshotGameState`, `restoreGameState`).
- **Modification d'une donne** : ✏️ ouvre l'écran Résultat rapide pré-rempli (`loadFastSaisieFromRaw`).
- La saisie classique est inchangée. Les deux modes enregistrent exactement les mêmes données : on peut changer de mode en cours de partie.

CSS : section « SAISIE RAPIDE » placée après les styles partagés. Elle est volontairement autonome (portrait, paysage, petit paysage iPhone `max-height:500px`, grands écrans `min-width:768px` + `min-height:700px`) et ne touche aucun élément de la saisie classique. Les sélecteurs sont préfixés `.fast-panel` pour passer devant la règle globale `button, [onclick] { min-height:44px }`.

Page Contrat classique en iPhone paysage : depuis le retrait du bouton « Tout le monde passe » (v20261031_2135), la grille se range en Équipe / Hauteur puis Contre / Couleur et le bouton Confirmer n'est plus coupé sous la barre du bas (point 7 de la liste).

Bilan prévu : après quelques parties, garder un seul des deux modes et supprimer l'autre pour simplifier le code.

### 8.27 Saisie rapide plein écran sur iPad paysage

Version `v20261031_2320`, après essai réel sur iPad : en paysage, un tiers de l'écran restait vide sous les écrans rapides.

Uniquement en iPad paysage (`min-width:1025px` + `orientation:landscape` + `pointer:coarse`, la même requête que les blocs iPad paysage A/B), `#fast-contrat` et `#fast-saisie` occupent toute la hauteur de l'onglet. Les grilles (équipes, hauteurs, contre, couleurs, cases d'équipe, pavé) s'étirent et les textes grossissent. Les boutons de contre deviennent des blocs arrondis, comme les couleurs. iPhone, iPad portrait et PC sont inchangés.

### 8.28 Saisie rapide : bandeau du bas masqué pendant la partie

Version `v20261031_2335`, sur tous les appareils, **uniquement en saisie rapide**.

- Sur l'écran de jeu (`#screen-game`), le bandeau du bas (`#bottom-nav`) est masqué. Pendant la partie, il faisait doublon avec les boutons Contrat / Saisir score de la TABLE et avec les retours automatiques.
- Sur la TABLE, deux icônes en haut à droite, **📋 Parties** et **📈 Stats** (`#fast-hdr-right`), en face de la roue des Réglages. Sur Parties et Stats, un bouton **← Retour** en haut à gauche (`#fast-hdr-back`) ramène à la TABLE, ou à la configuration si aucune partie n'est lancée.
- Les onglets récupèrent la hauteur du bandeau (`bottom:0` et marge basse avec `safe-area-inset-bottom`).
- Le bandeau reste affiché sur l'écran de configuration et partout en saisie classique.
- Mécanique : `activateAppScreen()` pose la classe `on-game-screen` sur `body` ; `updateFastHeader(tab)` est appelée par `showTab()`.
- Le masquage automatique du bandeau quand on ne touche pas l'écran a été écarté : il ajoute un appui pour le faire réapparaître et risque des appuis involontaires sur la table.

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
211 / 211 contrôles réussis avant l'ajout du backup pré-import
```

Validation de la livraison `v20260618_1604` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/hors ligne : PASS 32
Contrôle statique backup/import OK
Relance navigateur complète non effectuée : URL locale bloquée par l'outil navigateur intégré
```

Validation de la livraison `v20260618_1617` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
```

Validation de la livraison `v20260618_1626` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 197 / 197 contrôles réussis
Total : 255 / 255 contrôles réussis
```

Validation de la livraison `v20260625_1457` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 225 / 225 contrôles réussis
Total : 283 / 283 contrôles réussis
```

Validation de la livraison `v20260625_1522` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 240 / 240 contrôles réussis
Total : 298 / 298 contrôles réussis
```

Validation de la livraison `v20260625_1544` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 248 / 248 contrôles réussis
Total : 306 / 306 contrôles réussis
```

Validation de la livraison `v20260625_1601` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 242 / 242 contrôles réussis
Total : 300 / 300 contrôles réussis
```

Validation de la livraison `v20260625_1624` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 248 / 248 contrôles réussis
Total : 306 / 306 contrôles réussis
```

Validation de la livraison `v20260630_1615` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 253 / 253 contrôles réussis
Total : 311 / 311 contrôles réussis
```

Validation de la livraison `v20260630_1638` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 257 / 257 contrôles réussis
Total : 315 / 315 contrôles réussis
```

Validation de la livraison `v20260701_1051` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 273 / 273 contrôles réussis
Total : 331 / 331 contrôles réussis
```

Validation de la livraison `v20260701_1114` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 278 / 278 contrôles réussis
Total : 336 / 336 contrôles réussis
```

Validation de la livraison `v20260701_1133` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 279 / 279 contrôles réussis
Total : 337 / 337 contrôles réussis
```

Validation de la livraison `v20260701_1253` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 281 / 281 contrôles réussis
Total : 339 / 339 contrôles réussis
```

Validation de la livraison `v20260701_1308` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 281 / 281 contrôles réussis
Total : 339 / 339 contrôles réussis
```

Validation de la livraison `v20260701_1317` :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Campagne navigateur : 282 / 282 contrôles réussis
Total : 340 / 340 contrôles réussis
```

Validation de la livraison `v20260701_1326` :

```text
Test PWA/cache/hors ligne : PASS 58
Test ciblé iPhone TABLE/Contrat/Résultat : PASS 60
Campagne navigateur complète non relancée : navigateur intégré bloqué sur les URL file://
```

Validation de la livraison `v20260701_1355` :

```text
Test PWA/cache/hors ligne : PASS 58
Test ciblé iPhone TABLE/Contrat/Résultat/Manche en cours : PASS 62
Campagne navigateur complète non relancée : navigateur intégré bloqué sur les URL file://
```

Validation de la livraison `v20261031_2135` (Claude, Chromium Playwright, 5 contextes) :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
Nouveau test ameliorations-20261031-regression.html : PASS 37
Autres tests navigateur : 223 / 223, plus 10 cas de score
iphone-table-actions-regression.html : 1 contrôle en échec, déjà en échec sur v20260701_1355 dans cet environnement
  (mesure du retour à la ligne « Cynthia & / Eric » dépendante des polices installées ; à vérifier sur iPhone)
```

Validation de la livraison `v20261031_2305` (Claude, Chromium Playwright, 5 contextes) :

```text
Syntaxe index.html OK
Syntaxe service-worker.js OK
Test PWA/cache/hors ligne : PASS 58
saisie-rapide-regression.html : PASS 47
ameliorations-20261031-regression.html : PASS 37
Autres tests navigateur : 223 / 223, plus 10 cas de score
iphone-table-actions-regression.html : même contrôle de police en échec que précédemment (environnement)
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
- prompt de mise à jour PWA présent ;
- annulation rapide de la dernière donne présente ;
- modification de donne plus visible et sauvegardée ;
- reprise de partie interrompue plus explicite ;
- résumé de fin de partie enrichi ;
- statistiques joueur enrichies ;
- export QR Code supprimé ;
- vérification hors ligne automatisée présente ;
- backup avant import présent avec restauration depuis l'écran d'import ;
- bandeau de correction rapide post-saisie retiré ; modification et annulation restent accessibles par les commandes habituelles ;
- édition d'une donne par l'écran Résultat complet, couleurs sur la feuille, « Tout le monde passe » sur la TABLE, fin de partie en un écran (v20261031_2135) ;
- découpage en fichiers non recommandé à court terme ;
- priorité aux évolutions ciblées et testées.

Recommandation générale :

```text
Ne pas chercher à rendre le code "parfait" au détriment de la stabilité.
Améliorer progressivement, avec tests, en conservant la qualité actuelle de l'application.
```

---

## 15. Tableau de suivi des évolutions

Ce tableau doit être complété à chaque nouvelle demande, correction ou évolution.

Statuts utilisés :

- `Fait` : livré dans l'application ;
- `Priorité` : prochaine évolution recommandée ;
- `Moyen terme` : intéressant, mais pas urgent ;
- `À éviter pour l'instant` : possible techniquement, mais risque supérieur au bénéfice immédiat.

### 15.1 Technique et architecture

| Sujet | Description | Statut | Priorité | Version / remarque |
|---|---|---:|---:|---|
| README de reprise | Documenter fonctionnement, structure, tests, règles de maintenance et consignes de reprise. | Fait | Haute | Créé le 18 juin 2026 |
| Version synchronisée | Mettre à jour la version visible dans `index.html` et `CACHE_NAME` dans `service-worker.js` à chaque livraison applicative. | Fait | Permanente | Dernière version : `v20261031_2135` |
| Suppression reconnaissance vocale | Retirer le code vocal inaccessible et l'appel IA sans clé. | Fait | Moyenne | Livré en `v20261031_2135` |
| Tests de non-régression | Maintenir et rejouer les tests avant livraison. | Fait | Permanente | 343 contrôles disponibles ; v20260701_1355 vérifiée sur PWA + test ciblé iPhone |
| Guide utilisateur actualisé | Reprendre la page `Comment utiliser l'application`, ajouter des visuels explicatifs et faire clignoter les boutons Retour d'aide. | Fait | Haute | Livré en `v20260630_1615` |
| Version en tête des Réglages | Retirer la version du bandeau et l'afficher dans un encart dédié en haut du contenu Réglages. | Fait | Haute | Livré en `v20260625_1457` |
| Actions TABLE sur iPhone | Placer `Annuler dernière donne` sous `Contrat` et `Terminer la partie` sous `Saisir score`, avec annulation grisée si indisponible. | Fait | Haute | Livré en `v20260625_1457` |
| Correction navigation rotation TABLE | Sécuriser le retour TABLE après passage saisie/rotation/annulation sur iPhone et iPad. | Fait | Haute | Corrigé avant `v20260611_1707` |
| Nettoyage code mort | Supprimer fonctions/variables inutilisées et diagnostics non nécessaires sans toucher au comportement. | Fait | Moyenne | Fait avant `v20260611_1707` |
| Prompt mise à jour PWA | Afficher `Nouvelle version disponible` puis laisser l'utilisateur cliquer sur `Mettre à jour`. | Fait | Haute | Livré en `v20260618_1502` |
| Service worker prudent | Ne plus forcer `skipWaiting()` à l'installation ; attendre la validation utilisateur. | Fait | Haute | Livré en `v20260618_1502` |
| Tests annulation dernière donne | Vérifier score, historique, manche, donneur, contrat et score en attente après annulation. | Fait | Haute | Livré en `v20260618_1502` |
| Vérification hors ligne complète | Vérifier que la PWA fonctionne vraiment hors ligne sans dépendance CDN connue. | Fait | Haute | Test automatisé livré en `v20260618_1549` |
| Suppression QR Code | Retirer l'export QR Code devenu inadapté aux gros historiques et supprimer la dépendance CDN associée. | Fait | Haute | Livré en `v20260618_1542` |
| Backup avant import | Créer une sauvegarde locale de sécurité avant tout import/remplacement de données. | Fait | Haute | Livré en `v20260618_1604` |
| Tests PWA/cache | Ajouter des contrôles ou procédure de test pour le cycle nouvelle version/service worker. | Fait | Haute | Test automatisé renforcé en `v20260618_1617` |
| Tests cas limites score | Ajouter des cas supplémentaires de score/contrat/capot/contre/surcontre. | À faire | Priorité | Renforce le métier |
| Découpage complet en fichiers | Séparer CSS/JS en plusieurs fichiers comme ScoreDarts. | À éviter pour l'instant | Basse | Risque de régression trop élevé actuellement |
| Extraction progressive CSS/JS | Extraire un petit module seulement si une évolution le justifie naturellement. | Moyen terme | Moyenne | À faire par étapes, jamais en grand chantier unique |
| Manifest et assets séparés | Ajouter/extraire `manifest.json`, icônes et assets propres. | Moyen terme | Moyenne | Utile PWA, moins risqué qu'un découpage JS complet |
| Centralisation handlers complexes | Réduire progressivement les handlers inline quand une zone est modifiée. | Moyen terme | Moyenne | Ne pas faire en refonte globale |

### 15.2 Gameplay et usage

| Sujet | Description | Statut | Priorité | Version / remarque |
|---|---|---:|---:|---|
| Annuler dernière donne | Depuis la TABLE, afficher le détail de la dernière donne puis restaurer score/manche/donneur après confirmation. | Fait | Haute | Enrichi en `v20260625_1624` |
| Modifier une donne | Depuis l'historique ou la feuille, rouvrir une donne, modifier les points et recalculer les scores suivants. | Fait | Haute | Livré en `v20260618_1524`, écran Résultat complet en `v20261031_2135` |
| Suppression d'une donne | La feuille affichée et les totaux sont rafraîchis immédiatement. | Fait | Haute | Corrigé en `v20261031_2135` |
| Couleurs feuille de score | Symboles ♥♦ rouges, une couleur par équipe. | Fait | Haute | Livré en `v20261031_2135` |
| Tout le monde passe sur la TABLE | Bouton à la place de `Saisir score` tant qu'il n'y a pas de contrat. | Fait | Haute | Livré en `v20261031_2135` |
| Fin de partie simplifiée | Écran de victoire avec choix directs, trophée fixe, archive sans doublon. | Fait | Haute | Livré en `v20261031_2135` |
| Règle capot + belote à 2001 | Une équipe mise capot qui dépasse l'objectif grâce à la belote ne gagne pas. | Fait | Haute | Livré en `v20261031_2135` |
| Saisie rapide (option) | Contrat validé par la couleur, pavé numérique, calcul en direct, actions avec Annuler. | Fait | Haute | Livré en `v20261031_2305`, à évaluer à l'usage |
| Garder l'écran allumé | Réglage Screen Wake Lock. | Fait | Haute | Livré en `v20261031_2305` |
| Table à la saisie du contrat | « Afficher directement la table à la saisie du contrat ». | À préciser | Haute | Besoin d'une description du comportement attendu |
| Reprise partie interrompue | Afficher au démarrage une reprise plus claire de la partie autosauvegardée. | Fait | Haute | Livré en `v20260618_1524` |
| Mode erreur de saisie | Après validation d'une donne, proposer quelques secondes `Annuler / Modifier`. | Retiré | Haute | Livré en `v20260618_1626`, retiré en `v20260625_1601` |
| Permuter les partenaires sur la TABLE | Appuyer sur un joueur pour échanger sa place avec son partenaire, sans changer les équipes et en conservant le donneur. | Fait | Haute | Livré en `v20260625_1522` |
| Modification d'une donne sur iPhone portrait | Rendre les valeurs des deux équipes entièrement lisibles dans la fenêtre d'édition. | Fait | Haute | Corrigé en `v20260625_1544` |
| Scroll saisie score iPhone paysage | Permettre d'atteindre le bas de l'écran `Résultat / Saisir score` en iPhone paysage. | Fait | Haute | Corrigé en `v20260630_1638` |
| Ajustements Contrat/Résultat iPhone | Forcer certains noms sur deux lignes en portrait, alléger les boutons `-1/+1`, réduire Belote en portrait et agrandir les boutons rapides en paysage. | Fait | Haute | Livré en `v20260701_1051`, précisé en `v20260701_1114`, corrigé jusqu'en `v20260701_1326` |
| Résumé fin de partie enrichi | Ajouter nombre de donnes, contrats réussis/chutés, plus gros contrat, meilleure série. | Fait | Haute | Livré en `v20260618_1524` |
| Statistiques joueur avancées | Contrats pris, taux de réussite, chutes, points moyens, partenaires, victoires. | Fait | Haute | Livré en `v20260618_1524` |
| Aide contextuelle | Petits boutons `?` sur contrat, belote, capot, tournoi. | À faire | Moyen terme | Faible risque si ciblé |
| Export résumé lisible | Générer un résumé texte/image de la partie à partager. | À faire | Moyen terme | Peut compléter l'export image actuel |
| Amélioration tournoi | Continuer à enrichir appariements, saisie scores tournoi et historique tournoi. | À préciser | Moyen terme | Besoin de demandes plus concrètes |
