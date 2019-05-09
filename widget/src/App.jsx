import { Component } from 'react';
import './widget/AnoteaWebComponent';
import 'whatwg-fetch';

class App extends Component {

    constructor() {
        super();
        window.WebComponents.waitFor(() => {
            // IE11 Polyfill
            if (!Array.prototype.fill) {
                Object.defineProperty(Array.prototype, 'fill', {
                    value: function (value) {

                        if (this == null) {
                            throw new TypeError('this is null or not defined');
                        }

                        var O = Object(this);

                        var len = O.length >>> 0;

                        var start = arguments[1];
                        var relativeStart = start >> 0;

                        var k = relativeStart < 0 ?
                            Math.max(len + relativeStart, 0) :
                            Math.min(relativeStart, len);

                        var end = arguments[2];
                        var relativeEnd = end === undefined ?
                            len : end >> 0;

                        var final = relativeEnd < 0 ?
                            Math.max(len + relativeEnd, 0) :
                            Math.min(relativeEnd, len);

                        while (k < final) {
                            O[k] = value;
                            k++;
                        }

                        return O;
                    }
                });
            }
            if (!String.prototype.repeat) {
                String.prototype.repeat = function (count) {
                  "use strict";
                  if (this == null)
                    throw new TypeError("ne peut convertir " + this + " en objet");
                  var str = "" + this;
                  count = +count;
                  if (count != count)
                    count = 0;
                  if (count < 0)
                    throw new RangeError("le nombre de répétitions doit être positif");
                  if (count == Infinity)
                    throw new RangeError("le nombre de répétitions doit être inférieur à l'infini");
                  count = Math.floor(count);
                  if (str.length == 0 || count == 0)
                    return "";
                  if (str.length * count >= 1 << 28)
                    throw new RangeError("le nombre de répétitions ne doit pas dépasser la taille de chaîne maximale");
                  var rpt = "";
                  for (var i = 0; i < count; i++) {
                    rpt += str;
                  }
                  return rpt;
                }
              }
            return import('./widget/AnoteaWebComponent');
        });
    }
}

export default App;
