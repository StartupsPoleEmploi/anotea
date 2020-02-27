const _ = require('lodash');
const { batchCursor } = require('../../../job-utils');
const { getNbModifiedDocuments, getNbRemovedDocuments } = require('../../../job-utils');

let regionMapper = {
    '2': '84',
    '3': '27',
    '4': '53',
    '5': '24',
    '6': '94',
    '7': '44',
    '8': '01',
    '9': '03',
    '10': '32',
    '11': '11',
    '12': '04',
    '13': '02',
    '14': '28',
    '15': '75',
    '16': '76',
    '17': '52',
    '18': '93',
};

module.exports = async db => {

    let deleted =
        getNbRemovedDocuments(await db.collection('statistics').removeMany({ campaign: { $exists: false } })) +
        getNbRemovedDocuments(await db.collection('statistics').removeOne({ date: new Date('2019-10-15T01:02:08.165Z') })) +
        getNbRemovedDocuments(await db.collection('statistics').removeMany({ 'avis.nbAvisAvecCommentaire': 0 }));

    let renamed = 0;
    let cursor = db.collection('statistics').find();

    await batchCursor(cursor, async next => {
        let stats = await next();

        let organismes = stats.organismes.map(o => {
            return {
                label: o.label,
                codeRegions: o.codeRegions,
                nbOrganismesContactes: o.nbOrganismesContactes,
                nbMailsEnvoyes: o.mailsEnvoyes,
                nbOuvertureMails: o.ouvertureMails,
                nbLiensCliques: o.nbClicDansLien,
                nbOrganismesActifs: o.organismesActifs,
            };
        });

        let avis = stats.avis.map((a, index) => {
            return {
                ..._.omit(a, ['nbQuestionnairesValidees']),
                nbAvis: a.nbQuestionnairesValidees,
                nbReponses: stats.organismes[index].nbReponses,
            };
        });

        let res = await db.collection('statistics').replaceOne({ _id: stats._id }, {
            _id: stats._id,
            date: stats.date,
            national: {
                api: _.omit(stats.api[0], ['codeRegions', 'label']),
                organismes: _.omit(organismes[0], ['codeRegions', 'label']),
                avis: _.omit(avis[0], ['codeRegions', 'label']),
                campagnes: stats.campaign.reduce((acc, c) => {
                    if (!c.date || !c.formValidated) {
                        return acc;
                    }
                    return [
                        ...acc,
                        {
                            campaign: c._id,
                            date: c.date,
                            nbStagiairesContactes: c.mailSent,
                            nbMailsOuverts: c.mailOpen,
                            nbLiensCliques: c.linkClick,
                            nbAvis: c.formValidated,
                            nbCommentaires: c.nbCommentaires,
                        }
                    ];
                }, []),
            },
            regions: stats.api.filter(a => a.label !== 'Toutes').reduce((acc, item) => {
                let codeRegion = item.codeRegions[0];

                let filter = item => item.codeRegions.length === 1 && item.codeRegions[0] === codeRegion;
                let newRegionCode = regionMapper[codeRegion];

                return {
                    ...acc,
                    [newRegionCode]: {
                        api: _.omit(stats.api.find(filter), ['codeRegions', 'label']),
                        organismes: _.omit(organismes.find(filter), ['codeRegions', 'label']),
                        avis: _.omit(avis.find(filter), ['codeRegions', 'label']),
                    },
                };
            }, {}),
        });

        renamed += getNbModifiedDocuments(res);

    });

    return { renamed, deleted };
};
