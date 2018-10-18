module.exports = function() {

    /* Convert string to JS Date
       Example : '20150109' to 1st septembre 2015 */
    const buildDate = function(text) {
        if (text === undefined || text === '00000000') {
            return null;
        }

        return new Date(parseInt(text.substring(0, 4)), // year
            parseInt(text.substring(4, 6)), // month
            parseInt(text.substring(6, 8))); // day
    };

    return {
        buildDate: buildDate
    };
};
