const {
  getCanvas,
  rpxToRealPx,
  showCodeResult,
  shareHome
} = require('../../utils/util.js')

const Options = require('../../utils/options.js')

const options = Options.getInstance()

Page({
  onShareAppMessage: shareHome,
  data: {
    qrcodeResult: '',
    size: options.getSize(),
  },
  onLoad() {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('qrcodeInfo', (data) => {
      this._buffer = data.buffer
      const input = data.input
      this.setData({
        size: data.size
      }, () => {
        const size = rpxToRealPx(this.data.size)
        getCanvas('#myCanvas', size, size).then(canvas => {
          this._canvas = canvas
          const buffer = this._buffer
          const ctx = canvas.getContext('2d')
          const imageData = ctx.createImageData(canvas.width, canvas.height)
          const pixelSize = canvas.width * canvas.height
          for (let i = 0; i < pixelSize; i++) {
            imageData.data.set([buffer[i], buffer[i], buffer[i], 255], i * 4)
          }
          ctx.putImageData(imageData, 0, 0)
          this.setData({
            qrcodeResult: input
          })
        })
      })
    })
  },
  onReady () {
  },
  saveQRCode () {
    wx.canvasToTempFilePath({
      canvas: this._canvas,
      fileType: 'png',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          }
        })
      }
    })
  },
  backHome () {
    wx.navigateBack({
      delta: 1
    })
  },
  showResult () {
    showCodeResult(this.data.qrcodeResult, '二维码内容')
  }
})
