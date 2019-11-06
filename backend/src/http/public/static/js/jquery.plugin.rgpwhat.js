/*!
 * jQuery InfoCookie becomes RgpWhat Plugin v2.0 for RGPD consent
 *
 * Copyright 2015 - 2020 by sreg
 * Released under the MIT license
 * Options:
 *  - class: set class for the cookie notice bar (default "cookie-notice")
 *  - LoadCss: load default css rgpwhat/rgpwhat.css. Maybe false to load nothing.
 *  - delay: set delay before to appear (default 1000ms)
 *  - cookieDuration: define the max duration (in month) before to appear a new bar if it was first accepted (default 12 months)
 *  - cookieName: the cookie name to remember the acceptation (default "rgpwhat")
 *  - position: "top" or "bottom" -> defines the position of the bar at the top of the screen or at the bottom (default "top")
 *  - fixed: boolean (default true). If false, css position = "relative". If true css position = "absolute"
 *  - validateFollow: true/false -> is equal to a click on "ok" on first document click (default true). A false value specifies a click to button "ok" as mandatory
 *  - consent: array of specifics cookies (optional)
 *
 * Example: (Attention to mandatory tags)
 *  - $.rgpWhat('Les cookies assurent le bon fonctionnement de nos services. En utilisant ces derniers, vous acceptez l\'utilisation des cookies. <a href="" target="_blank">En savoir plus</a>.',
 *    {
 *       class: "rgpwhat"
 *       "consent": [
 *         {
 *             title: "hotjar", //Mandatory
 *             description: "Service de feedback", //Usefull
 *             key: "hotjar", //Mandatory
 *             callbackAccepted: function() { //Optionnal
 *                 alert('callback accept hotjar');
 *             },
 *             callbackDenied: function() { //Optionnal
 *                 alert('callback denied hotjar');
 *             }
 *         },
 *         {
 *             title: "Google Analytics",
 *             description: "Service google de statistiques de trafic",
 *             key: "ga",
 *             callbackAccepted: function() {
 *                 alert('callback accept ga');
 *             },
 *             callbackDenied: function() {
 *                 alert('callback denied ga');
 *             }
 *         }
 *     ],
 *     "position": "top",
 *     "fixed": false
 *   });
 *
 * Css sample :
 * 
 * .rgpwhat {background-color: rgba(33,33,33,0.9); color: white; text-align: center; line-height: 2.5em; padding: 2px; vertical-align: middle; position: relative; top: 0;}
 * .rgpwhat .consent-list {background-color: black; padding: 1em; width: 100%;}
 * .rgpwhat .consent-list .all-cookies-choice {width: 50%; margin: auto;}
 * .rgpwhat .consent-list .cookie-choice {width: 50%; margin: auto; display: flex; flex-direction: row; align-items: center; border-bottom: 1px solid grey;}
 * .rgpwhat .consent-list .cookie-choice .explanations {text-align: left; flex: 2;}
 * .rgpwhat .consent-list .cookie-choice .explanations .title {font-size: 1.5em; font-weight: bold;}
 * .rgpwhat .consent-list .cookie-choice .explanations .description {line-height: 1em;}
 * .rgpwhat .consent-list .cookie-choice .buttons {flex: 1; text-align: right;}
 * .rgpwhat .consent-list .cookie-choice .buttons .accept, .rgpwhat .consent-list .cookie-choice .buttons .deny {color: white;}
 * .rgpwhat .consent-list button {background-color: #f00; line-height: 2.2em; margin-top: 2px; opacity: .9;}
 * .rgpwhat .consent-list button:hover {opacity: 1;}
 * .rgpwhat .consent-list button.selected {background-color: #1BD2A4;}
 * .rgpwhat button, .rgpwhat input[type=button] {color: white; background-color: #1BD2A4; border-radius: 5px; border: 0; padding: 0 20px; margin-left: 10px;}
 *
 * Change since v1
 * - authorize cookieDuration to 0
 * Since v2
 * - Add multi-cookie choice
 * - Add callbacks
 * - Add locales
 */
