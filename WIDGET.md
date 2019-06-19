# WIDGET

Le widget Anotea permet d’intégrer et de promouvoir facilement les avis des stagiaires sur votre site web. Il est possible de lister les avis pour un organisme, une formation, une action ou une session de formation.

Il existe en trois formats (`score`, `carrousel`, `liste` ) et supporte tous les navigateurs modernes (Firefox 32+, Chrome 37+, Opera 30+, Safari OS X, Internet Explorer 11+).

Vous pouvez consulter des exemples d'intégration du widget à l'url suivante [https://anotea.pole-emploi.fr/doc/widget](https://anotea.pole-emploi.fr/doc/widget)

## Options

En plus de l'affichage des avis, il est possible d'activer des options dans le widget

### json-ld

L'option `json-ld` ajoute automatiquement des balises dans votre page HTML afin que les moteurs de recherche puissent récuperer les informations affichées par
le widget. Ces informations peuvent être utilisées par les moteurs de recherche pour, par exemple, afficher la note de votre organisme sur ses pages de résultats. 

## Configuration du widget

Insérez la balise suivante de préférence dans la balise `<head>` de votre document HTML.

```html
<script src="https://anotea.pole-emploi.fr/static/js/widget/anotea-widget-loader.min.js"></script>
```

Positionner le code suivant à l'emplacement où vous souhaiter afficher le widget dans votre page HTML:

```html
<div class="anotea-widget" data-type="organisme|formation|action|session" data-format="score|carrousel|liste" data-identifiant="siret|numero"></div>"
```

### Paramétrage des données

| Paramètre     | Valeurs                                                   |                               |
| ------------- | -------------                                             | -------------                 |
| type          | organisme,formation,action,session                        | Obligatoire                   |
| identifiant   | Le siret ou le numéro de la formation/action/session      | Obligatoire                   |
| format        | Le format d'affichage (score,carrousel,liste)             | Obligatoire                   |
| options       | La liste des options séparées par une virgule (json-ld)   | Optionnel (default: aucune)   |


### Exemples

Affichage au format score pour un organisme
```html
<div class="anotea-widget" data-type="organisme" data-format="score" data-identifiant="22222222222222"></div>"
 ```

 Affichage au format carrousel pour une formation
```html
<div class="anotea-widget" data-type="formation" data-format="carrousel" data-identifiant="14_AF_0000000000"></div>"
 ```
 
 Affichage au format carrousel pour une action de formation
```html
<div class="anotea-widget" data-type="action" data-format="carrousel" data-identifiant="14_AF_0000000000|14_SE_0000000000"></div>"
 ```
 
 Affichage au format liste pour une session de formation
```html
<div class="anotea-widget" data-type="action" data-format="carrousel" data-identifiant="14_AF_0000000000|14_SE_0000000000|SE_0000000000"></div>"
 ```
