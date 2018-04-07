var Session = require('../dist/core/Session').default;
var ses = new Session({host: 'localhost', port: 6379, logging: {sentry: {host: 'localhost'}}});
var promise = ses.get('systemate', 'gepj0vn2pifboa9r30qnp394g3');

promise.then(function (_ses) {
    console.log(_ses);
});
promise.catch(function (err) {
    console.error(err);
})
