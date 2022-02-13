const optionsKey = 'options'

class Options {
  constructor () {
    const optionsJson = wx.getStorageSync(optionsKey)
    this._data = optionsJson ? JSON.parse(optionsJson) : {}
  }

  getMargin () {
    return this._data.margin != null ? this._data.margin : 8
  }

  setMargin (value) {
    this._data.margin = value
    this.save()
  }

  setSize (value) {
    this._data.size = value
    this.save()
  }

  getSize () {
    return this._data.size != null ? this._data.size : 375
  }

  setEccLevel (value) {
    this._data.eccLevel = value
    this.save()
  }

  getEccLevel () {
    return this._data.eccLevel != null ? this._data.eccLevel : 8
  }

  setDefault () {
    this.setMargin(8)
    this.setSize(375)
    this.setEccLevel(8)
  }

  save () {
    wx.setStorageSync(optionsKey, JSON.stringify(this._data))
  }
}

Options._instance = null

/**
 * @returns {Options}
 */
Options.getInstance = function () {
  if (!Options._instance) {
    Options._instance = new Options()
  }
  return Options._instance
}

module.exports = Options
