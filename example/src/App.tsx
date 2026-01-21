import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  testSherpaInit,
  initializeSherpaOnnx,
  unloadSherpaOnnx,
} from 'react-native-sherpa-onnx-stt';
import { getModelPath, MODELS, type ModelId } from './modelConfig';

export default function App() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [initResult, setInitResult] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<ModelId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const result = await testSherpaInit();
      setTestResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async (modelId: ModelId) => {
    setLoading(true);
    setError(null);
    setInitResult(null);

    try {
      const modelPathConfig = getModelPath(modelId);

      // Unload previous model if any
      if (currentModel) {
        await unloadSherpaOnnx();
      }

      // Initialize new model
      await initializeSherpaOnnx({
        modelPath: modelPathConfig,
      });

      const modelName =
        modelId === MODELS.ZIPFORMER_EN
          ? 'English (Zipformer)'
          : 'Chinese (Paraformer)';

      setCurrentModel(modelId);
      setInitResult(`Initialized: ${modelName}`);
    } catch (err) {
      // Log full error details for debugging
      console.error('Initialization error:', err);

      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Include error code if available (React Native error objects)
        if ('code' in err) {
          errorMessage = `[${err.code}] ${errorMessage}`;
        }
        // Include stack trace in console
        if (err.stack) {
          console.error('Stack trace:', err.stack);
        }
      } else if (typeof err === 'object' && err !== null) {
        // Handle React Native error objects
        const errorObj = err as any;
        errorMessage =
          errorObj.message ||
          errorObj.userInfo?.NSLocalizedDescription ||
          JSON.stringify(err);
        if (errorObj.code) {
          errorMessage = `[${errorObj.code}] ${errorMessage}`;
        }
      }

      setError(errorMessage);
      setInitResult(
        `Initialization failed: ${errorMessage}\n\nNote: Models must be provided separately. See MODEL_SETUP.md for details.\n\nCheck Logcat (Android) or Console (iOS) for detailed logs.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sherpa-ONNX STT Test</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Library Test</Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleTest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Test Sherpa Init</Text>
            )}
          </TouchableOpacity>

          {testResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Result:</Text>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Initialize Model</Text>
          <Text style={styles.hint}>
            Select a model to initialize. Models must be provided separately.
          </Text>

          {currentModel && (
            <View style={styles.currentModelContainer}>
              <Text style={styles.currentModelText}>
                Current:{' '}
                {currentModel === MODELS.ZIPFORMER_EN ? 'English' : 'Chinese'}
              </Text>
            </View>
          )}

          <View style={styles.modelButtons}>
            <TouchableOpacity
              style={[
                styles.modelButton,
                currentModel === MODELS.ZIPFORMER_EN &&
                  styles.modelButtonActive,
                loading && styles.buttonDisabled,
              ]}
              onPress={() => handleInitialize(MODELS.ZIPFORMER_EN)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  currentModel === MODELS.ZIPFORMER_EN &&
                    styles.modelButtonTextActive,
                ]}
              >
                English (Zipformer)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modelButton,
                currentModel === MODELS.PARAFORMER_ZH &&
                  styles.modelButtonActive,
                loading && styles.buttonDisabled,
              ]}
              onPress={() => handleInitialize(MODELS.PARAFORMER_ZH)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.modelButtonText,
                  currentModel === MODELS.PARAFORMER_ZH &&
                    styles.modelButtonTextActive,
                ]}
              >
                中文 (Paraformer)
              </Text>
            </TouchableOpacity>
          </View>

          {initResult && (
            <View
              style={[styles.resultContainer, error && styles.errorContainer]}
            >
              <Text style={[styles.resultLabel, error && styles.errorLabel]}>
                {error ? 'Error' : 'Result'}:
              </Text>
              <Text style={[styles.resultText, error && styles.errorText]}>
                {initResult}
              </Text>
            </View>
          )}
        </View>

        {error && !initResult && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorLabel}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  section: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#1b5e20',
  },
  errorContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c62828',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#b71c1c',
  },
  currentModelContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
  },
  currentModelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
  modelButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modelButtonActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  modelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modelButtonTextActive: {
    color: '#2e7d32',
  },
});
