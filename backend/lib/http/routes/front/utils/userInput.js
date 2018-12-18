const s = require('string');

module.exports = {

    sanitize: data => {
        // unescape HTML (if user copy/paste HTML entities)
        let sanitizedData = s(data).unescapeHTML().s;

        // remove HTML tags
        sanitizedData = s(sanitizedData).stripTags().s;

        // remove emoj
        sanitizedData = sanitizedData.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

        return sanitizedData;
    }
};
