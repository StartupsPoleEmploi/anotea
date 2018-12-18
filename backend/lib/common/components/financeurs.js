const financeurs = {
    '0': 'Autre',
    '1': 'Code(s) obsolète(s)',
    '10': 'Bénéficiaire de l\'action',
    '11': 'Etat - Ministère chargé de l\'emploi',
    '12': 'Etat - Ministère de l\'éducation nationale',
    '13': 'Etat - Autre',
    '14': 'Fonds européens - Autre',
    '15': 'Collectivité territoriale - Autre',
    '16': 'OPCA',
    '17': 'OPACIF',
    '2': 'Collectivité territoriale - Conseil régional',
    '3': 'Fonds européens - FSE',
    '4': 'Pôle emploi',
    '5': 'Entreprise',
    '6': 'ACSÉ (anciennement FASILD)',
    '7': 'AGEFIPH',
    '8': 'Collectivité territoriale - Conseil général',
    '9': 'Collectivité territoriale - Commune',
};

module.exports = {
    findLabelByCodeFinanceur: code => financeurs[code],
};
