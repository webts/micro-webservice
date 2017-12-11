#! /usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _factory = require('./utils/factory');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _dot = require('dot');

var _dot2 = _interopRequireDefault(_dot);

var _cpy = require('cpy');

var _cpy2 = _interopRequireDefault(_cpy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version('0.1.0').name('service_cli').description('Micro-webservice CLI');

_commander2.default.command("build", 'generate docker files and docker compose').action(function () {
    let configs = (0, _utils2.default)();

    (0, _utils.generateFiles)(configs);
    (0, _utils.composeUp)().then(() => console.log('build done'));
});

_commander2.default.command('run <configFile>', 'run the service with configuration').action(function (configFile) {
    if (typeof configFile === 'undefined') configFile = './run.config.json';
    if (!configFile.endsWith('.json')) throw new Error('Invalid configuration file');
    if (configFile === './') configFile = './run.config.json';

    if (_fs2.default.existsSync(configFile)) {
        try {
            const cf = JSON.parse(_fs2.default.readFileSync(configFile).toString());
            cf.root = './build/';
            (0, _utils.build)(cf).then(() => {
                const service = (0, _factory.buildService)(cf);
                if (service !== null) service.start();
            });
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log('Configuration file not exists');
    }
});

_commander2.default.command('stop', 'stop all docker services').action(function () {
    (0, _utils.composeStop)().then(() => console.log('all stopped'));
});

_commander2.default.command('start', 'start all docker services').action(function () {
    (0, _utils.composeStart)().then(() => console.log('all started'));
});

_commander2.default.command('clone db media', 'clone db with media').action(function (db, media) {
    (0, _utils.cloneDB)(db, media);
});

_commander2.default.command('create <serviceName>', 'create a service folder').action(function (serviceName) {
    if (_fs2.default.existsSync('./' + serviceName)) {
        console.log('service already exists');
    } else {
        _fs2.default.mkdirSync(`./${serviceName}/`);
        _fs2.default.mkdirSync(`./${serviceName}/src/`);

        let pkg = _dot2.default.template(_fs2.default.readFileSync(__dirname + '/templates/_package.json.dot').toString())({
            name: serviceName,
            npm: []
        });
        _fs2.default.writeFileSync(`./${serviceName}/package.json`, pkg);
        _fs2.default.writeFileSync(`./${serviceName}/app.js`, _fs2.default.readFileSync(__dirname + '/templates/app.js').toString());
        _fs2.default.writeFileSync(`./${serviceName}/.babelrc`, _fs2.default.readFileSync(__dirname + '/templates/.babelrc').toString());
        _fs2.default.writeFileSync(`./${serviceName}/service.config.json`, JSON.stringify({
            kind: "service",
            name: serviceName,
            src: ['./src']

        }));
    }
});

_commander2.default.parse(process.argv);