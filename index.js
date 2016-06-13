var events = require('events')
var inherits = require('inherits')
var http = require('http')
var https = require('https')
var url = require('url')
var xtend = require('xtend')

module.exports = RandomAccessMemory

function RandomAccessHTTP (url, opts) {
  if (!(this instanceof RandomAccessHTTP)) return new RandomAccessHTTP(url, opts)
  if (!opts) opts = {}

  events.EventEmitter.call(this)

  var self = this

  this.url = url
  this.urlObj = url.parse(url)
  this.client = {
    http: http,
    https: https
  }[this.urlObj.protocol.split(':')[0]]
  this.readable = opts.readable !== false
  this.writable = false
  this.length = opts.length || 0
  this.opened = false
}

inherits(RandomAccessMemory, events.EventEmitter)

RandomAccessHTTP.prototype.open = function (cb) {
  var self = this
  var reqOpts = xtend(this.urlObj, {
    method: 'HEAD',
    headers: {
      Connection: 'keep-alive'
    }
  })
  this.reqOpts = reqOpts
  this.client.request(reqOpts, function (res) {
    if (res.statusCode !== 200) return cb(new Error('Bad response: ' + res.statusCode))
    if (headersInvalid(res.headers)) {
      return cb(new Error('Source doesn\' support \'accept-ranges\''))
    }
    self.opened = true
    if (res.headers['content-length']) self.length = res.headers['content-length']
    self.emit('open')
    cb()
  })
}

function headersInvalid (headers) {
  if (!headers['accept-ranges']) return true
  if (headers['accept-ranges'] !== 'bytes') return true
}

RandomAccessHTTP.prototype.write = function (offset, data, cb) {
  if (!cb) cb = noop
  if (!this.buffer) return cb(new Error('Instance is closed'))
  cb(new Error('Write Not Implemented'))
}

RandomAccessHTTP.prototype.read = function (offset, length, cb) {
  if (!this.buffer) return cb(new Error('Instance is closed'))
  if (offset + length > this.buffer.length) return cb(new Error('Could not satisfy length'))
  cb(new Error('Read Not Implemented'))
}

RandomAccessHTTP.prototype.close = function (cb) {
  cb(new Error('Close Not Implemented'))
}

function noop () {}
