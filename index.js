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

  var self = this

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
      return cb(new Error('Source doesn\' support \'accept-ranges\''))
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
  if (!this.buffer) return cb(new Error('Instance is closed'))
  cb(new Error('Write Not Implemented'))
}

RandomAccessHTTP.prototype.read = function (offset, length, cb) {
  if (!this.buffer) return cb(new Error('Instance is closed'))
  if (offset + length > this.buffer.length) return cb(new Error('Could not satisfy length'))
  cb(new Error('Read Not Implemented'))
}

RandomAccessHTTP.prototype.close = function (cb) {
  this.opened = false
  this.emit('close')
  cb(null)
}

function noop () {}
