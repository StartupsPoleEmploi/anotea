$(document).ready(() => {
    $.rgpWhat('En naviguant sur le site, vous acceptez l\'utilisation de cookies pour améliorer la qualité du service et pour réaliser des statistiques de visite. Pour en savoir plus, consultez notre <a href="/politique-confidentialite" target="_blank">Politique de Confidentialité</a>. Vous avez la possibilité de modifier vos préférences à tout moment ou bien d\'accepter les paramètres par défaut.',
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
