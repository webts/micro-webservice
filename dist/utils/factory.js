"use strict";

var _path = _interopRequireDefault(require("path"));

var _debug = require("debug");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pkg = require('../../package.json');
/**
 * create service from serveless yaml config file
 * 
 * @param {any} path 
 */


module.exports.buildService = async function (config) {
  let serviceClass = config.serviceClass;
  let clazz = null;

  try {
    //load directly from path
    if (serviceClass.endsWith('.js') || serviceClass.indexOf('/') > 0) {
      if (serviceClass.startsWith('./')) serviceClass = _path.default.resolve('./build', serviceClass);
      clazz = require(serviceClass);
    } else if (serviceClass.indexOf('.') > 0) {
      const parts = serviceClass.split('.');

      if (parts[0] === pkg.name) //this package
        {
          console.log(__dirname + '/../core/' + parts[1]);
          clazz = require('../core/' + parts[1]).default; //console.log('class ' + clazz);
        } else {
        const npm = require(parts[0]);

        if (parts.length > 1) {
          clazz = npm;

          for (let i = 1; i < parts.length; i++) {
            clazz = clazz[parts[i]];
          }
        } else {
          console.error(new Error('Invalid class signature'));
          return null;
        }
      }
    } else {
      clazz = require(serviceClass);
    }

    const instance = new clazz(config);
    return instance;
  } catch (err) {
    console.error(err);
  }

  return null;
};
//# sourceMappingURL=factory.js.map