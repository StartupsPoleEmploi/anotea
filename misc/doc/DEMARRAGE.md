# Démarrer sur le projet

Anotea est composé de deux projets :

`backend` qui contient un serveur et des jobs basés sur les technologies suivantes :

- [Node.js](https://nodejs.org/) pour la partie serveur ainsi que les jobs.
- [MongoDB](https://www.mongodb.com/) pour la base de données.
- [EJS](https://ejs.co/) pour les templates HTML (website, emails).
- [Mocha](https://mochajs.org) pour les l'execution des tests.

`ui` qui contient les interfaces graphiques et qui est basée sur les technologies suivantes :

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

### Docker

La procédure d'installation décrit ci-dessus permet de configurer un environnement de développement.

Il est également possible de démarrer l'application via des [containers Docker](DOCKER.md) ce qui vous permettra d'émuler l'environnement de production.

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
