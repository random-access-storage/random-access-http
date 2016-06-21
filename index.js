var events = require('events')
var inherits = require('inherits')
var http = require('http')
var https = require('https')
var url = require('url')
var xtend = require('xtend')
var concat = require('concat-stream')
var pump = require('pump')
var limitStream = require('size-limit-stream')

module.exports = RandomAccessHTTP

function RandomAccessHTTP (fileUrl, opts) {
  if (!(this instanceof RandomAccessHTTP)) return new RandomAccessHTTP(fileUrl, opts)
  if (!opts) opts = {}

  events.EventEmitter.call(this)

  this.url = fileUrl
  this.urlObj = url.parse(fileUrl)
  this.client = {
    http: http,
    https: https
  }[this.urlObj.protocol.split(':')[0]]
  this.readable = opts.readable !== false
  this.writable = false
  this.length = opts.length || 0
  this.opened = false
}

inherits(RandomAccessHTTP, events.EventEmitter)

RandomAccessHTTP.prototype.open = function (cb) {
  var self = this

  this.keepAliveAgent = new this.client.Agent({ keepAlive: true })
  var reqOpts = xtend(this.urlObj, {
    method: 'HEAD',
    agent: this.keepAliveAgent
  })
  var req = this.client.request(reqOpts, onres)

  function onres (res) {
    if (res.statusCode !== 200) return cb(new Error('Bad response: ' + res.statusCode))
    if (headersInvalid(res.headers)) {
      return cb(new Error("Source doesn't support 'accept-ranges'"))
    }
    self.opened = true
    if (res.headers['content-length']) self.length = res.headers['content-length']
    self.emit('open')
    cb()
  }

  req.on('error', (e) => {
    return cb(new Error(`problem with request: ${e.message}`))
  })

  req.end()
}

function headersInvalid (headers) {
  if (!headers['accept-ranges']) return true
  if (headers['accept-ranges'] !== 'bytes') return true
}

RandomAccessHTTP.prototype.write = function (offset, buf, cb) {
  if (!cb) cb = noop
  if (!this.opened) return openAndWrite(this, offset, buf, cb)
  if (!this.writable) return cb(new Error('URL is not writable'))
  cb(new Error('Write Not Implemented'))
}

RandomAccessHTTP.prototype.read = function (offset, length, cb) {
  if (!this.opened) return openAndRead(this, offset, length, cb)
  if (!this.readable) return cb(new Error('URL is not readable'))

  var self = this

  var range = `${offset}-${offset + length - 1}` // 0 index'd
  var reqOpts = xtend(this.urlObj, {
    method: 'GET',
    agent: this.keepAliveAgent,
    headers: {
      Accept: '*/*',
      Range: `bytes=${range}`
    }
  })

  var req = this.client.request(reqOpts, onres)

  req.on('error', (e) => {
    return cb(new Error(`problem with read request: ${e.message}`))
  })

  req.end()

  function onres (res) {
    if (!res.headers['content-range']) return cb(new Error('Server did not return a byte range'))
    if (res.statusCode !== 206) return cb(new Error('Bad response: ' + res.statusCode))
    var expectedRange = `bytes ${range}/${self.length}`
    if (res.headers['content-range'] !== expectedRange) return cb(new Error('Server returned unexpected range: ' + res.headers['content-range']))
    var concatStream = concat(onBuf)
    var limiter = limitStream(length + 1)

    pump(res, limiter, concatStream, function (err) {
      if (err) return cb(new Error(`problem while reading stream: ${err}`))
    })
  }

  function onBuf (buf) {
    return cb(null, buf)
  }
}

// function parseRangeHeader (rangeHeader) {
//   var range = {}
//   var byteRangeArr = rangeHeader.split(' ')
//   range.unit = byteRangeArr[0]
//   var ranges = byteRangeArr[1].split('/')
//   range.totalLength = ranges[1]
//   var startStop = ranges[0].split('-')
//   range.offset = startStop[0]
//   range.end = startStop[1]
//   range.length = range.end - range.offset
//   return range
// }

RandomAccessHTTP.prototype.close = function (cb) {
  this.opened = false
  this.keepAliveAgent.destroy()
  this.emit('close')
  cb(null)
}

function noop () {}

function openAndRead (self, offset, length, cb) {
  self.open(function (err) {
    if (err) return cb(err)
    self.read(offset, length, cb)
  })
}

function openAndWrite (self, offset, buf, cb) {
  self.open(function (err) {
    if (err) return cb(err)
    self.write(offset, buf, cb)
  })
}
