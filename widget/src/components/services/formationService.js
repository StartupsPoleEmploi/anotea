import { _get } from '../../utils/http-client';

export const getFormation = numero => _get(`/api/v1/formations/${numero}&notes_decimales=true`);

export const getAction = numero => _get(`/api/v1/actions/${numero}&notes_decimales=true`);

export const getSession = numero => _get(`/api/v1/sessions/${numero}&notes_decimales=true`);

