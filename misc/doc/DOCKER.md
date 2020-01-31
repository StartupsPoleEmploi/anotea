# Docker

Il est possible de démarrer Anotéa au sein de containers Docker de la même manière qu'en production.

```
docker-compose up --build
```

Cette commande va construire et démarrer plusieurs containers :

- Un container `nginx`, reverse proxy qui est le point d'entrée de l'application pour tous les appels http
- Un container `backend` contenant le serveur node.js
- Un container `ui` contenant les interfaces graphiques
- Un container `mongodb`  

![Anotea Docker_Diagram](./misc/doc/diagram/anotea-docker-diagram.svg)

L'application est ensuite accessible à l'url `http://localhost`

## Gestion des logs

Afin d'être au plus près de l'architecture de production, en plus des containers du projet, trois containers 
sont démarrés pour gérer les logs:

- fluentbit
- elasticsearch
- kibana

Les logs sont disponibles à l'url `http://localhost:5601/`

## Execution des jobs

Pour exécuter un job, il faut lancer la commande :

```sh
docker build -t anotea_script .
docker run anotea_script bash -c "node src/jobs/<nom du script>"
```

## Surcharge des variables

Il est possible de fournir une configuration spécifique dans le fichier `docker-compose.local.yml` :

```sh
docker-compose -f docker-compose.yml -f docker-compose.local.yml up
```

Les fichiers seront fusionnés avec la configuration par défaut.

Vous pouvez prendre exemple sur les fichiers `docker-compose.override.yml` et `docker-compose.test.yml`.

Pour information, c'est le mécanisme utilisé pour configurer les différents environnements.

Pour plus d'informations sur le mécanisme de surcharge de docker-compose voir [https://docs.docker.com/compose/extends/](https://docs.docker.com/compose/extends/) 
