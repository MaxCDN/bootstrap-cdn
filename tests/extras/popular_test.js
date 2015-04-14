'use strict';

var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var http   = require('http');
var assert = require('assert');
var format = require('format');

var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', '..', 'config', '_config.yml'), 'utf8'));
process.env.PORT = (config.port < 3000 ? config.port + 3000 : config.port + 1); // don't use configured port

/***
 * MaxCDN Stub
 */
var MaxCDN = require('maxcdn');
MaxCDN.prototype.get = function (_, cb) {
    cb(null, require('../stubs/popular.json'));
    return;
};

require('../../app.js');
var host = format('http://localhost:%s', process.env.PORT);
var response;

before(function(done) {
    http.get(host + '/extras/popular', function(res) {
        response = res;
        response.body = '';
        res.on('data', function(chunk) {
            response.body += chunk;
        });
        res.on('end', function() {
            done();
        });
    });
});

describe('popular', function() {
    /*it('/extras/popular :: 200\'s', function(done) {
        assert(response);
        assert.equal(200, response.statusCode);
        done();
    });*/

    it('contains authors', function(done) {
        config.authors.forEach(function(author) {
            assert(response.body.indexOf(author));
        });
        done();
    });

    it('contains analytics', function(done) {
        assert(response.body.indexOf(config.google_analytics.account_id));
        assert(response.body.indexOf(config.google_analytics.domain_name));
        assert(response.body.indexOf('.google-analytics.com/ga.js'));
        done();
    });

    describe('contains bootswatch', function() {
        config.bootswatch.themes.forEach(function(theme) {
            var file = config.bootswatch.bootstrap
                                .replace('SWATCH_NAME', theme)
                                .replace('SWATCH_VERSION', config.bootstrap.version)
                                .replace('https://maxcdn.bootstrapcdn.com', '');
            it(format('-> %s', theme), function(done) {
                assert(response.body.indexOf(file));
                done();
            });
        });
    });

    describe('contains bootstrap', function() {
        config.bootstrap.forEach(function(bootstrap) {
            it(format('-> %s', bootstrap.version), function(done) {
                assert(response.body.indexOf(bootstrap.css_complete.replace('https://maxcdn.bootstrapcdn.com', '')));
                assert(response.body.indexOf(bootstrap.javascript.replace('https://maxcdn.bootstrapcdn.com', '')));
                if (bootstrap.css_no_icons) {
                    assert(response.body.indexOf(bootstrap.css_no_icons.replace('https://maxcdn.bootstrapcdn.com', '')));
                }
                done();
            });
        });
    });
});
