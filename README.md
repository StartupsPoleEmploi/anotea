<img src="https://anotea.pole-emploi.fr/static/images/logo_Anotea_Horizontal_baseline2.png" width="30%" height="30%" />

Anotéa est un service lancé par Pôle emploi permettant de collecter les avis de demandeurs d'emplois ayant suivis une formation.

Seules les personnes ayant effectué la formation reçoivent un questionnaire à compléter. 
Vous êtes donc certains que les avis que vous consultez sont fiables.

## Comment cela fonctionne-t-il ?

Dans le cadre de sa recherche d'emploi, une personne peut suivre une formation financée par Pôle Emploi et/ou par 
la région dans laquelle il habite.

Lorsque la formation est terminée, Anotéa envoie par mail un questionnaire à cette personne — qu'on appelle stagiaire —  
pourqu'il puisse déposer un avis sur la formation (la réponse à ce questionnaire est facultative).

Une fois l'avis déposé et anonymisé, il est [réconcilié](misc/doc/RECONCILIATION.md) afin d'être potentiellement consultable 
sur tous les sites qui utilisent Anotéa (ex: https://labonneformation.pole-emploi.fr).  

Ces sites utilisent deux canaux fournis par Anotéa : l'[api](misc/doc/API.md) et le [widget](misc/doc/WIDGET.md) 

![Anotea Diagram](./misc/doc/diagram/anotea-diagram.svg)

## Développement

Travis Status ![Travis Status](https://travis-ci.org/StartupsPoleEmploi/anotea.svg?branch=master)

Anotéa nécessite que MongoDB 4+ soit démarré sur le port 27017 et que node.js 12+ soit installé. 

Il est également conseillé d'installer docker 18+ et docker-compose 1.25+

Anotea est composé de deux projets : 
- `backend` qui contient un serveur node.js et expose des API
- `ui` qui contient les interfaces graphiques

### Démarrer l'application

Chaque projet se démarre avec les commandes suivantes :

```
npm install
npm start
```

Par défaut les deux projets sont configurés pour prendre en compte automatiquement les modifications du code source.

#### Jeu de données

Vous pouvez créer un jeu de données en local au moyen de la commande suivante:

```
cd backend
node src/jobs/data/dataset --drop
```

Ce script part du principe qu'une base MongoDB est démarrée sur la port 27017 et va générer 
un ensemble de données permettant à l'application de fonctionner.
Le sortie console du script vous donnera les instructions pour vous connecter à l'application.

#### Mode développement avancé

Afin d'éviter de devoir lancer les deux projets à la main, il est possible de les démarrer en une seule commande.

Ce script utilise `pm2`, il est donc nécessaire de l'installer auparavant

```
npm install pm2 -g
```

puis 
 
```
bash dev.sh
```

Pour éviter que le script installe les dépendances npm à chaque fois:

```
SKIP_NPM_INSTALL=true bash dev.sh
```

Il également possible de démarrer l'application au sein de [containers Docker](misc/doc/DOCKER.md). 

#### Envoyer des emails en local

Certains fonctionnalités envoient des emails et ont donc besoin d'un serveur SMTP.
Vous pouvez démarrer en local un serveur MailHog (nécessite Docker) :

```
cd backend
npm run smtp:start
```

Si vous avez démarré l'application via Docker un container MailHog est automatiquement lancé. 


### Tests

Pour lancer les tests, il faut exécuter la commande
 
```
cd backend
npm run test
```

ou 

```
cd backend
npm run test:unit && npm run test:integration
```

Attention, les tests d'intégration partent du principe qu'une base MongoDB est démarrée sur la port 27017.

Une commande permet également de lancer tous les tests en démarrant un MongoDB in-memory sur le port 27018 (nécessite Docker)  :

```
cd backend
npm run test:all
```

<p align="center">
<img src="https://anotea.pole-emploi.fr/static/images/logo-pole-emploi.svg" width="20%" height="20%" />
</p>
