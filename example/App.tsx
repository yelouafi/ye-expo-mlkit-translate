import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import ExpoMlkitTranslateModule, {
  TRANSLATE_LANGUAGES,
  TranslateLanguage,
} from "expo-mlkit-translate";
import { Dropdown, DropdownTrigger } from "./Dropdown";

export default function App() {
  const [text, setText] = useState("Hello, how are you today?");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState<TranslateLanguage>("en");
  const [targetLanguage, setTargetLanguage] = useState<TranslateLanguage>("es");
  const [downloadedModels, setDownloadedModels] = useState<TranslateLanguage[]>(
    []
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceDropdownVisible, setSourceDropdownVisible] = useState(false);
  const [targetDropdownVisible, setTargetDropdownVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingLanguage, setDownloadingLanguage] = useState<string>("");

  // Create language options for dropdowns
  const languageOptions = Object.entries(TRANSLATE_LANGUAGES).map(
    ([key, value], index) => ({
      key: `${key}-${index}`, // Use the key name + index to ensure uniqueness
      label: key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " "),
      value: value,
    })
  );

  useEffect(() => {
    loadDownloadedModels();
  }, []);

  // Sync model management with translation pair
  useEffect(() => {
    const checkAndDownloadModels = async () => {
      const requiredLanguages = [sourceLanguage, targetLanguage];

      for (const language of requiredLanguages) {
        try {
          const isDownloaded =
            await ExpoMlkitTranslateModule.isModelDownloaded(language);
          if (!isDownloaded) {
            const languageLabel =
              languageOptions.find((lang) => lang.value === language)?.label ||
              language;
            Alert.alert(
              "Model Required",
              `${languageLabel} language model is required for translation. Would you like to download it now?`,
              [
                { text: "Cancel", style: "cancel" },
                { text: "Download", onPress: () => downloadModel(language) },
              ]
            );
          }
        } catch (error) {
          console.error(`Error checking model for ${language}:`, error);
        }
      }
    };

    checkAndDownloadModels();
  }, [sourceLanguage, targetLanguage]);

  const loadDownloadedModels = async () => {
    try {
      const models = await ExpoMlkitTranslateModule.getDownloadedModels();
      setDownloadedModels(models);
    } catch (error) {
      console.error("Error loading downloaded models:", error);
    }
  };

  const translateText = async () => {
    if (!text.trim()) {
      Alert.alert("Error", "Please enter some text to translate");
      return;
    }

    setIsTranslating(true);
    try {
      const result = await ExpoMlkitTranslateModule.translate(
        text,
        sourceLanguage,
        targetLanguage
      );
      setTranslatedText(result);
    } catch (error) {
      console.error("Translation error:", error);
      Alert.alert("Error", "Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const downloadModel = async (language: TranslateLanguage) => {
    const languageLabel =
      languageOptions.find((lang) => lang.value === language)?.label ||
      language;
    setIsDownloading(true);
    setDownloadingLanguage(languageLabel);

    try {
      await ExpoMlkitTranslateModule.downloadModel(language, {
        allowsCellularAccess: false,
        allowsBackgroundDownloading: true,
      });
      Alert.alert("Success", `${languageLabel} model downloaded successfully`);
      loadDownloadedModels();
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download model");
    } finally {
      setIsDownloading(false);
      setDownloadingLanguage("");
    }
  };

  const deleteModel = async (language: TranslateLanguage) => {
    try {
      await ExpoMlkitTranslateModule.deleteModel(language);
      Alert.alert("Success", `${language} model deleted successfully`);
      loadDownloadedModels();
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete model");
    }
  };

  const checkModelDownloaded = async (language: TranslateLanguage) => {
    try {
      const isDownloaded =
        await ExpoMlkitTranslateModule.isModelDownloaded(language);
      Alert.alert(
        "Model Status",
        `${language} model is ${isDownloaded ? "downloaded" : "not downloaded"}`
      );
    } catch (error) {
      console.error("Check model error:", error);
      Alert.alert("Error", "Failed to check model status");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ML Kit Translation Demo</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Translation</Text>

        <View style={styles.languageRow}>
          <View style={styles.languageContainer}>
            <Text style={styles.languageLabel}>From:</Text>
            <DropdownTrigger
              onPress={() => setSourceDropdownVisible(true)}
              label={
                languageOptions.find((lang) => lang.value === sourceLanguage)
                  ?.label || "Select language"
              }
              placeholder="Select source language"
            />
          </View>

          <View style={styles.languageContainer}>
            <Text style={styles.languageLabel}>To:</Text>
            <DropdownTrigger
              onPress={() => setTargetDropdownVisible(true)}
              label={
                languageOptions.find((lang) => lang.value === targetLanguage)
                  ?.label || "Select language"
              }
              placeholder="Select target language"
            />
          </View>
        </View>

        <View style={styles.modelStatusContainer}>
          <Text style={styles.modelStatusTitle}>Required Models:</Text>
          <View style={styles.modelStatusRow}>
            <View style={styles.modelStatus}>
              <Text style={styles.modelStatusText}>
                {
                  languageOptions.find((lang) => lang.value === sourceLanguage)
                    ?.label
                }
              </Text>
              <Text
                style={[
                  styles.modelStatusIndicator,
                  downloadedModels.includes(sourceLanguage)
                    ? styles.modelDownloaded
                    : styles.modelNotDownloaded,
                ]}
              >
                {downloadedModels.includes(sourceLanguage) ? "✓" : "✗"}
              </Text>
            </View>
            <View style={styles.modelStatus}>
              <Text style={styles.modelStatusText}>
                {
                  languageOptions.find((lang) => lang.value === targetLanguage)
                    ?.label
                }
              </Text>
              <Text
                style={[
                  styles.modelStatusIndicator,
                  downloadedModels.includes(targetLanguage)
                    ? styles.modelDownloaded
                    : styles.modelNotDownloaded,
                ]}
              >
                {downloadedModels.includes(targetLanguage) ? "✓" : "✗"}
              </Text>
            </View>
          </View>
        </View>

        <Dropdown
          data={languageOptions}
          value={sourceLanguage}
          onSelect={(value) => setSourceLanguage(value as TranslateLanguage)}
          visible={sourceDropdownVisible}
          onClose={() => setSourceDropdownVisible(false)}
          title="Select Source Language"
          keyExtractor={(item) => item.key}
          labelExtractor={(item) => item.label}
          valueExtractor={(item) => item.value}
          placeholder="Select source language"
        />

        <Dropdown
          data={languageOptions}
          value={targetLanguage}
          onSelect={(value) => setTargetLanguage(value as TranslateLanguage)}
          visible={targetDropdownVisible}
          onClose={() => setTargetDropdownVisible(false)}
          title="Select Target Language"
          keyExtractor={(item) => item.key}
          labelExtractor={(item) => item.label}
          valueExtractor={(item) => item.value}
          placeholder="Select target language"
        />

        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Enter text to translate"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, isTranslating && styles.buttonDisabled]}
          onPress={translateText}
          disabled={isTranslating}
        >
          <Text style={styles.buttonText}>
            {isTranslating ? "Translating..." : "Translate"}
          </Text>
        </TouchableOpacity>

        {translatedText ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Translation:</Text>
            <Text style={styles.resultText}>{translatedText}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model Management</Text>

        <TouchableOpacity style={styles.button} onPress={loadDownloadedModels}>
          <Text style={styles.buttonText}>Refresh Downloaded Models</Text>
        </TouchableOpacity>

        <View style={styles.modelsContainer}>
          <Text style={styles.modelsTitle}>
            Downloaded Models ({downloadedModels.length}):
          </Text>
          {downloadedModels.map((model, index) => {
            const modelLabel =
              languageOptions.find((lang) => lang.value === model)?.label ||
              model;
            return (
              <Text key={index} style={styles.modelItem}>
                • {modelLabel}
              </Text>
            );
          })}
          {downloadedModels.length === 0 && (
            <Text style={styles.noModels}>No models downloaded</Text>
          )}
        </View>
      </View>

      {/* Download Loader Overlay */}
      <Modal
        visible={isDownloading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}} // Prevent closing during download
      >
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loaderTitle}>Downloading Model</Text>
            <Text style={styles.loaderText}>
              Downloading {downloadingLanguage} language model...
            </Text>
            <Text style={styles.loaderSubtext}>
              This may take a few moments
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2196F3",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  languageContainer: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  smallButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
    alignItems: "center",
  },
  smallButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  resultContainer: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  modelsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 6,
  },
  modelsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modelItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  noModels: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  loaderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  loaderText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  loaderSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  modelStatusContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modelStatusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  modelStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modelStatus: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  modelStatusText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  modelStatusIndicator: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modelDownloaded: {
    color: "#4CAF50",
  },
  modelNotDownloaded: {
    color: "#f44336",
  },
});
