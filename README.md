# BootstrapCDN

[![Follow BootstrapCDN on Twitter](https://img.shields.io/badge/twitter-@getBootstrapCDN-55acee.svg?style=flat-square)](https://twitter.com/getbootstrapcdn)
[![Linux Build Status](https://img.shields.io/travis/MaxCDN/bootstrapcdn/develop.svg?label=Linux%20build&style=flat-square)](https://travis-ci.org/MaxCDN/bootstrapcdn)
[![Windows Build status](https://img.shields.io/appveyor/ci/jdorfman/bootstrapcdn/develop.svg?label=Windows%20build&style=flat-square)](https://ci.appveyor.com/project/jdorfman/bootstrapcdn)
[![Coverage Status](https://img.shields.io/coveralls/github/MaxCDN/bootstrapcdn.svg?style=flat-square)](https://coveralls.io/github/MaxCDN/bootstrapcdn)
[![dependencies Status](https://img.shields.io/david/MaxCDN/bootstrapcdn.svg?style=flat-square)](https://david-dm.org/MaxCDN/bootstrapcdn)
[![devDependencies Status](https://img.shields.io/david/dev/MaxCDN/bootstrapcdn.svg?style=flat-square)](https://david-dm.org/MaxCDN/bootstrapcdn?type=dev)

## Deploy your own copy on Heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Requirements

1. [Node.js](https://nodejs.org/)

## Running

Use `npm run <task>`.

### Development

```sh
npm install

npm test && npm run dev
```

### Demonized

```shell
# start development server and watch for changes
npm run dev
# or
npm run watch

# start production server
npm start

# and more
npm run
```

## Configuration

### `config/_app.yml`

The Express.js app configuration.

* port: Integer value of the Node application port.
* theme: Integer value of the default theme we use; it's the array index value from the `bootswatch4` section below.
* siteurl: Our canonical URL.
* authors: Array of author Objects. Accepts the following:
    * name
    * twitter: the Twitter handler without `@`
    * url: author's website URL (optional)
    * work: (optional) Object which can contain:
        * text: the text to show for the `url` bellow
        * url: the link to the work
* description: String containing the default meta description of the site.
* favicon: The path to `favicon.ico`.
* stylesheet: Array of stylesheet file(s) we use apart from the Bootswatch stylesheet.
* javascript: Array of javascript file(s) we use.
* redirects: Array of Objects for the page redirects.

### `config/_extras.yml`

Contains the `/showcase/` and `/integrations/` config we use in the Express.js app.

### `config/_files.yml`

Contains the CDN files we host.The SRI values are updated by running `npm run integrity`.

### `config/helmet-csp.js`

Our CSP config using <https://github.com/helmetjs/csp>

## Updating Bootstrap/Bootlint

1. `npm i bootstrap@version --save-exact -D`/`npm i bootlint@version --save-exact -D`
2. `npm run bootstrap version`/`npm run bootlint version`
3. Update `config/_config.yml` accordingly
4. `npm run integrity`
5. Make sure `npm run ci` passes after the files are on S3/CDN and verify the frontend works as expected without any visual breakage
