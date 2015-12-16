'use strict';

var os     = require('os');
var fs     = require('fs');
var path   = require('path');
var escape = require('querystring').escape;

function store(key) {
    if (process.env.CACHE_STORE)
        return process.env.CACHE_STORE;

    return path.join(os.tmpdir(), '.' + escape(key) + '.json');
}

function localSet(key, val, callback) {
    fs.writeFile(store(key), val, callback);
}

function localGet(key, callback) {
    fs.readFile(store(key), callback);
}

module.exports = function() {
    if (process.env.REDIS_URL)
        return require('redis').createClient(process.env.REDIS_URL);

    return {
        store: store,
        get:   localGet,
        set:   localSet
    };
}();
