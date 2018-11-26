const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const convertToExposableAvis = require('../../../routes/api/v1/dto/convertToExposableAvis');
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


        let data = convertToExposableAvis(comment);

        assert.deepEqual(data, {
            id: 1234,
            pseudo,
            commentaire: {
                titre: 'Génial',
                texte: 'Super formation.',
                reponse: undefined,
            },
            date: date,
            notes: {
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                moyen_materiel: 2,
                accompagnement: 1,
                global: 2
            },
            formation: {
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
                        numero: '2422722',
                        periode: {
                            debut: date,
                            fin: date
                        }
                    },
                }
            }
        });
    });

    it('should map avis with réponse', async () => {

        let comment = newComment({
            answer: 'Voici notre réponse',
            answered: true,
        });

        let data = convertToExposableAvis(comment);

        assert.deepEqual(data.commentaire, {
            titre: 'Génial',
            texte: 'Super formation.',
            reponse: 'Voici notre réponse',
        });
    });

    it('should set undefined when commentaire is missing', async () => {

        let comment = newComment({
            comment: null,
        });

        let data = convertToExposableAvis(comment);

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

        let data = convertToExposableAvis(comment);

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

        let data = convertToExposableAvis(comment);

        assert.deepEqual(data.formation.certifications, []);
    });


    it('should use _id when date property is missing', async () => {

        let comment = newComment({
            _id: ObjectID.createFromTime(1),
            date: null
        });

        let data = convertToExposableAvis(comment);

        assert.deepEqual(new Date(data.date).toISOString(), '1970-01-01T00:00:01.000Z');
    });

});
