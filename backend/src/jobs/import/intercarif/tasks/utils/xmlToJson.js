const util = require('util');
const xml2js = require('xml2js');

let sanitizeXmlNames = name => name.replace(/-/g, '_').toLowerCase();
let parser = new xml2js.Parser({
    attrkey: '_attributes',
    charkey: '_value',
    explicitArray: false,
    explicitRoot: false,
    tagNameProcessors: [sanitizeXmlNames],
    attrNameProcessors: [sanitizeXmlNames],
});

module.exports = util.promisify(parser.parseString);
