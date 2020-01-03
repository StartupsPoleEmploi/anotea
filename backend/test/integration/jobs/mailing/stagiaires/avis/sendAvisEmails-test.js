const assert = require("assert");
const moment = require("moment");
const configuration = require("config");
const { withMongoDB } = require("../../../../../helpers/with-mongodb");
const { newTrainee, randomize } = require("../../../../../helpers/data/dataset");
const logger = require("../../../../../helpers/components/fake-logger");
const sendAvisEmails = require("../../../../../../src/jobs/mailing/stagiaires/avis/tasks/sendAvisEmails");
const SendAction = require("../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/SendAction");
const RetryAction = require("../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/RetryAction");
const ResendAction = require("../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/ResendAction");

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, createEmailMocks }) => {

    let getDummyAction = (selector = {}) => {
        return {
            getQuery: () => selector,
        };
    };

    it("should send email to trainee (DummyAction)", async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize("name")}@email.fr`;
        let action = getDummyAction({ _id: "1234" });
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: "1234",
                trainee: {
                    email: email,
                },
            })),
        ]);

        let results = await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        let emailMessagesSent = mailer.getEmailMessagesSent();
        assert.strictEqual(emailMessagesSent.length, 1);
        assert.strictEqual(emailMessagesSent[0].parameters.subject, "Pôle Emploi vous demande votre avis sur votre formation");
        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });

    it("should update trainee when mailer succeed", async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        let id = randomize("trainee");
        let action = getDummyAction();
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: id,
                trainee: {
                    email: `${randomize("name")}@email.fr`,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        let trainee = await db.collection("trainee").findOne({ _id: id });
        assert.ok(trainee.mailSent);
        assert.ok(trainee.mailSentDate);
        assert.deepStrictEqual(trainee.mailError, undefined);
        assert.deepStrictEqual(trainee.mailErrorDetail, undefined);
        assert.deepStrictEqual(trainee.mailRetry, 0);
    });

    it("should increase maxRetry when an email has already been sent", async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        let id = randomize("trainee");
        let action = getDummyAction();
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: id,
                mailRetry: 0,
                trainee: {
                    email: `${randomize("name")}@email.fr`,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        let trainee = await db.collection("trainee").findOne({ _id: id });
        assert.deepStrictEqual(trainee.mailRetry, 1);
    });

    it("should update trainee when mailer fails", async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks({ fail: true });
        let id = randomize("trainee");
        let action = getDummyAction();
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: id,
                trainee: {
                    email: `${randomize("name")}@email.fr`,
                },
            })),
        ]);

        try {
            await sendAvisEmails(db, logger, emails, action);
            assert.fail();
        } catch (e) {
            let trainee = await db.collection("trainee").findOne({ _id: id });
            assert.ok(trainee.mailSent);
            assert.deepStrictEqual(trainee.mailError, "smtpError");
            assert.deepStrictEqual(trainee.mailErrorDetail, "Unable to send email");
            assert.deepStrictEqual(e, {
                total: 1,
                sent: 0,
                error: 1,
            });
        }
    });

    it("should send email to new trainee (SendAction)", async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize("name")}@email.fr`;
        let action = new SendAction(configuration);
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: randomize("trainee"),
                codeRegion: "11",
                sourceIDF: null,
                mailSent: false,
                unsubscribe: false,
                trainee: {
                    email: email,
                },
            })),
            insertIntoDatabase("trainee", newTrainee({
                codeRegion: "11",
                sourceIDF: null,
                mailSent: false,
                unsubscribe: true,
                trainee: {
                    email: "not-sent@trainee.org",
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });

    it("should ignore region (SendAction", async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                codeRegion: "XX",
                sourceIDF: null,
                mailSent: false,
                unsubscribe: false,
            })),
        ]);
        let action = new SendAction(configuration, {
            codeRegions: ["11"]
        });

        await sendAvisEmails(db, logger, emails, action);

        assert.strictEqual(mailer.getEmailMessagesSent().length, 0);
    });

    it("should send email to trainee with smtp error (RetryAction)", async () => {

        let db = await getTestDatabase();
        let id = randomize("trainee");
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize("name")}@email.fr`;
        let action = new RetryAction(configuration);
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: id,
                codeRegion: "18",
                mailSent: true,
                unsubscribe: false,
                mailError: "smtpError",
                mailErrorDetail: "An error occurred",
                mailRetry: 0,
                trainee: {
                    email: email,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });


    it("should resend email to trainee already contacted but without avis (ResendAction)", async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize("name")}@email.fr`;
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: randomize("trainee"),
                codeRegion: "18",
                mailSent: true,
                unsubscribe: false,
                avisCreated: false,
                mailRetry: 0,
                mailSentDate: moment().subtract("10", "days").toDate(),
                trainee: {
                    email: email,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });

    it("should not resend email to trainee with avis (ResendAction)", async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize("name")}@email.fr`;
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase("trainee", newTrainee({
                _id: randomize("trainee"),
                codeRegion: "18",
                mailSent: true,
                unsubscribe: false,
                avisCreated: true,
                mailRetry: 0,
                mailSentDate: moment().subtract("10", "days").toDate(),
                trainee: {
                    email: email,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailMessagesSent(), []);
    });
}));
