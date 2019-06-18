# Anotea

## Présentation

Anotéa est un service lancé par Pôle emploi, en étroite collaboration avec la région Île-de-France. 
Ces tiers s’assurent que les avis recueillis sont ceux d’anciens stagiaires.

Seules les personnes ayant effectivement effectué la formation reçoivent un questionnaire à compléter. 
Vous êtes donc certains que les avis que vous consultez sont fiables.



## Développement

[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=cDdFS0VEeVkwNGplNWRRZTc3ajFXakk3Z1FYS1VXOVdDbHU1K0F0TDlYTT0tLWJJU1RoSk9YZzliWURyODU5a0xRZEE9PQ==--891e4fe6e282b4d38005ce6116797dbf12e80496)](https://www.browserstack.com/automate/public-build/cDdFS0VEeVkwNGplNWRRZTc3ajFXakk3Z1FYS1VXOVdDbHU1K0F0TDlYTT0tLWJJU1RoSk9YZzliWURyODU5a0xRZEE9PQ==--891e4fe6e282b4d38005ce6116797dbf12e80496)

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
