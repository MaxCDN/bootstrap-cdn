const path = require('path');
const helpers = require('../lib/helpers.js');
const config = require('../config');

const digest = helpers.sri.digest;
const PUBLIC_DIR = path.join(__dirname, '../public/');
const SRI_CACHE = {};

function getProto(req) {
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    return proto;
}

function getCurrentSiteurl(req) {
    const proto = getProto(req);

    return `${proto}://${req.hostname}`;
}

function getPageTitle(pageTitle) {
    return `${pageTitle} · ${config.title_suffix}`;
}

function getThemeQuery(req) {
    const totalThemes = config.bootswatch4.themes.length;

    return req.query.theme < totalThemes ?
        req.query.theme :
        '';
}

function generateBodyClass(url) {
    let str = url;

    if (str === '/') {
        str = 'home'; // only for the index page
    }

    str = str.replace(/\//g, ''); // remove any slashes

    // Make the first letter lowercase
    str = str.charAt(0).toLowerCase() + str.slice(1);

    return `page-${str}`;
}

function generateSRI(file) {
    if (typeof SRI_CACHE[file] === 'undefined') {
        SRI_CACHE[file] = digest(path.join(PUBLIC_DIR, file));
    }

    return SRI_CACHE[file];
}

function appendLocals(req, res) {
    const siteUrl = getCurrentSiteurl(req);
    const canonicalUrl = `${config.siteurl}${req.path}`;
    const theme = getThemeQuery(req);
    const pageUrl = req.originalUrl;
    const bodyClass = generateBodyClass(pageUrl);

    const locals = {
        siteUrl,
        canonicalUrl,
        pageUrl,
        theme,
        displayTitle: getPageTitle,
        bodyClass,
        generateSRI
    };

    res.locals = Object.assign(res.locals, locals);

    return res;
}

module.exports = appendLocals;

// vim: ft=javascript sw=4 sts=4 et:
