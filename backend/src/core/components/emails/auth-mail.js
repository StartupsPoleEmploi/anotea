const { URLSearchParams } = require('url');
const fetch = require('node-fetch').default;
const { badRequest } = require('@hapi/boom');

module.exports = (configuration) => {

  let token;
  let timeLastToken = 0;
  const tenMinutesInMs = 1000 * 60 * 10;

  const encodedParams = new URLSearchParams();
  encodedParams.set('client_id', configuration.ftmail.client_id);
  encodedParams.set('client_secret', configuration.ftmail.client_secret);
  encodedParams.set('scope', configuration.ftmail.scope);
  encodedParams.set('grant_type', 'client_credentials');

  const url = `${configuration.ftmail.endpoint}/access_token?realm=%2Fpartenaire`;
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: encodedParams
  };

  const getTokenSendMail = async () => {
    if (token && ((new Date()).getTime() - timeLastToken) < tenMinutesInMs) {
      //keep token in memory for 10 minutes
      return token;
    }
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      token = data.access_token;
      timeLastToken = (new Date()).getTime();
      return token;
    } else {
      throw badRequest(`could not send mail`);
    }
  }

  return {
    getTokenSendMail,
  }
}