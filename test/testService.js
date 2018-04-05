var WebService = require('../dist/core/WebService').default;
console.log(JSON.stringify(WebService));

var inst = new WebService(
    { db:
        { type: 'mongodb',
          host: 'localhost',
          port: '27017',
          username: 'sytm8',
          password: 'w38T52007',
          logging: { sentry: [Object] } },
       session: { host: 'localhost', port: 6379, logging: { sentry: { host: 'localhost' } } },
       messageBus: { port: 1883, host: 'localhost', logging: { sentry: { host: 'localhost' }} },
       logging: { sentry: { host: 'localhost' } },
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
       deps: [],
       kind: 'service',
       name: 'analytics',
       src: [ './deps/*.js' ],
       node_env: 'development',
       root: process.cwd()+ '/test/',
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