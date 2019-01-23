/* global fetch */
import { getToken } from '../utils/token';
const baseUrl = '/api';

export const updatePassword = (actualPassword, password, id, profile) => {
    return fetch(`${baseUrl}/backoffice/account/updatePassword`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
            actualPassword,
            password,
            id,
            profile
        })
    }).then(response => response.json());
};
