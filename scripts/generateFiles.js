/* eslint-env es2020 */

'use strict';
const axios = require('axios').default;
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const https = require('https');

const configFile = path.resolve(__dirname, '../config/_files.yml');

const apiURL = 'https://data.jsdelivr.com/v1/package/npm';
const baseURL = 'https://cdn.jsdelivr.net/npm/';
const packagesList = [
    'bootstrap',
    '@fortawesome/fontawesome-free',
    'bootlint',
    'bootswatch'
];
const instance = axios.create({
    timeout: 60000, // optional
    httpsAgent: new https.Agent({ keepAlive: true }),
    headers: { 'Content-Type': 'application/json' }
});
async function getPackage(packageName) {
    const { data } = await instance.get(`${apiURL}/${packageName}`);
    return { ...data, packageName };
}

async function getLatestVersion(packageName) {
    const latestV = await getPackage(packageName);
    return latestV.tags.latest;
}

function findFile(folder, filename) {
    const file = folder.files.find((file) => file.name === filename);
    return file;
}

function writeToYml(files) {
    fs.writeFileSync(
        configFile,
        yaml.dump(files, {
            lineWidth: -1
        })
    );

    fs.copyFileSync(configFile, `${configFile}.bak`);
}

function buildPath(packageData, ext, filename) {
    let path = `${baseURL}${packageData.packageName}@${packageData.version}/`;
    const dir = findFile(packageData, 'dist');
    if (dir) {
        path += dir.name;
        const extensionFolder = findFile(dir, ext);
        if (extensionFolder) {
            path += `/${extensionFolder.name}`;
            const file = findFile(extensionFolder, filename);
            if (file) {
                path += `/${file.name}`;
            } else {
                return undefined;
            }
        }

        return path;
    }

    return false;
}

function buildPathFontAwesome(packageData) {
    let path = `${baseURL}${packageData.packageName}@${packageData.version}/`;
    const cssFolder = findFile(packageData, 'css');
    path += cssFolder.name;
    const cssFile = findFile(cssFolder, 'fontawesome.min.css');
    if (cssFile) {
        path += `/${cssFile.name}`;

        return path;
    }

    return false;
}

function buildPathBootsWatch(packageData) {
    const basepath = `${baseURL}${packageData.packageName}@SWATCH_VERSION`;
    const distFolder = findFile(packageData, 'dist');
    let bootstrapPath = '';
    let themes;
    if (distFolder) {
        themes = distFolder.files.map((theme) => {
            let path = `${basepath}/${distFolder.name}`;
            const { name } = theme;
            const cssFile = findFile(theme, 'bootstrap.min.css').name;
            path += `/SWATCH_NAME/${cssFile}`;
            bootstrapPath = path;
            return {
                name
            };
        });
    } else {
        const themesNames = [
            'cerulean',
            'cosmo',
            'cyborg',
            'darkly',
            'flatly',
            'journal',
            'litera',
            'lumen',
            'lux',
            'materia',
            'minty',
            'pulse',
            'sandstone',
            'simplex',
            'sketchy',
            'slate',
            'solar',
            'spacelab',
            'superhero',
            'united',
            'yeti'
        ];
        let path = basepath;
        themes = themesNames
            .map((theme) => {
                const themeFolder = findFile(packageData, theme);
                if (themeFolder) {
                    path = `${basepath}/SWATCH_NAME`;
                    const cssFile = findFile(themeFolder, 'bootstrap.min.css');
                    path += `/${cssFile.name}`;
                    bootstrapPath = path;

                    return { name: theme };
                }

                return false;
            })
            .filter((und) => und);
    }

    return { bspath: bootstrapPath, themes };
}

function buildPathBootlint(packageData) {
    const basepath = `${baseURL}${packageData.packageName}@${packageData.version}/`;
    const distFolder = findFile(packageData, 'dist');
    if (distFolder) {
        let path = `${basepath}${distFolder.name}`;
        const browserFolder = findFile(distFolder, 'browser');
        if (browserFolder) {
            path += `/${browserFolder.name}`;
            const minjsFile = findFile(browserFolder, 'bootlint.min.js');
            if (minjsFile) {
                path += `/${minjsFile.name}`;
                return path;
            }

            return false;
        }
    }

    return false;
}

