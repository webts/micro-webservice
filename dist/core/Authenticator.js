"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _passport = _interopRequireDefault(require("passport"));

var _passportHttpBearer = _interopRequireDefault(require("passport-http-bearer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Authenticator {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    const self = this;
    this.passport = _passport.default.Passport.use(new _passportHttpBearer.default.Strategy(function (token, done) {
      self.app.tokenUtil('get', {
        'authenticationToken': token
      }).then(tokenInfo => {
        if (!tokenInfo) {
          let user = {
            id: tokenInfo.hasOwnProperty('user_id') ? tokenInfo.user_id : null
          };
          return done(null, user, {
            scope: self.app.name
          });
        } else {
          return done(null, false, {
            message: 'Invalid authenticationToken'
          });
        }
      }).catch(err => {
        return done(err);
      });
    }));
  }
  /**
   * check if user exists or not
   *
   * @param {string|null} email or username
   * @return {Object|null} user
   * @memberof Authenticator
   * @return User record
   */


  getUser(nameOrEmail) {}
  /**
   *
   *
   * @param {any} req
   * @memberof Authenticator
   */


  authenticate(req, res, next) {
    return this.passport.authenticate('bearer', {
      session: false
    })(req, res, next);
  }

}

exports.default = Authenticator;