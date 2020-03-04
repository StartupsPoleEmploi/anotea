const _ = require('lodash');
const waitUntil = require('wait-until');
const request = require('supertest');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../helpers/with-server');
const { newAvis, newStagiaire, newOrganismeAccount } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, createIndexes, getComponents, getTestDatabase, logAsOrganisme }) => {

    let buildAvis = (custom = {}) => {
        return newAvis(_.merge({
            codeRegion: '11',
            formation: {
                action: {
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        siret: '11111111111111',
                    },
                },
            },
        }, custom));
    };

    let checkEmail = callback => {
        return new Promise(async (resolve, reject) => {
            let { mailer } = await getComponents();
            waitUntil()
            .interval(100)
            .times(10)
            .condition(() => mailer.getEmailMessagesSent().length > 0)
            .done(result => {
                if (!result) {
                    reject(new Error('The condition was never met.'));
                }

                callback(mailer);
                resolve();
            });
        });
    };

    it(`can search avis with status`, async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
            insertIntoDatabase('avis', buildAvis({ status: 'rejected' })),
            insertIntoDatabase('avis', buildAvis({ status: 'reported' })),
            insertIntoDatabase('avis', buildAvis({ status: 'none' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?statuses=validated')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'validated');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=rejected')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'rejected');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=reported')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'reported');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=none')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'none');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=archived')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);
    });

    it('can search avis by email (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('stagiaires', newStagiaire({
                token: '12345',
                individu: {
                    email: 'robert@domaine.com',
                },
            })),
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                token: '12345',
            })),
            createIndexes(['avis']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=robert@domaine.com')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis by email (no match) (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis()),
            createIndexes(['avis']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=unknown@unknown.com')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('can search avis by titre (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({
                commentaire: {
                    title: 'Trop Génial',
                },
            })),
            insertIntoDatabase('avis', newAvis({
                commentaire: {
                    title: 'Pas cool',
                },
            })),
            createIndexes(['avis']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=Trop')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].commentaire.title, 'Trop Génial');
    });

    it('can search avis by titre (no match) (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis()),
            createIndexes(['avis']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=NOMATCH')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('can validate reponse', async () => {

        let app = await startServer();
        let avis = newAvis();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/validateReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.reponse.lastStatusUpdate);
        assert.deepStrictEqual(response.body.reponse.status, 'validated');
    });

    it('can not validate reponse of another region', async () => {

        let app = await startServer();
        let avis = newAvis({ codeRegion: '6' });
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/validateReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can reject reponse', async () => {

        let app = await startServer();
        let avis = newAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'none',
            },
        });
        let organisme = newOrganismeAccount({ siret: avis.formation.action.organisme_formateur.siret });
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', avis),
            insertIntoDatabase('accounts', organisme)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/rejectReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.reponse.lastStatusUpdate);
        assert.deepStrictEqual(response.body.reponse.status, 'rejected');

        return checkEmail(mailer => {
            let message = mailer.getLastEmailMessageSent();
            assert.strictEqual(message.email, 'contact@poleemploi-formation.fr');
            assert.strictEqual(message.parameters.subject, 'Pôle Emploi - Votre réponse n\'a pas été prise en compte');
        });
    });

    it('can not reject reponse of another region', async () => {

        let app = await startServer();
        let avis = newAvis({
            codeRegion: '94',
            reponse: {
                text: 'Voici notre réponse',
                status: 'none',
            },
        });
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/rejectReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can edit an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({
                _id: id,
                commentaire: {
                    text: 'Génial'
                },
            })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/edit`)
        .send({ text: 'New message' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.commentaire.text, 'New message');
        assert.deepStrictEqual(response.body.meta.history[0].commentaire.text, 'Génial');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can not edit an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({
                _id: id,
                codeRegion: '44',
                commentaire: {
                    text: 'Génial'
                },
            })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/edit`)
        .send({ text: 'New message' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can validate an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/validate`)
        .send({ qualification: 'positif' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.status, 'validated');
        assert.deepStrictEqual(response.body.qualification, 'positif');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can cancel report', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345', status: 'reported' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'validate@email.fr',
            })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/validate`)
        .send({ qualification: 'positif' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        return checkEmail(mailer => {
            let message = mailer.getLastEmailMessageSent();
            assert.strictEqual(message.email, 'validate@email.fr');
            assert.strictEqual(message.parameters.subject, 'Pôle Emploi - Avis signalé dans votre Espace Anotéa');
        });
    });

    it('can confirm report', async () => {
        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345', status: 'reported' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'reject@email.fr',
            })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/reject`)
        .send({ qualification: 'injure' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        return checkEmail(mailer => {
            let message = mailer.getEmailMessagesSent().find(m => m.email === 'reject@email.fr');
            assert.strictEqual(message.email, 'reject@email.fr');
            assert.strictEqual(message.parameters.subject, 'Pôle Emploi - Avis signalé dans votre Espace Anotéa');
        });
    });

    it('can not validate an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345', codeRegion: '44' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/validate`)
        .send({ qualification: 'positif' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can not validate an avis when logged as financeur', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/validate`)
        .send({ qualification: 'positif' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 403);
        assert.deepStrictEqual(response.body, {
            error: 'Forbidden',
            message: 'Action non autorisé',
            statusCode: 403,
        });
    });

    it('can reject an avis (injure)', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/reject`)
        .send({ qualification: 'injure' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.status, 'rejected');
        assert.deepStrictEqual(response.body.qualification, 'injure');
        assert.ok(response.body.lastStatusUpdate);

        return checkEmail(mailer => {
            let message = mailer.getLastEmailMessageSent();
            assert.strictEqual(message.email, 'henri@email.fr');
            assert.strictEqual(message.parameters.subject, 'Rejet de votre avis sur votre formation Développeur à INSTITUT DE FORMATION');
        });
    });

    it('can reject an avis (alerte)', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/reject`)
        .send({ qualification: 'alerte' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.status, 'rejected');
        assert.deepStrictEqual(response.body.qualification, 'alerte');
        assert.ok(response.body.lastStatusUpdate);
        return checkEmail(mailer => {
            let message = mailer.getLastEmailMessageSent();
            assert.strictEqual(message.email, 'henri@email.fr');
            assert.strictEqual(message.parameters.subject, 'Nous avons bien pris en compte votre commentaire');
        });
    });

    it('can not reject an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '12345', codeRegion: '44' })),
            insertIntoDatabase('stagiaires', newStagiaire({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/reject`)
        .send({ qualification: 'injure' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can delete an avis', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('stagiaires', newStagiaire({ token: '123', avisCreated: true })),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '123' })),
        ]);

        let response = await request(app)
        .delete(`/api/backoffice/avis/${id}`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(await db.collection('avis').countDocuments({ _id: id }), 0);
        let stagiaire = await db.collection('stagiaires').findOne({ token: '123' });
        assert.strictEqual(stagiaire.avisCreated, false);
    });

    it('can delete an avis and resend email', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('stagiaires', newStagiaire({ token: '1234' })),
            insertIntoDatabase('avis', newAvis({ _id: id, token: '1234' })),
        ]);

        let response = await request(app)
        .delete(`/api/backoffice/avis/${id}?sendEmail=true`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        let db = await getTestDatabase();
        let count = await db.collection('avis').countDocuments({ _id: id });
        assert.strictEqual(count, 0);

        return checkEmail(mailer => {
            let message = mailer.getLastEmailMessageSent();
            assert.strictEqual(message.email, 'henri@email.fr');
        });
    });

    it('can not delete an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, codeRegion: '44' })),
        ]);

        let response = await request(app)
        .delete(`/api/backoffice/avis/${id}`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can un/mask title', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.commentaire.titleMasked, true);

        response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.commentaire.titleMasked, false);
    });

    it('can not un/mask title of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('avis', newAvis({ _id: id, codeRegion: '44' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can not reject unknown avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${new ObjectID()}/reject`)
        .send({ qualification: 'alerte' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });
}));
