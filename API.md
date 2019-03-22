# API

Anotea expose pour ses partenaires plusieurs services — appelés routes — au travers d'une API web.

## ESD (API publique)

L'API publique est disponible sur l'Emploi Store Dev (https://www.emploi-store-dev.fr/portail-developpeur/catalogueapi)

La documentation Swagger est disponible à l'url suivante https://anotea.pole-emploi.fr/api/doc/#/ESD

## Kairos

Plusieurs routes sont mises à disposition pour permettre aux utilistateurs de l'application Kairos de se connecter facilement à Anotéa.

Le documentation Swagger est disponible à l'url suivante https://anotea.pole-emploi.fr/api/doc/#/Kairos

## Authentification

Les appels à l'API doivent être authentifiés au moyen d'une clé sécrète appelée secret.
Plusieurs mécanismes d'authentification sont disponibles

### HMAC

Le header Authorization doit être de la forme suivante :

```
Authorization: "ANOTEA-HMAC-SHA256 <api_key>:<timestamp>:<digest>"
```

- `api_key` : Votre API Key.
- `timestamp` :  Nombre de millisecondes depuis l'Unix Epoch UTC.
- `digest` :  Digest spécifique à l'appel.
  
Le digest doit être crée en générant, à partir de votre secret, un HMAC SHA256 de la chaine de caractères composée des informations suivantes concaténées dans l'ordre :

`digest = "timestamp + method + path + body"`

- `timestamp` :  Nombre de millisecondes depuis l'Unix Epoch UTC.
- `body` : Le body de la requête (ex: json) ou rien s'il n'y a pas de body (ex: requête GET)
- `method`: La méthode de la requête en upper case (ex: GET)
- `path` : Le chemin de la route avec les parameters (ex: /api/v1/ping/authenticated?value=1)

La durée de validité du digest est de 5 minutes.

Exemple d'appel:
curl -X GET \
https://anotea.pole-emploi.fr/api/v1/ping/authenticated \
-H 'Authorization: ANOTEA-HMAC-SHA256 admin:1532004499293:217e41887152c459e34bd7070ab1ac8da572c1cf6107cafbbd0217d4b87db1a4'

### JWT

Le header Authorization doit être de la forme suivante :

```
Authorization: "Bearer <token>"
```

Le token doit être crée en générant un token JWT avec les claims iat et sub et le signant avec votre secret via l'algorithme HMAC256.

- `iat` : Nombre de secondes depuis l'Unix Epoch UTC.
- `sub` : Votre API Key
