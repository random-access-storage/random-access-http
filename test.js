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

tape('read from https flickr', function (t) {
  t.plan(3)
  var popeye = rahttp('https://c1.staticflickr.com/3/2892/12196828014_eb4ffac150_o.jpg')
  var length = 10
  popeye.read(0, 10, function (err, buf) {
    t.error(err, 'url read without error')
    t.equal(buf.length, length)
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})

tape('read from http flickr', function (t) {
  t.plan(3)
  var popeye = rahttp('http://c1.staticflickr.com/3/2892/12196828014_eb4ffac150_o.jpg')
  var length = 10
  popeye.read(30, 10, function (err, buf) {
    t.error(err, 'url read without error')
    t.equal(buf.length, length)
    popeye.close(function (err) {
      t.error(err, 'url closed without error')
    })
  })
})
