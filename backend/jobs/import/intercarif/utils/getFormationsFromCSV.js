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

const getRegionName = code => {
    let mapping = [
        { region: '32', name: 'Hauts-de-France' },
        { region: '44', name: 'Grand-Est' },
        { region: '27', name: 'Bourgogne-Franche-Comté' },
        { region: '84', name: 'Auvergne-Rhône-Alpes' },
        { region: '93', name: 'Provence-Alpes-Côte d\'Azur' },
        { region: '76', name: 'Occitanie' },
        { region: '75', name: 'Nouvelle-Aquitaine' },
        { region: '52', name: 'Pays-de-la-Loire' },
        { region: '53', name: 'Bretagne' },
        { region: '24', name: 'Centre-Val de Loire' },
        { region: '11', name: 'Île-de-France' },
        { region: '28', name: 'Normandie' },
        { region: '94', name: 'Corse' },
        { region: '04', name: 'La Réunion' },
        { region: '08', name: 'Nouvelle Calédonie' },
        { region: '06', name: 'Mayotte' },
        { region: '03', name: 'Guyane' },
        { region: '07', name: 'Polynésie française' },
        { region: '02', name: 'Martinique' },
        { region: '01', name: 'Guadeloupe' },
    ];
    return mapping.find(m => m.region === code).name;
};

const sanitizeJson = json => {
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
                    value.nom_region = getRegionName(value[key]);
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

module.exports = file => {
    let parseXml = buildXmlParser();

    return getFormationsAsXml(file)
    .flatMap(async xml => {
        let json = await parseXml(xml);
        return sanitizeJson(json);
    });
};
