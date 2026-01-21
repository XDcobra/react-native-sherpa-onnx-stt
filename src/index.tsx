import SherpaOnnxStt from './NativeSherpaOnnxStt';
import type { InitializeOptions } from './types';

// Export types and utilities
export type { InitializeOptions, ModelPathConfig } from './types';
export {
  assetModelPath,
  autoModelPath,
  fileModelPath,
  getDefaultModelPath,
} from './utils';

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
 * Resolve model path based on configuration.
 * This handles different path types (asset, file, auto) and returns
 * a platform-specific absolute path that can be used by native code.
 *
 * @param config - Model path configuration or simple string path
 * @returns Promise resolving to absolute path usable by native code
 */
export async function resolveModelPath(
  config: InitializeOptions['modelPath']
): Promise<string> {
  // Backward compatibility: if string is passed, treat as auto
  if (typeof config === 'string') {
    return SherpaOnnxStt.resolveModelPath({
      type: 'auto',
      path: config,
    });
  }

  return SherpaOnnxStt.resolveModelPath(config);
}

/**
 * Initialize sherpa-onnx with model directory.
 *
 * Supports multiple model source types:
 * - Asset models (bundled in app)
 * - File system models (downloaded or user-provided)
 * - Auto-detection (tries asset first, then file system)
 *
 * @param options - Model path configuration or simple string path
 * @example
 * ```typescript
 * // Simple string (auto-detect)
 * await initializeSherpaOnnx('models/sherpa-onnx-model');
 *
 * // Asset model
 * await initializeSherpaOnnx({
 *   modelPath: { type: 'asset', path: 'models/sherpa-onnx-model' }
 * });
 *
 * // File system model
 * await initializeSherpaOnnx({
 *   modelPath: { type: 'file', path: '/path/to/model' }
 * });
 * ```
 */
export async function initializeSherpaOnnx(
  options: InitializeOptions | InitializeOptions['modelPath']
): Promise<void> {
  // Handle both object syntax and direct path syntax
  const modelPath =
    typeof options === 'object' && 'modelPath' in options
      ? options.modelPath
      : (options as InitializeOptions['modelPath']);

  const resolvedPath = await resolveModelPath(modelPath);
  return SherpaOnnxStt.initializeSherpaOnnx(resolvedPath);
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
