import { _get } from '../../utils/http-client';
import queryString from 'query-string';

export const getOrganismesFormateur = async siret => {

    let [organisme, results] = await Promise.all([
        _get(`/api/v1/organismes-formateurs/${siret}?notes_decimales=true`),
        _get(`/api/v1/avis?${queryString.stringify({
            organisme_formateur: siret,
            notes_decimales: true,
            avec_commentaires_uniquement: true,
            items_par_page: 250,
        })}`)
    ]);

    return {
        score: organisme.score,
        results,
    };
};
