const express = require('express');

module.exports = ({ db, middlewares, logger }) => {

    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    const checkAuth = createJWTAuthMiddleware('backoffice');
    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/backoffice/dashboard/advices', checkAuth, checkProfile('moderateur'), (req, res) => {
        db.collection('comment').aggregate([
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    rejected: { $sum: { $cond: ['$rejected', 1, 0] } },
                    moderated: { $sum: { $cond: ['$moderated', 1, 0] } },
                    reported: { $sum: { $cond: ['$reported', 1, 0] } },
                    edited: { $sum: { $cond: ['$editedComment', 1, 0] } },
                }
            }
        ])
        .toArray((err, docs) => {
            if (err) {
                logger.error(err);
                res.status(500).render('errors/error');
            } else {
                res.send(docs);
            }
        });
    });

    router.get('/backoffice/dashboard/organisations', checkAuth, checkProfile('moderateur'), (req, res) => {
        db.collection('accounts').aggregate([
            {
                $match: {
                    profile: 'organisme'
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    mailSent: { $sum: { $cond: ['$mailSentDate', 1, 0] } },
                    mailOpen: { $sum: { $cond: ['$tracking', 1, 0] } },
                    accountCreated: { $sum: { $cond: ['$passwordHash', 1, 0] } },
                    haveAdvices: { $sum: { $cond: ['$advicesCount', 1, 0] } },
                    haveAnswered: { $sum: { $cond: ['$countComment', 1, 0] } },
                    haveComments: { $sum: { $cond: ['$countAnswer', 1, 0] } }
                }
            }
        ])
        .toArray((err, docs) => {
            if (err) {
                logger.error(err);
                res.send(docs);
            } else {
                res.status(500).render('errors/error');
            }
        });
    });

    router.get('/backoffice/dashboard/trainees', checkAuth, checkProfile('moderateur'), (req, res) => {
        db.collection('trainee').aggregate([
            {
                $group: {
                    _id: '$campaign',
                    mailSent: { $sum: { $cond: ['$mailSent', 1, 0] } },
                    mailOpen: { $sum: { $cond: ['$tracking', 1, 0] } }
                }
            },
            {
                $lookup:
                    {
                        from: 'comment',
                        localField: '_id',
                        foreignField: 'campaign',
                        as: 'comments'
                    }
            },
            {
                $unwind:
                    {
                        path: '$comments',
                        preserveNullAndEmptyArrays: true
                    }
            },
            {
                $group: {
                    _id: '$_id',
                    mailSent: { $first: '$mailSent' },
                    mailOpen: { $first: '$mailOpen' },
                    linkClick: { $sum: { $cond: { if: { $gte: ['$comments.step', 1] }, then: 1, else: 0 } } },
                    pageOne: { $sum: { $cond: { if: { $gte: ['$comments.step', 2] }, then: 1, else: 0 } } },
                    formValidated: { $sum: { $cond: { if: { $eq: ['$comments.step', 3] }, then: 1, else: 0 } } },
                    allowToContact: { $sum: { $cond: { if: { $eq: ['$comments.accord', true] }, then: 1, else: 0 } } },
                    allowToContactEntreprise: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$comments.accordEntreprise', true] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    mailSent: { $sum: '$mailSent' },
                    mailOpen: { $sum: '$mailOpen' },
                    linkClick: { $sum: '$linkClick' },
                    pageOne: { $sum: '$pageOne' },
                    formValidated: { $sum: '$formValidated' },
                    allowToContact: { $sum: '$allowToContact' },
                    allowToContactEntreprise: { $sum: '$allowToContactEntreprise' }
                }

            }
        ])
        .toArray((err, docs) => {
            if (err) {
                logger.error(err);
                res.status(500).render('errors/error');
            } else {
                res.send(docs);
            }
        });
    });

    return router;
};
