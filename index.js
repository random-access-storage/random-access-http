var events = require('events')
var inherits = require('inherits')
var http = require('http')
var https = require('https')

module.exports = RandomAccessMemory

function RandomAccessHTTP (url, opts) {
  if (!(this instanceof RandomAccessHTTP)) return new RandomAccessHTTP(url, opts)
  if (!opts) opts = {}

  events.EventEmitter.call(this)

  var self = this

  this.url = url
  this.readable = opts.readable !== false
  this.writable = false
  this.length = opts.length || 0
  this.opened = false
}

inherits(RandomAccessMemory, events.EventEmitter)

RandomAccessHTTP.prototype.open = function (cb) {
  cb()
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
