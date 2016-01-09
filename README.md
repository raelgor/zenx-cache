# zenx-cache
A tiny caching server used by the [ZenX](https://github.com/raelgor/zenx) project. Currently supports only MongoDB but MySQL will be added in the future. Feel free to use it and contribute.

## Manual
* [Installation](#installation)
* [Class: ZenXCacheClient](#zcc)
  * [Event: 'error'](#zccee)
  * [Event: 'connected'](#zccec)
  * [Event: 'disconnected'](#zccedc)
  * [client.get(options)](#zccg)
  * [client.update(options)](#zccu)
  * [client.remove(options)](#zccr)
* [Class: ZenXCacheServer](#zcs)
  * [Event: 'listening'](#zcsel)
  * [Event: 'close'](#zcsec)

### <a name="installation">Installation</a>
```shell
npm i --save zenx-cache
```

### <a name="zcc">Class: ZenXCacheClient</a>
A `ZenXCacheClient` takes in a `configuration` object and connects to a `ZenXCacheServer`.
```js
var cacheClient = new require('zenx-cache').Client(configuration);
```

Configuration:
* `host`, `port`(Default: 80), `path`(Default: ''), `method`(Default: post): Will be passed in Node's `http` or `https` request method depending on the `protocol` option's value.
* `protocol`(Default: 'http'): Can be either `http` or `https`.
* `defaultDatabase`: Default database name that will be used for request.
* `defaultCollection`: Default collection.
* `defaultTable`: Alias for `defaultCollection`.

### <a name="zccee">Event: 'error'</a>
`function(error) { }`

Emitted when the client receives an error message from the server or a request fails.

### <a name="zccec">Event: 'connected'</a>
`function() { }`

Emitted when the client manages to connect or reconnect to the cache server.

### <a name="zccedc">Event: 'disconnected'</a>
`function() { }`

Emitted when a request fails. The client will not attempt any more requests until reconnected.

### License
(The MIT License)

Copyright (c) 2015 Kosmas Papadatos <kosmas.papadatos@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
