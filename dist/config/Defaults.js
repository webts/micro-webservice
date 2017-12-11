'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
    let defFiles = _glob2.default.sync('**/+(config|defaults|default).+(js|json|yml)', {
        realpath: true
    });
    let defFile = defFiles[0];
    let defaults = {};
    if (_path2.default.extname(defFile) === 'yml') {
        try {
            defaults = _jsYaml2.default.safeLoad(_fs2.default.readFileSync(defFile, 'utf-8'));
        } catch (err) {
            console.error(err);
        }
    } else if (_path2.default.extname(defFile) === 'json') {
        try {
            defaults = JSON.parse(_fs2.default.readFileSync(defFile, 'utf-8'));
        } catch (err) {
            console.error(err);
        }
    } else if (_path2.default.extname(defFile) === 'js') {
        defaults = require(defFile);
    }

    if (defaults) {
        defaults = (0, _immutable.fromJS)(defaults);
        const proxy = (0, _immutable.fromJS)(require('./proxy.json')),
              docker = (0, _immutable.fromJS)(require('./docker.json')),
              messageBus = (0, _immutable.fromJS)(require('./messageBus.json')),
              session = (0, _immutable.fromJS)(require('./session.json')),
              service = (0, _immutable.fromJS)(require('./service.json')),
              db = (0, _immutable.fromJS)(require('./db.json'));

        defaults = _extends({}, proxy, db, session, messageBus, docker, service, defaults);
    }

    return defaults;
})();