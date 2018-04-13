var DbClient = require('../dist/core/DbClient').default;
var assert = require('assert')
var db = new DbClient({

    type: 'mongodb',
    host: 'localhost',
    port: '27017',
    username: 'systm8',
    password: 'w38T52007',
    logging: {sentry: [Object]}

});

db.database('systemate_demo');
var promise = db.begin();
promise.then(function () {
    console.log('connection successful');
    assert.notEqual(db.client, null, "db is not null");
    db.end();
});
promise.catch(function (err) {
    console.error(err);
    db.end();
});