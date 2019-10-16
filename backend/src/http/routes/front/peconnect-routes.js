const express = require('express');

module.exports = ({ db, logger, configuration, peconnect }) => {
    
    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/callback_pe_connect', async (req, res) => {
        try {
            if (req.query.scope !== undefined) {
                if (peconnect.checkState(req.session.pe_connect.state, req.query.state)) {
                    logger.info('User successfully logged in throw PE Connect');
                    peconnect.buildAccessToken(configuration, req.query.code, req.session.pe_connect.nonce).then(async data => {
                        const accessToken = data.access_token;
                        peconnect.getUserInfo(accessToken).then(async data => {
                            const email = data.email.toLowerCase();
                            const name = data.family_name;
                            const firstName = data.given_name;

                            const filter = { 'trainee.email': email, 'trainee.name': name, 'trainee.firstName': firstName, 'avisCreated': false };
                            const trainee = await db.collection('trainee').find(filter).sort({ importDate: -1 }).limit(1).toArray();
                            if (trainee.length === 1) {
                                await db.collection('trainee').updateOne(filter, { $set: { 'tracking.peConnectSucceed': new Date() } });
                                logger.info('User successfully logged in throw PE connect');
                                res.redirect(`/questionnaire/${trainee[0].token}`);
                            } else {
                                logger.error(`User fail logged in throw PE Connect: trainee not found email=${email}`);
                                res.render('front/peconnect/notFound');
                            }
                        }).catch(e => {
                            logger.error(`HTTP call to PE Connect API failed: ${e.error}`);
                            res.redirect('/connexion');
                        });
                    }).catch(e => {
                        if (e.error === 'nonce') {
                            logger.error('User attack detected: wrong nonce');
                            res.redirect('/?failed=unexpected');
                        } else {
                            logger.error(`User fail logged in throw PE Connect: ${e.error}`);
                            res.redirect('/?failed=pe');
                        }
                    });
                } else {
                    logger.error('User attack detected: wrong state');
                    res.redirect('/?failed=unexpected');
                }

            } else if (req.query.error === undefined) {
                logger.info('User cancelled log in throw PE Connect');
                res.redirect('/');
            } else {
                logger.error(`User fail logged in throw PE Connect: ${req.query.error}`);
                res.redirect('/?failed=pe');
            }
        } catch (e) {
            logger.error(`User fail logged in throw PE Connect: ${e}`);
            res.redirect('/?failed=unexpected');
        }
    });

    return router;
};
