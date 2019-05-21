/* eslint-disable no-var */
(function() {

    function getStyles() {
        var css = '.anotea-widget{overflow: hidden; position:relative}' +
            '.anotea-widget::before{display:block;content:""}' +
            '.anotea-widget iframe{position:absolute;top:0;bottom:0;left:0;width:100%;height:100%;border:0}';

        var style = document.createElement('style');
        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        return style;
    }

    function createIFrame(widget) {

        var baseUrl = window.location.href.indexOf('localhost') !== -1 ? 'http://localhost:3001' :
            window.location.href.replace(window.location.pathname, '') + '/widget';
        var format = widget.getAttribute('data-format');
        var type = widget.getAttribute('data-type');
        var identifiant = widget.getAttribute('data-identifiant');
        var options = widget.getAttribute('data-options');

        var iframe = document.createElement('iframe');
        iframe.className = 'anotea-widget-iframe';
        iframe.scrolling = 'no';
        iframe.frameBorder = '0';
        iframe.src = baseUrl +
            '?format=' + format +
            '&type=' + type +
            '&identifiant=' + identifiant +
            '&options=' + options;
        return iframe;
    }

    document.addEventListener('DOMContentLoaded', function() {

        var widgets = document.querySelectorAll('.anotea-widget');

        for (var i = 0; i < widgets.length; i++) {
            var widget = widgets[i];
            widget.appendChild(getStyles());
            widget.appendChild(createIFrame(widget));

            switch (widget.getAttribute('data-format')) {
                case 'score':
                    widget.style.cssText = 'min-height:130px; min-width:250px';
                    break;
                case 'carrousel':
                    widget.style.cssText = 'min-height:800px; min-width:300px';
                    break;
                default:
                    widget.style.cssText = 'min-height:1000px; min-width:300px';
            }

        }
    });
})();
