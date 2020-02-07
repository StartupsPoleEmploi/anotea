const { round } = require('../../../../core/utils/number-utils');

let projectStats = stats => {
    return Object.keys(stats).reduce((acc, key) => {

        //Wrap all notes under a parent property (can be done painfully with $project)
        if (key.indexOf('_') !== -1) {
            //Mongo can not round with 2 digits yet
            let roundedValue = round(stats[key]);
            let parentPropertyName = key.split('__')[0];
            let propertyName = key.split('__')[1];
            acc.notes[parentPropertyName] = Object.assign(
                {},
                acc.notes[parentPropertyName] || {},
                { [propertyName]: roundedValue });
        } else {
            acc[key] = stats[key];
        }
        return acc;
    }, { notes: {} });
};

module.exports = async (db, query) => {

    let sumCommentairesWith = (options = {}) => {
        return {
            $sum: {
                $cond: [{
                    $and: [
                        { $not: { $not: ['$commentaire'] } }, //exists
                        ...[options.status ? { $eq: ['$status', options.status] } : {}],
                        ...[options.qualification ? { $eq: ['$qualification', options.qualification] } : {}],
                    ]
                }, 1, 0]
            }
        };
    };

    let results = await db.collection('avis').aggregate([
        {
            $match: query
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                accueil__moyenne: { $avg: '$notes.accueil' },
                accueil__1: { $sum: { $cond: [{ $eq: ['$notes.accueil', 1] }, 1, 0] } },
                accueil__2: { $sum: { $cond: [{ $eq: ['$notes.accueil', 2] }, 1, 0] } },
                accueil__3: { $sum: { $cond: [{ $eq: ['$notes.accueil', 3] }, 1, 0] } },
                accueil__4: { $sum: { $cond: [{ $eq: ['$notes.accueil', 4] }, 1, 0] } },
                accueil__5: { $sum: { $cond: [{ $eq: ['$notes.accueil', 5] }, 1, 0] } },
                contenu_formation__moyenne: { $avg: '$notes.contenu_formation' },
                contenu_formation__1: { $sum: { $cond: [{ $eq: ['$notes.contenu_formation', 1] }, 1, 0] } },
                contenu_formation__2: { $sum: { $cond: [{ $eq: ['$notes.contenu_formation', 2] }, 1, 0] } },
                contenu_formation__3: { $sum: { $cond: [{ $eq: ['$notes.contenu_formation', 3] }, 1, 0] } },
                contenu_formation__4: { $sum: { $cond: [{ $eq: ['$notes.contenu_formation', 4] }, 1, 0] } },
                contenu_formation__5: { $sum: { $cond: [{ $eq: ['$notes.contenu_formation', 5] }, 1, 0] } },
                equipe_formateurs__moyenne: { $avg: '$notes.equipe_formateurs' },
                equipe_formateurs__1: { $sum: { $cond: [{ $eq: ['$notes.equipe_formateurs', 1] }, 1, 0] } },
                equipe_formateurs__2: { $sum: { $cond: [{ $eq: ['$notes.equipe_formateurs', 2] }, 1, 0] } },
                equipe_formateurs__3: { $sum: { $cond: [{ $eq: ['$notes.equipe_formateurs', 3] }, 1, 0] } },
                equipe_formateurs__4: { $sum: { $cond: [{ $eq: ['$notes.equipe_formateurs', 4] }, 1, 0] } },
                equipe_formateurs__5: { $sum: { $cond: [{ $eq: ['$notes.equipe_formateurs', 5] }, 1, 0] } },
                moyen_materiel__moyenne: { $avg: '$notes.moyen_materiel' },
                moyen_materiel__1: { $sum: { $cond: [{ $eq: ['$notes.moyen_materiel', 1] }, 1, 0] } },
                moyen_materiel__2: { $sum: { $cond: [{ $eq: ['$notes.moyen_materiel', 2] }, 1, 0] } },
                moyen_materiel__3: { $sum: { $cond: [{ $eq: ['$notes.moyen_materiel', 3] }, 1, 0] } },
                moyen_materiel__4: { $sum: { $cond: [{ $eq: ['$notes.moyen_materiel', 4] }, 1, 0] } },
                moyen_materiel__5: { $sum: { $cond: [{ $eq: ['$notes.moyen_materiel', 5] }, 1, 0] } },
                accompagnement__moyenne: { $avg: '$notes.accompagnement' },
                accompagnement__1: { $sum: { $cond: [{ $eq: ['$notes.accompagnement', 1] }, 1, 0] } },
                accompagnement__2: { $sum: { $cond: [{ $eq: ['$notes.accompagnement', 2] }, 1, 0] } },
                accompagnement__3: { $sum: { $cond: [{ $eq: ['$notes.accompagnement', 3] }, 1, 0] } },
                accompagnement__4: { $sum: { $cond: [{ $eq: ['$notes.accompagnement', 4] }, 1, 0] } },
                accompagnement__5: { $sum: { $cond: [{ $eq: ['$notes.accompagnement', 5] }, 1, 0] } },
                global__moyenne: { $avg: '$notes.global' },
                global__1: { $sum: { $cond: [{ $eq: ['$notes.global', 1] }, 1, 0] } },
                global__2: { $sum: { $cond: [{ $eq: ['$notes.global', 2] }, 1, 0] } },
                global__3: { $sum: { $cond: [{ $eq: ['$notes.global', 3] }, 1, 0] } },
                global__4: { $sum: { $cond: [{ $eq: ['$notes.global', 4] }, 1, 0] } },
                global__5: { $sum: { $cond: [{ $eq: ['$notes.global', 5] }, 1, 0] } },
                nbRead: { $sum: { $cond: { if: { $eq: ['$read', true] }, then: 1, else: 0 } } },
                nbReponses: { $sum: { $cond: { if: { $not: ['$reponse'] }, then: 0, else: 1 } } },
                nbReponseAModerer: { $sum: { $cond: { if: { $eq: ['$reponse.status', 'none'] }, then: 1, else: 0 } } },
                nbNotesSeules: { $sum: { $cond: { if: { $not: ['$commentaire.text'] }, then: 1, else: 0 } } },
                nbCommentaires: sumCommentairesWith(),
                nbCommentairesAModerer: sumCommentairesWith({ status: 'none' }),
                nbCommentairesValidated: sumCommentairesWith({ status: 'validated' }),
                nbCommentairesRejected: sumCommentairesWith({ status: 'rejected' }),
                nbCommentairesReported: sumCommentairesWith({ status: 'reported' }),
                nbCommentairesArchived: sumCommentairesWith({ status: 'archived' }),
                nbCommentairesPositifs: sumCommentairesWith({ status: 'validated', qualification: 'positif' }),
                nbCommentairesNegatifs: sumCommentairesWith({ status: 'validated', qualification: 'négatif' }),
                nbCommentairesAlertes: sumCommentairesWith({ status: 'rejected', qualification: 'alerte' }),
                nbCommentairesInjures: sumCommentairesWith({ status: 'rejected', qualification: 'injure' }),
                nbCommentairesNonConcernes: sumCommentairesWith({ status: 'rejected', qualification: 'non concerné' }),
            }
        },
        {
            $project: {
                _id: 0,
            }
        }
    ])
    .toArray();

    let stats = results[0];
    if (!stats) {
        return {};
    }

    return projectStats(stats);
};
