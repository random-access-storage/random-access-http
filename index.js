var axios = require('axios')
var randomAccess = require('random-access-storage')
var logger = require('./lib/logger')
var isNode = require('./lib/is-node')
var {validUrl, prependUrlProtocol} = require('./lib/url')

var defaultOptions = {
  responseType: 'arraybuffer',
  timeout: 60000,
  maxRedirects: 10, // follow up to 10 HTTP 3xx redirects
  maxContentLength: 50 * 1000 * 1000 // cap at 50MB,
}

var randomAccessHttp = function (filename, options) {
  if (!options) options = {}

  var url = prependUrlProtocol(options.url)

  if (!url) filename = prependUrlProtocol(filename)
  if (!filename || (!validUrl(filename) && !validUrl(url))) {
    throw new Error('Expect first argument to be a valid URL or a relative path, with url set in options')
  }

  var axiosConfig = Object.assign({}, defaultOptions)
  if (isNode) {
    var http = require('http')
    var https = require('https')
    // keepAlive pools and reuses TCP connections, so it's faster
    axiosConfig.httpAgent = new http.Agent({ keepAlive: true })
    axiosConfig.httpsAgent = new https.Agent({ keepAlive: true })
  }
  if (options) {
    if (url) axiosConfig.baseURL = url
    if (options.timeout) axiosConfig.timeout = options.timeout
    if (options.maxRedirects) axiosConfig.maxRedirects = options.maxRedirects
    if (options.maxContentLength) axiosConfig.maxContentLength = options.maxContentLength
  }
  var _axios = axios.create(axiosConfig)
  var file = filename
  var verbose = !!(options && options.verbose)

  return randomAccess({
    open: function (req) {
      if (verbose) logger.log('Testing to see if server accepts range requests', url, file)
      // should cache this
      _axios.head(file)
        .then((response) => {
          if (verbose) logger.log('Received headers from server')
          var accepts = response.headers['accept-ranges']
          if (accepts && accepts.toLowerCase().indexOf('bytes') !== -1) {
            if (response.headers['content-length']) this.length = response.headers['content-length']
            return req.callback(null)
          }
          return req.callback(new Error('Accept-Ranges does not include "bytes"'))
        })
        .catch((err) => {
          if (verbose) logger.log('Error opening', file, '-', err)
          req.callback(err)
        })
    },
    read: function (req) {
      var range = `${req.offset}-${req.offset + req.size - 1}`
      var headers = {
        range: `bytes=${range}`
      }
      if (verbose) logger.log('Trying to read', file, headers.Range)
      _axios.get(file, { headers: headers })
        .then((response) => {
          if (!response.headers['content-range']) throw new Error('Server did not return a byte range')
          if (response.status !== 206) throw new Error('Bad response: ' + response.status)
          var expectedRange = `bytes ${range}/${this.length}`
          if (response.headers['content-range'] !== expectedRange) throw new Error('Server returned unexpected range: ' + response.headers['content-range'])
          if (req.offset + req.size > this.length) throw new Error('Could not satisfy length')
          if (verbose) logger.log('read', JSON.stringify(response.headers, null, 2))
          req.callback(null, Buffer.from(response.data))
        })
        .catch((err) => {
          if (verbose) {
            logger.log('error', file, headers.Range)
            logger.log(err, err.stack)
          }
          req.callback(err)
        })
    },
    write: function (req) {
      // This is a dummy write function - does not write, but fails silently
      if (verbose) logger.log('trying to write', file, req.offset, req.data)
      req.callback()
    },
    del: function (req) {
      // This is a dummy del function - does not del, but fails silently
      if (verbose) logger.log('trying to del', file, req.offset, req.size)
      req.callback()
    },
    close: function (req) {
      if (_axios.defaults.httpAgent) {
        _axios.defaults.httpAgent.destroy()
      }
      if (_axios.defaults.httpsAgent) {
        _axios.defaults.httpsAgent.destroy()
      }
      req.callback()
    }
  })
}

module.exports = randomAccessHttp
