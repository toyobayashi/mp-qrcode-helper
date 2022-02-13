const fs = require('fs')
const path = require('path')

const js = path.join(__dirname, '../miniprogram/lib/zxingwasm.js')
const wasm = path.join(__dirname, '../miniprogram/lib/zxingwasm.wasm')
fs.copyFileSync(path.join(__dirname, '../build/zxingwasm.js'), js)
fs.copyFileSync(path.join(__dirname, '../build/zxingwasm.wasm'), wasm)

let code = fs.readFileSync(js, 'utf8')

code = code.replace(/WebAssembly/g, '_WebAssembly')
code = code.replace(/var ENVIRONMENT_IS_WEB = typeof window === "object";/g, fs.readFileSync(path.join(__dirname, './webassembly-polyfill.js'), 'utf8') +
  'var ENVIRONMENT_IS_WEB = typeof window === "object" || typeof wx === "object";')
code = code.replace(/return getBinaryPromise\(\)/g, 'return (typeof wx !== "undefined" ? Promise.resolve(wasmBinaryFile) : getBinaryPromise())')

fs.writeFileSync(js, code, 'utf8')
