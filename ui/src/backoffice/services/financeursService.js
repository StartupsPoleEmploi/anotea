import { _get } from '../../common/utils/http-client';

export const getFinanceurs = () => {
    return _get(`/backoffice/financeurs`);
};

export const getDispositifs = () => {
    return [
        { code: '41C', libelle: '41C' },
        { code: '41N', libelle: '41N' },
        { code: 'AFC', libelle: 'Action de Formation Conventionnée' },
        { code: 'AFPR', libelle: 'Action de Formation Préalable au Recrutement' },
        { code: 'AGEFIPH', libelle: `Association de gestion du fonds pour l'insertion professionnelle des personnes handicapées` },
        { code: 'AIF', libelle: 'Aide Individuelle à la Formation' },
        { code: 'Autres_AFC', libelle: 'Autres_AFC' },
        { code: 'AUTRES', libelle: 'AUTRES' },
        { code: 'BEN', libelle: 'BEN' },
        { code: 'CR', libelle: 'Conseil régional' },
        { code: 'ETAT', libelle: 'ETAT' },
        { code: 'FOAD', libelle: 'FOAD' },
        { code: 'OPCA', libelle: 'OPCA' },
        { code: 'POEC_OPCA', libelle: 'POEC_OPCA' },
        { code: 'POEI_MONO', libelle: 'POEI_MONO' },
    ];
};
