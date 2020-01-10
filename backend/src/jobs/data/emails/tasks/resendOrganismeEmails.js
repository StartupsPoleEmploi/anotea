const { writeObject, ignoreFirstLine, pipeline, parseCSV } = require('../../../../core/utils/stream-utils');
const sendActivationCompteEmails = require('../../../mailing/organismes/account/tasks/sendActivationCompteEmails');
const ForceAction = require('../../../mailing/organismes/account/tasks/actions/ForceAction');

module.exports = async (db, logger, emails, stream) => {

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    await pipeline([
        stream,
        parseCSV({
            delimiter: '|',
            quote: '',
            columns: [
                'Siret',
                'Nom',
                'Email Anotea',
                'Nombre Avis',
                'Email Kairos',
            ],
        }),
        ignoreFirstLine(),
        writeObject(async record => {
            try {
                stats.total++;
                let siret = record['Siret'];

                let organisme = await db.collection('accounts').findOne({ 'meta.siretAsString': siret });
                if (!organisme) {
                    stats.unknown++;
                    return;
                }

                await sendActivationCompteEmails(db, logger, emails, new ForceAction(), {
                    siret,
                    limit: 10000,
                    delay: 100,
                });
                stats.sent++;
            } catch (e) {
                stats.invalid++;
                logger.error(`Organisme email cannot be sent`, record, e);
            }
        }, { parallel: 25 })
    ]);

    return stats;
};

