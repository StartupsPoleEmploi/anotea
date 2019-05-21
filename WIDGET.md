# WIDGET

Le widget Anotea permet d’intégrer et de promouvoir facilement les avis des stagiaires sur votre site web. Il est possible de lister les avis pour un organisme, une formation ou une action/session de formation.

Il existe en trois formats (`score`, `carrousel`, `liste` ) et supporte tous les navigateurs modernes dont Internet Explorer dans une version 11 minimum.

Vous pouvez consulter des exemples d'intégration du widget à l'url suivante [https://anotea.pole-emploi.fr/doc/widget](https://anotea.pole-emploi.fr/doc/widget)

### Intégration du widget

Insérez la balise suivante dans la balise `<header>` ou directement dans le `<body>.`

```html
<script src="https://anotea.pole-emploi.fr/widget/anotea-widget.min.js"></script>
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
| format        | Le format d'affichage (score,carrousel,liste)             | Optionnel (default: liste)    |


