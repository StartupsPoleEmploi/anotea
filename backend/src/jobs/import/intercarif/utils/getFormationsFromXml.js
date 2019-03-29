const _ = require('lodash');
const util = require('util');
const Rx = require('rxjs');
const linebyline = require('linebyline');
const xml2js = require('xml2js');
const md5 = require('md5');

const getFormationsAsXml = file => {
    return Rx.Observable.create(observer => {
        const rl = linebyline(file);
        rl.on('line', line => observer.next(line));
        rl.on('error', err => observer.error(err));
        rl.on('close', () => observer.complete());
    })
    .scan((acc, line) => {
        acc.partial = true;
        if (line.startsWith('<formation')) {
            acc.xml = line;
        } else {
            acc.xml += line;
        }

        if (line.startsWith('</formation')) {
            acc.partial = false;
        }

        return acc;

    }, { xml: '', partial: true })
    .filter(acc => !acc.partial)
    .map(acc => acc.xml);
};

const buildXmlParser = () => {
    let sanitizeXmlNames = name => name.replace(/-/g, '_').toLowerCase();
    let parser = new xml2js.Parser({
        attrkey: '_attributes',
        charkey: '_value',
        explicitArray: false,
        explicitRoot: false,
        tagNameProcessors: [sanitizeXmlNames],
        attrNameProcessors: [sanitizeXmlNames],
    });
    return util.promisify(parser.parseString);
};

const getCodeRegion = (regions, codeINSEE) => {
    try {
        return regions.findRegionByCodeINSEE(codeINSEE).codeRegion;
    } catch (err) {
        return 'XX';
    }
};


const sanitizeJson = (json, regions) => {
    //According to lheo.xsd theses fields are the only ones with maxOccurs > 1. see http://lheo.gouv.fr/2.2/lheo.xsd
    let excludedProperties = ['extras'];
    const tagsWithMultipleOccurrences = [
        'code_formacode',
        'code_nsf',
        'code_rome',
        'code_formacode',
        'urlweb',
        'sous_module',
        'urlweb',
        'reference_module',
        'numtel',
        'urlweb',
        'code_public_vise',
        'session',
        'certification',
        'resume_offre',
        'numtel',
        'ligne',
        'resume_organisme',
        'certification',
        'action',
        'numtel',
        'ligne',
        'formation',
        'code_public_vise',
        'session',
        'date_information',
        'code_modalite_pedagogique',
        'organisme_financeur',
    ];

    let document = _.cloneDeepWith(json, value => {
        if (value && typeof value === 'object') {
            Object.keys(value).forEach(key => {

                if (excludedProperties.includes(key)) {
                    delete value[key];
                    return;
                }

                if (key === 'region') {
                    value.code_region = getCodeRegion(regions, value[key]);
                    return;
                }

                if (key === 'siret') {
                    // Sometimes siret are prefixed by 0
                    value[key] = `${parseInt(value[key], 10)}`;
                    return;
                }

                if (tagsWithMultipleOccurrences.includes(key) && value[key].constructor !== Array) {
                    value[`${key}s`] = [value[key]];
                    delete value[key];
                } else if (value[key].constructor === Array) {
                    value[`${key}s`] = value[key];
                    delete value[key];
                }
            });
        }
    });
    document._meta = {
        certifinfos: document.certifications ? document.certifications.map(c => c.code_certifinfo) : [],
        formacodes: document.domaine_formation.code_formacodes ?
            document.domaine_formation.code_formacodes.map(c => c._value) : [],
    };
    document.md5 = md5(JSON.stringify(document));
    return document;
};

module.exports = (file, regions) => {
    let parseXml = buildXmlParser();

    return getFormationsAsXml(file)
    .flatMap(async xml => {
        let json = await parseXml(xml);
        return sanitizeJson(json, regions);
    });
};
