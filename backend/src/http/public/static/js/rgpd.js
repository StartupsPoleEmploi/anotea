$(document).ready(() => {
    $.rgpWhat("En naviguant sur le site, vous acceptez l'utilisation de cookies pour améliorer la qualité du service et pour réaliser des statistiques de visite. Pour en savoir plus, consultez notre <a href=\"/politique-confidentialite\" target=\"_blank\">Politique de Confidentialité</a>.",
        {
            class: "rgpwhat",
            loadCss: "/static/js/rgpwhat/rgpwhat.css",
            consent: [
                {
                    title: "Google Analytics",
                    description: "Service google de statistiques de trafic",
                    key: "ga",
                    callbackAccepted: () => {
                        // enable Google Analytics
                        window.dataLayer = window.dataLayer || [];

                        function gtag() {
                            dataLayer.push(arguments);
                        }

                        gtag("js", new Date());
                        gtag("config", "<%= analytics.ga %>");
                    }
                }
            ],
            position: "bottom",
            fixed: true,
            forceDisplay: false,
            buttons: "notOk|ok",
            locale: {
                ok: "J'accepte",
                notOk: "Je refuse"
            }
        });
});
