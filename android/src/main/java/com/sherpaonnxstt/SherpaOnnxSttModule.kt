package com.sherpaonnxstt

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

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
   * Resolve model path based on configuration.
   * Handles asset paths, file system paths, and auto-detection.
   */
  override fun resolveModelPath(config: ReadableMap, promise: Promise) {
    try {
      val type = config.getString("type") ?: "auto"
      val path = config.getString("path")
        ?: throw IllegalArgumentException("Path is required")

      val resolvedPath = when (type) {
        "asset" -> resolveAssetPath(path)
        "file" -> resolveFilePath(path)
        "auto" -> resolveAutoPath(path)
        else -> throw IllegalArgumentException("Unknown path type: $type")
      }

      promise.resolve(resolvedPath)
    } catch (e: Exception) {
      val errorMessage = "Failed to resolve model path: ${e.message ?: e.javaClass.simpleName}"
      Log.e(NAME, errorMessage, e)
      promise.reject("PATH_RESOLVE_ERROR", errorMessage, e)
    }
  }

  /**
   * Resolve asset path - copy from assets to internal storage if needed
   */
  private fun resolveAssetPath(assetPath: String): String {
    val assetManager = reactApplicationContext.assets
    val targetDir = File(reactApplicationContext.filesDir, "models")
    targetDir.mkdirs()

    val modelDir = File(targetDir, File(assetPath).name)
    
    // Check if already extracted
    if (modelDir.exists() && modelDir.isDirectory) {
      return modelDir.absolutePath
    }

    // Extract from assets recursively
    try {
      modelDir.mkdirs()
      copyAssetRecursively(assetManager, assetPath, modelDir)
      return modelDir.absolutePath
    } catch (e: Exception) {
      throw IllegalArgumentException("Failed to extract asset: $assetPath", e)
    }
  }

  /**
   * Recursively copy assets from asset manager to target directory
   */
  private fun copyAssetRecursively(
    assetManager: android.content.res.AssetManager,
    assetPath: String,
    targetDir: File
  ) {
    val assetFiles = assetManager.list(assetPath)
      ?: throw IllegalArgumentException("Asset path not found: $assetPath")

    for (fileName in assetFiles) {
      val assetFilePath = "$assetPath/$fileName"
      val targetFile = File(targetDir, fileName)

      try {
        // Try to list as directory first
        val subFiles = assetManager.list(assetFilePath)
        if (subFiles != null && subFiles.isNotEmpty()) {
          // It's a directory, recurse
          targetFile.mkdirs()
          copyAssetRecursively(assetManager, assetFilePath, targetFile)
        } else {
          // It's a file, copy it
          assetManager.open(assetFilePath).use { input ->
            FileOutputStream(targetFile).use { output ->
              input.copyTo(output)
            }
          }
        }
      } catch (e: Exception) {
        // If listing fails, try to open as file
        try {
          assetManager.open(assetFilePath).use { input ->
            FileOutputStream(targetFile).use { output ->
              input.copyTo(output)
            }
          }
        } catch (fileException: Exception) {
          throw IllegalArgumentException("Failed to copy asset: $assetFilePath", fileException)
        }
      }
    }
  }

  /**
   * Resolve file system path - verify it exists
   */
  private fun resolveFilePath(filePath: String): String {
    val file = File(filePath)
    if (!file.exists()) {
      throw IllegalArgumentException("File path does not exist: $filePath")
    }
    if (!file.isDirectory) {
      throw IllegalArgumentException("Path is not a directory: $filePath")
    }
    return file.absolutePath
  }

  /**
   * Auto-detect path - try asset first, then file system
   */
  private fun resolveAutoPath(path: String): String {
    return try {
      resolveAssetPath(path)
    } catch (e: Exception) {
      // If asset fails, try file system
      try {
        resolveFilePath(path)
      } catch (fileException: Exception) {
        throw IllegalArgumentException(
          "Path not found as asset or file: $path. Asset error: ${e.message}, File error: ${fileException.message}",
          e
        )
      }
    }
  }

  /**
   * Initialize sherpa-onnx with model directory.
   * Phase 1: Stub implementation
   */
  override fun initializeSherpaOnnx(modelDir: String, promise: Promise) {
    try {
      // Verify model directory exists
      val modelDirFile = File(modelDir)
      if (!modelDirFile.exists()) {
        val errorMsg = "Model directory does not exist: $modelDir"
        Log.e(NAME, errorMsg)
        promise.reject("INIT_ERROR", errorMsg)
        return
      }
      
      if (!modelDirFile.isDirectory) {
        val errorMsg = "Model path is not a directory: $modelDir"
        Log.e(NAME, errorMsg)
        promise.reject("INIT_ERROR", errorMsg)
        return
      }
      
      val success = nativeInitialize(modelDir)
      if (success) {
        promise.resolve(null)
      } else {
        val errorMsg = "Failed to initialize sherpa-onnx. Check native logs for details."
        Log.e(NAME, "Native initialization returned false for modelDir: $modelDir")
        promise.reject("INIT_ERROR", errorMsg)
      }
    } catch (e: Exception) {
      val errorMsg = "Exception during initialization: ${e.message ?: e.javaClass.simpleName}"
      Log.e(NAME, errorMsg, e)
      promise.reject("INIT_ERROR", errorMsg, e)
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
      promise.resolve(null)
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
