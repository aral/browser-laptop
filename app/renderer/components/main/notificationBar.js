/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')
const Immutable = require('immutable')

// Components
const ReduxComponent = require('../reduxComponent')
const NotificationItem = require('./notificationItem')

// Utils
const {getOrigin} = require('../../../../js/lib/urlutil')
const frameStateUtil = require('../../../../js/state/frameStateUtil')
const notificationBarState = require('../../../common/state/notificationBarState')

// Styles
const commonStyles = require('../styles/commonStyles')
const globalStyles = require('../styles/global')

class NotificationBar extends React.Component {
  mergeProps (state, ownProps) {
    const currentWindow = state.get('currentWindow')
    const activeFrame = frameStateUtil.getActiveFrame(currentWindow) || Immutable.Map()
    const activeOrigin = getOrigin(activeFrame.get('location'))
    const notifications = state.get('notifications', Immutable.List())

    const props = {}
    // TODO: Make use of getActiveTabNotifications API instead
    props.activeNotifications = notifications
      .filter((item) => {
        return item.get('frameOrigin')
          ? activeOrigin === item.get('frameOrigin')
          : !item.get('greeting') // greetings indicate a global notification
      })
      .takeLast(3)
      .map((notification) => notification.get('message'))

    props.isPerTab = notificationBarState.isPerTab(state)
    return props
  }

  render () {
    if (!this.props.isPerTab) {
      return null
    }
    return <div className={css(commonStyles.notificationBar)} data-test-id='notificationBar'>
      {
        this.props.activeNotifications.map((message) =>
          <NotificationItem message={message} />
        )
      }
    </div>
  }
}

// TODO maybe this should be merged in <NotificationBar /> and defined
// per conditional prop such as isGlobal={conditional}
class BraveNotificationBar extends React.Component {
  mergeProps (state, ownProps) {
    const props = {}
    props.notifications = notificationBarState.getGlobalNotifications(state)
    props.isGlobal = notificationBarState.isGlobal(state)
    return props
  }

  render () {
    if (!this.props.isGlobal) {
      return null
    }
    return (
      <div className={css(commonStyles.notificationBar)} data-test-id='braveNotificationBar'>
        {
          this.props.notifications.map((notification) =>
            <NotificationItem message={notification.get('message')} />
          )
        }
      </div>
    )
  }
}

class NotificationBarCaret extends React.Component {
  render () {
    return <div className={css(styles.caretWrapper)}>
      <div className={css(styles.caretWrapper__caret)} />
    </div>
  }
}

const styles = StyleSheet.create({
  caretWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: globalStyles.zindex.zindexTabs,
    filter: 'drop-shadow(rgba(0,0,0,0.25) 0px 0px 1px)'
  },

  caretWrapper__caret: {
    position: 'relative',
    margin: 'auto',
    width: '16px',

    ':before': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      borderBottom: `6px solid ${globalStyles.color.notificationItemColor}`,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent'
    }
  }
})

module.exports = {
  NotificationBar: ReduxComponent.connect(NotificationBar),
  BraveNotificationBar: ReduxComponent.connect(BraveNotificationBar),
  NotificationBarCaret
}
