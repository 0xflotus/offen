var assert = require('assert')

var stats = require('./stats')

describe('src/stats.js', function () {
  describe('stats.loss(events)', function () {
    it('calculates the percentage of anoynmous events in the given set', function () {
      return stats.loss([
        { userId: 'user-a' },
        { userId: 'user-b' },
        { timestamp: new Date().toJSON() },
        { userId: 'user-d' }
      ])
        .then(function (result) {
          assert.strictEqual(result, 0.25)
        })
    })
    it('returns 0 on empty events', function () {
      return stats.loss([])
        .then(function (result) {
          assert.strictEqual(result, 0)
        })
    })
    it('returns 1 on anonymous events only', function () {
      return stats.loss([
        { timestamp: new Date().toJSON() },
        { timestamp: new Date().toJSON() }
      ])
        .then(function (result) {
          assert.strictEqual(result, 1)
        })
    })
  })

  describe('stats.uniqueSessions(events)', function () {
    it('counts the number of unique session identifiers', function () {
      return stats.uniqueSessions([
        {},
        { payload: {} },
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-b' } },
        { payload: { sessionId: 'session-B' } },
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-B' } }
      ])
        .then(function (result) {
          assert.strictEqual(result, 3)
        })
    })
    it('returns 0 when given an empty list', function () {
      return stats.uniqueSessions([])
        .then(function (result) {
          assert.strictEqual(result, 0)
        })
    })
  })

  describe('stats.bounceRate(events)', function () {
    it('calculates the percentage of session identifiers that occur only once', function () {
      return stats.bounceRate([
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-b' } },
        { payload: { sessionId: 'session-B' } },
        { payload: { sessionId: 'session-c' } },
        { payload: { sessionId: 'session-B' } },
        { payload: { sessionId: 'session-B' } },
        { payload: { sessionId: 'session-B' } },
        { timestamp: new Date().toJSON() }
      ])
        .then(function (result) {
          assert.strictEqual(result, 0.75)
        })
    })
    it('returns 0 on when given an empty list', function () {
      return stats.bounceRate([])
        .then(function (result) {
          assert.strictEqual(result, 0)
        })
    })
    it('returns 1 on a list of unique session id', function () {
      return stats.bounceRate([
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-b' } },
        { payload: { sessionId: 'session-B' } },
        { payload: { sessionId: 'session-c' } },
        {}
      ])
        .then(function (result) {
          assert.strictEqual(result, 1)
        })
    })
  })

  describe('stats.avgPageload(events)', function () {
    it('calculates the average of the pageload times present in the set of events', function () {
      return stats.avgPageload([
        { timestamp: new Date().toJSON() },
        { payload: { pageload: 200 } },
        { payload: {} },
        { payload: { pageload: 200 } },
        { payload: { pageload: 400 } },
        { payload: { pageload: 100 } },
        { payload: { pageload: 100 } }
      ])
        .then(function (result) {
          assert.strictEqual(result, 200)
        })
    })
    it('returns null on an empty list of events', function () {
      return stats.avgPageload([])
        .then(function (result) {
          assert.strictEqual(result, null)
        })
    })
  })

  describe('stats.avgPageDepth(events)', function () {
    it('returns the average session length', function () {
      return stats.avgPageDepth([
        {},
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-b' } },
        { payload: { sessionId: 'session-b' } },
        { payload: { sessionId: 'session-a' } },
        { payload: { sessionId: 'session-c' } },
        { payload: { sessionId: 'session-a' } }
      ])
        .then(function (result) {
          assert.strictEqual(result, 2)
        })
    })
    it('returns null when given an empty array of events', function () {
      return stats.avgPageDepth([])
        .then(function (result) {
          assert.strictEqual(result, null)
        })
    })
  })

  describe('stats.pageviews(events)', function () {
    it('counts the number of events with userId value', function () {
      return stats.pageviews([
        { userId: 'user-b' },
        { userId: 'user-a' },
        { userId: null },
        { userId: 'user-b' },
        { userId: 'user-c' },
        {}
      ])
        .then(function (result) {
          assert.strictEqual(result, 4)
        })
    })
    it('returns 0 when given an empty list', function () {
      return stats.pageviews([])
        .then(function (result) {
          assert.strictEqual(result, 0)
        })
    })
  })

  describe('stats.visitors(events)', function () {
    it('counts the number of events with distinct userId values', function () {
      return stats.visitors([
        { userId: 'user-b' },
        { userId: 'user-a' },
        { userId: null },
        { userId: 'user-b' },
        { userId: 'user-c' },
        {}
      ])
        .then(function (result) {
          assert.strictEqual(result, 3)
        })
    })
    it('returns 0 when given an empty list', function () {
      return stats.visitors([])
        .then(function (result) {
          assert.strictEqual(result, 0)
        })
    })
  })

  describe('stats.accounts(events)', function () {
    it('counts the number of events with distinct accountId values', function () {
      return stats.accounts([
        { accountId: 'account-b' },
        { accountId: 'account-a' },
        { accountId: null },
        { accountId: 'account-b' },
        { accountId: 'account-c' },
        {}
      ])
        .then(function (result) {
          assert.strictEqual(result, 3)
        })
    })
    it('returns 0 when given an empty list', function () {
      return stats.accounts([])
        .then(function (result) {
          assert.strictEqual(result, 0)
        })
    })
  })

  describe('stats.referrers(events)', function () {
    it('returns sorted referrer values from foreign domains grouped by host', function () {
      return stats.referrers([
        {},
        { payload: { href: new window.URL('https://www.mysite.com/x'), referrer: new window.URL('https://www.example.net/foo') } },
        { payload: { href: new window.URL('https://www.mysite.com/y'), referrer: new window.URL('https://www.example.net/bar') } },
        { payload: { href: new window.URL('https://www.mysite.com/z'), referrer: new window.URL('https://www.example.net/baz') } },
        { payload: { href: new window.URL('https://www.mysite.com/x'), referrer: new window.URL('https://beep.boop/#!foo=bar') } },
        { payload: { href: new window.URL('https://www.mysite.com/x'), referrer: new window.URL('https://www.mysite.com/a') } }
      ])
        .then(function (result) {
          assert.deepStrictEqual(result, [
            { key: 'www.example.net', count: 3 },
            { key: 'beep.boop', count: 1 }
          ])
        })
    })
    it('returns an empty array when given an empty array', function () {
      return stats.referrers([])
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })

  describe('stats.campaigns(events)', function () {
    it('returns sorted referrer campaigns from foreign domains grouped by host', function () {
      return stats.campaigns([
        {},
        { payload: { href: new window.URL('https://www.mysite.com/x'), referrer: new window.URL('https://www.example.net/foo?utm_campaign=beep') } },
        { payload: { href: new window.URL('https://www.mysite.com/y'), referrer: new window.URL('https://www.example.net/bar?something=12&utm_campaign=boop') } },
        { payload: { href: new window.URL('https://www.mysite.com/z'), referrer: new window.URL('https://www.example.net/baz') } },
        { payload: { href: new window.URL('https://www.mysite.com/x'), referrer: new window.URL('https://beep.boop/site?utm_campaign=beep') } },
        { payload: { href: new window.URL('https://www.mysite.com/x'), referrer: new window.URL('https://www.mysite.com/a') } }
      ])
        .then(function (result) {
          assert.deepStrictEqual(result, [
            { key: 'beep', count: 2 },
            { key: 'boop', count: 1 }
          ])
        })
    })
    it('returns an empty array when given an empty array', function () {
      return stats.campaigns([])
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })

  describe('stats.pages(events)', function () {
    it('returns a sorted list of pages grouped by a clean URL', function () {
      return stats.pages([
        {},
        { accountId: 'account-a', userId: 'user-a', payload: { href: new window.URL('https://www.example.net/foo') } },
        { accountId: 'account-a', userId: 'user-a', payload: { href: new window.URL('https://www.example.net/foo?param=bar') } },
        { accountId: 'account-b', userId: 'user-z', payload: { href: new window.URL('https://beep.boop/site#!/foo') } },
        { accountId: 'account-a', userId: null, payload: { } }
      ])
        .then(function (result) {
          assert.deepStrictEqual(result, [
            { key: 'https://www.example.net/foo', count: 2 },
            { key: 'https://beep.boop/site', count: 1 }
          ])
        })
    })
    it('returns an empty array when given no events', function () {
      return stats.pages([])
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })

  describe('stats.activePages(events)', function () {
    it('returns a sorted list of active pages grouped by a clean URL', function () {
      return stats.activePages([
        {},
        { accountId: 'account-a', userId: 'user-a', payload: { timestamp: '100', href: new window.URL('https://www.example.net/bar') } },
        { accountId: 'account-a', userId: 'user-a', payload: { timestamp: '120', href: new window.URL('https://www.example.net/foo?param=bar') } },
        { accountId: 'account-b', userId: 'user-z', payload: { timestamp: '200', href: new window.URL('https://beep.boop/site#!/foo') } },
        { accountId: 'account-a', userId: null, payload: { } }
      ])
        .then(function (result) {
          assert.deepStrictEqual(result, [
            { key: 'https://beep.boop/site', count: 1 },
            { key: 'https://www.example.net/foo', count: 1 }
          ])
        })
    })
    it('returns an empty array when given no events', function () {
      return stats.pages([])
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })

  describe('stats.landingPages(events)', function () {
    it('returns a sorted list of landing pages grouped by a clean URL', function () {
      return stats.landingPages([
        {},
        { userId: 'user-a', payload: { timestamp: '0', sessionId: 'session-a', href: new window.URL('https://www.example.net/foo') } },
        { userId: 'user-a', payload: { timestamp: '1', sessionId: 'session-a', href: new window.URL('https://www.example.net/bar') } },
        { userId: 'user-a', payload: { timestamp: '2', sessionId: 'session-a', href: new window.URL('https://www.example.net/baz') } },
        { userId: 'user-b', payload: { timestamp: '247', sessionId: 'session-b', href: new window.URL('https://www.example.net/foo?param=bar') } },
        { userId: 'user-b', payload: { timestamp: '290', sessionId: 'session-b', href: new window.URL('https://www.example.net/bar?param=foo') } },
        { userId: 'user-z', payload: { timestamp: '50', sessionId: 'session-c', href: new window.URL('https://beep.boop/site#!/foo') } },
        { userId: null, payload: { } }
      ])
        .then(function (result) {
          assert.deepStrictEqual(result, [
            { key: 'https://www.example.net/foo', count: 2 },
            { key: 'https://beep.boop/site', count: 1 }
          ])
        })
    })
    it('returns an empty array when given no events', function () {
      return stats.landingPages([])
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })

  describe('stats.exitPages(events)', function () {
    it('returns a sorted list of exit pages grouped by a clean URL', function () {
      return stats.exitPages([
        {},
        { userId: 'user-a', payload: { timestamp: '0', sessionId: 'session-a', href: new window.URL('https://www.example.net/foo') } },
        { userId: 'user-a', payload: { timestamp: '1', sessionId: 'session-a', href: new window.URL('https://www.example.net/bar') } },
        { userId: 'user-a', payload: { timestamp: '2', sessionId: 'session-a', href: new window.URL('https://www.example.net/baz') } },
        { userId: 'user-b', payload: { timestamp: '247', sessionId: 'session-b', href: new window.URL('https://www.example.net/foo?param=bar') } },
        { userId: 'user-b', payload: { timestamp: '290', sessionId: 'session-b', href: new window.URL('https://www.example.net/bar?param=foo') } },
        { userId: 'user-z', payload: { timestamp: '50', sessionId: 'session-c', href: new window.URL('https://beep.boop/site#!/foo') } },
        { userId: null, payload: { } }
      ])
        .then(function (result) {
          assert.deepStrictEqual(result, [
            { key: 'https://www.example.net/bar', count: 1 },
            { key: 'https://www.example.net/baz', count: 1 }
          ])
        })
    })
    it('returns an empty array when given no events', function () {
      return stats.exitPages([])
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })

  describe('stats.retention(...events)', function () {
    it('returns a retention matrix for the given event chunks', function () {
      return stats.retention(
        [{}, { userId: 'user-a' }, { userId: 'user-b' }, { userId: 'user-y' }, { userId: 'user-z' }],
        [{}, { userId: 'user-m' }, { userId: 'user-a' }, { userId: 'user-z' }],
        [{}, { userId: 'user-k' }, { userId: 'user-m' }, { userId: 'user-z' }],
        []
      )
        .then(function (result) {
          assert.deepStrictEqual(result, [[1, 0.5, 0.25, 0], [1, 2 / 3, 0], [1, 0], [0]])
        })
    })
    it('returns 0 values when given empty chunks', function () {
      return stats.retention(
        [],
        [],
        []
      )
        .then(function (result) {
          assert.deepStrictEqual(result, [[0, 0, 0], [0, 0], [0]])
        })
    })
    it('returns an empty array when given no events', function () {
      return stats.retention()
        .then(function (result) {
          assert.deepStrictEqual(result, [])
        })
    })
  })
})
