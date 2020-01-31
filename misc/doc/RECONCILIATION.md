# Réconciliation

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

Les améliorations apportées à la réconciliation sont listées dans le [CHANGELOG](misc/doc/CHANGELOG.md#Réconciliation)

## Changelog

#### 2019-06-18

Une session est considérée comme similaire si elle possède
 
 - le même `siren` que l'organisme formateur
 - le même lieu de formation (`code postal`)
 - au moins un `formacode` ou `certifinfo` identique
 
Désormais les avis partageant le même certifinfo sont réconciliés en priorité. S'il n'y a pas d'avis avec le même certifinfo alors les avis partageant le même formacode sont réconciliés.

#### 2019-01-01

Une session est considérée comme similaire si elle possède
 
 - le même organisme formateur (`siret`)
 - le même lieu de formation (`code postal`)
 - au moins un `formacode` ou `certifinfo` identique
 
 Tous les avis partageant les mêmes critères sont réconciliés avec ces sessions.
 
 Résultats suite à ces changements :
 
 +2% de sessions avec au moins 1 avis soit 36% au 18/06/19 toutes régions confondues.
 
 Des disparités selon les régions : +3 pts pour IDF ; +7 pts pour Normandie ; + 5 pts pour BFC
 
 Cela résoud les problèmes de réconciliation sur l'AFPA et le GRETA pour qui toutes les AES sont enregistrées sur l'OF Responsable alors que les sessions sont enregistrées sur OF dispensateur
 