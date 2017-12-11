'use strict';

require('babel-polyfill');

module.exports = {
    WebService: require('./core/WebService'),
    ServiceProxy: require('./core/ServiceProxy'),
    WebAppService: require('./core/WebAppService'),

    Logger: require('./core/logger'),
    PubSubClient: require('./core/PubSubClient'),
    Authenticator: require('./core/Authenticator'),
    DbClient: require('./core/DbClient'),
    Session: require('./core/Session'),
    ServiceFactory: require('./utils/factory')
};