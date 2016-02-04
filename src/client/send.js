'use strict';

const log = (...args) => console.log(`[${new Date()}][${process.pid}] `, ...args);

var send = function(requestName, requestObject) {
    
    log(`sending a ${requestName} request...`);
    
    let fn = resolve => {
        
        requestObject.cmd = requestName;
        
        let requestDataAsString = JSON.stringify(requestObject) || '{}';
        
        let errorHandler = err => {
            log(`error handler called for ${requestName} request...`, err);
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
            log('send got a socket. errorHandler bound.');
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
    
    log(`response received and parsed: `, data);
    
    return data;
    
}

module.exports = send;