async function generateFilesPath({ versions, packageName }) {
    const filesPromises = versions.map((version, index) => {
        return new Promise((resolve) => {
            setTimeout(async() => {
                console.log(`Fetching ${packageName}@${version}...`);
                const res = await getPackage(`${packageName}@${version}`);
                resolve({ ...res, version, packageName });
            }, index * 1000);
        });
    });

    const files = await Promise.all(filesPromises);

    const latestVersion = await getLatestVersion(packageName);

    const versionFiles = files
        .map((file) => {
            const paths = { version: file.version };
            paths.current = file.version === latestVersion;

            console.log(
                `Building cdn for ${file.packageName} - v${file.version}`
            );

            switch (file.packageName) {
                case 'bootstrap': {
                    const stylesheet = buildPath(
                        file,
                        'css',
                        'bootstrap.min.css'
                    );
                    const javascript = buildPath(
                        file,
                        'js',
                        'bootstrap.min.js'
                    );

                    if (javascript && stylesheet) {
                        paths.stylesheet = stylesheet;
                        paths.javascript = javascript;
                        paths.javascriptBundle = buildPath(
                            file,
                            'js',
                            'bootstrap.bundle.min.js'
                        );
                        paths.javascriptEsm = buildPath(
                            file,
                            'js',
                            'bootstrap.esm.min.js'
                        );
                    } else {
                        return false;
                    }

                    break;
                }

                case 'bootswatch':
                    paths.link = 'https://bootswatch.com/SWATCH_NAME/';
                    paths.image =
                        'https://bootswatch.com/SWATCH_NAME/thumbnail.png';
                    if (file.version === '4.5.2') {
                        const { bspath, themes } = buildPathBootsWatch(file);
                        paths.link = 'https://bootswatch.com/SWATCH_NAME/';
                        paths.image =
                            'https://bootswatch.com/SWATCH_NAME/thumbnail.png';
                        paths.bootstrap = bspath;
                        paths.themes = themes.reverse();
                    } else if (file.version === '3.4.1') {
                        paths.link = 'https://bootswatch.com/3/SWATCH_NAME/';
                        paths.image =
                            'https://bootswatch.com/3/SWATCH_NAME/thumbnail.png';
                        const { bspath, themes } = buildPathBootsWatch(file);
                        paths.bootstrap = bspath;
                        paths.themes = themes;
                    } else {
                        return false;
                    }

                    break;
                case '@fortawesome/fontawesome-free': {
                    const stylesheet = buildPathFontAwesome(file);
                    if (!stylesheet) {
                        return false;
                    }

                    paths.stylesheet = stylesheet;
                    break;
                }

                case 'bootlint': {
                    const bootlintPath = buildPathBootlint(file);

                    if (bootlintPath) {
                        paths.javascript = buildPathBootlint(file);
                    } else {
                        return false;
                    }

                    break;
                }

                default:
                    return null;
            }

            Object.keys(paths).map((path) => {
                if (!paths[path]) {
                    delete paths[path];
                }

                return '';
            });

            return paths;
        })
        .filter((cdn) => cdn);

    return versionFiles;
}

async function main() {
    const promises = packagesList.map(async(pack) => {
        const versions = await getPackage(pack);
        const versionFiles = await generateFilesPath(versions);

        return { [pack]: versionFiles };
    });

    const files = await Promise.all(promises);

    let filesMap = {};
    files.forEach((file) => {
        const keysName = Object.keys(file);
        if (keysName.includes('bootswatch')) {
            filesMap = { ...filesMap, bootswatch3: file.bootswatch[1] };
            filesMap = { ...filesMap, bootswatch4: file.bootswatch[0] };
        } else {
            filesMap = { ...filesMap, ...file };
        }
    });

    console.log('Writing to _files.yml...');
    writeToYml(filesMap);
    console.log(`Generated file: ${configFile}`);
    console.log('Done');
}

main();
