'use strict';

const SERVER_PORT = 10001;
const SERVER_IP = '127.0.0.1';

var http = require('http');
var server = http.createServer((req, res) => res.end('OK'));
var co = require('co');

server.listen(SERVER_PORT, SERVER_IP);

describe('Client tests', () => {
    
    let cache
    let cacheClient;
    
    it('should require module without errors', () => cache = require('./../main'));
    
    it('should fire \'connected\' in less than 100ms', function(done) {
        
        this.timeout(100);
        
        cacheClient = new cache.Client({
            host: SERVER_IP,
            port: SERVER_PORT
        });
        
        cacheClient.once('connected', done);
        
    });
    
    it('should fire \'disconnected\' on manual disconnect', done => {
       
       cacheClient.once('disconnected', done);
       cacheClient.disconnect();
        
    });
   
   it('should manually reconnect and fire \'connected\' in less than 100ms', function(done) {
      
      this.timeout(100);
      
      cacheClient.once('connected', done);
      cacheClient.connect();
       
   });
   
   it('should handle all requests without errors in less than 100ms', function(done) {
       
       this.timeout(100);
       
       co(function*(){
           
           var get = yield cacheClient.get({});
           var update = yield cacheClient.update({});
           var remove = yield cacheClient.remove({});
           
           if(!get[0] && !update[0] && !remove[0])
            done();
           
       });
       
   });
   
   it('should close server', done => server.close(done));
   
});