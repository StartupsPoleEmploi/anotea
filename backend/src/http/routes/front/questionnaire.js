const express = require('express');
const moment = require('moment');
const { getDeviceType } = require('./utils/analytics');

module.exports = ({ db, logger }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).render('errors/404');
                return;
            }

            req.trainee = trainee;
            next();
        });
    };

    const saveDeviceData = async (req, res, next) => {
        let trainee = req.trainee;
        let now = new Date();
        let lastSeenDate = trainee.lastSeenDate;
        let isNewSession = !lastSeenDate || Math.ceil(moment.duration(moment(now).diff(moment(lastSeenDate))).asMinutes()) > 30;
        let devices = getDeviceType(req.headers['user-agent']);

        db.collection('trainee').updateOne({ _id: trainee._id }, {
            ...(isNewSession && devices.phone ? { $inc: { 'deviceTypes.phone': 1 } } : {}),
            ...(isNewSession && devices.tablet ? { $inc: { 'deviceTypes.tablet': 1 } } : {}),
            ...(isNewSession && devices.desktop ? { $inc: { 'deviceTypes.desktop': 1 } } : {}),
            $set: { lastSeenDate: now }
        }).catch(e => logger.error(e));

        next();
    };

    router.get('/questionnaire/:token/start', getTraineeFromToken, saveDeviceData, async (req, res) => {

        let trainee = req.trainee;
        // We check if advice not already sent
        let comment = await db.collection('comment').findOne({
            token: req.params.token,
            formacode: trainee.training.formacode,
            idSession: trainee.training.idSession
        });

        if (!comment) {
            comment = {
                date: new Date(),
                token: req.params.token,
                campaign: trainee.campaign,
                formacode: trainee.training.formacode,
                idSession: trainee.training.idSession,
                training: trainee.training,
                step: 1,
                codeRegion: trainee.codeRegion
            };

            db.collection('comment').insertOne(comment).catch(e => logger.error(e));
        }

        // we let user change it's advice if last step not validated
        if (comment && comment.step === 3) {
            res.send({ error: true, reason: 'already sent', trainee: trainee });
        } else {
            res.send({ trainee: trainee });
        }
    });

    return router;
};
