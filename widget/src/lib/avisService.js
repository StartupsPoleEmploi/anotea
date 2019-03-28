import { _get } from '../utils/http-client';

export const getOrganismeStats = siret => _get(`/organismes-formateurs?siret=${siret}`);

export const getOrganismeAvis = siret => _get(`/avis?organisme_formateur=${siret}`);

export const getActionFormationStats = numeroAction => _get(`/actions?numero=${numeroAction}`);
