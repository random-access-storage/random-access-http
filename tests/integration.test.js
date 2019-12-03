var rahttp = require('../')
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

tape('read 10 bytes', function (t) {
  t.plan(3)
  var popeye = rahttp(testUrl)
  var length = 10
  popeye.read(0, 10, function (err, buf) {
    t.error(err, 'url read without error')
    t.equal(buf.length, length)
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})

tape('read 100 bytes at an offset of 2000', function (t) {
  t.plan(3)
  var popeye = rahttp(testUrl)
  var length = 100
  popeye.read(2000, length, function (err, buf) {
    t.error(err, 'url read without error')
    t.equal(buf.length, length)
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})

tape('read from https wikipedia', function (t) {
  t.plan(3)
  var popeye = rahttp('https://upload.wikimedia.org/wikipedia/en/7/7d/Lenna_%28test_image%29.png')
  var length = 10
  popeye.read(0, 10, function (err, buf) {
    t.error(err, 'url read without error')
    t.equal(buf.length, length)
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})

tape('read from http archive.org', function (t) {
  t.plan(3)
  var popeye = rahttp('http://ia801009.us.archive.org/5/items/mbid-e77048de-139b-3fd3-977b-d86993e0e1b2/mbid-e77048de-139b-3fd3-977b-d86993e0e1b2-12826202809.jpg')
  var length = 10
  popeye.read(30, 10, function (err, buf) {
    t.error(err, 'url read without error')
    t.equal(buf.length, length)
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})
