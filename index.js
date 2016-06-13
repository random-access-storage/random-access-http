var events = require('events')
var inherits = require('inherits')
var http = require('http')
var https = require('https')
var url = require('url')
var xtend = require('xtend')

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
  var reqOpts = xtend(this.urlObj, {
    method: 'HEAD',
    headers: {
      Connection: 'keep-alive'
    }
  })
  this.reqOpts = reqOpts
  var req = this.client.request(reqOpts, function (res) {
    if (res.statusCode !== 200) return cb(new Error('Bad response: ' + res.statusCode))
    if (headersInvalid(res.headers)) {
      return cb(new Error("Source doesn' support 'accept-ranges'"))
    }
    self.opened = true
    if (res.headers['content-length']) self.length = res.headers['content-length']
    self.emit('open')
    cb()
  })

  req.on('error', (e) => {
    return cb(new Error(`problem with request: ${e.message}`))
  })

  req.end()
}

function headersInvalid (headers) {
  if (!headers['accept-ranges']) return true
  if (headers['accept-ranges'] !== 'bytes') return true
}

RandomAccessHTTP.prototype.write = function (offset, data, cb) {
  if (!cb) cb = noop
  if (!this.writable) return cb(new Error('URL is not writable'))
  cb(new Error('Write Not Implemented'))
}

RandomAccessHTTP.prototype.read = function (offset, length, cb) {
  if (!this.opened) return openAndRead(this, offset, length, cb)
  if (!this.readable) return cb(new Error('File is not readable'))
  cb(new Error('Read Not Implemented'))
}

RandomAccessHTTP.prototype.close = function (cb) {
  this.opened = false
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
