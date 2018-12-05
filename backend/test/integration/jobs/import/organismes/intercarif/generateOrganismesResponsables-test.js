const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newComment } = require('../../../../../helpers/data/dataset');
const generateOrganismesResponsables = require('../../../../../../jobs/import/organismes/intercarif/generateOrganismesResponsables');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif, insertIntoDatabase }) => {

    it('should create collection with organismes responsables', async () => {

        let db = await getTestDatabase();
        await importIntercarif();

        await generateOrganismesResponsables(db);

        let organisme = await db.collection('intercarif_organismes_responsables').findOne();
        assert.deepEqual(organisme, {
            _id: '11111111111111',
            siret: '11111111111111',
            nom: 'Anotea Formation',
            numero: 'OR_XX_XXX',
            raison_sociale: 'Centre de formation Anotéa',
            adresse: {
                code_postal: '93100',
                region: '11',
                ville: 'Montreuil'
            },
            organisme_formateurs: [
                {
                    courriel: 'anotea.pe+paris@gmail.com',
                    lieux_de_formation: [{
                        nom: 'Anotea Formation Paris',
                        adresse: {
                            code_postal: '75019',
                            region: '11',
                            ville: 'Paris'
                        }
                    }],
                    raison_sociale: 'Anotea Formation Paris',
                    siret: '22222222222222',
                    numero: 'OF_XXX',
                },
            ],
            score: {
                nb_avis: 0,
            }
        });
    });

    it('should compute score', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: '11111111111111',
                    },
                }
            }))
        ]);

        await generateOrganismesResponsables(db);

        let organisme = await db.collection('intercarif_organismes_responsables').findOne();
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

}));