(function($) {
	$.infoCookie=$.rgpWhat=function(text,options) {
		var className="rgpwhat";
		var cookieName="rgpwhat";
		var delay=1000;
		var cookieDuration=12;
		var position="top";
		var fixed=true;
		var consentOptions=true;
		var forceDisplay=false;
		var div=false;
		var version="2";
		var loadCss="";
		var locale={
			'ok': 'Ok',
			'notOk': 'Interdire',
			'choice': 'Choisir mes cookies',
			'acceptAll': 'Autoriser tous les cookies',
			'denyAll': 'Interdire tous les cookies',
			'accept': 'Autoriser',
			'deny': 'Interdire'
		};
		if(typeof options!=="undefined") {
			if(typeof options.class!=="undefined") className=options.class;
			if(typeof options.delay!=="undefined") delay=options.delay;
			if(typeof options.cookieDuration!=="undefined") cookieDuration=options.cookieDuration;
			if(typeof options.cookieName!=="undefined") cookieName=options.cookieName;
			if(typeof options.position!=="undefined") position=options.position;
			if(typeof options.fixed!=="undefined") fixed=options.fixed;
			if(typeof options.forceDisplay!=="undefined") forceDisplay=options.forceDisplay;
			if(typeof options.loadCss!=="undefined") loadCss=options.loadCss;
			if(typeof options.locale!=="undefined") {
				var loc=options.locale;

				if(typeof loc.ok!=="undefined") locale.ok=loc.ok;
				if(typeof loc.notOk!=="undefined") locale.notOk=loc.notOk;
				if(typeof loc.choice!=="undefined") locale.choice=loc.choice;
				if(typeof loc.acceptAll!=="undefined") locale.acceptAll=loc.acceptAll;
				if(typeof loc.denyAll!=="undefined") locale.denyAll=loc.denyAll;
				if(typeof loc.accept!=="undefined") locale.accept=loc.accept;
				if(typeof loc.deny!=="undefined") locale.deny=loc.deny;
			}
		}
		if(typeof options.consent!=="undefined") {
			consentOptions=options.consent; //JSON.parse(JSON.stringify(options.consent));
		}

		var loadCssFile=function(name) {
			if(typeof name==="boolean")
				if(name==false) return;
				else name="";

			var src="";

			if(name==="") {
				src="/css/jquery/rgpwhat/rgpwhat.css";
			} else {
				src=name;
			}

			var link=document.createElement('link');
			link.rel='stylesheet';
			link.type='text/css';
			link.href=src+"?v="+version;
			document.getElementsByTagName('head')[0].appendChild(link);
		}

		var getCookie=function(name) {
			var cookies=[];
			document.cookie.split(/; +/g).forEach(function(a) {
				a.replace(/^(.*?)=(.*)$/,function(s,a,b) {
					cookies[a]=b;
					return s;
				});
			});
			return cookies[name];
		}

		var setCookie=function(cookieName,cookieValue,cookieDuration) {
			var date=new Date();
			date.setMonth(date.getMonth()+cookieDuration);
			document.cookie=cookieName+'='+cookieValue+'; expires='+date.toUTCString()+'; path=/';
		};

		var setButtonClass=function(e) {
			var value=e.value;

			if(value) {
				e.accept.addClass('selected');
				e.denied.removeClass('selected');
			} else {
				e.denied.addClass('selected');
				e.accept.removeClass('selected');
			}
		}

		var saveCookieConsent=function(cookieName,consentOptions) {
			var response=consentOptions;

			if(typeof consentOptions!=='boolean') {
				var json=[];
				consentOptions.forEach(function(e) {
					json.push({"key": e.key,"value": typeof e.value!=="undefined"?e.value:false});
				});
				response=JSON.stringify(json);
			}
			setCookie(cookieName,response,cookieDuration);
		}

		var autoSelectButtons=function(consentOptions) {
			consentOptions.forEach(function(e) {
				setButtonClass(e);
			});
		}

		var saveConsent=function(key,value) {
			var list=[];
			consentOptions.forEach(function(e) {
				if(key===null) {
					e.value=value;
				} else if(key==e.key) {
					e.value=value;
				}
				list.push({"key": e.key,"value": e.value});
			});
			autoSelectButtons(consentOptions);
			saveCookieConsent(cookieName,consentOptions);
		}

		var runCallback=function(e) {
			if(e.value===true) {
				if(typeof e.callbackAccepted!=="undefined")
					e.callbackAccepted(e);
			} else {
				if(typeof e.callbackDenied!=="undefined")
					e.callbackDenied(e);
			}
		}

		var runCallbacks=function(consentOptions) {
			/* Le cookie existe, on execute les callback */
			if(Array.isArray(consentOptions))
				consentOptions.forEach(function(e) {
					runCallback(e);
				});
		}
		/***************/
		

		var display=function(consentOptions,text,className,position,fixed) {
			loadCssFile(loadCss);

			var div=$(document.createElement("div"));
			var doc=$('<div>').addClass('consent-list').css('display','none');

			div.css({"display":"none","width":"100%","position":fixed?"fixed":"relative","zIndex":"255","left":"0"})
			   .addClass(className);
			if(position=="top") div.css("top","0"); else div.css("bottom","0");
			div.html(text);

			$('<button>'+locale.ok+'</button>').appendTo(div).click(function() {
				saveCookieConsent(cookieName,consentOptions);
				runCallbacks(consentOptions);
				div.slideUp();
			});
			if(Array.isArray(consentOptions)) {
				$('<button>'+locale.choice+'</button>').appendTo(div).click(function() {
					doc.slideToggle();
				});
			
				var row=$('<div>').addClass('all-cookies-choice').appendTo(doc);

				var buttonAcceptAll=$(document.createElement("button")).addClass('accept').html(locale.acceptAll).click(function() {
					$(this).addClass('selected');
					buttonDenyAll.removeClass('selected');
					saveConsent(null,true);
				}).appendTo(row);
				var buttonDenyAll=$(document.createElement("button")).addClass('deny').html(locale.denyAll).click(function() {
					$(this).addClass('selected');
					buttonAcceptAll.removeClass('selected');
					saveConsent(null,false);
				}).appendTo(row);

				/* Ajoute chaque ligne de demande de consentement */
				consentOptions.forEach(function(e) {
					var row=$('<div>').addClass('cookie-choice');
					
					var col;
					col=$('<div>').addClass('explanations');
					col.html('<span class="title">'+e.title+'</span><p class="description">'+e.description+"</p>");
					col.appendTo(row);

					col=$('<div>').addClass('buttons');
					e.accept=$(document.createElement("button")).addClass('accept').html(locale.accept).click(function() {
						e.value=true;
						setButtonClass(e);
						saveCookieConsent(cookieName,consentOptions);
					}).appendTo(col);
					e.denied=$(document.createElement("button")).addClass('deny').html(locale.deny).click(function() {
						e.value=false;
						setButtonClass(e);
						saveCookieConsent(cookieName,consentOptions);
					}).appendTo(col);
					col.appendTo(row);

					row.appendTo(doc);
				});

				doc.appendTo(div);
			} else {
				$('<button>'+locale.notOk+'</button>').appendTo(div).click(function() {
					div.slideUp();
					consentOptions=false;
					runCallbacks(consentOptions);
					saveCookieConsent(cookieName,consentOptions);
				});
			}

			if(position=='bottom')
				div.appendTo("body");
			else
                $("body").prepend(div);
			return div;
		};

		/* Initialise les valeurs de chaque objet json représentant un cookie en spécifiant par "value" si le bouton est sur autorisé ou interdire */
		var initConsentOptions=function(consentCookie,consentOptions) {
			var jsonCookie=[];
			if(typeof consentCookie!=='undefined') {
				jsonCookie=JSON.parse(consentCookie);
			}

			if(typeof consentOptions!=="undefined") {
				var jsonOptions=consentOptions; //JSON.parse(JSON.stringify(consentOptions));

				//Initialisation aux valeurs par defaut
				jsonOptions.forEach(function(econsent) {
					econsent.value=(typeof econsent.default!=="undefined" && econsent.default=="accept")?true:false;
				});

				if(typeof jsonCookie!=="object") jsonCookie=[];
				jsonCookie.forEach(function(ecookie) {
					jsonOptions.forEach(function(eoptions) {
						if(eoptions.key==ecookie.key) {
							eoptions.value=ecookie.value;
						}
					});
				});
				return jsonOptions;
			}
		}
        console.log("div")
		var show=function() {
            console.log(div)
			if(div===false) {
				div=display(consentOptions,text,className,position,fixed);
			}
		}

		var consentCookie=getCookie(cookieName);

		if(typeof consentCookie!=="undefined") {
			if(typeof consentCookie==='boolean' && Array.isArray(consentOptions)) {
			}
		}
		initConsentOptions(consentCookie,consentOptions);


		if(typeof consentCookie==="undefined" || forceDisplay) {
			/* Le cookie n'existe pas, on demande le consentement */
			div=display(consentOptions,text,className,position,fixed);
			autoSelectButtons(consentOptions);
			if(delay) setTimeout(function() {div.slideDown("fast");},delay);
            else div.show();
            console.log(div.slideDown)
            div.slideDown("fast")
			return true;
		} else {
			//var div=display(consentOptions,text,className,position,fixed);
			//autoSelectButtons(consentOptions);
			//if(delay) setTimeout(function() {div.slideDown("fast");},delay);
			//else div.show();

			runCallbacks(consentOptions);
		}
		return false;
	};
})(jQuery);