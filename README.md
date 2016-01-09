# zenx-cache
A tiny caching server.

* [Class: ZenXCacheClient](#zcc)
  * [Event: 'connected'](#zccec)
  * [Event: 'disconnected'](#zccedc)
  * [client.get(options)](#zccg)
  * [client.upsert(options)](#zccu)
  * [client.remove(options)](#zccr)
* [Class: ZenXCacheServer](#zcs)

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
