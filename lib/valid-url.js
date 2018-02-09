var url = require('url')

module.exports = function (str) {
  if (typeof str !== 'string') return false
  var parsed = url.parse(str)
  return ['http:', 'https:'].includes(parsed.protocol)
}
