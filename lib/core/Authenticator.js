import passport from 'passport';
import BearerStrategy from 'passport-http-bearer';


export default class Authenticator {
    constructor(app) {
        this.app = app;
        this.init();
        this.authenticate = this.authenticate.bind(this);
    }

    init(){
        const self = this;
        this.passport = passport.use(
            new BearerStrategy.Strategy(
                function(token, done){
                    self.app.tokenUtil('get', {'authToken': token})
                        .then((tokenInfo) =>
                        {
                            if(!tokenInfo){
                                let user = {id: tokenInfo.hasOwnProperty('user_id') ? tokenInfo.user_id : null};
                                return done(null, user, {scope:self.app.name});
                            }
                            else{
                                return done(null, false, {message: 'Invalid authenticationToken'});
                            }
                        })
                        .catch((err) => {
                            return done(err);
                        })

                }
            )
        )
    }

    /**
     * check if user exists or not
     *
     * @param {string|null} email or username
     * @return {Object|null} user
     * @memberof Authenticator
     * @return User record
     */
    getUser(nameOrEmail) {

    }

    /**
     *
     *
     * @param {any} req
     * @memberof Authenticator
     */
    authenticate(req, res, next) {
        return this.passport.authenticate('bearer', {session:false})(req, res, next);
    }
}