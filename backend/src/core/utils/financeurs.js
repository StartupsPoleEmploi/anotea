const financeurs = [
    { code: '0', label: `Autre` },
    { code: '2', label: `Conseil régional` },
    { code: '3', label: `Fonds Européens - FSE` },
    { code: '4', label: `Pôle Emploi` },
    { code: '5', label: `Entreprise` },
    { code: '7', label: `AGEFIPH` },
    { code: '9', label: `Collectivité territoriale - Commune` },
    { code: '10', label: `Bénéficiaire de l'action` },
    { code: '11', label: `Etat - Ministère chargé de l'emploi` },
    { code: '12', label: `Etat - Ministère de l'éducation nationale` },
    { code: '13', label: `Etat - Autre` },
    { code: '14', label: `Fonds Européens - Autre` },
    { code: '15', label: `Collectivité territoriale - Autre` },
    { code: '16', label: `OPCA` },
    { code: '17', label: `OPACIF` },
];

module.exports = {
    isPoleEmploi: code => code === '4',
    isConseilRegional: code => code === '2',
    getFinanceurs: () => financeurs,
};
