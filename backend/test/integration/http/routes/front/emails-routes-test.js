const request = require("supertest");
const assert = require("assert");
const { withServer } = require("../../../../helpers/with-server");
const { newTrainee, newOrganismeAccount } = require("../../../../helpers/data/dataset");


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it("should update tracking informations in stagiaires", async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee({
            tracking: {
                firstRead: new Date(),
            }
        });
        await insertIntoDatabase("trainee", trainee);

        let response = await request(app).get(`/emails/stagiaires/${trainee.token}/track`);

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection("trainee").findOne({ token: trainee.token });

        assert.deepStrictEqual(trainee.token, result.token);
        assert.ok(result.tracking.firstRead);
        assert.ok(result.tracking.lastRead);
    });

    it("should update tracking informations in organismes", async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let account = newOrganismeAccount();
        await insertIntoDatabase("accounts", account);

        let response = await request(app).get(`/emails/organismes/${account.token}/track`);

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection("accounts").findOne({ token: account.token });

        assert.deepStrictEqual(account.token, result.token);
        assert.ok(result.tracking.firstRead);
    });

    it("can unsubscribe", async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee({
            tracking: {
                firstRead: new Date(),
            },
            unsubscribe: false,
        });
        await insertIntoDatabase("trainee", trainee);

        let response = await request(app).get(`/emails/stagiaires/${trainee.token}/unsubscribe`);

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection("trainee").findOne({ token: trainee.token });

        assert.ok(result.unsubscribe);
    });
}));
