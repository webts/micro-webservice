var WebService = require('../dist/core/WebService').default;
console.log(JSON.stringify(WebService));

var inst = new WebService(
    { db:
        { type: 'mongodb',
          host: 'mongo',
          port: '27017',
          username: 'sytm8',
          password: 'w38T52007',
          logging: { sentry: [Object] } },
       session: { host: 'redis', port: 6379, logging: { sentry: [Object] } },
       messageBus: { port: 1883, host: 'emqttd', logging: { sentry: [Object] } },
       logging: { sentry: { host: 'sentry' } },
       image: 'node:8.9.1-alpine',
       cmd: '"yarn","start"',
       volumes:
        [ './services/analytics:/usr/src/app',
          '/usr/src/app/node_modules',
          './services/analytics/app/lib:/usr/src/app/app/lib',
          './services/analytics/app/src:/usr/src/app/app/src',
          './services/analytics/app.config.js:/usr/src/app/app.config.js',
          './services/analytics/.babelrc:/usr/src/app/.babelrc',
          './services/analytics/app.js:/usr/src/app/app.js',
          './services/analytics/package.json:/usr/src/app/package.json',
          './services/analytics/run.config.json:/usr/src/app/run.config.json' ],
       port: 8080,
       npm: [],
       serviceClass: 'micro-webservice.WebService',
       deps: [ './lib/commons/**' ],
       kind: 'service',
       name: 'analytics',
       src: [ './app/src/*.js' ],
       node_env: 'development',
       root: './build/',
       copy:
        [ './app/lib',
          './app/src',
          './app.config.js',
          './.babelrc',
          './app.js',
          './package.json',
          './run.config.json' ],
       command: 'yarn start',
       buildPath: 'services/analytics' }    
);

//console.log(inst);
inst.start();