/* global ga */
(function() {

    var trackingId = 'UA-138038381-1';

    var loadGoogleAnalytics = function() {
        /* eslint-disable */
        // @formatter:off
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        // @formatter:on
        /* eslint-enable */

        ga('set', 'anonymizeIp', true);
        ga('create', trackingId);
        ga('send', 'pageview');
    };

    var showCookiePopup = function() {
        var message = 'Nous utilisons des cookies pour réaliser des statisques anonymes en vue d\'améliorer le site.';
        var style = 'position: fixed; right: 10px; bottom:10px; background-color:#E8E8E8;border-radius:5px;text-align:center;padding:10px;padding-right: 25px;font-size:1rem;';
        var links = '<a href="/cgu#donnees-personnelles">En savoir plus</a>';
        $(document).ready(function() {
            $('body').append('<div style="' + style + '">' + message + '<br/>' + links + '<div style="position:absolute;top:0;right:5px;">x</div>' + '.</div>');
        });
    };

    var getCookie = function(name) {
        var pairs = document.cookie.split(';');
        var cookies = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            cookies[(pair[0] + '').trim()] = unescape(pair.slice(1).join('='));
        }
        return cookies[name];
    };

    var deleteCookie = function(name) {
        document.cookie = name + '=; Path=/; Domain=.' + document.location.host + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    var installAPI = function() {
        window.rgpd = window.rgpd || {};
        window.rgpd.optout = function() {
            window['ga-disable-' + trackingId] = true;
            deleteCookie('_ga');
        };
    };

    var getRGPDMaxLifespan = function() {
        var _13months = new Date();
        _13months.setMonth(_13months.getMonth() + 13);
        return _13months;
    };

    var getGoogleAnalyticsData = function() {
        var cookie = getCookie('_ga');
        if (!cookie) {
            return null;
        }

        var values = cookie.split('.');
        var creationDate = new Date(values[3] * 1000);
        return {
            values: values,
            creationDate: creationDate,
            expired: creationDate > getRGPDMaxLifespan()
        };
    };

    var data = getGoogleAnalyticsData();
    if (!data || data.expired) {
        deleteCookie('_ga');
        showCookiePopup();
    }

    loadGoogleAnalytics();
    installAPI();
})();
