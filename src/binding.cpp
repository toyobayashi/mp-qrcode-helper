#include <emscripten.h>
#include <string>

#include "BitMatrix.h"
#include "TextUtfEncoding.h"
#include "BarcodeFormat.h"
#include "MultiFormatWriter.h"
#include "CharacterSetECI.h"

namespace zxingwasm {
  std::string error_msg;

  inline void SetLastErrorMessage(const std::string& err_msg) {
    error_msg = err_msg;
  }

  inline void ClearLastErrorMessage() {
    error_msg = "";
  }
}  // namespace zxingwasm

extern "C" EMSCRIPTEN_KEEPALIVE
const char* zxingwasm_get_last_error_msg() {
  return zxingwasm::error_msg.c_str();
}

extern "C" EMSCRIPTEN_KEEPALIVE
ZXing::Matrix<uint8_t>* zxingwasm_generate(const char* text,
                                           const char* format,
                                           const char* encoding,
                                           int margin,
                                           int width,
                                           int height,
                                           int ecc_level) {
  zxingwasm::ClearLastErrorMessage();
  try {
    ZXing::BarcodeFormat barcodeFormat = ZXing::BarcodeFormatFromString(format);
    if (barcodeFormat == ZXing::BarcodeFormat::None) {
      zxingwasm::SetLastErrorMessage(
        std::string("Unsupported format: ") + format);
      return nullptr;
    }

    ZXing::MultiFormatWriter writer(barcodeFormat);
    if (margin >= 0)
      writer.setMargin(margin);

    ZXing::CharacterSet charset =
      ZXing::CharacterSetECI::CharsetFromName(encoding);
    if (charset != ZXing::CharacterSet::Unknown)
      writer.setEncoding(charset);

    if (ecc_level >= 0 && ecc_level <= 8)
      writer.setEccLevel(ecc_level);

    ZXing::Matrix<uint8_t>* buffer = new ZXing::Matrix<uint8_t>(
      ZXing::ToMatrix<uint8_t>(writer.encode(
        ZXing::TextUtfEncoding::FromUtf8(text), width, height)));

    return buffer;
  } catch (const std::exception& e) {
    zxingwasm::SetLastErrorMessage(e.what());
    return nullptr;
  } catch (...) {
    zxingwasm::SetLastErrorMessage("Unknown error");
    return nullptr;
  }
}

extern "C" EMSCRIPTEN_KEEPALIVE
void zxingwasm_free_matrix(ZXing::Matrix<uint8_t>* matrix) {
  zxingwasm::ClearLastErrorMessage();
  if (matrix == nullptr) return;
  delete matrix;
}

#define ZXINGWASM_CHECK(p) \
  do { \
    if ((p) == nullptr) { \
      zxingwasm::SetLastErrorMessage("Bad matrix"); \
      return 0; \
    } \
  } while (0)

extern "C" EMSCRIPTEN_KEEPALIVE
int zxingwasm_get_matrix_data(const ZXing::Matrix<uint8_t>* matrix) {
  ZXINGWASM_CHECK(matrix);
  zxingwasm::ClearLastErrorMessage();
  return reinterpret_cast<int>(matrix->data());
}

extern "C" EMSCRIPTEN_KEEPALIVE
int zxingwasm_get_matrix_size(const ZXing::Matrix<uint8_t>* matrix) {
  ZXINGWASM_CHECK(matrix);
  zxingwasm::ClearLastErrorMessage();
  return matrix->size();
}

extern "C" EMSCRIPTEN_KEEPALIVE
int zxingwasm_get_matrix_width(const ZXing::Matrix<uint8_t>* matrix) {
  zxingwasm::ClearLastErrorMessage();
  if (matrix == nullptr) return 0;
  return matrix->width();
}

extern "C" EMSCRIPTEN_KEEPALIVE
int zxingwasm_get_matrix_height(const ZXing::Matrix<uint8_t>* matrix) {
  ZXINGWASM_CHECK(matrix);
  zxingwasm::ClearLastErrorMessage();
  return matrix->height();
}
