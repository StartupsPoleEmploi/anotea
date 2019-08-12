const express = require('express');

module.exports = ({ db, logger, configuration, peconnect }) => {
    
    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/callback_pe_connect', (req, res) => {
        console.log(req.query);
        try {
            if (req.query.scope !== undefined) {
                if (peconnect.checkState(req.session.pe_connect.state, req.query.state)) {
                    logger.info('User successfully logged in throw PE Connect');

                    console.log(req.query.code);
                    console.log(req.session.pe_connect);
        
                    // TODO: vérifier nonce à la demande de l'access token
        
                    // Page de succès
                    console.log(req)
                    res.send(req.query);
                } else {
                    logger.error('User attack detected: wrong state');
                    // Problème de sécurité => page d'erreur
                }

            } else if (req.query.error === undefined) {
                logger.info('User cancelled log in throw PE Connect');
                // Page d'annulation
                res.redirect('/connexion?cancelled=true');
            } else {
                logger.error(`User fail logged in throw PE Connect: ${req.query.error}`);
                // Page d'erreur
                res.redirect('/connexion?failed=pe');
            }
        } catch (e) {
            logger.error(`User fail logged in throw PE Connect: ${e}`);
            // Page d'erreur
            req.failedUnexpected = true;
            res.redirect('/connexion?failed=unexpected');
        }
    });

    return router;
};
