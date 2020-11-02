import { log } from '../../../backoffice/utils/logger';

export const initialize = (isProduction = false) => {
    log(`Tag Commander isProduction=${isProduction}`);

    const script = document.createElement('script');
    if (!isProduction) {
      script.src = 'https://cdn.tagcommander.com/5220/uat/tc_zen_31.js';
    } else {
      script.src = 'https://cdn.tagcommander.com/5220/tc_zen_31.js';
    }
    script.async = true;
    document.body.appendChild(script);
};