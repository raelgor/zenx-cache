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
