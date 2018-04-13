/* eslint global-require: 0 */
'use strict';

// Force NODE_ENV (and thus 'env' in express)
process.env.NODE_ENV = 'test';

const assert     = require('assert');
const fs         = require('fs');
const path       = require('path');
const htmlEncode = require('htmlencode').htmlEncode;
const request    = require('request');
const validator  = require('html-validator');
const yaml       = require('js-yaml');

let response = {};

// For array of types, the first one will be chosen when testing strictly
const CONTENT_TYPE_MAP = {
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',

    eot: 'application/vnd.ms-fontobject',
    otf: 'application/x-font-otf',
    svg: 'image/svg+xml',
    ttf: [
        'application/x-font-ttf',
        'font/ttf'
    ],
    woff: 'application/font-woff',
    woff2: 'application/font-woff2',

    map: 'application/json; charset=utf-8'
};

function getExtension(str) {
    // use two enclosing parts; one for the dot (.)
    // and one for the extension itself.
    // So, the result we want is the third Array element,
    // since the first one is the whole match, the second one
    // returns the first captured match, etc.
    const re = /(\.)([a-zA-Z0-9]+)$/;

    return str.match(re)[2];
}

function assertContentType(uri, contentType) {
    const ext = getExtension(uri);
    let expectedType  = CONTENT_TYPE_MAP[ext];

    // Making TEST_STRICT=true default, pass TEST_STRICT=false to disable
    // strict checking.

    if (process.env.TEST_STRICT === 'false' && Array.isArray(expectedType)) {
        assert(contentType.includes(expectedType),
            `Invalid "content-type" for "${ext}", expects one of "${expectedType.join('", "')}" but got ${contentType}`);
    } else {
        expectedType = Array.isArray(expectedType) ? expectedType[0] : expectedType;

        assert.equal(contentType, expectedType,
            `Invalid "content-type" for "${ext}", expects "${expectedType}" but got "${contentType}"`);
    }
}

function getConfig() {
    const CONFIG_FILE = path.join(__dirname, '..', 'config', '_config.yml');

    return yaml.safeLoad(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function cleanEndpoint(endpoint = '/') {
    endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    endpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;

    return endpoint;
}

function runApp(cfg, endpoint) {
    const endp = cleanEndpoint(endpoint);
    const port = cfg.port < 3000 ? cfg.port + 3000 : cfg.port + 1;

    // don't use configured port
    process.env.PORT = port;

    // load app
    require('../app.js');

    return `http://localhost:${port}${endp}`;
}

function assertValidHTML(res, done) {
    const options = {
        data: res.body,
        format: 'text'
    };

    validator(options, (err, data) => {
        if (err) {
            return done(err);
        }

        // Return when successful.
        if (data.includes('The document validates')) {
            return done();
        }

        // Formatting output for readability.
        const errStr = `HTML Validation for '${res.request.path}' failed with:\n\t${data.replace('Error: ', '').split('\n').join('\n\t')}\n`;

        return done(new Error(errStr));
    });
}

function assertItWorks(res, done) {
    try {
        assert.equal(200, res, 'file missing or forbidden');
        done();
    } catch (err) {
        done(err);
    }
}

function preFetch(uri, cb) {
    const reqOpts = {
        uri,
        forever: true, // for 'connection: Keep-Alive'
        gzip: true
    };

    request.get(reqOpts, (err, res, body) => {
        if (err) {
            console.log(err);
        }

        response = res;
        response.body = body;
    })
    .on('complete', () => cb(response));
}

function cssHTML(uri, sri) {
    return htmlEncode(`<link href="${uri}" rel="stylesheet" integrity="${sri}" crossorigin="anonymous">`);
}

function cssJade(uri, sri) {
    return htmlEncode(`link(href="${uri}", rel="stylesheet", integrity="${sri}", crossorigin="anonymous")`);
}

function cssHAML(uri, sri) {
    return htmlEncode(`%link{href: "${uri}", rel: "stylesheet", integrity: "${sri}", crossorigin: "anonymous"}`);
}

function jsHTML(uri, sri) {
    return htmlEncode(`<script src="${uri}" integrity="${sri}" crossorigin="anonymous"></script>`);
}

function jsJade(uri, sri) {
    return htmlEncode(`script(src="${uri}", integrity="${sri}", crossorigin="anonymous")`);
}

function jsHAML(uri, sri) {
    return htmlEncode(`%script{src: "${uri}", integrity: "${sri}", crossorigin: "anonymous"}`);
}

function domainCheck(uri) {
    if (typeof process.env.TEST_S3 === 'undefined') {
        return uri;
    }

    return uri.replace('https://stackpath.bootstrapcdn.com/', process.env.TEST_S3);
}

module.exports = {
    getConfig,
    runApp,
    assert: {
        contentType: assertContentType,
        itWorks: assertItWorks,
        validHTML: assertValidHTML
    },
    preFetch,
    getExtension,
    css: {
        pug: cssJade,
        html: cssHTML,
        haml: cssHAML
    },
    javascript: {
        pug: jsJade,
        html: jsHTML,
        haml: jsHAML
    },
    CONTENT_TYPE_MAP,
    domainCheck
};
