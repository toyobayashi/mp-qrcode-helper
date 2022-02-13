const oid = require('./oid.js')

const historyKey = 'history'

class History {
  constructor () {
    const historyJson = wx.getStorageSync(historyKey)
    this._data = historyJson ? JSON.parse(historyJson) : []
  }

  getData () {
    return this._data
  }

  add (type, content) {
    this._data.push({
      id: oid.generate(),
      type,
      content
    })
    this.save()
  }

  remove (id) {
    for (let i = 0; i < this._data.length; ++i) {
      if (this._data[i].id === id) {
        this._data.splice(i, 1)
        break
      }
    }
    this.save()
  }

  clear () {
    this._data.length = 0
    this.save()
  }

  save () {
    wx.setStorageSync(historyKey, JSON.stringify(this._data))
  }
}

History._instance = null

/**
 * @returns {History}
 */
History.getInstance = function () {
  if (!History._instance) {
    History._instance = new History()
  }
  return History._instance
}

module.exports = History
