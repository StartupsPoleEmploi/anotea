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
                        alert('callback accept ga');
                    },
                    callbackDenied: () => {
                        alert('callback denied ga');
                    }
                }
            ],
            position: 'bottom',
            fixed: true,
            forceDisplay: true
        });
});

console.log("coucou")