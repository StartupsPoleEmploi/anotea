<img src="https://anotea.pole-emploi.fr/static/images/logo_Anotea_Horizontal_baseline2.png" width="30%" height="30%" />

Anotéa est un service lancé par Pôle emploi permettant de collecter les avis de demandeurs d'emplois ayant suivis une formation.

Seules les personnes ayant effectué la formation reçoivent un questionnaire à compléter. 
Vous êtes donc certains que les avis que vous consultez sont fiables.

## Comment cela fonctionne-t-il ?

Dans le cadre de sa recherche d'emploi, une personne peut suivre une formation financée par Pôle Emploi et/ou par la région dans laquelle il habite.

Lorsque la formation est terminée, Anotéa envoie par email un questionnaire à cette personne — qu'on appelle stagiaire —  pourqu'il puisse déposer un avis sur la formation (la réponse à ce questionnaire est facultative).

Une fois l'avis déposé et anonymisé, il est potentiellement consultable sur tous les sites qui utilisent Anotéa (ex: https://labonneformation.pole-emploi.fr)

Afin de récupérer les avis, ces sites peuvent utiliser deux canaux fournis par Anotéa : l'[api](API.md) et le [widget](WIDGET.md)

### Réconciliation

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

BrowserStack Status ![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=cDdFS0VEeVkwNGplNWRRZTc3ajFXakk3Z1FYS1VXOVdDbHU1K0F0TDlYTT0tLWJJU1RoSk9YZzliWURyODU5a0xRZEE9PQ==--891e4fe6e282b4d38005ce6116797dbf12e80496)


Anotea est composé de quatre projets : 
- `backend` qui contient un serveur node.js et expose des serveurs via [une API](API.md)
- `backoffice` qui contient une Single Page Application en React fournissant des outils de modération d'avis
- `questionnaire` qui contient une Single Page Application en React permettant aux stagiaires de donner leur avis.
- `widget` qui contient [un composant](WIDGET.md) permettant d'afficher facilement les avis des stagiaires sur un site web .

### Démarrer l'application 

L'application nécessite MongoDB 4, Node.js 8

Les projets se démarrent avec les commandes suivantes :

```
npm install
npm start
```

#### Jeu de données

Vous pouvez créer un jeu de données en local au moyen de la commande suivante:

```
node src/jobs/data/dataset
```

Ce script va générer des comptes et des avis.
Il est ensuite possible de se connecter à l'url `http://localhost` avec le login `moderateur@pole-emploi.fr` et le mot de passe  `password`


### Démarrer l'application via Docker

L'application peut-être lancée au moyen de la commande suivante:

```
docker-compose up --build
```

Cette commande va construire et démarrer plusieurs containers :

- Un container nginx, un reverse proxy qui est le point d'entrée de l'application pour tous les appels sur http
- Un container backend contenant l'API et les batchs
- Un container backoffice avec un nginx pour servir les ressources web statiques
- Un container Mongodb  

L'application est accessible à l'url `http://localhost`

Pour executer un script dans un conteneur docker, il faut lancer la commande :

```sh
docker exec anotea_mongodb bash -c "node src/jobs/<nom du script>"
```

#### Configurer un environnement

##### Surcharge

Il est possible de fournir une configuration spécifique via le mécanisme de surcharge de docker-compose:

```sh
docker-compose -f docker-compose.yml -f /path/to/other/docker-compose.yml up
```

Ce fichier de type `docker-compose.yml` sera fusionné avec la configuration 
par défaut.

Pour plus d'informations voir [https://docs.docker.com/compose/extends/](https://docs.docker.com/compose/extends/)

Par exemple il est possible d'ajouter d'une variable d'environnement dans le backend

```yml
backend:
  environment:
    - ANOTEA_CUSTOM_VARIABLE=25
...
```

<img src="https://anotea.pole-emploi.fr/static/images/logo-pole-emploi-530.png" width="20%" height="20%" />
