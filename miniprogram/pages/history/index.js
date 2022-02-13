const {
  showCodeResult,
  formatTime,
  shareHome,
  shareTimeline
} = require('../../utils/util.js')

const oid = require('../../utils/oid.js')

const History = require('../../utils/history.js')
const history = History.getInstance()

Page({
  onShareAppMessage: shareHome,
  onShareTimeline: shareTimeline,
  data: {
    history: []
  },
  onLoad() {
  },
  onShow () {
    this.update()
  },
  onReady () {
  },
  update () {
    this.setData({
      history: history.getData()
    })
  },
  showDetail (e) {
    const item = e.target.dataset.item
    showCodeResult(item.content, formatTime(new Date(oid.getTimestamp(item.id) * 1000)))
  },
  copyItem (e) {
    const item = e.target.dataset.item
    wx.setClipboardData({
      data: item.content
    })
  },
  removeItem (e) {
    const item = e.target.dataset.item
    history.remove(item.id)
    this.update()
  },
  clear () {
    history.clear()
    this.update()
  }
})
