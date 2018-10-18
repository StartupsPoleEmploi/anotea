module.exports = function(db, logger, configuration) {

    const MobileDetect = require('mobile-detect');
    const redis = require('redis');
    const crypto = require('crypto');

    const redisClient = redis.createClient(configuration.redis.port, configuration.redis.host);

    redisClient.on('error', function(err) {
        logger.error(err);
    });

    const getDeviceType = function(userAgent) {
        const md = new MobileDetect(userAgent);

        return {
            phone: md.phone() !== null,
            tablet: md.tablet() !== null,
            desktop: md.phone() === null && md.tablet() === null
        };
    };

    const getKey = function(_id, userAgent) {
        const hash = crypto.createHmac('sha256', configuration.security.secret)
        .update(userAgent)
        .digest('hex');

        return 'trainee.' + _id + '.UserAgent.' + hash;
    };

    const updateTrainee = function(trainee, userAgent) {
        if (trainee.deviceTypes === undefined) {
            trainee.deviceTypes = {
                phone: 0,
                tablet: 0,
                desktop: 0
            };
        }
        let currentDeviceType = getDeviceType(userAgent);
        trainee.deviceTypes.phone += currentDeviceType.phone ? 1 : 0;
        trainee.deviceTypes.tablet += currentDeviceType.tablet ? 1 : 0;
        trainee.deviceTypes.desktop += currentDeviceType.desktop ? 1 : 0;

        return trainee;
    };

    const buildDeviceTypesHistory = function(trainee, request) {
        const userAgent = request.headers['user-agent'];
        const key = getKey(trainee._id, userAgent);

        redisClient.get(key, (err, value) => {
            if (!err && value < new Date().getTime() - configuration.analytics.sessionDuration) {
                db.collection('trainee').save(updateTrainee(trainee));
                redisClient.set(key, new Date().getTime());
            }
        });
    };

    return {
        getDeviceType: getDeviceType,
        buildDeviceTypesHistory: buildDeviceTypesHistory
    };
};
