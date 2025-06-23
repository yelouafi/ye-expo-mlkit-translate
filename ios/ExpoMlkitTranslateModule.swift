import ExpoModulesCore
@preconcurrency import MLKitTranslate

public class ExpoMlkitTranslateModule: Module {
  // Dictionary to store translators for different language pairs
  private var translators: [String: Translator] = [:]

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoMlkitTranslate')` in JavaScript.
    Name("ExpoMlkitTranslate")

    AsyncFunction("translate") {
      (text: String, sourceLanguage: String, targetLanguage: String) -> String in
      let sourceLanguageTag = TranslateLanguage(rawValue: sourceLanguage) ?? .english
      let targetLanguageTag = TranslateLanguage(rawValue: targetLanguage) ?? .english

      let translatorKey = "\(sourceLanguage)-\(targetLanguage)"

      // Get or create translator for this language pair
      let translator: Translator
      if let existingTranslator = self.translators[translatorKey] {
        translator = existingTranslator
      } else {
        let options = TranslatorOptions(
          sourceLanguage: sourceLanguageTag, targetLanguage: targetLanguageTag)
        translator = Translator.translator(options: options)
        self.translators[translatorKey] = translator
      }

      // Check if model is downloaded, if not download it first
      let conditions = ModelDownloadConditions(
        allowsCellularAccess: false,
        allowsBackgroundDownloading: true
      )

      return try await withCheckedThrowingContinuation { continuation in
        translator.downloadModelIfNeeded(with: conditions) { error in
          if let error = error {
            continuation.resume(throwing: error)
            return
          }

          // Model is ready, perform translation
          translator.translate(text) { translatedText, error in
            if let error = error {
              continuation.resume(throwing: error)
            } else if let translatedText = translatedText {
              continuation.resume(returning: translatedText)
            } else {
              continuation.resume(
                throwing: NSError(
                  domain: "TranslationError", code: -1,
                  userInfo: [NSLocalizedDescriptionKey: "Translation failed"]))
            }
          }
        }
      }
    }

    AsyncFunction("isModelDownloaded") { (language: String) -> Bool in
      guard let languageTag = TranslateLanguage(rawValue: language) else {
        throw NSError(
          domain: "InvalidLanguage", code: -1,
          userInfo: [NSLocalizedDescriptionKey: "Invalid language code: \(language)"])
      }

      let model = TranslateRemoteModel.translateRemoteModel(language: languageTag)
      let downloadedModels = ModelManager.modelManager().downloadedTranslateModels
      return downloadedModels.contains(model)
    }

    AsyncFunction("downloadModel") { (language: String, options: [String: Any]?) -> Void in
      guard let languageTag = TranslateLanguage(rawValue: language) else {
        throw NSError(
          domain: "InvalidLanguage", code: -1,
          userInfo: [NSLocalizedDescriptionKey: "Invalid language code: \(language)"])
      }

      let allowsCellular = options?["allowsCellularAccess"] as? Bool ?? false
      let allowsBackground = options?["allowsBackgroundDownloading"] as? Bool ?? true

      let conditions = ModelDownloadConditions(
        allowsCellularAccess: allowsCellular,
        allowsBackgroundDownloading: allowsBackground
      )

      let model = TranslateRemoteModel.translateRemoteModel(language: languageTag)

      return try await withCheckedThrowingContinuation { continuation in
        let _ = ModelManager.modelManager().download(model, conditions: conditions)

        // We'll use NotificationCenter to monitor download completion
        var successObserver: NSObjectProtocol?
        var failObserver: NSObjectProtocol?

        successObserver = NotificationCenter.default.addObserver(
          forName: .mlkitModelDownloadDidSucceed,
          object: nil,
          queue: nil
        ) { notification in
          guard let userInfo = notification.userInfo,
            let downloadedModel = userInfo[ModelDownloadUserInfoKey.remoteModel.rawValue]
              as? TranslateRemoteModel,
            downloadedModel == model
          else { return }

          if let observer = successObserver {
            NotificationCenter.default.removeObserver(observer)
          }
          if let observer = failObserver {
            NotificationCenter.default.removeObserver(observer)
          }

          continuation.resume()
        }

        failObserver = NotificationCenter.default.addObserver(
          forName: .mlkitModelDownloadDidFail,
          object: nil,
          queue: nil
        ) { notification in
          guard let userInfo = notification.userInfo,
            let downloadedModel = userInfo[ModelDownloadUserInfoKey.remoteModel.rawValue]
              as? TranslateRemoteModel,
            downloadedModel == model
          else { return }

          if let observer = successObserver {
            NotificationCenter.default.removeObserver(observer)
          }
          if let observer = failObserver {
            NotificationCenter.default.removeObserver(observer)
          }

          let error =
            userInfo[ModelDownloadUserInfoKey.error.rawValue] as? Error
            ?? NSError(
              domain: "DownloadError", code: -1,
              userInfo: [NSLocalizedDescriptionKey: "Model download failed"])
          continuation.resume(throwing: error)
        }
      }
    }

