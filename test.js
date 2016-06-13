var rahttp = require('./')
var tape = require('tape')

var testUrl = 'https://ia800309.us.archive.org/2/items/Popeye_Nearlyweds/Popeye_Nearlyweds_512kb.mp4'

tape('open and close', function (t) {
  t.plan(4)
  var popeye = rahttp(testUrl)
  popeye.on('close', function () {
    t.pass('close event fired')
  })
  popeye.on('open', function () {
    t.pass('open event fired')
  })
  popeye.open(function (err) {
    t.error(err, 'url opened without error')
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})
