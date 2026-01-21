cmake_minimum_required(VERSION 3.22.1)

project("sherpaonnxstt")

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Android specific settings
set(CMAKE_ANDROID_ARCH_ABI ${ANDROID_ABI})
set(CMAKE_SYSTEM_NAME Android)
set(CMAKE_SYSTEM_VERSION ${ANDROID_PLATFORM_LEVEL})

# Calculate path relative to project root: android/src/main/cpp -> android -> project root
get_filename_component(PROJECT_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../.." ABSOLUTE)

# Fixed location where Gradle extracts native libraries
set(EXTRACTED_LIBS_DIR "${PROJECT_ROOT}/build/extracted_native_libs/jni/${ANDROID_ABI}")

# Try to find library directly by path (most reliable)
set(SHERPA_ONNX_LIB_CXX "${EXTRACTED_LIBS_DIR}/libsherpa-onnx-cxx-api.so")
set(SHERPA_ONNX_LIB_C "${EXTRACTED_LIBS_DIR}/libsherpa-onnx-c-api.so")

if(EXISTS "${SHERPA_ONNX_LIB_CXX}")
    set(SHERPA_ONNX_LIB "${SHERPA_ONNX_LIB_CXX}")
    message(STATUS "Found sherpa-onnx library (cxx-api): ${SHERPA_ONNX_LIB}")
elseif(EXISTS "${SHERPA_ONNX_LIB_C}")
    set(SHERPA_ONNX_LIB "${SHERPA_ONNX_LIB_C}")
    message(STATUS "Found sherpa-onnx library (c-api): ${SHERPA_ONNX_LIB}")
else()
    # Fallback: use find_library
    find_library(SHERPA_ONNX_LIB
        NAMES sherpa-onnx-cxx-api libsherpa-onnx-cxx-api sherpa-onnx-c-api libsherpa-onnx-c-api
        PATHS ${EXTRACTED_LIBS_DIR}
        NO_DEFAULT_PATH
    )
    
    if(NOT SHERPA_ONNX_LIB)
        message(FATAL_ERROR "sherpa-onnx library not found in ${EXTRACTED_LIBS_DIR}\n"
                            "Expected files:\n"
                            "  - ${SHERPA_ONNX_LIB_CXX}\n"
                            "  - ${SHERPA_ONNX_LIB_C}\n"
                            "Please ensure extractNativeLibs task ran successfully.")
    endif()
endif()

# Source files
set(SOURCES
    jni/sherpa-onnx-stt-jni.cpp
    jni/sherpa-onnx-wrapper.cpp
)

# Create shared library
add_library(sherpaonnxstt SHARED
    ${SOURCES}
)

# Include directories (must be after add_library)
target_include_directories(sherpaonnxstt PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/jni
)

# Link libraries
target_link_libraries(sherpaonnxstt
    ${SHERPA_ONNX_LIB}
    log
    android
)

# Compiler flags
target_compile_options(sherpaonnxstt PRIVATE
    -Wall
    -Wextra
    -fvisibility=hidden
)
