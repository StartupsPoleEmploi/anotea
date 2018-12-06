const assert = require('assert');
const _ = require('lodash');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newOrganismeResponsable } = require('../../../../../helpers/data/dataset');
const generateOrganismesFormateurs = require('../../../../../../jobs/import/organismes/intercarif/generateOrganismesFormateurs');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const getOrganismesFormateurs = () => {
        return [
            {
                _id: '22222222222222',
                siret: '22222222222222',
                numero: 'OF_XXX',
                raison_sociale: 'PE Formation',
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
    };

    it('should create collection with organismes formateurs', async () => {

        let db = await getTestDatabase();

        await insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable({ organismes_formateurs: getOrganismesFormateurs() }));

        await generateOrganismesFormateurs(db);

        let organisme = await db.collection('intercarif_organismes_formateurs').findOne();
        assert.ok(organisme._id);
        assert.deepEqual(_.omit(organisme, ['_id']), {
            siret: '22222222222222',
            numero: 'OF_XXX',
            raison_sociale: 'PE Formation',
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

    it('should ignore same organismes formateurs', async () => {

        let db = await getTestDatabase();

        await insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable({
            siret: '11111111111111',
            organismes_formateurs: getOrganismesFormateurs({ siret: '22222222222222' })
        }));
        await insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable({
            siret: '33333333333333'
        }));

        await generateOrganismesFormateurs(db);

        let organisme = await db.collection('intercarif_organismes_formateurs').findOne({ siret: '22222222222222' });
        assert.ok(organisme);
    });

    it('should create indexes', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            insertIntoDatabase('intercarif_organismes_responsables', newOrganismeResponsable()),
        ]);

        await generateOrganismesFormateurs(db);

        let indexes = await db.collection('intercarif_organismes_formateurs').indexInformation();
        assert.deepEqual(indexes, {
            '_id_': [['_id', 1]],
            'siret_1': [['siret', 1]],
            'numero_1': [['numero', 1]],
        });
    });
}));
