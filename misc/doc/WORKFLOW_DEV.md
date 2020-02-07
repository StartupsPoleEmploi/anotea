# Worflow de développement

Le projet se base sur le système de branches Git pour séparer les versions en cours de développement :

- `master` : cette branche contient la version actuellement en production
- `dev` : cette branche contient la version en cours de développement
- `*` : Toutes les autres branches contiennent des évolutions (pull-request)

Ce workflow est une version simplifiée du [Git Workflow](https://nvie.com/posts/a-successful-git-branching-model/)

Toutes les pull-requests sont automatiquement testés via Travis

- master [![Build Status](https://travis-ci.org/StartupsPoleEmploi/anotea.svg?branch=master)](https://travis-ci.org/StartupsPoleEmploi/anotea)
- dev [![Build Status](https://travis-ci.org/StartupsPoleEmploi/anotea.svg?branch=dev)](https://travis-ci.org/StartupsPoleEmploi/anotea)

## Ajout d'une fonctionnalité

Pour ajouter une fonctionnalité, il faut créer une pull-request à merger sur la branche de `dev`.

Après la création et à chaque commit sur cette branche, les tests seront automatiquement executés par Travis

Les conditions pour que la pull-request soit mergée sont les suivantes:

- Les tests doivent être au vert
- Une revue de code doit être réalisée (si possible)

## Livraison

Une fois que la branche de `dev` regroupe un ensemble cohérent de fonctionnalités, il faut livrer cette branche dans le `master`.

Pour se faire, il faut créer une pull-request de la branche `dev` à merger sur la branche `master`.

Par convention nous appelons cette pull-request `Mise en production` (ex: https://github.com/StartupsPoleEmploi/anotea/pull/1039)

Pour information, le merge dans le master ne déclenche pas automatiquement un déploiement en production.

## Hotfix

Pour corriger une anomalie en production, il faut créer une pull-request à merger sur la branche `master`.

Après la création et à chaque commit sur cette branche, les tests seront automatiquement executés par Travis

Les conditions pour que la pull-request soit mergée sont les suivantes:

- Les tests doivent être au vert
- Une revue de code doit être réalisée (si possible)

Une fois la branche hotfix mergée, il est nécessaire de rapatrier les modifications dans la branche de dev :

```
git checkout dev
git merge --no-ff origin/master
git push
```
