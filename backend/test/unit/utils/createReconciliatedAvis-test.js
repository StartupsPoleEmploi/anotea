const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const createReconciliatedAvis = require('../../../src/core/utils/createReconciliatedAvis');
const { newAvis, randomize } = require('../../helpers/data/dataset');

describe(__filename, () => {

    it('avis should be mapped into avis', async () => {

        let numeroAction = '14_TE_1234567890';
        let date = new Date();
        let avis = newAvis({
            _id: 1234,
            training: {
                infoCarif: {
                    numeroAction: numeroAction
                }
            }
        }, date);


        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data, {
            id: 1234,
            commentaire: {
                titre: 'Génial',
                texte: 'Super formation.',
            },
            date: date,
            notes: {
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                moyen_materiel: 2,
                accompagnement: 1,
                global: 2.4
            },
            formation: {
                numero: 'F_XX_XX',
                domaine_formation: {
                    formacodes: ['46242'],
                },
                intitule: 'Développeur',
                certifications: [{
                    certif_info: '78997'
                }],
                action: {
                    numero: numeroAction,
                    lieu_de_formation: {
                        code_postal: '75011',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date,
                            fin: date
                        }
                    },
                }
            }
        });
    });

    it('should add réponse', async () => {

        let avis = newAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data.reponse, {
            texte: 'Voici notre réponse',
        });
    });

    it('should ignore réponse (not moderated)', async () => {

        let avis = newAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'none',
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.strictEqual(data.reponse, undefined);
    });

    it('should ignore réponse (rejected)', async () => {

        let avis = newAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'rejected',
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.strictEqual(data.reponse, undefined);
    });

    it('should ignore réponse (avis rejected)', async () => {

        let avis = newAvis({
            status: 'rejected',
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.strictEqual(data.reponse, undefined);
    });

    it('should set undefined when commentaire is missing', async () => {

        let avis = newAvis({
            commentaire: null,
        });

        let data = createReconciliatedAvis(avis);

        assert.strictEqual(data.commentaire, undefined);
    });

    it('should handle numeroAction=NULL', async () => {

        let avis = newAvis({
            training: {
                infoCarif: {
                    numeroAction: 'NULL'
                }
            }
        });

        let data = createReconciliatedAvis(avis);

        assert.strictEqual(data.formation.action.numero, undefined);
    });

    it('should handle empty training.certifInfos', async () => {

        let avis = newAvis();
        avis.training.certifInfos = [];

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data.formation.certifications, []);
    });


    it('should use _id when date property is missing', async () => {

        let avis = newAvis({
            _id: ObjectID.createFromTime(1),
            date: null
        });

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(new Date(data.date).toISOString(), '1970-01-01T00:00:01.000Z');
    });


    it('should ignore title when titleMasked is true', async () => {

        let avis = newAvis({
            commentaire: {
                titleMasked: true,
                title: 'Génial',
                text: 'Super formation.'
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data.commentaire.titre, undefined);
    });

    it('should return edited avis when commentaire has been edited', async () => {

        let avis = newAvis({
            commentaire: {
                title: 'Génial',
                text: 'Formation super géniale.',
            },
            meta: {
                history: [
                    {
                        commentaire: {
                            text: 'Formation géniale.'
                        }
                    }
                ]
            }
        });

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data.commentaire.texte, 'Formation super géniale.');
    });

    it('should not return commentaire when avis has been rejected', async () => {

        let avis = newAvis({
            status: 'rejected',
            commentaire: {
                title: 'Génial',
                text: 'Formation géniale.'
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data.commentaire, undefined);
    });

    it('should not return commentaire when avis has not been moderated yet', async () => {

        let avis = newAvis({
            status: 'none',
            commentaire: {
                title: 'Génial',
                text: 'Formation géniale.'
            },
        });

        let data = createReconciliatedAvis(avis);

        assert.deepStrictEqual(data.commentaire, undefined);
    });
});
