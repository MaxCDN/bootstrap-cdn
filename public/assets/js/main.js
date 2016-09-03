(function() {
    'use strict';

    window.tryIt = function (n) {
        window.location.search = 'theme=' + n;
    };

    window.toggleCode = function (el, name) {
        var wellContainer = document.querySelector('#' + name);
        var btnIcon = el.querySelector('span');

        if (wellContainer) {
            wellContainer.classList.toggle('hidden');
            btnIcon.classList.toggle('caret-open');
        }
    };

    (function () {
        var el = document.querySelectorAll('input[type="text"');

        if (el) {
            for (var i = 0, len = el.length; i < len; i++) {
                el[i].addEventListener('focus', function() {
                    this.select();
                });
                el[i].addEventListener('mouseup', function(a) {
                    a.preventDefault();
                });
            }
        }
    })();

    /* eslint func-style: 0 */
    (function(win, doc) {
        var init = function() {
            var script = doc.createElement('script');

            script.type = 'text/javascript';

            if (typeof script.setAttribute !== 'undefined') {
                script.setAttribute('async', 'async');
            }

            script.src = '//' + (win.location.protocol === 'https:' ? 's3.amazonaws.com/cdx-radar/' : 'radar.cedexis.com/') + '01-10956-radar10.min.js';
            doc.body.appendChild(script);
        };

        if (win.addEventListener) {
            win.addEventListener('load', init, false);
        } else if (win.attachEvent) {
            win.attachEvent('onload', init);
        }

    })(window, document);

    /* eslint-disable */
    window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);

        t._e = [];
        t.ready = function(f) {
            t._e.push(f);
        };

        return t;
    }(document, "script", "twitter-wjs"));
    /* eslint-enable */

})();
