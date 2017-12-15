'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportHttpBearer = require('passport-http-bearer');

var _passportHttpBearer2 = _interopRequireDefault(_passportHttpBearer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Authenticator = class Authenticator {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        const self = this;
        this.passport = _passport2.default.Passport.use(new _passportHttpBearer2.default.Strategy(function (token, done) {
            self.app.tokenUtil('get', { 'authenticationToken': token }).then(tokenInfo => {
                if (!tokenInfo) {
                    let user = { id: tokenInfo.hasOwnProperty('user_id') ? tokenInfo.user_id : null };
                    return done(null, user, { scope: self.app.name });
                } else {
                    return done(null, false, { message: 'Invalid authenticationToken' });
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
        return this.passport.authenticate('bearer', { session: false })(req, res, next);
    }
};
exports.default = Authenticator;