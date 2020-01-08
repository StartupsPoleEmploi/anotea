<img src="https://anotea.pole-emploi.fr/static/images/logo_Anotea_Horizontal_baseline2.png" width="30%" height="30%" />

Anotéa est un service lancé par Pôle emploi permettant de collecter les avis de demandeurs d'emplois ayant suivis une formation.

Seules les personnes ayant effectué la formation reçoivent un questionnaire à compléter. 
Vous êtes donc certains que les avis que vous consultez sont fiables.

## Comment cela fonctionne-t-il ?

Dans le cadre de sa recherche d'emploi, une personne peut suivre une formation financée par Pôle Emploi et/ou par la région dans laquelle il habite.

Lorsque la formation est terminée, Anotéa envoie par mail un questionnaire à cette personne — qu'on appelle stagiaire —  pourqu'il puisse déposer un avis sur la formation (la réponse à ce questionnaire est facultative).

Une fois l'avis déposé et anonymisé, il est potentiellement consultable sur tous les sites qui utilisent Anotéa (ex: https://labonneformation.pole-emploi.fr)

Afin de récupérer les avis, ces sites peuvent utiliser deux canaux fournis par Anotéa : l'[api](API.md) et le [widget](WIDGET.md)

### En détails 

![Anotea Diagram](./misc/doc/diagram/anotea-diagram.svg)

#### Réconciliation

Les formations suivies par les stagiaires sont référencées dans un catalogue.

Chaque formation peut être dispensée par plusieurs organismes formateurs, dans plusieurs lieux et à des dates différentes.

Quand un stagiaire dépose un avis sur une formation, il le fait donc pour

 1. un organisme formateur
 2. un lieu de formation (ex: 45000)
 3. une période (ex: du 01/01/2018 au 31/01/2018).

Ces trois critères représentent une session de formation. 

Le stagiaire étant contacté à la fin de la session, l'avis est donc déposé sur une session terminée. 

Le but de la réconciliation va être d'identifier dans le catalogue de formations, des sessions similaires en cours ou à venir. 
Une session est considérée comme similaire si elle possède
 
 - le même `siren` que l'organisme formateur
 - le même lieu de formation (`code postal`)
 - au moins un `formacode` ou `certifinfo` identique
        
Une fois que les sessions ont été identifiées, l'avis déposé est alors rattaché à ces sessions.

Les améliorations apportées à la réconciliation sont listées dans le [CHANGELOG](CHANGELOG.md#Réconciliation) 

## Développement
Travis Status ![Travis Status](https://travis-ci.org/StartupsPoleEmploi/anotea.svg?branch=master)

Anotéa nécessite que MongoDB 4+ soit démarré sur le port 27017 et que node.js 10 soit installé. 

Anotea est composé de deux projets : 
- `backend` qui contient un serveur node.js et expose des serveurs via [une API](API.md)
- `ui` qui contient les interfaces graphiques

### Démarrer l'application

Chaque projet se démarre avec les commandes suivantes :

```
npm install
npm start
```

Pour plus d'options démarrage, vous pouvez consulter la [Boite à outils](#Boite-à-outils)

Vous pouvez ensuite créer un jeu de données en local au moyen de la commande suivante:

```
cd backend
node src/jobs/data/dataset --drop
```

Ce script va générer un ensemble de données permettant à l'application de fonctionner.
Le sortie console du script vous donnera les instructions pour vous connecter à l'application.

### Boite à outils

#### Mode développement avancé

Afin d'éviter de devoir lancer tous les projets à la main, il est possible de tous les démarrer en une seule commande :

```
npm install pm2 -g
bash dev.sh
```

Pour stopper les projets : 

```
pm2 delete dev.yml
```

#### Tests

Par défaut, les tests d'intégration utilisent la base MongoDB démarrée sur la port 27017.
Afin que les tests s'éxecutent rapidement, vous pouvez démarrer un MongoDB in-memory :

```
mongod --dbpath <path to data dir> --port 27018 --storageEngine=ephemeralForTest
```

Vous pouvez ensuite lancer les tests avec la commande suivante :

```
cd backend
ANOTEA_MONGODB_URI=mongodb://localhost:27018/anotea?w=1 npm run test
```

#### Envoyer des emails en local

Certains fonctionnalités envoient des emails et ont donc besoin d'un serveur SMTP.
Vous pouvez démarrer en local un serveur MailHog :

```
cd backend
npm run smtp:start
```

Si vous avez démarré l'application via Docker un container MailHog est automatiquement lancé. 

### Démarrer l'application via Docker

Il est possible de démarrer Anotéa au sein de containers Docker.

Cette option permet d'avoir une environnement quasiment identique à celui de la production (reverse proxy,...).

Nous l'utilisons la plupart du temps pour reproduire une anomalie liée au déploiement.

```
docker-compose up --build
```

Cette commande va construire et démarrer plusieurs containers :

- Un container `nginx`, reverse proxy qui est le point d'entrée de l'application pour tous les appels http
- Un container `backend` contenant le serveur node.js
- Un container `mongodb`  
- Des containers pour servir les ressources web statiques (`widget`, `backoffice`, `questionnaire`,...)
- ...

![Anotea Docker_Diagram](./misc/doc/diagram/anotea-docker-diagram.svg)

L'application est ensuite accessible à l'url `http://localhost`

Pour executer un script dans un conteneur Docker, il faut lancer la commande :

```sh
docker build -t anotea_script .
docker run anotea_script bash -c "node src/jobs/<nom du script>"
```

#### Adapter la configuration Docker en local

Il est possible de fournir une configuration spécifique dans le fichier `docker-compose.local.yml` :

```sh
docker-compose -f docker-compose.yml -f docker-compose.local.yml up
```

Les fichiers seront fusionnés avec la configuration par défaut.

Vous pouvez prendre exemple sur les fichiers `docker-compose.override.yml` et `docker-compose.test.yml`

Pour plus d'informations sur le mécanisme de surcharge de docker-compose voir [https://docs.docker.com/compose/extends/](https://docs.docker.com/compose/extends/) 


Par exemple il est possible d'ajouter d'une variable d'environnement dans le backend

<p align="center">
<img src="https://anotea.pole-emploi.fr/static/images/logo-pole-emploi.svg" width="20%" height="20%" />
</p>
