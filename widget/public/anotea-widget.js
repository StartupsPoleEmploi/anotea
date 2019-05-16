(function() {

    var getStyles = function() {
        var css = '.anotea-widget{position:relative}.anotea-widget::before{display:block;content:""}.anotea-widget iframe{position:absolute;top:0;bottom:0;left:0;width:100%;height:100%;border:0}';

        var style = document.createElement('style');
        if (style.styleSheet) {
            // This is required for IE8 and below.
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        return style;
    };

    document.addEventListener("DOMContentLoaded", function() {

        var widgets = document.querySelectorAll('.anotea-widget');

        for (var i = 0; i < widgets.length; i++) {
            var widget = widgets[i];
            widget.appendChild(getStyles());

            var type = widget.getAttribute('data-type');
            var siret = widget.getAttribute('data-siret');
            var layout = widget.getAttribute('data-layout');
            var iframe = document.createElement('iframe');

            widget.style.cssText = layout === 'score' ? 'min-height:60px; min-width:100px' : 'min-height:200px; min-width:300px';
            iframe.src = 'http://localhost:3001' +
                '?type=' + type +
                '&siret=' + siret +
                '&layout=' + layout;

            widget.appendChild(iframe);
        }
    });
})();
