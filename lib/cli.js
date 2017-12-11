#! /usr/bin/env node

import args from 'commander';
import getConfigs, {generateFiles, composeStart, composeStop, composeUp, cloneDB, build} from './utils';
import {buildService} from './utils/factory';
import path from 'path';
import fs from 'fs';
import dot from 'dot';
import cpy from 'cpy';

args
    .version('0.1.0')
    .name('service_cli')
    .description('Micro-webservice CLI');

args.command("build", 'generate docker files and docker compose')
    .action(function(){
        let configs = getConfigs();

        generateFiles(configs);
        composeUp().then(() => console.log('build done'));
    });

args.command('run <configFile>','run the service with configuration')
    .action(function(configFile)
    {
        if(typeof configFile === 'undefined') configFile = './run.config.json';
        if(!configFile.endsWith('.json')) throw new Error('Invalid configuration file');
        if(configFile === './') configFile = './run.config.json';

        if(fs.existsSync(configFile)){
            try {
                const cf = JSON.parse(fs.readFileSync(configFile).toString());
                cf.root = './build/';
                build(cf).then(() => {
                    const service = buildService(cf);
                    if(service !== null)
                        service.start();
                });

            }catch(err){
                console.error(err);
            }
        }
        else{
            console.log('Configuration file not exists');
        }
    });

args.command('stop', 'stop all docker services')
    .action(function(){
        composeStop().then(() => console.log('all stopped'));
    });

args.command('start', 'start all docker services')
    .action(function(){
        composeStart().then(() => console.log('all started'));
    });

args.command('clone db media', 'clone db with media')
    .action(function(db, media){
        cloneDB(db, media);
    });

args.command('create <serviceName>', 'create a service folder')
    .action(function(serviceName){
        if(fs.existsSync('./' + serviceName)) {
            console.log('service already exists');
        }
        else{
            fs.mkdirSync(`./${serviceName}/`);
            fs.mkdirSync(`./${serviceName}/src/`);

            let pkg = dot.template(fs.readFileSync(__dirname + '/templates/_package.json.dot').toString())(
                {
                    name: serviceName,
                    npm:[]
                }
            );
            fs.writeFileSync(`./${serviceName}/package.json`, pkg);
            fs.writeFileSync(`./${serviceName}/app.js`, fs.readFileSync(__dirname + '/templates/app.js').toString());
            fs.writeFileSync(`./${serviceName}/.babelrc`, fs.readFileSync(__dirname + '/templates/.babelrc').toString());
            fs.writeFileSync(`./${serviceName}/service.config.json`, JSON.stringify({
                kind:"service",
                name:serviceName,
                src:['./src'],

            }));
        }

    });

args.parse(process.argv);

