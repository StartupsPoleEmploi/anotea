const { sanitize } = require('../../http/routes/front/utils/userInput');
const s = require('string');

module.exports = data => sanitize(s(data).unescapeHTML().replaceAll('\\', ''));
