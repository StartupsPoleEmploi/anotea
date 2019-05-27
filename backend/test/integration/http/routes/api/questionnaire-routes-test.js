const request = require('supertest');
const assert = require('assert');
const _ = require('lodash');
const { withServer } = require('../../../../helpers/test-server');
const { newTrainee, newCarif } = require('../../../../helpers/data/dataset');


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it('can submit a questionnaire', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let date = new Date();
        let trainee = newTrainee({}, date);
        await insertIntoDatabase('trainee', trainee);
        await insertIntoDatabase('carif', newCarif({ codeRegion: '11' }));

        let response = await request(app)
        .post(`/api/questionnaire/${trainee.token}`)
        .send({
            avis_accueil: 2,
            avis_contenu_formation: 2,
            avis_equipe_formateurs: 1,
            avis_moyen_materiel: 2,
            avis_accompagnement: 2,
            pseudo: 'John D.',
            commentaire: {
                texte: 'texte',
                titre: 'titre'
            },
            accord: true,
            accordEntreprise: true
        });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(_.omit(response.body.stagiaire, ['_id', 'token']), {
            campaign: 'test-campaign',
            importDate: date.toJSON(),
            trainee: {
                name: 'Dupont',
                firstName: 'Henri',
                mailDomain: 'free.fr',
                email: 'henri@email.fr',
                phoneNumbers: [
                    '0123456789',
                    'NULL'
                ],
                emailValid: true,
                dnIndividuNational: '1111111111'
            },
            training: {
                idFormation: 'F_XX_XX',
                title: 'Développeur',
                startDate: date.toJSON(),
                scheduledEndDate: date.toJSON(),
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    postalCode: '75011',
                    city: 'Paris'
                },
                certifInfo: {
                    id: '78997',
                    label: 'Développeur'
                },
                idSession: '2422722',
                formacode: '46242',
                aesRecu: 'AES',
                referencement: '41C561691111',
                idSessionAudeFormation: '2422722',
                infoCarif: {
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX'
                },
                codeFinanceur: '10'
            },
            unsubscribe: false,
            mailSent: true,
            mailSentDate: date.toJSON(),
            tracking: {
                firstRead: date.toJSON()
            },
            codeRegion: '11'
        });
        assert.deepStrictEqual(_.omit(response.body.infosRegion, ['trainee']), {
            carifLinkEnabled: true,
            carifURL: 'https://www.defi-metiers.fr/',
            showLinks: false,
        });

        let result = await db.collection('comment').findOne({ token: trainee.token });

        assert.deepStrictEqual(_.omit(result, ['token', '_id', 'date']), {
            campaign: 'test-campaign',
            formacode: '46242',
            idSession: '2422722',
            training: {
                idFormation: 'F_XX_XX',
                title: 'Développeur',
                startDate: date,
                scheduledEndDate: date,
                organisation: {
                    id: '14_OF_XXXXXXXXXX',
                    siret: '11111111111111',
                    label: 'Pole Emploi Formation',
                    name: 'INSTITUT DE FORMATION'
                },
                place: {
                    postalCode: '75011',
                    city: 'Paris'
                },
                certifInfo: {
                    id: '78997',
                    label: 'Développeur'
                },
                idSession: '2422722',
                formacode: '46242',
                aesRecu: 'AES',
                referencement: '41C561691111',
                idSessionAudeFormation: '2422722',
                infoCarif: {
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX'
                },
                codeFinanceur: '10'
            },
            codeRegion: '11',
            rates: {
                accueil: 2,
                contenu_formation: 2,
                equipe_formateurs: 1,
                moyen_materiel: 2,
                accompagnement: 2,
                global: 1.8,
            },
            pseudo: 'JohnD',
            comment: {
                title: 'titre',
                text: 'texte'
            },
            accord: true,
            accordEntreprise: true
        });
    });
}));
