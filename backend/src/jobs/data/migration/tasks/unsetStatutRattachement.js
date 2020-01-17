const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let [stagiaires, avis] = await Promise.all([
        db.collection('stagiaires').updateMany({},
            {
                $unset: {
                    'training.labelStatutRattachement': 1,
                    'training.statutRattachement': 1,
                }
            }
        ),
        db.collection('avis').updateMany({},
            {
                $unset: {
                    'training.labelStatutRattachement': 1,
                    'training.statutRattachement': 1,
                }
            }
        )
    ]);

    return { stagiaires: getNbModifiedDocuments(stagiaires), avis: getNbModifiedDocuments(avis) };
};
