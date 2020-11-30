/* global ga */
(function() {

    var nodeEnv = document.querySelector('#rgpd').getAttribute('node-env');
    if (!nodeEnv) {
        return;
    }

    var loadTagCommander = function() {
        if (window.location.pathname !== '/widget') {
            const script = document.createElement('script');
            var isProduction = nodeEnv === 'production';
            if (!isProduction) {
                script.src = 'https://cdn.tagcommander.com/5375/uat/tc_Anotea_31.js';
            } else {
                script.src = 'https://cdn.tagcommander.com/5375/tc_Anotea_31.js';
            }
            script.async = true;
            document.body.appendChild(script);
        }
    };

    window.addEventListener('load', function() {
        loadTagCommander();
    });
})();
