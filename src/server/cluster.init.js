/* global index */
/* global config */
'use strict';

// Unique Request Id
// Used for requests via IPC channel to the master process
global._URID = 0;

const url = require('url');
const makeMongoUrl = require('./makeMongoUrl');
const co = require('co');
const mongodb = require('mongodb');
const send = require('./../client/send');
const log = (...args) => console.log(`[${new Date()}][${process.pid}] `, ...args);

function init(message) {
    
    var config = global.config = message.options;
    
    var serverOptions = 
        config.ssl ? [config.ssl, _reqHandler] : [_reqHandler];
    
    var server = require(config.protocol)
                    .createServer(...serverOptions);
    
    // Assert types
    config.databases = config.databases || {};
    config.siblings = config.siblings || [];
            
    // Create indexes and connections
    global.index = {};
    
    co(function*(){
       
        for(let dbName in config.databases) {
            
            let database = config.databases[dbName];
            let connStr = makeMongoUrl({
                dbName: database.name,
                dbHost: database.host,
                dbPort: database.port,
                dbUser: database.username,
                dbPassword: database.password,
                query: database.query
            });
            
            log({connStr});
            
            index[dbName] = {
                connection: null,
                collections: {}
            }
            
            // @todo handle connection error
            let db = yield new Promise(resolve => mongodb.connect(connStr, (err, db) => resolve([err,db])));
            
            if(db = db[1])
                index[dbName].connection = db;
            
            for(let collectionName in database.collections) {
                
                let collection = {
                    configuration: database.collections[collectionName],
                    indexes: {},
                    items: []
                }
                
                if(collection.configuration.searchIndex)
                    collection.searchIndex = {};
                
                index[dbName].collections[collectionName] = collection;
                
                for(let indexKey in collection.configuration.indexes)
                    collection.indexes[indexKey] = {};
                
            }
            
        } 
        
        // Listen after we are done
        // connectinig to databases and
        // building the index
        server.listen(config.port, config.host);
        
        server.on('listening', () => {
                log(`process ${process.pid} ready with listening server.`);
                process.send({ cmd: 'event', event: 'listening' })
        });
        
    });
            
}

process.on('uncaughtException', 
    err => log(`error on ${process.pid}: `, err));

function _reqHandler(req, res) {
    
    log(`request received by ${process.pid}. receiving...`);
    
    function bad() { 
        log('request was bad. exiting...');
        res.end('bad_request');    
    } 
    
    co(function*(){
        
        var request = '';
        
        req.on('data', c => request += c);
        yield new Promise(resolve => req.on('end', resolve));
        
        log(`request loaded: '${request}'. parsing...`);
        
        try { request = JSON.parse(request) } catch(err) { return bad() }
        
        log(`request parsed. handling...`);
        
        if(request.cmd === 'ping')
            return res.end('{"msg":"OK"}');
        
        // @todo Construction shortcut
        try{ 
            
            var db = index[request.database].connection;
            
            var collection = db.collection(request.collection);
            var queryNames = {
                get: 'find',
                update: 'update',
                remove: 'remove'
            }
            
            var collectionCall = collection[queryNames[request.cmd]].bind(collection);
            var queryOptions = [request.query];
            
            if(request.cmd === 'update')
                queryOptions.push(request.update, request.options);
                
            var query = collectionCall(...queryOptions);
            
            if(request.cmd === 'get' && request.options) {
                
                if(request.options.skip)
                    query.skip(request.options.skip);
                    
                if(request.options.limit)
                    query.limit(request.options.limit);
            
            }
            
            var responseData = '';
            
            if(request.cmd === 'get')
                yield new Promise(resolve => query.toArray((err, data) => {
                    responseData = JSON.stringify(data);
                    log({responseData, err});
                    resolve();
                }));
            
            // @todo Wait to assert changes are saved because life
            // is to short for callbacks
            yield new Promise(resolve => setTimeout(resolve, 100));
            res.end(responseData);
                
        } catch(err) { log({err, request}); }
            
        return;
        // @todo Construction shortcut end
        
        let foundInThisContext = lookInThisContext(request);
        
        if(request._data = foundInThisContext) return res.end(handle(request));
        
        // Pass the request to the rest of the cluster
        // and look for someone that can handle it and
        // return a response object
        let handledByCluster = yield askCluster(request);
        
        if(handledByCluster) return res.end(handledByCluster);
        
        // Pass the request to sibling servers and look for someone
        // that can handle it and return a response object
        let handledBySiblings = yield askSiblings(request);
        
        if(handledBySiblings) return res.end(handledBySiblings);
        
        // Proxies the request to the database
        request._data = yield lookInMongo(request);
        
        // Depending on the request, caches/updates
        // or asks the rest of the cluster/siblings
        // and responds
        res.end(handle(request));
        
    });
    
}

// @todo Under construction
function askCluster(request) {
    return Promise.resolve(false);
}

// @todo Under construction
function askSiblings(request) {
    return Promise.resolve(false);
}

function handle(request) {
    
    log('handling...');
    
    var responseData;
    var collection = index[request.database].collections[request.collection];
    var searchIndex = collection.searchIndex;
    var keysInQuery = Object.keys(request.query);
    
    var key = keysInQuery[0];
    var targetIndex = collection.indexes[key];
    
    // If the keys in query are more than one, set the search key
    // to the stringified query object
    keysInQuery.length > 1 && (key = JSON.stringify(request.query));
    
    // If collection has searchIndex and we have more than one keys
    // in query, set target index to the searchIndex
    searchIndex && keysInQuery.length > 1 && (targetIndex = searchIndex);
    
    if(targetIndex === searchIndex)
        searchIndex[key] = [];
    
    return JSON.stringify(responseData);
    
}

function lookInThisContext(request) {
    
    log('looking in this context...');
    
    var data = null;
    
    try {
    
        var collection = index[request.database].collections[request.collection];
        var searchIndex = collection.searchIndex;
        var keysInQuery = Object.keys(request.query);
        
        var key = keysInQuery[0];
        var targetIndex = collection.indexes[key];
        
        // If the keys in query are more than one, set the search key
        // to the stringified query object
        keysInQuery.length > 1 && (key = JSON.stringify(request.query));
        
        // If collection has searchIndex and we have more than one keys
        // in query, set target index to the searchIndex
        searchIndex && keysInQuery.length > 1 && (targetIndex = searchIndex);
        
        try { data = index[key] } catch(err) {}
    
    } catch(err) {
        log('error: ', err);
        log({index})
    }
    
    log('found: ', data);
    
    return data;
    
}

function lookInMongo(request) {
    
    log('looking in mongo...');
    
    var resolve;
    var db = index[request.database].connection.collection(request.collection);
 
    db.find(request.query).toArray((err, data) => {
        log('found: ', data);
        resolve(data);
    });
    
    return new Promise(r => resolve = r);
    
}

module.exports = init;