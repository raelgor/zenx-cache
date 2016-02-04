'use strict';

const http = require('http');
const https = require('https');

const command = {
    
    // Takes in a configuration object
    // and starts the server
    init: require('./cluster.init')
    
}

function _messageHandler(message) {
    command[message.cmd || message.requestObject.cmd](message);
}

process.on('message', _messageHandler);