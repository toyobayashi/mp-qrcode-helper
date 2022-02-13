# 码上扫扫小程序

WebAssembly 在微信小程序中的实践。

本小程序提供无后端服务的二维码识别和生成功能，生成功能使用 zxing-cpp 库编译到 WebAssembly 实现，要求使用较新版本的微信才能运行。

![mpcode_344](./assets/mpcode_344.jpg)

## 技术细节

小程序的 [WXWebAssembly](https://developers.weixin.qq.com/miniprogram/dev/framework/performance/wasm.html) 不是标准的 [WebAssembly](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly)，对于 Emscripten 编译出来的胶水 JS 代码，需要修改以下内容才能在小程序中运行：

1. 使运行环境判断为 `ENVIRONMENT_IS_WEB`

    ```js
    var ENVIRONMENT_IS_WEB = typeof window === "object";
    ```

    要改为

    ```js
    var ENVIRONMENT_IS_WEB = typeof window === "object" || typeof wx === "object";
    ```

2. 兼容 `WXWebAssembly` 和 `WXWebAssembly.RuntimeError`

    全局替换所有 `WebAssembly` 为 `_WebAssembly`，并在前面添加以下代码

    ```js
    var _WebAssembly = typeof WXWebAssembly !== 'undefined'
      ? WXWebAssembly
      : (typeof WebAssembly !== 'undefined' ? WebAssembly : undefined);
    if (_WebAssembly) {
      _WebAssembly.RuntimeError = _WebAssembly.RuntimeError || (function () {
        var setPrototypeOf = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };

        var __extends = function (d, b) {
          if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
          setPrototypeOf(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };

        return (function (_super) {
          __extends(RuntimeError, _super);
          function RuntimeError (message) {
            if (!(this instanceof RuntimeError)) {
              throw new TypeError("Class constructor RuntimeError cannot be invoked without 'new'")
            }

            var _this = _super.call(this, message) || this;
            var ErrorConstructor = this.constructor;
            setPrototypeOf(_this, ErrorConstructor.prototype);

            if (typeof Error.captureStackTrace === 'function') {
              Error.captureStackTrace(_this, ErrorConstructor);
            }
            return _this;
          }
          Object.defineProperty(RuntimeError.prototype, 'name', {
            configurable: true,
            writable: true,
            value: 'RuntimeError'
          })
          return RuntimeError;
        })(Error);
      })();
    }
    ```

3. `WXWebAssembly.instantiate` 第一个参数要为包内 wasm 文件路径

    ```js
    function instantiateArrayBuffer(receiver) {
      return getBinaryPromise().then(function(binary) {
        return WebAssembly.instantiate(binary, info);
      }).then(function(instance) {
        return instance;
      }).then(receiver, function(reason) {
        err("failed to asynchronously prepare wasm: " + reason);
        abort(reason);
      });
    }
    ```

    要改为

    ```js
    function instantiateArrayBuffer(receiver) {
      return (typeof WXWebAssembly !== "undefined"
        ? Promise.resolve(wasmBinaryFile)
        : getBinaryPromise()
      ).then(function(binary) {
        return _WebAssembly.instantiate(binary, info);
      }).then(function(instance) {
        return instance;
      }).then(receiver, function(reason) {
        err("failed to asynchronously prepare wasm: " + reason);
        abort(reason);
      });
    }
    ```

    且初始化时需要设置 `Module.locateFile`

    ```js
    const Module = require('./path/to/glue.js')
    Module.locateFile = () => 'lib/zxingwasm.wasm'
    Module.onRuntimeInitialized = function () {
      // ...
    }
    ```
