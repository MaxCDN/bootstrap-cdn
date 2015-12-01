'use strict';

var fs     = require('fs');
var path   = require('path');
var yaml   = require('js-yaml');
var assert = require('assert');
var mktemp = require('mktemp');
var exec   = require('child_process').execSync;
var walk   = require('fs-walk');
var async  = require('async');

var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();

var expectedHeaders = {
  date: undefined,
  etag: undefined,
  expires: undefined,

  //connection: 'keep-alive',
  connection: undefined, // TODO: reseach why this is returning 'closed' for
                         // this test, but 'keep-alive' as expected via
                         // curl and browsers.

  vary: 'Accept-Encoding',

  'content-type': undefined,
  'content-length': undefined,
  'last-modified': undefined,
  'x-cache': undefined,

  //'x-amz-server-side-encryption': 'AES256',
  'accept-ranges': 'bytes',
  'access-control-allow-origin': '*',

  // the following are set as undefined because www
  // and assets (js/css) differ
  server: undefined,
  'x-hello-human': undefined, // because www and assets differ
  'cache-control': undefined
};

var responses = {};
function request(uri, cb) {
    // return memoized response to avoid making the same http call twice
    if (responses.hasOwnProperty(uri)) return cb(responses[uri]);

    // build memoized response
    helpers.preFetch(uri, function(res) {
        responses[uri] = res;
        cb(res);
    }, require('https'));
}

function assertSRI(uri, sri, done) {
    request(uri, function(response) {
        assert.equal(200, response.statusCode);
        mktemp.createFile('/tmp/XXXXX.txt', function(err, tmp) {
            if (err) throw err;
            fs.writeFile(tmp, response.body, function(err) {
                if (err) throw err;

                var sri256 = exec('cat '+tmp+' | openssl dgst -sha256 -binary | openssl enc -base64 -A').toString();
                var sri512 = exec('cat '+tmp+' | openssl dgst -sha512 -binary | openssl enc -base64 -A').toString();
                fs.unlinkSync(tmp);

                var expected = 'sha256-'+sri256+' sha512-'+sri512;

                assert.equal(expected, sri);
                done();
            });
        });
    });
}

var s3include = [ 'content-type' ];
function assertHeader(uri, header) {

    if (process.env.TEST_S3 === 'true' && s3include.indexOf(header) === -1) {
        return it.skip('has ' + header);
    }

    it('has ' + header, function(done) {
        request(uri, function(response) {
            assert.equal(200, response.statusCode);
            assert(response.headers.hasOwnProperty(header));

            if (expectedHeaders[header]) {
                assert.equal(response.headers[header], expectedHeaders[header]);
            }

            done();
        });
    });
}

// bootswtch
describe('functional', function () {

    describe('bootstrap', function () {
        config.bootstrap.forEach(function(self) {
            describe(helpers.domainCheck(self.javascript), function () {
                var uri = helpers.domainCheck(self.javascript);
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, self.javascript_sri, done);
                });
            });

            describe(helpers.domainCheck(self.stylesheet), function () {
                var uri = helpers.domainCheck(self.stylesheet);
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, self.stylesheet_sri, done);
                });
            });
        });
    });

    describe('bootswatch', function () {
        config.bootswatch.themes.forEach(function(theme) {
            var uri = helpers.domainCheck(config.bootswatch.bootstrap
                .replace("SWATCH_VERSION", config.bootswatch.version)
                .replace("SWATCH_NAME", theme.name));

            describe(uri, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, theme.sri, done);
                });
            });
        });
    });

    describe('bootlint', function () {
        config.bootlint.forEach(function (self) {
            var uri = helpers.domainCheck(self.javascript);
            describe(uri, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, self.javascript_sri, done);
                });
            });
        });
    });

    describe('bootstrap4', function () {
        config.bootstrap4.forEach(function(self) {
            describe(helpers.domainCheck(self.javascript), function () {
                var uri = helpers.domainCheck(self.javascript);
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, self.javascript_sri, done);
                });
            });

            describe(helpers.domainCheck(self.stylesheet), function () {
                var uri = helpers.domainCheck(self.stylesheet);
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, self.stylesheet_sri, done);
                });
            });
        });
    });

    describe('fontawesome', function () {
        config.fontawesome.forEach(function(self) {
            var uri = helpers.domainCheck(self.stylesheet);
            describe(uri, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    assertHeader(uri, header);
                });

                it('has integrity', function(done) {
                    assertSRI(uri, self.stylesheet_sri, done);
                });
            });
        });
    });

    describe('public/**/*.*', function() {

        /*
         * Build File List
         ****/
        var whitelist = [
            "bootlint",
            "bootstrap",
            "bootswatch",
            "font-awesome",
            "twitter-bootstrap",
            "css",
            "js"
        ];

        var publicURIs = [];
        walk.filesSync(path.join(__dirname, '..', 'public'), function (base, name) {
            var root = base.split('/public/')[1];

            // ensure file is in whitelisted directory
            if (root === undefined || whitelist.indexOf(root.split(path.sep)[0]) === -1) return;

            var domain = helpers.domainCheck('https://maxcdn.bootstrapcdn.com/');

            var uri = domain + root + '/' + name;
            var ext = helpers.extension(name);

            // ignore unknown / unsupported types
            if (helpers.CONTENT_TYPE_MAP[ext] === undefined) return;

            publicURIs.push(uri);
        });

        /*
         * Run Tests
         ****/
        async.each(publicURIs, function(uri, callback) {
            describe(uri, function() {
                it('content-type', function(done) {
                    request(uri, function(response) {
                        assert.equal(200, response.statusCode, 'file missing or forbidden');

                        helpers.assert.contentType(uri, response.headers['content-type']);
                        done(); callback();
                    });
                });
            });
        });

    });

});
