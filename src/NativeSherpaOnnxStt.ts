import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;

  /**
   * Test method to verify sherpa-onnx native library is loaded.
   * Phase 1: Minimal "Hello World" test.
   */
  testSherpaInit(): Promise<string>;

  /**
   * Initialize sherpa-onnx with model directory.
   * Phase 1: Stub implementation.
   */
  initializeSherpaOnnx(modelDir: string): Promise<void>;

  /**
   * Transcribe an audio file.
   * Phase 1: Stub implementation.
   */
  transcribeFile(filePath: string): Promise<string>;

  /**
   * Release sherpa-onnx resources.
   */
  unloadSherpaOnnx(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SherpaOnnxStt');
