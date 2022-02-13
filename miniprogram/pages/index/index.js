const {
  initWasm,
  checkWebAssembly,
  rpxToRealPx,
  showCodeResult,
  shareHome,
  shareTimeline
} = require('../../utils/util.js')

const Options = require('../../utils/options.js')
const History = require('../../utils/history.js')

const options = Options.getInstance()
const history = History.getInstance()

const app = getApp()

Page({
  onShareAppMessage: shareHome,
  onShareTimeline: shareTimeline,
  data: {
    textInput: '',
    margin: options.getMargin(),
    size: options.getSize(),
    eccLevel: options.getEccLevel()
  },
  onLoad() {
  },
  onReady () {
  },
  onInput (e) {
    this.setData({
      textInput: e.detail.value
    })
  },
  clearInput () {
    this.setData({
      textInput: ''
    })
  },
  readQRCode (e) {
    wx.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        const content = res.result
        this.setData({
          textInput: content
        })
        showCodeResult(content)
        history.add(0, content)
      }
    })
  },
  generateQRCode (e) {
    if (!checkWebAssembly()) return
    if (!this.data.textInput) {
      wx.showModal({
        title: '提示',
        content: '请先输入文本再生成二维码',
        showCancel: false
      })
      return
    }
    initWasm().then(({ Module, generateMatrix }) => {
      const input = this.data.textInput
      const size = rpxToRealPx(this.data.size)
      const matrix = generateMatrix(input, 'QRCode', 'UTF-8', rpxToRealPx(this.data.margin), size, size, this.data.eccLevel)

      const dataPtr = matrix.getDataAddress()
      const dataSize = matrix.getDataSize()
      console.log(matrix.getWidth(), matrix.getHeight(), dataPtr, dataSize)
      const buffer = new Uint8Array(Module.HEAPU8.buffer, dataPtr, dataSize).slice()
      matrix.destroy()
      history.add(1, input)
      wx.navigateTo({
        url: '/pages/qrcode/index',
        success: (res) => {
          res.eventChannel.emit('qrcodeInfo', {
            size: this.data.size,
            input,
            buffer
          })
        }
      })
    })
  },
  marginChange (e) {
    options.setMargin(e.detail.value)
    this.setData({
      margin: options.getMargin()
    })
  },
  sizeChange (e) {
    options.setSize(e.detail.value)
    this.setData({
      size: options.getSize()
    })
  },
  eccLevelChange (e) {
    options.setEccLevel(e.detail.value)
    this.setData({
      eccLevel: options.getEccLevel()
    })
  },
  setDefault () {
    options.setDefault()
    this.setData({
      margin: options.getMargin(),
      size: options.getSize(),
      eccLevel: options.getEccLevel()
    })
  }
})
