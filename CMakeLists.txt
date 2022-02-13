cmake_minimum_required(VERSION 3.17.0)

project(zxingwasm)

set(BUILD_READERS OFF)
set(BUILD_WRITERS ON)

add_compile_options(
  "-sDISABLE_EXCEPTION_CATCHING=0"
)

add_subdirectory("deps/zxing-cpp/core")

add_executable(zxingwasm
  "src/binding.cpp"
)

set_target_properties(zxingwasm
  PROPERTIES CXX_STANDARD 17
)

target_link_options(zxingwasm PRIVATE
  "--minify" "0"
  "-sDISABLE_EXCEPTION_CATCHING=0"
  "-sALLOW_MEMORY_GROWTH=1"
  "-sMIN_CHROME_VERSION=48"
  "-sEXPORTED_FUNCTIONS=['_malloc','_free']"
  "-sEXPORTED_RUNTIME_METHODS=['ccall','cwrap','UTF8ToString']"
)

add_custom_command(TARGET zxingwasm POST_BUILD
  COMMAND npx emwrap "--name=zxingwasm" "$<TARGET_FILE:zxingwasm>"
  COMMAND node "../script/copy.js"
)

target_link_libraries(zxingwasm ZXing)
