let isEnabled;

export const initialize = id => {

    isEnabled = !!id;
    console.log(`Hotjar enabled=${isEnabled}`);

    if (!isEnabled) {
        return;
    }
    /* eslint-disable */
    // @formatter:off
    (function(h, o, t, j, a, r) {
        h.hj = h.hj || function() {
            (h.hj.q = h.hj.q || []).push(arguments)
        };
        h._hjSettings = { hjid: id, hjsv: 5 };
        a = o.getElementsByTagName("head")[0];
        r = o.createElement("script");
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
    })(window, document, "//static.hotjar.com/c/hotjar-", ".js?sv=");
    // @formatter:on
    /* eslint-enable */
};
