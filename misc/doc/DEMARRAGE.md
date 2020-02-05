# Démarrer sur le projet

Anotéa nécessite que MongoDB 4+ soit démarré sur le port 27017 et que node.js 12+ soit installé.

L'application est composée de deux projets :

`backend` qui contient un serveur et des jobs basés sur les technologies suivantes :

- [Node.js](https://nodejs.org/) pour la partie serveur ainsi que les jobs.
- [MongoDB](https://www.mongodb.com/) pour la base de données.
- [EJS](https://ejs.co/) pour les templates HTML (website, emails).
- [Mocha](https://mochajs.org) pour les l'execution des tests.

`ui` qui contient les interfaces graphiques et qui est basé sur les technologies suivantes :

- [React](https://reactjs.org) pour la gestion des interfaces utilisateurs (create-react-app)

## Installation

Il est tout d'abord nécessaire de cloner le repository

```bash
git clone git@github.com:StartupsPoleEmploi/anotea.git
```

Chaque projet se démarre ensuite avec les commandes suivantes :

```bash
npm install
npm start
```

L'application est ensuite accessible à l'url `http://localhost:8080`

Par défaut les deux projets sont configurés pour prendre en compte automatiquement les modifications du code source.

### Jeu de données

Afin de pouvoir tester les différentes fonctionnalités de l'application, il est possible de générer un jeu de données au moyen de la commande suivante

```bash
cd backend
node src/jobs/data/dataset --drop
```

Ce script part du principe qu'une base MongoDB est démarrée sur la port 27017 et va générer dans la base MongoDB des données permettant à l'application de fonctionner. Le sortie console du script vous donnera les instructions pour vous connecter à l'application.

### Emails

Certains fonctionnalités envoient des emails et ont donc besoin d'un serveur SMTP. Vous pouvez démarrer en local un serveur MailHog (nécessite Docker) :

```bash
cd backend
npm run smtp:start
```

## Tests

Pour lancer les tests, il faut exécuter la commande
 
```bash
cd backend
npm run test
```

ou 

```bash
cd backend
npm run test:unit && npm run test:integration
```

Attention, les tests d'intégration partent du principe qu'une base MongoDB est démarrée sur la port 27017.

Une commande permet de lancer tous les tests en démarrant un MongoDB in-memory sur le port 27018 (nécessite Docker)  :

```bash
cd backend
npm run test:all
```
## Docker

La procédure d'installation décrit ci-dessus permet de configurer un environnement de développement.

Toutefois en production, l'application est déployée au sein de [containers Docker](ARCHITECTURE.md).

En local, il est aussi possible de reproduire cet environnement via la commande : 

```
docker-compose up --build
```

L'application est ensuite accessible à l'url `http://localhost`

Afin d'être au plus près de l'environnement de production (cf. diagramme ci-dessus), 
le fichier `docker-compose.override.yml` est configuré avec des containers supplémentaires :

- `mailhog`pour émuler le serveur SMTP (`http://localhost:8025/`)
- `fluentbit`, `kibana` et `elasticsearch` pour émuler la gestion des logs (`http://localhost:5601/`). 

### Exécution des jobs

Pour exécuter un job, il faut lancer la commande :

```sh
docker build -t anotea_script .
docker run anotea_script bash -c "node src/jobs/<nom du script>"
```

### Surcharge des variables

Il est possible de fournir une configuration spécifique dans le fichier `docker-compose.local.yml` :

```sh
docker-compose -f docker-compose.yml -f docker-compose.local.yml up
```

Les fichiers seront fusionnés avec la configuration par défaut.

Vous pouvez prendre exemple sur les fichiers `docker-compose.override.yml` et `docker-compose.test.yml`.

Pour information, c'est le mécanisme utilisé pour configurer les différents environnements.

Pour plus d'informations sur le mécanisme de surcharge de docker-compose voir [https://docs.docker.com/compose/extends/](https://docs.docker.com/compose/extends/) 