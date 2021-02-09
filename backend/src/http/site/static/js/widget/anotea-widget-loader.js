(function() {

    window.anotea = window.anotea || {};

    var getAnoteaUrl = function(path, env) {
        var location = window.location.href;

        if (env === 'recette' || location.indexOf('https://anotea.beta.pole-emploi.fr') !== -1) {
            return 'https://anotea.beta.pole-emploi.fr' + path;
        } else if (env === 'dev' || location.indexOf('load_anotea_widget_iframe_from_localhost=true') !== -1) {
            return 'http://localhost:3000' + path;
        }
        return 'https://anotea.pole-emploi.fr' + path;
    };

    var appendChild = function(name, element, attach) {
        element.appendChild(document.createComment('anotea-' + name + '-start'));
        element.appendChild(attach);
        element.appendChild(document.createComment('anotea-' + name + '-end'));
    };

    function getWidgetIframe(attributes) {
        var path = '/widget' +
            '?format=' + attributes.format +
            '&type=' + attributes.type +
            '&identifiant=' + attributes.identifiant +
            '&options=' + attributes.options.join(',');

        var iframe = document.createElement('iframe');
        iframe.className = 'anotea-widget-iframe';
        iframe.style.width = '1px';
        iframe.style.minWidth = '100%';
        iframe.scrolling = 'no';
        iframe.frameBorder = '0';
        iframe.src = getAnoteaUrl(path, attributes.env);

        return iframe;
    }

    function getAggregateRatingScript(attributes, callback) {
        var typeMapping = {
            'organisme': 'organismes-formateurs',
            'formation': 'formations',
            'action': 'actions',
            'session': 'sessions',
        };
        var url = getAnoteaUrl('/api/v1/' + typeMapping[attributes.type] + '/' + attributes.identifiant, attributes.env);

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.setRequestHeader('accept', 'application/ld+json');
        request.setRequestHeader('x-anotea-widget', '1');
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                var script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                script.innerHTML = request.responseText;
                callback(script);
            } else {
                console.log(request);

            }
        };
        request.onerror = function(e) {
            console.log(e);
        };
        request.send();
    }

    function getIframeResizerScript(attributes) {
        var script = document.createElement('script');
        script.setAttribute('src', getAnoteaUrl('/static/js/widget/iframe-resizer.min.js', attributes.env));
        script.async = false;
        script.onload = function() {

            var isOldIE = (navigator.userAgent.indexOf('MSIE') !== -1); // Detect IE10 and below

            window.anotea.iFrameResizer({
                heightCalculationMethod: isOldIE ? 'max' : 'lowestElement',
                checkOrigin: false,
                tolerance: 20,
            }, '.anotea-widget-iframe');
        };
        return script;
    }

    function loadWidget() {

        var elements = document.querySelectorAll('.anotea-widget');
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var attributes = {
                format: element.getAttribute('data-format'),
                env: element.getAttribute('data-env'),
                type: element.getAttribute('data-type'),
                identifiant: element.getAttribute('data-identifiant'),
                options: (element.getAttribute('data-options') || '').split(','),
            };

            appendChild('widget', element, getWidgetIframe(attributes));

            if (i === elements.length - 1) {
                if (attributes.options.includes('json-ld')) {
                    getAggregateRatingScript(attributes, function(script) {
                        appendChild('json-ld', document.head, script);
                    });
                }
                element.appendChild(getIframeResizerScript(attributes));
            }
        }
    }

    document.addEventListener('DOMContentLoaded', loadWidget);
})();

