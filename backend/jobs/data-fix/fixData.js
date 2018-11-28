const { sanitize } = require('../../components/userInput');
const s = require('string');

module.exports = data => sanitize(s(data).unescapeHTML().replaceAll('\\', ''));
