'use strict';

const log = (...args) => console.log(`[${new Date()}][${process.pid}] `, ...args);
const co = require('co');

//process.on('uncaughtException', 
//    err => log(`error on ${process.pid}: `, err));
    
log(`starting... (PID: ${process.pid})`);
log('loading configuration...');

const config = require('../config');

const db_zenarena = {
    name: config.mongodb.name,
    host: config.mongodb.host,
    port: config.mongodb.port,
    username: config.mongodb.username,
    password: config.mongodb.password,
    query: config.mongodb.query,
    collections: {
        configuration: {
            name: 'configuration',
            searchIndex: false,
            indexes: {
                key: {
                    key: 'key',
                    capacity: 2000,
                    timeout: 10000
                }
            }
        }
    }            
}

log('done.');
log('loading library...');

const lib = require('../main');

log('done. creating cache server objects...');

co(function*(){
    
    var server_1 = new lib.Server({
        host: 'localhost',
        port: 8082,
        protocol: 'http',
        siblings: ['http://localhost:8083'],
        numOfClusters: 2,
        databases: {zenarena:db_zenarena}
    });

    var server_2 = new lib.Server({
        host: 'localhost',
        port: 8083,
        protocol: 'http',
        siblings: ['http://localhost:8082'],
        numOfClusters: 2,
        databases: {zenarena:db_zenarena}
    });
    
    log('done. waiting for them to fire \'listening\'...');
    
    yield Promise.all([
        new Promise(resolve => server_1.once('listening', resolve)),
        new Promise(resolve => server_2.once('listening', resolve))
    ]);

    log('done. creating cache client object...');

    var client = new lib.Client({
        host: 'localhost',
        port: 8082,
        protocol: 'http'
    });
    
    log('done. binding error handler...');
    
    client.on('error', err => log('client emitted error: ', err));

    log('done. waiting for client to fire \'connected\'...');
    
    yield new Promise(resolve => client.on('connected', resolve));
    
    log('done. getting an object...');
    
    var obj = yield client.get({ 
        database: 'zenarena',
        collection: 'configuration',
        query: {
            key: 'DOMAIN_NAME'
        }
    });
    
    log('done.', obj);
    
    log(yield client.update({
        database: 'zenarena',
        collection: 'configuration',
        query: { key: 'SITE_NAME' },
        update: { $set: {
            key: 'SITE_NAME',
            value: 'ZenArena.com'
        } },
        options: { upsert: true }
    }))
    
});
