import { log } from '../../../backoffice/utils/logger';

export const initialize = (isProduction = false) => {
    log(`Tag Commander isProduction=${isProduction}`);

    const script = document.createElement('script');
    if (!isProduction) {
      script.src = 'https://cdn.tagcommander.com/5375/uat/tc_Anotea_31.js';
    } else {
      script.src = 'https://cdn.tagcommander.com/5375/tc_Anotea_31.js';
    }
    script.async = true;
    document.body.appendChild(script);
};