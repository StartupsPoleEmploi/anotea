<p>
<img src="https://anotea.pole-emploi.fr/static/images/logo_Anotea_Horizontal_baseline2.png" width="200px" />
</p>
 
Anotéa est un service lancé par Pôle emploi permettant de collecter les avis de demandeurs d'emplois ayant suivis une formation.

Seules les personnes ayant effectué la formation reçoivent un questionnaire à compléter. 
Vous êtes donc certains que les avis que vous consultez sont fiables.

## Comment cela fonctionne-t-il ?

Dans le cadre de sa recherche d'emploi, une personne peut suivre une formation financée par Pôle Emploi et/ou par 
la région dans laquelle il habite.

Lorsque la formation est terminée, Anotéa envoie par mail un questionnaire à cette personne — qu'on appelle stagiaire —  
pourqu'il puisse déposer un avis sur la formation (la réponse à ce questionnaire est facultative).

Une fois l'avis déposé et anonymisé, il est [réconcilié](#Réconciliation) afin d'être potentiellement consultable 
sur tous les sites qui utilisent Anotéa (ex: https://candidat.pole-emploi.fr/formations/recherche).  

Ces sites utilisent deux canaux fournis par Anotéa : l'[api](misc/doc/API.md) et le [widget](misc/doc/WIDGET.md) 

### Réconciliation

Les formations suivies par les stagiaires sont référencées dans un catalogue.

Chaque formation peut être dispensée par plusieurs organismes formateurs, dans plusieurs lieux et à des dates différentes.

Quand un stagiaire dépose un avis sur une formation, il le fait donc pour

 1. un organisme formateur
 2. un lieu de formation (ex: 45000)
 3. une période (ex: du 01/01/2018 au 31/01/2018).

Ces trois critères représentent une session de formation. 

Le stagiaire étant contacté à la fin de la session, l'avis est donc déposé sur une session terminée. 

Le but de la réconciliation est d'identifier dans le catalogue de formations, des sessions similaires en cours ou à venir. 
Une session est considérée comme similaire si elle possède
 
 - le même `siren` que l'organisme formateur
 - le même lieu de formation (`code postal`)
 - au moins un `formacode` ou `certifinfo` identique
        
Une fois que les sessions ont été identifiées, l'avis déposé est alors rattaché à ces sessions.

Les améliorations apportées à la réconciliation sont listées dans le [CHANGELOG](misc/doc/CHANGELOG.md)

### Cycle de vie des avis

Ce diagramme décrit les étapes de collecte et de modération d'un avis dans Anotéa.

![Anotea Workflow_Avis](./misc/doc/diagram/anotea-workflow-avis.svg)

## Développement

- [Démarrer sur le projet](misc/doc/DEMARRAGE.md) 
- [Architecture](misc/doc/ARCHITECTURE.md)
- [Workflow de développement](misc/doc/WORKFLOW_DEV.md) 
- [API](misc/doc/API.md) 
- [Widget](misc/doc/WIDGET.md)


<p align="center">
<img src="https://anotea.pole-emploi.fr/static/images/logo-pole-emploi.svg" width="100px"  />
</p>
