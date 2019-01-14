const assert = require('assert');
const _ = require('lodash');
const { withMongoDB } = require('../../../../../helpers/test-database');
const { newOrganismeResponsable } = require('../../../../../helpers/data/dataset');
const generateOrganismesFormateurs = require('../../../../../../src/jobs/import/organismes/generators/generateOrganismesFormateurs');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {


    it('should create collection with organismes formateurs', async () => {

        let db = await getTestDatabase();

        await insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable());

        await generateOrganismesFormateurs(db);

        let organisme = await db.collection('intercarif_organismes_formateurs').findOne();
        assert.ok(organisme._id);
        assert.deepEqual(_.omit(organisme, ['_id']), {
            siret: '22222222222222',
            numero: 'OF_XXX',
            raison_sociale: 'PE Formation',
            courriel: 'contact@poleemploi-formation.fr',
            lieux_de_formation: [
                {
                    nom: 'PE Formation',
                    adresse: {
                        code_postal: '37250',
                        ville: 'Veigné',
                        region: '24'
                    }
                }
            ],
        });
    });

    it('should ignore same organismes formateurs from two different organismes responsables', async () => {

        let db = await getTestDatabase();

        await insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable({
            siret: '11111111111111',
        }));
        await insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable({
            siret: '33333333333333'
        }));

        await generateOrganismesFormateurs(db);

        let count = await db.collection('intercarif_organismes_formateurs').countDocuments({ siret: '22222222222222' });
        assert.deepEqual(count, 1);
    });

    it('should ignore organismes formateurs with missing data', async () => {

        let db = await getTestDatabase();

        let responsable = newOrganismeResponsable();
        responsable.organisme_formateurs = [
            {
                _id: '0',
                siret: '0',
                numero: 'OF_XXX',
                raison_sociale: 'PE Formation',
                courriel: 'contact@poleemploi-formation.fr',
                lieux_de_formation: [
                    {
                        nom: 'PE Formation',
                        adresse: {
                            code_postal: '37250',
                            ville: 'Veigné',
                            region: '24'
                        }
                    }
                ]
            }
        ];
        await insertIntoDatabase('intercarif_organismes_responsables', responsable);

        await generateOrganismesFormateurs(db);

        let count = await db.collection('intercarif_organismes_formateurs').countDocuments({ siret: '0' });
        assert.deepEqual(count, 0);

        count = await db.collection('intercarif_organismes_formateurs').countDocuments({ siret: '44444444444444' });
        assert.deepEqual(count, 0);
    });
}));
