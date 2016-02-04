'use strict';

const PING_INTERVAL = 2000;
const ENOTCONN = 'Client is not connected.';
const ECONNFAILED = 'Failed to connect';

var emitter = require('events').EventEmitter;
var co = require('co');

class Client {
    
    constructor(configuration) {
        
        this.STATUS = 0;
        this.MANUAL_DISCONNECT = false;
        
        this._config = {};
        this._requests = {};
        
        // Defaults
        this._config.protocol = 'http';
        this._config.method = 'post';
        this._config.port = 80;
        
        // Save config and overwrite defaults
        for(let key in configuration)
            this._config[key] = configuration[key];
        
        emitter.call(this);
        
        for(let request of ['get', 'update', 'remove'])
            this[request] = requestObject => 
                { return this._send(request, requestObject) };
        
        this._connect();
        
    }
    
    _actionHandler(requestObject) {
        
        var requestBlueprint = JSON.stringify(requestObject);
        
        if(!(requestBlueprint in this._requests)) {
            this._requests[requestBlueprint] = { requests: [] };
            this.socket.send(requestBlueprint);
        }
        
        return new Promise(resolve => this._requests[requestBlueprint].requests.push(resolve));
    
    }
    
    _errorHandler() {
        this.emit('error', ...arguments);
        this._setStatus(0, 'disconnected');
    }
    
    disconnect() {
        this.MANUAL_DISCONNECT = true;
        this._setStatus(0, 'disconnected');
    }
    
    connect() {
        this.MANUAL_DISCONNECT = false;
        return this._connect();
    }
    
    _connect() {
        
        if(this.MANUAL_DISCONNECT)
            return Promise.resolve({ error: ECONNFAILED });
            
        if(this.STATUS === 1)
            return Promise.resolve(true);
        
        var resolve;
        
        co(function*(){
            
            var ping = yield this._send('ping', {});
            
            if(ping.msg === 'OK') {
                resolve(true);
                this._setStatus(1, 'connected');
            }
            
        }.bind(this));
        
        return new Promise(r => resolve = r);
        
    }
    
    _setStatus(statusCode, eventName) {
        this.STATUS = statusCode;
        this.emit(eventName);
    }
    
}

Client.prototype._send = require('./send');
Client.prototype.__proto__ = emitter.prototype;

module.exports = Client;