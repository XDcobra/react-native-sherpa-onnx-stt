package com.sherpaonnxstt

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = SherpaOnnxSttModule.NAME)
class SherpaOnnxSttModule(reactContext: ReactApplicationContext) :
  NativeSherpaOnnxSttSpec(reactContext) {

  init {
    System.loadLibrary("sherpaonnxstt")
  }

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  /**
   * Test method to verify sherpa-onnx native library is loaded.
   * This is a minimal "Hello World" test for Phase 1.
   */
  override fun testSherpaInit(promise: Promise) {
    try {
      val result = nativeTestSherpaInit()
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", "Failed to test sherpa-onnx initialization", e)
    }
  }

  /**
   * Initialize sherpa-onnx with model directory.
   * Phase 1: Stub implementation
   */
  override fun initializeSherpaOnnx(modelDir: String, promise: Promise) {
    try {
      val success = nativeInitialize(modelDir)
      if (success) {
        promise.resolve(Unit)
      } else {
        promise.reject("INIT_ERROR", "Failed to initialize sherpa-onnx")
      }
    } catch (e: Exception) {
      promise.reject("INIT_ERROR", "Exception during initialization", e)
    }
  }

  /**
   * Transcribe an audio file.
   * Phase 1: Stub implementation
   */
  override fun transcribeFile(filePath: String, promise: Promise) {
    try {
      val result = nativeTranscribeFile(filePath)
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("TRANSCRIBE_ERROR", "Failed to transcribe file", e)
    }
  }

  /**
   * Release sherpa-onnx resources.
   */
  override fun unloadSherpaOnnx(promise: Promise) {
    try {
      nativeRelease()
      promise.resolve(Unit)
    } catch (e: Exception) {
      promise.reject("RELEASE_ERROR", "Failed to release resources", e)
    }
  }

  companion object {
    const val NAME = "SherpaOnnxStt"

    // Native JNI methods
    @JvmStatic
    private external fun nativeTestSherpaInit(): String

    @JvmStatic
    private external fun nativeInitialize(modelDir: String): Boolean

    @JvmStatic
    private external fun nativeTranscribeFile(filePath: String): String

    @JvmStatic
    private external fun nativeRelease()
  }
}
