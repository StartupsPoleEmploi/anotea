const express = require('express');
const moment = require('moment');
const { getFullUrl } = require('../routes-utils');

module.exports = ({ db, peconnect, sentry, configuration }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/peconnect', async (req, res) => {
        console.log(req);
        let authenticationUrl = await peconnect.getAuthenticationUrl();
        return res.redirect(authenticationUrl);
    });

    router.get('/callback_pe_connect', async (req, res) => {

        try {
            let userInfo = await peconnect.getUserInfo(getFullUrl(req));

            const results = await db.collection('trainee').find({
                'trainee.email': userInfo.email.toLowerCase(),
                'avisCreated': false,
                'training.scheduledEndDate': { $gte: moment().subtract(1, 'years').toDate() }
            })
            .sort({ 'training.scheduledEndDate': -1 })
            .limit(1)
            .toArray();

            if (results.length === 0) {
                return res.render('front/peconnect/notFound');
            }

            let trainee = results[0];
            db.collection('trainee').updateOne({ _id: trainee._id }, { $set: { 'tracking.peConnectSucceed': new Date() } });
            return res.redirect(`${configuration.app.public_hostname}/questionnaire/${trainee.token}`);
        } catch (e) {
            sentry.sendError(e);
            return res.status(500).render('errors/error');
        }
    });

    return router;
};
