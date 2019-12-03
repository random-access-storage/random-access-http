var test = require('tape')
var { validUrl, prependUrlProtocol } = require('../lib/url')

test('prependUrlProtocol assumes http without path', (t) => {
  t.same(prependUrlProtocol('example.com'), 'http://example.com')
  t.end()
})

test('prependUrlProtocol assumes http with path', (t) => {
  t.same(prependUrlProtocol('example.com/foo/bar.html'), 'http://example.com/foo/bar.html')
  t.end()
})

test('prependUrlProtocol doesn\'t change protocol if given', (t) => {
  t.same(prependUrlProtocol('https://example.com/foo/bar.html'), 'https://example.com/foo/bar.html')
  t.same(prependUrlProtocol('ftp://example.com/foo/bar.html'), 'ftp://example.com/foo/bar.html')
  t.end()
})

test('validUrl returns false if url is not a string', (t) => {
  t.notOk(validUrl())
  t.notOk(validUrl(null))
  t.notOk(validUrl({}))
  t.notOk(validUrl(['foo']))
  t.end()
})

test('validUrl returns false for rubbish strings', (t) => {
  t.notOk(validUrl('f234324 ff43 f43f4 f43 '))
  t.notOk(validUrl('company tax cuts will increase wages...'))
  t.end()
})

test('validUrl returns false if url is not http/s', (t) => {
  t.notOk(validUrl('ftp://ok.com'))
  t.notOk(validUrl('ssh://this:not@ok.net'))
  t.notOk(validUrl('mailto:not@ok.net'))
  t.end()
})

test('validUrl returns true if url is http/s', (t) => {
  t.ok(validUrl('http://theanarchistlibrary.org/'))
  t.ok(validUrl('http://127.0.0.1:4000'))
  t.ok(validUrl('https://en.wikipedia.org/wiki/S._R._Ranganathan'))
  t.end()
})
