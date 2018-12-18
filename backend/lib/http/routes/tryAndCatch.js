module.exports = callback => {
    return async (req, res, next) => {
        try {
            await callback(req, res, next);
        } catch (e) {
            return next(e);
        }
    };
};