    AsyncFunction("deleteModel") { (language: String) -> Void in
      guard let languageTag = TranslateLanguage(rawValue: language) else {
        throw NSError(
          domain: "InvalidLanguage", code: -1,
          userInfo: [NSLocalizedDescriptionKey: "Invalid language code: \(language)"])
      }

      let model = TranslateRemoteModel.translateRemoteModel(language: languageTag)

      return try await withCheckedThrowingContinuation { continuation in
        ModelManager.modelManager().deleteDownloadedModel(model) { error in
          if let error = error {
            continuation.resume(throwing: error)
          } else {
            continuation.resume()
          }
        }
      }
    }

    AsyncFunction("getDownloadedModels") { () -> [String] in
      let downloadedModels = ModelManager.modelManager().downloadedTranslateModels
      return downloadedModels.map { $0.language.rawValue }
    }
  }
}

extension TranslateLanguage {
  init?(rawValue: String) {
    switch rawValue {
    case "af": self = .afrikaans
    case "ar": self = .arabic
    case "be": self = .belarusian
    case "bg": self = .bulgarian
    case "bn": self = .bengali
    case "ca": self = .catalan
    case "cs": self = .czech
    case "cy": self = .welsh
    case "da": self = .danish
    case "de": self = .german
    case "el": self = .greek
    case "en": self = .english
    case "eo": self = .eperanto
    case "es": self = .spanish
    case "et": self = .estonian
    case "fa": self = .persian
    case "fi": self = .finnish
    case "fr": self = .french
    case "ga": self = .irish
    case "gl": self = .galician
    case "gu": self = .gujarati
    case "he": self = .hebrew
    case "hi": self = .hindi
    case "hr": self = .croatian
    case "ht": self = .haitianCreole
    case "hu": self = .hungarian
    case "id": self = .indonesian
    case "is": self = .icelandic
    case "it": self = .italian
    case "ja": self = .japanese
    case "ka": self = .georgian
    case "kn": self = .kannada
    case "ko": self = .korean
    case "lt": self = .lithuanian
    case "lv": self = .latvian
    case "mk": self = .macedonian
    case "mr": self = .marathi
    case "ms": self = .malay
    case "mt": self = .maltese
    case "nl": self = .dutch
    case "no": self = .norwegian
    case "pl": self = .polish
    case "pt": self = .portuguese
    case "ro": self = .romanian
    case "ru": self = .russian
    case "sk": self = .slovak
    case "sl": self = .slovenian
    case "sq": self = .albanian
    case "sv": self = .swedish
    case "sw": self = .swahili
    case "ta": self = .tamil
    case "te": self = .telugu
    case "th": self = .thai
    case "tl": self = .tagalog
    case "tr": self = .turkish
    case "uk": self = .ukrainian
    case "ur": self = .urdu
    case "vi": self = .vietnamese
    case "zh": self = .chinese
    default: return nil
    }
  }
}
