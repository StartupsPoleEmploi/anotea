# Anotea

## Présentation

Anotéa est un service lancé par Pôle emploi, en étroite collaboration avec la région Île-de-France. 
Ces tiers s’assurent que les avis recueillis sont ceux d’anciens stagiaires

Seules les personnes ayant effectivement effectué la formation reçoivent un questionnaire à compléter. 
Vous êtes donc certains que les avis que vous consultez sont fiables.

Le projet est composé de deux projets : 
- backend qui contient un serveur node.js et expose des serveurs via un API
- backoffice qui contient une Single Page Application en React fournissant des outils de modération d'avis

## Démarrer l'application 

L'application nécessite MongoDB 4, Redis 4, Node.js 8

Pour démarrer le backend, il faut executer les commandes :

```
npm install
npm start
```

Pour démarrer le backoffice, il faut executer les commandes :

```
npm install
npm start
```

## Démarrer l'application via Docker

L'application peut-être lancée au moyen de la commande suivante:

```
docker-compose up --build
```

Cette commande va construire et démarrer plusieurs containers :

- Un container nginx, un reverse proxy qui est le point d'entrée de l'application pour tous les appels sur http
- Un container backend contenant l'API et les batchs
- Un container backoffice avec un nginx pour servir les ressources web statiques
- Un container Mongodb et un Redis  

L'application est accessible à l'url `http://localhost`

### Configurer un environnement

#### Surcharge

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
