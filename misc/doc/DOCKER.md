# Docker

En production l'application est démarrée dans des containers Docker.

- Un container `nginx`, reverse proxy qui est le point d'entrée de l'application pour tous les appels http
- Un container `backend` contenant le serveur node.js
- Un container `ui` contenant les interfaces graphiques
- Un container `mongodb`  
- Un container `fluentbit` pour gérer les logs


![Anotea Docker_Diagram](./diagram/anotea-docker-diagram.svg)

Quand un appel HTTP arrive au niveau du reverse proxy `nginx`, en fonction de l'url demandée l'appel est transmis soit au container `backend` soit au container `ui`. Les règles sont spécifiées [ici](../docker/nginx/app/nginx/conf.d/locations.inc)

## Développement

Sur un poste de développement, il est possible de construire et lancer les containers via la commande : 

```
docker-compose up --build
```

L'application est ensuite accessible à l'url `http://localhost`

Afin d'être au plus près de l'architecture de production (cf. diagramme ci-dessus), en plus des containers du projet, trois containers sont démarrés :

- `mailhog`
- `elasticsearch`
- `kibana`

Le serveur mailhog (SMTP) est disponible à l'url `http://localhost:8025/`

Le Kibana (gestion de logs) est disponible à l'url `http://localhost:5601/`

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
