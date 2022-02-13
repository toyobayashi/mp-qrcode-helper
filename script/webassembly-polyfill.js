var _WebAssembly = typeof WXWebAssembly !== 'undefined' ? WXWebAssembly : (typeof WebAssembly !== 'undefined' ? WebAssembly : undefined);
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
