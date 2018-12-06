const assert = require('assert');
const _ = require('lodash');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newComment, newOrganismeResponsable } = require('../../../../helpers/data/dataset');
const generateOrganismesFormateurs = require('../../../../../jobs/import/organismes/generateOrganismesFormateurs');

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

        await insertIntoDatabase('organismes_responsables', newOrganismeResponsable({ organismes_formateurs: getOrganismesFormateurs() }));

        await generateOrganismesFormateurs(db);

        let organisme = await db.collection('organismes_formateurs').findOne();
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
            score: {
                nb_avis: 0
            }
        });
    });


    it('should compute score', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            insertIntoDatabase('organismes_responsables', newOrganismeResponsable({ organismes_formateurs: getOrganismesFormateurs() })),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            }))
        ]);


        await generateOrganismesFormateurs(db);

        let organisme = await db.collection('organismes_formateurs').findOne();
        assert.deepEqual(organisme.score, {
            nb_avis: 1,
            notes: {
                accompagnement: 1,
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                global: 2,
                moyen_materiel: 2,
            }
        });
    });

    it('should ignore same organismes formateurs', async () => {

        let db = await getTestDatabase();

        await insertIntoDatabase('organismes_responsables', newOrganismeResponsable({
            siret: '11111111111111',
            organismes_formateurs: getOrganismesFormateurs({ siret: '22222222222222' })
        }));
        await insertIntoDatabase('organismes_responsables', newOrganismeResponsable({
            siret: '33333333333333'
        }));

        await generateOrganismesFormateurs(db);

        let organisme = await db.collection('organismes_formateurs').findOne({ siret: '22222222222222' });
        assert.ok(organisme);
    });

    it('should create indexes', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            insertIntoDatabase('organismes_responsables', newOrganismeResponsable()),
        ]);

        await generateOrganismesFormateurs(db);

        let indexes = await db.collection('organismes_formateurs').indexInformation();
        assert.deepEqual(indexes, {
            '_id_': [['_id', 1]],
            'siret_1': [['siret', 1]],
            'numero_1': [['numero', 1]],
            'score.nb_avis_1': [['score.nb_avis', 1]],
        });
    });
}));
