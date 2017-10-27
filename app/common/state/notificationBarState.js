/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert')
const Immutable = require('immutable')
const {getOrigin} = require('../../../js/lib/urlutil')
const {makeImmutable, isMap} = require('./immutableUtil')
const {getActiveFrame} = require('../../../js/state/frameStateUtil')

const api = {
  validateState: function (state) {
    state = makeImmutable(state)
    assert.ok(isMap(state), 'state must be an Immutable.Map')
    return state
  },

  /**
   * Gets an immutable list of notifications
   * @param {Map} appState - The app state object
   * @return {List} - immutable list of notifications
   */
  getNotifications: (state) => {
    state = api.validateState(state)
    return state.get('notifications', Immutable.List())
  },

  /**
   * Checks if the active frame origin match the current notification origin
   * @param {Map} appState - The app state object
   * @return {Boolean} - whether or not the active notification
   * origin match the current frame origin
   */
  isNotificationSameOrigin: (state, item) => {
    state = api.validateState(state)
    const activeFrame = getActiveFrame(state.get('currentWindow')) || Immutable.Map()

    if (!item.has('frameOrigin')) {
      return false
    }
    return getOrigin(activeFrame.get('location')) === item.get('frameOrigin')
  }
}

const notificationBarState = {
  /**
   * Gets the notifications that should be visible in the active tab
   * @param {Map} appState - The app state object
   * @return {List} - list of the current active tab's notification
   */
  getActiveTabNotifications: (state) => {
    const notifications = api.getNotifications(state)
    return notifications.filter(item => api.isNotificationSameOrigin(state, item))
  },

  /**
   * Checks whether or not there are per-tab notifications for the active tab
   * @param {Map} appState - The app state object
   * @return {Boolean} - whether or not the notification should be shown per tab
   */
  isPerTab: (state) => {
    return !notificationBarState.isGlobal(state)
  },

  /**
   * Get an immutable list of global notifications
   * @param {Map} appState - The app state object
   * @return {List} - list of all global notifications
   */
  getGlobalNotifications: (state) => {
    const notifications = api.getNotifications(state)
    return notifications.filter(item => item.has('greeting'))
  },

  /**
   * Get an immutable list of global notifications
   * @param {Map} appState - The app state object
   * @param {Boolean} - whether or not the notification should be shown in as global
   */
  isGlobal: (state) => {
    return !notificationBarState.getGlobalNotifications(state).isEmpty()
  }
}

module.exports = notificationBarState
