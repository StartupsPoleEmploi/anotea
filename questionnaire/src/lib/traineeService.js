import { _get } from '../utils/http-client';

export const getTraineeInfo = token => _get(`/questionnaire/${token}/start`);
