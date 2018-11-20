const { sanitize } = require('../../components/userInput');
const s = require('string');

const fixData = data => sanitize(s(data).unescapeHTML().replaceAll('\\', ''));

module.exports = { fixData };
