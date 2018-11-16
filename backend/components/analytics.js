const MobileDetect = require('mobile-detect');

module.exports = {
    getDeviceType: userAgent => {
        const detector = new MobileDetect(userAgent);
        return {
            phone: detector.phone() !== null,
            tablet: detector.tablet() !== null,
            desktop: detector.phone() === null && detector.tablet() === null
        };
    }
};
