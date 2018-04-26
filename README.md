# random-access-http

Continuous reading from a http(s) url using random offsets and lengths

```
npm install random-access-http
```

[![Build Status](https://travis-ci.org/random-access-storage/random-access-http.svg?branch=master)](https://travis-ci.org/random-access-storage/random-access-http) [![Coverage Status](https://coveralls.io/repos/github/random-access-storage/random-access-http/badge.svg?branch=master)](https://coveralls.io/github/random-access-storage/random-access-http?branch=master)

## Why?

Peers in a distributed system tend to come and go over a short period of time in many common p2p scenarios, especially when you are giving away a file without incentivizing the swarm to seed the file for a long time. There are also an abundance of free cloud hosts that let you host large files over http.

This module provides you random access to a file hosted over http so that it can be used by a client in a distributed system (such as hypercore or hyperdrive) to acquire parts of the file for itself and the other peers in the swarm.

## Usage

```js
var randomAccessHTTP = require('random-access-http')

var file = randomAccessHTTP('http://example.com/somefile.mp4')

// Read 10 bytes at an offset of 5
file.read(5, 10, function(err, buffer) {
  console.log(buffer)
  file.close(function() {
    console.log('http keepalive agents and sockets destroyed')
  })
})
```

file will use a keepalive agent to reduce the number http requests needed for the session. When you are done you should call `file.close()` to destroy the agent.

## API

#### `var file = randomAccessHTTP(url, [options])`

Create a new 'file' that reads from the provided `url`. The `url` can be either `http`, `https` or a relative path if url is set in options.

Options include:
```js
{
  url: string // Optionsal. The base url if first argument is relative
  verbose: boolean, // Optional. Default: false.
  timeout: number, // Optional. Default: 60000
  maxRedirects: number, // Optional. Default: 10
  maxContentLength: number, // Optional. Default: 50MB
  strict: true, // When false, will accept non-ranged response (it will slice the response to the requested offset/length)
}
```

#### `file.write(offset, buffer, [callback])`

**Not implemented!** Please let us know if you have opinions on how to implement this.
This will silently fail with no data being writen.

#### `file.read(offset, length, callback)`

Read a buffer at a specific offset. Callback is called with the buffer read.
By default, this will fail if the server returns byte ranges different than what is requested.
If you want to support uncooperative static file servers (that doesn't use ranges), pass the `strict` with a falsy value.

#### `file.close([callback])`

Close outstanding http keepalive agent sockets.

#### `file.on('open')`

Emitted when the url has been checked to support range requests and the keep-alive agent has been created.

#### `file.on('close')`

Emitted after the keepalive agent and its associated sockets have been destroyed.

## See Also

- [bittorrent.org/beps/bep_0019 WebSeed - HTTP/FTP Seeding (GetRight style)](http://www.bittorrent.org/beps/bep_0019.html)
- [bittorrent.org/beps/bep_0017 HTTP Seeding (Hoffman-style)](http://www.bittorrent.org/beps/bep_0017.html)
- [RFC2616 14.35.1 Byte Ranges](http://tools.ietf.org/html/rfc2616#section-14.35)
- [random-access-file](https://github.com/mafintosh/random-access-file)
- [random-access-memory](https://github.com/mafintosh/random-access-memory)
- [hypercore](https://github.com/mafintosh/hypercore)
