const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const convertCommentToAvis = require('../../../src/common/utils/convertCommentToAvis');
const { newComment, randomize } = require('../../helpers/data/dataset');

describe(__filename, () => {

    it('comment should be mapped into avis', async () => {

        let numeroAction = '14_TE_1234567890';
        let date = new Date();
        let pseudo = randomize('pseudo');
        let comment = newComment({
            _id: 1234,
            pseudo,
            training: {
                infoCarif: {
                    numeroAction: numeroAction
                }
            }
        }, date);


        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data, {
            id: 1234,
            pseudo,
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

        let comment = newComment({
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            },
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.reponse, {
            texte: 'Voici notre réponse',
        });
    });

    it('should ignore réponse (not moderated)', async () => {

        let comment = newComment({
            reponse: {
                text: 'Voici notre réponse',
                status: 'none',
            },
        });

        let data = convertCommentToAvis(comment);

        assert.strictEqual(data.reponse, undefined);
    });

    it('should ignore réponse (rejected)', async () => {

        let comment = newComment({
            reponse: {
                text: 'Voici notre réponse',
                status: 'rejected',
            },
        });

        let data = convertCommentToAvis(comment);

        assert.strictEqual(data.reponse, undefined);
    });

    it('should ignore réponse (avis rejected)', async () => {

        let comment = newComment({
            status: 'rejected',
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            },
        });

        let data = convertCommentToAvis(comment);

        assert.strictEqual(data.reponse, undefined);
    });

    it('should set undefined when commentaire is missing', async () => {

        let comment = newComment({
            comment: null,
        });

        let data = convertCommentToAvis(comment);

        assert.strictEqual(data.commentaire, undefined);
    });

    it('should handle numeroAction=NULL', async () => {

        let comment = newComment({
            training: {
                infoCarif: {
                    numeroAction: 'NULL'
                }
            }
        });

        let data = convertCommentToAvis(comment);

        assert.strictEqual(data.formation.action.numero, undefined);
    });

    it('should handle empty training.certifInfo.id', async () => {

        let comment = newComment({
            training: {
                certifInfo: {
                    id: ''
                }
            }
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.formation.certifications, []);
    });


    it('should use _id when date property is missing', async () => {

        let comment = newComment({
            _id: ObjectID.createFromTime(1),
            date: null
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(new Date(data.date).toISOString(), '1970-01-01T00:00:01.000Z');
    });


    it('should ignore title when titleMasked is true', async () => {

        let comment = newComment({
            comment: {
                titleMasked: true,
                title: 'Génial',
                text: 'Super formation.'
            },
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.commentaire.titre, undefined);
    });

    it('should ignore pseudo when pseudoMasked is true', async () => {

        let comment = newComment({
            pseudoMasked: true,
            pseudo: 'hacker',
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.pseudo, undefined);
    });

    it('should return edited comment when comment has been edited', async () => {

        let comment = newComment({
            comment: {
                title: 'Génial',
                text: 'Formation super géniale.',
            },
            meta: {
                history: [
                    {
                        comment: {
                            text: 'Formation géniale.'
                        }
                    }
                ]
            }
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.commentaire.texte, 'Formation super géniale.');
    });

    it('should not return commentaire when avis has been rejected', async () => {

        let comment = newComment({
            status: 'rejected',
            comment: {
                title: 'Génial',
                text: 'Formation géniale.'
            },
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.commentaire, undefined);
    });

    it('should not return commentaire when avis has not been moderated yet', async () => {

        let comment = newComment({
            status: 'none',
            comment: {
                title: 'Génial',
                text: 'Formation géniale.'
            },
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.commentaire, undefined);
    });

    it('should not return pseudo when avis has been rejected', async () => {

        let comment = newComment({
            status: 'rejected',
            pseudo: 'hacker',
            comment: {
                title: 'Génial',
                text: 'Formation géniale.'
            },
        });

        let data = convertCommentToAvis(comment);

        assert.deepStrictEqual(data.pseudo, undefined);
    });

});
