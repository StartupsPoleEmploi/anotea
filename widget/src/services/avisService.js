import { _get } from './http-client';

export const getOrganismesFormateurs = siret => _get(`/organismes-formateurs?siret=${siret}&notes_decimales=true`);

export const getAvis = siret => _get(`/avis?organisme_formateur=${siret}&notes_decimales=true`);

export const getActions = numeroAction => _get(`/actions?numero=${numeroAction}&notes_decimales=true`);

export const getFormations = id => _get(`/formations?id=${id}&notes_decimales=true`);
