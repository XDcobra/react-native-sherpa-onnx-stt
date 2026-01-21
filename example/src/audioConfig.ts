/**
 * Configuration for test audio files.
 * Audio files should be placed in:
 * - Android: android/app/src/main/assets/test_wavs/
 * - iOS: Add to Xcode project as folder reference in test_wavs/
 */

export const TEST_AUDIO_FILES = {
  // English test files (for Zipformer model)
  EN_1: 'test_wavs/en-1.wav',
  EN_2: 'test_wavs/en-2.wav',
  EN_3: 'test_wavs/en-3.wav',

  // Chinese test files (for Paraformer model)
  ZH_1: 'test_wavs/zh-1.wav',
  ZH_2: 'test_wavs/zh-2.wav',
  ZH_3: 'test_wavs/zh-3.wav',
} as const;

export type AudioFileId =
  (typeof TEST_AUDIO_FILES)[keyof typeof TEST_AUDIO_FILES];

export interface AudioFileInfo {
  id: AudioFileId;
  name: string;
  description: string;
  language: 'en' | 'zh';
}

export const AUDIO_FILES: AudioFileInfo[] = [
  {
    id: TEST_AUDIO_FILES.EN_1,
    name: 'English Sample 1',
    description: 'English audio sample 1',
    language: 'en',
  },
  {
    id: TEST_AUDIO_FILES.EN_2,
    name: 'English Sample 2',
    description: 'English audio sample 2',
    language: 'en',
  },
  {
    id: TEST_AUDIO_FILES.EN_3,
    name: 'English Sample 3',
    description: 'English audio sample 3',
    language: 'en',
  },
  {
    id: TEST_AUDIO_FILES.ZH_1,
    name: '中文样本 1',
    description: 'Chinese audio sample 1',
    language: 'zh',
  },
  {
    id: TEST_AUDIO_FILES.ZH_2,
    name: '中文样本 2',
    description: 'Chinese audio sample 2',
    language: 'zh',
  },
  {
    id: TEST_AUDIO_FILES.ZH_3,
    name: '中文样本 3',
    description: 'Chinese audio sample 3',
    language: 'zh',
  },
];

/**
 * Get audio files compatible with the given model
 * - Zipformer: English files only
 * - Paraformer: All files (English and Chinese) - supports both languages
 */
export function getAudioFilesForModel(modelId: string): AudioFileInfo[] {
  const isParaformer = modelId.includes('paraformer');
  const isZipformer = modelId.includes('zipformer') || modelId.includes('en');

  // Paraformer supports both English and Chinese
  if (isParaformer) {
    return AUDIO_FILES;
  }

  // Zipformer supports only English
  if (isZipformer) {
    return AUDIO_FILES.filter((file) => file.language === 'en');
  }

  // Default: return Chinese files (for other models)
  return AUDIO_FILES.filter((file) => file.language === 'zh');
}
