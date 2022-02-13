const {
  shareHome,
  shareTimeline
} = require('../../utils/util.js')

Page({
  onShareAppMessage: shareHome,
  onShareTimeline: shareTimeline,
  data: {
  },
  onLoad() {
  },
  onReady () {
  }
})
