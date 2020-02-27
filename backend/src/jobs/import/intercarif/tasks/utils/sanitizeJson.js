const _ = require('lodash');
const md5 = require('md5');

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

module.exports = json => {

    let document = _.cloneDeepWith(json, value => {
        if (value && typeof value === 'object') {
            Object.keys(value).forEach(key => {

                if (excludedProperties.includes(key)) {
                    delete value[key];
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

    return {
        ...document,
        md5: md5(JSON.stringify(document)),
        _meta: {
            certifinfos: document.certifications ? document.certifications.map(c => c.code_certifinfo) : [],
            formacodes: document.domaine_formation.code_formacodes ?
                document.domaine_formation.code_formacodes.map(c => c._value) : [],
        },
    };
};
