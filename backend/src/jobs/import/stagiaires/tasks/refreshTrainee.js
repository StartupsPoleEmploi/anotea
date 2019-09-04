const fs = require('fs');
const parse = require('csv-parse');
const { writeObject, pipeline, ignoreFirstLine } = require('../../../../common/utils/stream-utils');

module.exports = async (db, logger, file, handler) => {

    let stats = {
        updated: 0,
        invalid: 0,
        total: 0,
    };

    let refresh = async (trainee, record) => {

        let newTrainee = handler.rebuildTrainee(trainee, record);
        if (JSON.stringify(trainee) !== JSON.stringify(newTrainee)) {
            newTrainee.meta = newTrainee.meta || {};
            newTrainee.meta.refreshed = [...(newTrainee.meta.refreshed || []), new Date()];
        }

        await db.collection('trainee').replaceOne({ token: trainee.token }, newTrainee);
        await db.collection('comment').updateOne(
            { token: trainee.token },
            {
                $set: {
                    //TODO reuse code in questionnaire-routes.buildAvis
                    campaign: newTrainee.campaign,
                    formacode: newTrainee.training.formacode,
                    idSession: newTrainee.training.idSession,
                    training: newTrainee.training,
                    codeRegion: newTrainee.codeRegion,
                },
                $push: {
                    'meta.refreshed': new Date(),
                }
            }
        );
    };

    await pipeline([
        fs.createReadStream(file),
        parse(handler.csvOptions),
        ignoreFirstLine(),
        writeObject(async record => {
            stats.total++;

            let trainee = await db.collection('trainee').findOne({
                'trainee.email': record['c_adresseemail'].toLowerCase(),
                'training.infoCarif.numeroSession': record['dc_numeroicsession'],
            });

            if (!trainee) {
                return Promise.resolve();
            }

            return refresh(trainee, record)
            .catch(e => {
                stats.invalid++;
                logger.error(e);
            });
        }, { parallel: 100 }),
    ]);

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
