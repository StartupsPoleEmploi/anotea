const convertCommentToAvis = require('../../../../../common/utils/convertCommentToAvis');

module.exports = async (db, formation) => {

    let comments = await db.collection('comment').find({
        $and: [
            {
                'training.organisation.siret': {
                    $in: formation.actions.map(action => action.organisme_formateur.siret_formateur.siret)
                }
            },
            {
                $or: [
                    { 'training.certifInfo.id': { $in: formation._meta.certifinfos } },
                    { 'formacode': { $in: formation._meta.formacodes } },
                ]
            },
        ],
        $or: [
            { 'comment': { $exists: false } },
            { 'comment': null },
            { 'published': true },
            { 'rejected': true },
        ]
    })
    .project({
        campaign: 0,
        unsubscribe: 0,
        mailSent: 0,
        mailSentDate: 0,
        tracking: 0,
        accord: 0,
        meta: 0,
    })
    .toArray();

    return comments.map(c => convertCommentToAvis(c));
};
