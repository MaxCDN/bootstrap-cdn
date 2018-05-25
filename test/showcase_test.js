'use strict';

const assert = require('assert').strict;
const path = require('path');
const staticify = require('staticify')(path.join(__dirname, '../public'));
const helpers = require('./test_helpers.js');

describe('showcase', () => {
    const config = helpers.getConfig();
    const uri = helpers.getURI('showcase');
    let response = {};

    before((done) => {
        helpers.prefetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Showcase', response, done);
    });

    config.showcase.forEach((showcase) => {
        describe(showcase.name, () => {
            it('has name', (done) => {
                assert.ok(response.body.includes(showcase.name),
                    `Expects response body to include "${showcase.name}"`);
                done();
            });
            it('has image', (done) => {
                assert.ok(response.body.includes(staticify.getVersionedPath(showcase.img)),
                    `Expects response body to include "${showcase.img}"`);
                done();
            });
            it('has lib', (done) => {
                assert.ok(response.body.includes(showcase.lib),
                    `Expects response body to include "${showcase.lib}"`);
                done();
            });
            it('has url', (done) => {
                assert.ok(response.body.includes(showcase.url),
                    `Expects response body to include "${showcase.url}"`);
                done();
            });
        });
    });
});
