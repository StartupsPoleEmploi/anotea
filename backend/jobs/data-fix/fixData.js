const { sanitize } = require('../../routes/front/utils/userInput');
const s = require('string');

module.exports = data => sanitize(s(data).unescapeHTML().replaceAll('\\', ''));
