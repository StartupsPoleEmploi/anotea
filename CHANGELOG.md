# Changelog

## Réconciliation

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
