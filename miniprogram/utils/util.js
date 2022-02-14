const systemInfo = wx.getSystemInfoSync()
const dpr = systemInfo.pixelRatio
const windowWidth = systemInfo.windowWidth

function toRealPx (px) {
  return Math.floor(px * dpr)
}

function rpxToRealPx (rpx) {
  return toRealPx(Math.floor(rpx * windowWidth / 750))
}

function getCanvas (query, width, height) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().select(query)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          reject(new Error('Canvas not found'))
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        
        console.log(res[0].width, res[0].height, dpr)
        canvas.width = width || toRealPx(res[0].width)
        canvas.height = height || toRealPx(res[0].height)
        ctx.scale(dpr, dpr)
        if (systemInfo.platform === 'devtools') {
          console.log(canvas._canvasRef)
        }

        resolve(canvas)
      })
  })
}

class ZXingMatrix {
  constructor (Module, pointer) {
    this._Module = Module
    this._data = pointer
  }

  getDataAddress () {
    if (!this._data) throw new Error('Bad matrix')
    return this._Module._zxingwasm_get_matrix_data(this._data)
  }
  getDataSize () {
    if (!this._data) throw new Error('Bad matrix')
    return this._Module._zxingwasm_get_matrix_size(this._data)
  }
  getWidth () {
    if (!this._data) throw new Error('Bad matrix')
    return this._Module._zxingwasm_get_matrix_width(this._data)
  }
  getHeight () {
    if (!this._data) throw new Error('Bad matrix')
    return this._Module._zxingwasm_get_matrix_height(this._data)
  }
  destroy () {
    this._Module._zxingwasm_free_matrix(this._data)
    this._data = 0
  }
}

let wasmPromise
let _Module

function getWasmModule () {
  return _Module
}

function initWasm () {
  if (wasmPromise) {
    return wasmPromise
  }

  wasmPromise = new Promise((resolve, reject) => {
    const zxingwasm = require('../lib/zxingwasm.js')
    const promise = zxingwasm.default({
      locateFile: () => 'lib/zxingwasm.wasm'
    })
    promise.then(({ Module }) => {
      _Module = Module
      resolve({
        Module,
        generateMatrix (text, format, encoding, margin, width, height, eccLevel) {
          const matrixPointer = Module.ccall('zxingwasm_generate', 'number', [
            'string',
            'string',
            'string',
            'number',
            'number',
            'number',
            'number'
          ], [text, format, encoding, margin, width, height, eccLevel])
          if (!matrixPointer) {
            const errmsg = Module.UTF8ToString(Module._zxingwasm_get_last_error_msg())
            throw new Error(errmsg)
          }
          return new ZXingMatrix(Module, matrixPointer)
        }
      })
    }, (err) => {
      wasmPromise = undefined
      _Module = undefined
      reject(err)
    })
  })

  return wasmPromise
}

function checkWebAssembly () {
  if (typeof WXWebAssembly === 'undefined') {
    wx.showModal({
      title: '提示',
      content: `当前微信版本(v${wx.getSystemInfoSync().version})过低，无法使用该功能，请升级到最新微信版本后重试。`,
      showCancel: false
    })
    return false
  }
  return true
}

function showCodeResult (content, title = '扫码结果') {
  wx.showModal({
    title,
    content,
    confirmText: '复制',
    confirmColor: '#07C160',
    cancelText: '确定',
    success: (res) => {
      if (res.confirm) {
        wx.setClipboardData({
          data: content
        })
      }
    }
  })
}

/**
 * @param {Date} d
 * @returns {string}
 */
function formatTime (d) {
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()

  return `${year}年${month}月${date}日 ${('00' + h).slice(-2)}:${('00' + m).slice(-2)}:${('00' + s).slice(-2)}`
}

function shareHome () {
  return {
    path: '/pages/index/index'
  }
}

function shareTimeline () {
  return {}
}

exports.toRealPx = toRealPx
exports.rpxToRealPx = rpxToRealPx
exports.getCanvas = getCanvas
exports.initWasm = initWasm
exports.getWasmModule = getWasmModule
exports.checkWebAssembly = checkWebAssembly
exports.showCodeResult = showCodeResult
exports.formatTime = formatTime
exports.shareHome = shareHome
exports.shareTimeline = shareTimeline
exports.systemInfo = systemInfo
