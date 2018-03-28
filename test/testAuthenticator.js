var passport = require('passport');
var bearer = require('passport-http-bearer');
var Auth = require('../dist/index').Authenticator.default;

var app = {
    name:'test_app',
    tokenUtil: function(type, data) {
        return {user_id:"test user"}
    }
};

var auth = new Auth(app);

