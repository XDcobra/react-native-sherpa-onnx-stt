import SherpaOnnxStt from './NativeSherpaOnnxStt';

export function multiply(a: number, b: number): number {
  return SherpaOnnxStt.multiply(a, b);
}

/**
 * Test method to verify sherpa-onnx native library is loaded.
 * Phase 1: Minimal "Hello World" test.
 */
export function testSherpaInit(): Promise<string> {
  return SherpaOnnxStt.testSherpaInit();
}

/**
 * Initialize sherpa-onnx with model directory.
 * Phase 1: Stub implementation.
 */
export function initializeSherpaOnnx(modelDir: string): Promise<void> {
  return SherpaOnnxStt.initializeSherpaOnnx(modelDir);
}

/**
 * Transcribe an audio file.
 * Phase 1: Stub implementation.
 */
export function transcribeFile(filePath: string): Promise<string> {
  return SherpaOnnxStt.transcribeFile(filePath);
}

/**
 * Release sherpa-onnx resources.
 */
export function unloadSherpaOnnx(): Promise<void> {
  return SherpaOnnxStt.unloadSherpaOnnx();
}
