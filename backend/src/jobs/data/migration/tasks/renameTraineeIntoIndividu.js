const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let res = await db.collection('stagiaires').updateMany({},
        {
            $rename: { 'trainee': 'individu' },
        }
    );

    await db.collection('stagiaires').updateMany({},
        {
            $rename: {
                'individu.firstName': 'individu.prenom',
                'individu.name': 'individu.nom',
                'individu.phoneNumbers': 'individu.telephones',
                'individu.dnIndividuNational': 'individu.identifiant_pe',
                'individu.idLocal': 'individu.identifiant_local',
            },
            $unset: {
                'individu.mailDomain': 1,
            }
        }
    );

    return { updated: getNbModifiedDocuments(res) };
};
