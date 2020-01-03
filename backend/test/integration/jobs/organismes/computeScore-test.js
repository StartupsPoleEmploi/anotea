const _ = require("lodash");
const assert = require("assert");
const { withMongoDB } = require("../../../helpers/with-mongodb");
const { newOrganismeAccount, newModerateurAccount, newComment } = require("../../../helpers/data/dataset");
const logger = require("../../../helpers/components/fake-logger");
const computeOrganismesScore = require("../../../../src/jobs/organismes/tasks/computeScore");

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const prepareDatabase = () => {
        return Promise.all([
            insertIntoDatabase("comment", newComment({
                training: {
                    organisation: {
                        siret: "11111111111111",
                    },
                }
            })),
            insertIntoDatabase("comment", newComment({
                training: {
                    organisation: {
                        siret: "22222222222222",
                    },
                },
                rates: {
                    accueil: 1,
                    contenu_formation: 1,
                    equipe_formateurs: 1,
                    moyen_materiel: 1,
                    accompagnement: 1,
                    global: 1,
                },
            })),
            insertIntoDatabase("comment", newComment({
                training: {
                    organisation: {
                        siret: "22222222222222",
                    },
                },
                rates: {
                    accueil: 3,
                    contenu_formation: 3,
                    equipe_formateurs: 3,
                    moyen_materiel: 3,
                    accompagnement: 3,
                    global: 3,
                },
            })),
            insertIntoDatabase("comment", newComment({
                training: {
                    organisation: {
                        siret: "22222222222222",
                    },
                },
                rates: {
                    accueil: 3,
                    contenu_formation: 3,
                    equipe_formateurs: 3,
                    moyen_materiel: 3,
                    accompagnement: 3,
                    global: 3,
                },
            })),
        ]);
    };

    it("should compute rounded score", async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase("accounts", _.omit(newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                meta: {
                    siretAsString: "22222222222222"
                },
            }), ["score"])),
        ]);

        let stats = await computeOrganismesScore(db, logger);

        let doc = await db.collection("accounts").findOne({ SIRET: 22222222222222 });
        assert.deepStrictEqual(stats, {
            total: 1,
            updated: 1,
            invalid: 0,
        });
        assert.deepStrictEqual(doc.score, {
            nb_avis: 3,
            notes: {
                accompagnement: 2.3,
                accueil: 2.3,
                contenu_formation: 2.3,
                equipe_formateurs: 2.3,
                moyen_materiel: 2.3,
                global: 2.3,
            },
            aggregation: {
                global: {
                    max: 3,
                    min: 1,
                },
            }
        });
    });

    it("should not compute score for moderateur account", async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase("accounts", newModerateurAccount({
                courriel: "admin@pole-emploi.fr",
            })),
        ]);

        await computeOrganismesScore(db, logger);

        let doc = await db.collection("accounts").findOne({ courriel: "admin@pole-emploi.fr" });
        assert.deepStrictEqual(doc.score, undefined);
    });


    it("should use rejected avis to compute score", async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase("accounts", _.omit(newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                meta: {
                    siretAsString: "22222222222222"
                },
            })), ["score"]),
            insertIntoDatabase("comment", newComment({
                status: "rejected",
                rates: {
                    accueil: 0,
                    contenu_formation: 0,
                    equipe_formateurs: 0,
                    moyen_materiel: 0,
                    accompagnement: 0,
                    global: 0
                },
                training: {
                    organisation: {
                        siret: "22222222222222",
                    },
                }
            })),
        ]);

        await computeOrganismesScore(db, logger);

        let doc = await db.collection("accounts").findOne({ SIRET: 22222222222222 });
        assert.deepStrictEqual(doc.score, {
            nb_avis: 4,
            notes: {
                accompagnement: 1.8,
                accueil: 1.8,
                contenu_formation: 1.8,
                equipe_formateurs: 1.8,
                moyen_materiel: 1.8,
                global: 1.8,
            },
            aggregation: {
                global: {
                    max: 3,
                    min: 0,
                },
            }
        });
    });

    it("should give default score when no comments", async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase("accounts", _.omit(newOrganismeAccount({
                _id: 44444444444444,
                SIRET: 44444444444444,
                meta: {
                    siretAsString: "44444444444444"
                },
            })), ["score"]),
        ]);

        await computeOrganismesScore(db, logger);

        let doc = await db.collection("accounts").findOne({ SIRET: 44444444444444 });
        assert.deepStrictEqual(doc.score, {
            nb_avis: 0,
        });
    });
}));
