#include "sherpa-onnx-wrapper.h"
#include <android/log.h>

// sherpa-onnx headers (commented out for Phase 1 stub, will be enabled later)
// #include "sherpa-onnx/csrc/offline-recognizer.h"
// #include "sherpa-onnx/csrc/offline-model-config.h"
// #include "sherpa-onnx/csrc/offline-stream.h"
// #include "sherpa-onnx/csrc/wave-reader.h"

#define LOG_TAG "SherpaOnnxWrapper"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace sherpaonnxstt {

// PIMPL pattern implementation
class SherpaOnnxWrapper::Impl {
public:
    bool initialized = false;
    std::string modelDir;

    // TODO: Phase 2 - Add sherpa-onnx recognizer instance here
    // std::unique_ptr<sherpa_onnx::OfflineRecognizer> recognizer;
};

SherpaOnnxWrapper::SherpaOnnxWrapper() : pImpl(std::make_unique<Impl>()) {
    LOGI("SherpaOnnxWrapper created");
}

SherpaOnnxWrapper::~SherpaOnnxWrapper() {
    release();
    LOGI("SherpaOnnxWrapper destroyed");
}

bool SherpaOnnxWrapper::initialize(const std::string& modelDir) {
    if (pImpl->initialized) {
        release();
    }

    if (modelDir.empty()) {
        LOGE("Model directory is empty");
        return false;
    }

    // TODO: Implement actual sherpa-onnx initialization
    // Example:
    // sherpa_onnx::OfflineRecognizerConfig config;
    // config.model.transducer.model = modelDir + "/transducer.onnx";
    // config.model.encoder.num_threads = 4;
    // config.model.decoder.num_threads = 4;
    // pImpl->recognizer = std::make_unique<sherpa_onnx::OfflineRecognizer>(config);
    // pImpl->initialized = true;

    // For now, just mark as initialized for testing
    pImpl->modelDir = modelDir;
    pImpl->initialized = true;

    return true;
}

std::string SherpaOnnxWrapper::transcribeFile(const std::string& filePath) {
    if (!pImpl->initialized) {
        LOGE("Not initialized. Call initialize() first.");
        return "";
    }

    LOGI("Transcribing file: %s", filePath.c_str());

    // TODO: Implement actual transcription
    // Example:
    // auto audio = sherpa_onnx::ReadWave(filePath, 16000);
    // auto result = pImpl->recognizer->Decode(audio.samples, audio.sample_rate);
    // return result.text;

    // For now, return a test message
    return "Sherpa ONNX loaded! (stub transcription)";
}

bool SherpaOnnxWrapper::isInitialized() const {
    return pImpl->initialized;
}

void SherpaOnnxWrapper::release() {
    if (pImpl->initialized) {
        // TODO: Release recognizer
        // pImpl->recognizer.reset();
        pImpl->initialized = false;
        pImpl->modelDir.clear();
    }
}

} // namespace sherpaonnxstt
