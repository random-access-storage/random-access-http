var http = require('http')
var https = require('https')
var url = require('url')

var urlObj = url.parse('https://ia800309.us.archive.org/2/items/Popeye_Nearlyweds/Popeye_Nearlyweds_512kb.mp4')

var options = Object.assign({}, urlObj, {
    method: 'HEAD',
    headers: {
      Connection: 'keep-alive'
    }
  })

var client = {
  http: http,
  https: https
}[urlObj.protocol.split(':')[0]]

var req = client.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`)
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, '\t')}`)
  res.setEncoding('utf8')
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`)
  })
  res.on('end', () => {
    console.log('No more data in response.')
  })
})

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`)
})

// write data to request body
req.end()
