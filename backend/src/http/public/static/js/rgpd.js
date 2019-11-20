$(document).ready(() => {
    $.rgpWhat('Les cookies assurent le bon fonctionnement de nos services. En utilisant ces derniers, vous acceptez l\'utilisation des cookies. <a href="/cgu" target="_blank">En savoir plus</a>.',
        {
            class: 'rgpwhat',
            loadCss: '/static/js/rgpwhat/rgpwhat.css',
            consent: [
                {
                    title: 'Google Analytics',
                    description: 'Service google de statistiques de trafic',
                    key: 'ga',
                    callbackAccepted: () => {
                        // enable Google Analytics
                        window.dataLayer = window.dataLayer || [];
                        function gtag() {
                            dataLayer.push(arguments);
                        }
                        gtag('js', new Date());
                        gtag('config', '<%= analytics.ga %>');
                    },
                    callbackDenied: () => {

                    }
                }
            ],
            position: 'bottom',
            fixed: true,
            forceDisplay: true
        });
});
