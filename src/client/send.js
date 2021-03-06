'use strict';

const log = (...args) => console.log(`[${new Date()}][${process.pid}] `, ...args);

var send = function(requestName, requestObject) {
    
    let fn = resolve => {
        
        requestObject.cmd = requestName;
        
        let requestDataAsString = JSON.stringify(requestObject) || '{}';
        
        let errorHandler = err => {
            this._errorHandler(err);
            resolve({ error: err });
        }
        
        let requestOptions = {
            host: this._config.host,
            method: this._config.method,
            path: this._config.path,
            port: this._config.port
        }
        
        let responseHandler = response => {
            
            let data = '';
            
            response.on('error', errorHandler);
            response.on('data', chunk => data += chunk.toString('utf8'));
            
            response.on('end', () => resolve(parseResponse(data)));
            
        }
        
        let request = require(this._config.protocol).request(requestOptions, responseHandler);
        
        request.on('error', errorHandler);
        request.on('socket', socket => {
            socket.on('error', errorHandler);
        });
        
        request.write(requestDataAsString);
        request.end();
        
        setTimeout(() => request.abort(), 2000);
        
    }
    
    return new Promise(fn);
    
}

var parseResponse = text => {
    
    let data;
    
    try {
        data = JSON.parse(text);
    } catch(err) {
        data = { error: err };
    }
    
    return data;
    
}

module.exports = send;