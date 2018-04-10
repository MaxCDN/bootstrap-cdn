'use strict';

const assert     = require('assert');
const path       = require('path');
const staticify  = require('staticify');
const helpers    = require('./test_helper.js');

const config     = helpers.getConfig();
const uri        = helpers.runApp(config, 'showcase');

const PUBLIC_DIR = path.join(__dirname, '../public');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('showcase', () => {
    it('works', (done) => {
        assert(response);
        assert.equal(200, response.statusCode);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            assert(response.body.includes(author), `Expects response body to include "${author}"`);
        });
        done();
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center mb-4">Showcase</h2>'),
            'Expects response body to include Showcase header');
        done();
    });

    config.showcase.forEach((showcase) => {
        describe(showcase.name, () => {
            it('has name', (done) => {
                assert(response.body.includes(showcase.name),
                    `Expects response body to include "${showcase.name}"`);
                done();
            });
            it('has image', (done) => {
                assert(response.body.includes(staticify(PUBLIC_DIR).getVersionedPath(showcase.img)),
                    `Expects response body to include "${showcase.img}"`);
                done();
            });
            it('has lib', (done) => {
                assert(response.body.includes(showcase.lib),
                    `Expects response body to include "${showcase.lib}"`);
                done();
            });
            it('has url', (done) => {
                assert(response.body.includes(showcase.url),
                    `Expects response body to include "${showcase.url}"`);
                done();
            });
        });
    });
});
