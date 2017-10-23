/* global describe, it, beforeEach */
const notificationBarState = require('../../../../../app/common/state/notificationBarState')
const {isList} = require('../../../../../app/common/state/immutableUtil')
const Immutable = require('immutable')
const assert = require('chai').assert

const frameKey = 1
const index = 0
const site1 = 'https://nespressolovers.com'
const site2 = 'https://starbucks.com'
let state
const defaultState = Immutable.fromJS({
  notifications: [],
  currentWindow: {
    framesInternal: {
      index: { 1: 0 },
      tabIndex: { 1: 0 }
    },
    frames: [{
      index,
      key: frameKey,
      tabId: 1,
      location: site1
    }],
    activeFrameKey: frameKey,
    tabs: [{
      key: frameKey,
      index: index
    }]
  }
})

describe('notificationBarState test', function () {
  beforeEach(function () {
    state = defaultState
  })
  describe('getActiveTabNotifications', function () {
    it('returns an immutable list of notifications', function () {
      state = state.mergeIn(['notifications'], [
        { greeting: 'House Brave', message: 'The BAT is coming' },
        { frameOrigin: site1, message: 'nespresso site' }
      ])
      const result = notificationBarState.getActiveTabNotifications(state)
      assert.equal(isList(result), true)
    })

    it('does not show greeting notifications', function () {
      state = state.mergeIn(['notifications'], [
        { greeting: 'Serg of House Targaryen', message: 'DRACARYS!!!!' }
      ])
      const result = notificationBarState.getActiveTabNotifications(state)
      assert.equal(result.isEmpty(), true)
    })

    it('does not show if notification origin is different than frame origin', function () {
      state = state.mergeIn(['notifications'], [
        { frameOrigin: site1, message: 'what else?®' }
      ])
      state = state.setIn(['currentWindow', 'frames', 0, 'location'], site2)

      const result = notificationBarState.getActiveTabNotifications(state)
      assert.equal(result.isEmpty(), true)
    })

    it('shows if notification origin is equal to the frame origin', function () {
      state = state.mergeIn(['notifications'], [
        { frameOrigin: site1, message: 'nespressalicious' }
      ])

      const result = notificationBarState.getActiveTabNotifications(state)
      const originMatch = result.every(notification => notification.get('frameOrigin') === site1)

      assert.equal(originMatch, true)
      assert.equal(result.isEmpty(), false)
    })
  })

  describe('isPerTab', function () {
    it('returns true for per tab notifications', function () {
      state = state.mergeIn(['notifications'], [
        { frameOrigin: site1, message: 'nespresserism' }
      ])
      const result = notificationBarState.isPerTab(state)
      assert.equal(result, true)
    })

    it('returns false for greeting notifications', function () {
      state = state.mergeIn(['notifications'], [
        { greeting: 'Serg the Android king said', message: 'Burn them all!' }
      ])
      const result = notificationBarState.isPerTab(state)
      assert.equal(result, false)
    })
  })

  describe('getGlobalNotifications', function () {
    it('returns an immutable list of notifications', function () {
      state = state.mergeIn(['notifications'], [
        { greeting: 'Serg > Night King', message: 'Android Dragons FTW' },
        { frameOrigin: site1, message: 'nespresso the best' }
      ])
      const result = notificationBarState.getGlobalNotifications(state)
      assert.equal(isList(result), true)
    })

    it('does not show if notification has no greeting', function () {
      state = state.mergeIn(['notifications'], [
        { frameOrigin: site1, message: 'nespressalicious' }
      ])
      const result = notificationBarState.getGlobalNotifications(state)
      assert.equal(result.isEmpty(), true)
    })

    it('shows for greeting notification', function () {
      state = state.mergeIn(['notifications'], [
        { greeting: 'You know nothing', message: 'dragons > monkeys' }
      ])
      const result = notificationBarState.getGlobalNotifications(state)
      assert.equal(result.isEmpty(), false)
    })
  })

  describe('isGlobal', function () {
    it('returns true for greeting notifications', function () {
      state = state.mergeIn(['notifications'], [
        { greeting: 'Serg\'s best friend', message: 'Drogon not monkeys' }
      ])
      const result = notificationBarState.isGlobal(state)
      assert.equal(result, true)
    })

    it('returns false for per tab notifications', function () {
      state = state.mergeIn(['notifications'], [
        { frameOrigin: site1, message: 'nespressitastic' }
      ])
      const result = notificationBarState.isGlobal(state)
      assert.equal(result, false)
    })
  })
})
