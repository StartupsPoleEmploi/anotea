const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const reworkStats = require('../../../../../src/jobs/data/migration/tasks/reworkStats');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    let createDeprecatedData = () => {
        return {
            '_id': '1234',
            'date': new Date('2020-01-30T02:01:33.392Z'),
            'organismes': [
                {
                    'label': 'Toutes',
                    'codeRegions': [
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '10',
                        '11',
                        '13',
                        '14',
                        '15',
                        '16',
                        '17',
                        '18'
                    ],
                    'nbOrganismesContactes': 11108,
                    'mailsEnvoyes': 19057,
                    'avisModeresNonRejetes': 233200,
                    'ouvertureMails': 4494,
                    'nbClicDansLien': 0,
                    'organismesActifs': 4951,
                    'avisNonLus': 126561,
                    'nbReponses': 9496,
                    'avisSignales': 48
                },
                {
                    'label': 'Auvergne-Rhône-Alpes',
                    'codeRegions': [
                        '2'
                    ],
                    'nbOrganismesContactes': 1608,
                    'mailsEnvoyes': 2734,
                    'avisModeresNonRejetes': 35039,
                    'ouvertureMails': 840,
                    'nbClicDansLien': 0,
                    'organismesActifs': 750,
                    'avisNonLus': 17176,
                    'nbReponses': 915,
                    'avisSignales': 3
                }
            ],
            'avis': [
                {
                    'label': 'Toutes',
                    'codeRegions': [
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '10',
                        '11',
                        '13',
                        '14',
                        '15',
                        '16',
                        '17',
                        '18'
                    ],
                    'nbStagiairesImportes': 1168625,
                    'nbStagiairesContactes': 1166970,
                    'nbMailEnvoyes': 2194081,
                    'nbCommentairesAModerer': 0,
                    'nbMailsOuverts': 739585,
                    'nbLiensCliques': 325186,
                    'nbQuestionnairesValidees': 272275,
                    'nbAvisAvecCommentaire': 10,
                    'nbCommentairesPositifs': 0,
                    'nbCommentairesNegatifs': 0,
                    'nbCommentairesRejetes': 3571
                },
                {
                    'label': 'Auvergne-Rhône-Alpes',
                    'codeRegions': [
                        '2'
                    ],
                    'nbStagiairesImportes': 129111,
                    'nbStagiairesContactes': 128990,
                    'nbMailEnvoyes': 239489,
                    'nbCommentairesAModerer': 0,
                    'nbMailsOuverts': 87992,
                    'nbLiensCliques': 42362,
                    'nbQuestionnairesValidees': 35947,
                    'nbAvisAvecCommentaire': 10,
                    'nbCommentairesPositifs': 0,
                    'nbCommentairesNegatifs': 0,
                    'nbCommentairesRejetes': 389
                }
            ],
            'api': [
                {
                    'label': 'Toutes',
                    'codeRegions': [
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '10',
                        '11',
                        '13',
                        '14',
                        '15',
                        '16',
                        '17',
                        '18'
                    ],
                    'nbAvis': 276333,
                    'nbAvisRestituables': 166336,
                    'nbSessions': 420285,
                    'nbSessionsAvecAvis': 186391,
                    'nbSessionsCertifiantesAvecAvis': 140231,
                    'nbAvisParSession': 3.5
                },
                {
                    'label': 'Auvergne-Rhône-Alpes',
                    'codeRegions': [
                        '2'
                    ],
                    'nbAvis': 36170,
                    'nbAvisRestituables': 24240,
                    'nbSessions': 45036,
                    'nbSessionsAvecAvis': 20351,
                    'nbSessionsCertifiantesAvecAvis': 15554,
                    'nbAvisParSession': 3.3
                },
            ],
            'campaign': [
                {
                    '_id': 'anotea_stagiaires_aes_tt_regions_full_202001271800',
                    'date': new Date('2020-01-28T15:16:39.534Z'),
                    'mailSent': 857,
                    'mailOpen': 502,
                    'linkClick': 252,
                    'formValidated': 222,
                    'nbCommentaires': 118,
                    'nbCommentairesRejected': 2
                }
            ]
        };
    };

    it('should migrate data', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            insertIntoDatabase('statistics', createDeprecatedData()),
        ]);

        await reworkStats(db);

        assert.strictEqual(await db.collection('statistics').count(), 1);
        let doc = await db.collection('statistics').findOne();
        assert.deepStrictEqual(doc, {
            _id: '1234',
            date: new Date('2020-01-30T02:01:33.392Z'),
            national: {
                api: {
                    nbAvis: 276333,
                    nbAvisRestituables: 166336,
                    nbSessions: 420285,
                    nbSessionsAvecAvis: 186391,
                    nbSessionsCertifiantesAvecAvis: 140231,
                    nbAvisParSession: 3.5
                },
                organismes: {
                    nbOrganismesContactes: 11108,
                    nbMailsEnvoyes: 19057,
                    nbOuvertureMails: 4494,
                    nbLiensCliques: 0,
                    nbOrganismesActifs: 4951
                },
                avis: {
                    nbStagiairesImportes: 1168625,
                    nbStagiairesContactes: 1166970,
                    nbMailEnvoyes: 2194081,
                    nbCommentairesAModerer: 0,
                    nbMailsOuverts: 739585,
                    nbLiensCliques: 325186,
                    nbAvisAvecCommentaire: 10,
                    nbCommentairesPositifs: 0,
                    nbCommentairesNegatifs: 0,
                    nbCommentairesRejetes: 3571,
                    nbAvis: 272275,
                    nbReponses: 9496
                },
                campagnes: [
                    {
                        campaign: 'anotea_stagiaires_aes_tt_regions_full_202001271800',
                        date: new Date('2020-01-28T15:16:39.534Z'),
                        nbStagiairesContactes: 857,
                        nbMailsOuverts: 502,
                        nbLiensCliques: 252,
                        nbAvis: 222,
                        nbCommentaires: 118
                    }
                ]
            },
            regions: {
                '2': {
                    api: {
                        nbAvis: 36170,
                        nbAvisRestituables: 24240,
                        nbSessions: 45036,
                        nbSessionsAvecAvis: 20351,
                        nbSessionsCertifiantesAvecAvis: 15554,
                        nbAvisParSession: 3.3
                    },
                    organismes: {
                        nbOrganismesContactes: 1608,
                        nbMailsEnvoyes: 2734,
                        nbOuvertureMails: 840,
                        nbLiensCliques: 0,
                        nbOrganismesActifs: 750
                    },
                    avis: {
                        nbStagiairesImportes: 129111,
                        nbStagiairesContactes: 128990,
                        nbMailEnvoyes: 239489,
                        nbCommentairesAModerer: 0,
                        nbMailsOuverts: 87992,
                        nbLiensCliques: 42362,
                        nbAvisAvecCommentaire: 10,
                        nbCommentairesPositifs: 0,
                        nbCommentairesNegatifs: 0,
                        nbCommentairesRejetes: 389,
                        nbAvis: 35947,
                        nbReponses: 915
                    }
                }
            }
        });
    });
}));
