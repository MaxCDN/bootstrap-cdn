# Bootstrap CDN [![Build Status](https://travis-ci.org/MaxCDN/bootstrap-cdn.png?branch=master)](https://travis-ci.org/MaxCDN/bootstrap-cdn)

### Requirements

1. [Node.js](http://nodejs.org/)

### Running

##### Development

```
make setup test run
```

##### Demonized

```
##
# for the following make tasks, you can also run:
#
# npm <task name>
##

# before start or after npm update
make setup

# start server
make start

# stop server
make stop

# restart server
make restart

# server status
make status

# view logs
tail -f ./logs/server.log
```

##### Nginx

```
# generate nginx conf for your checkout and start nginx
make nginx/start

# stop nginx
make nginx/stop

# restart (stop then start) nginx
make nginx/restart

# HUP nginx process to reload configs
make nginx/reload


# to regnerate nginx.conf
rm nginx.conf
```

### Configuration

#### `config/_config.yml`

Key Overview:

1. `port`: Integer value of the Node application port.
2. `theme`: Integer value of the array index from the `bootswatch` section below.
3. `authors`: Array of Author Strings
4. `description`: String containing the meta descript of the site.
5. `extras`: Turn on extras functionality. Requires `config/_oauth.yml` update with correct `key` and `security` tokens.
5. `favicon`: Hash containing `ico` and `png` favicon paths (`ico` must be file system path, while `png` must be browser path).
6. `google_analytics`: Hash containing GA `account_id` and `domain_name`.
7. `stylesheets`: Array containing stylesheet files to be loaded at the top of the site.
8. `javascripts`: Array containing javascript files to be loaded either `before` (at the top) or `after` (at the bottom) of the site.
9. `bootswatch`: Hash containing current Bootswatch meta data and themes.
10. `bootstrap`: Array of Hashes containing Bootstrap meta data and pathing.

#### `config/_tweets.yml`

To add new tweets to the "Mad Love" section, follow these steps:

1. Copy the full `<blockquote>` HTML from the "Embed Tweet" source obtained via Twitter.
2. Replace all double quotes (`"`) with single quotes (`'`).
3. Wrap entire HTML block in double quotes (`"`).
4. Add to `_tweets.yml`, preceeded with a dash (`-`), which signifies an array item in YAML.

#### `config/_oauth.yml`

This is reserved for MaxCDN and NetDNA installation only at this time. Contact @jdorfman for more information.

