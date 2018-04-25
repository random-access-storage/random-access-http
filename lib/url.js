var url = require('url')

module.exports.validUrl = function (str) {
  if (typeof str !== 'string') return false
  var parsed = url.parse(str)
  return ~['http:', 'https:'].indexOf(parsed.protocol)
}

module.exports.prependUrlProtocol = function (str) {
  if (typeof str !== 'string') return false
  var parsed = url.parse(str)

  if (parsed.protocol === null) {
    parsed.protocol = 'http:'
    var parts = parsed.href.split('/')
    parsed.slashes = true
    parsed.hostname = parsed.host = parts[0]
    parsed.pathname = parsed.path = parts.slice(1).join('/')
  }

  return url.format(parsed)
}
