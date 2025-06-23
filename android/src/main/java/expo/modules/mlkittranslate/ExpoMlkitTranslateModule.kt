package expo.modules.mlkittranslate

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.google.mlkit.nl.translate.*
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.common.model.RemoteModelManager
import kotlinx.coroutines.tasks.await

class ExpoMlkitTranslateModule : Module() {
  // Map to store translators for different language pairs
  private val translators = mutableMapOf<String, Translator>()
  
  override fun definition() = ModuleDefinition {
    Name("ExpoMlkitTranslate")

    AsyncFunction("translate") { text: String, sourceLanguage: String, targetLanguage: String, promise: Promise ->
      try {
        val sourceLanguageTag = getTranslateLanguage(sourceLanguage)
        val targetLanguageTag = getTranslateLanguage(targetLanguage)
        
        val translatorKey = "$sourceLanguage-$targetLanguage"
        
        // Get or create translator for this language pair
        val translator = translators.getOrPut(translatorKey) {
          val options = TranslatorOptions.Builder()
            .setSourceLanguage(sourceLanguageTag)
            .setTargetLanguage(targetLanguageTag)
            .build()
          Translation.getClient(options)
        }
        
        // Download model if needed and translate
        val conditions = DownloadConditions.Builder()
          .requireWifi()
          .build()
          
        translator.downloadModelIfNeeded(conditions)
          .continueWithTask { task ->
            if (task.isSuccessful) {
              translator.translate(text)
            } else {
              throw task.exception ?: Exception("Model download failed")
            }
          }
          .addOnSuccessListener { translatedText ->
            promise.resolve(translatedText)
          }
          .addOnFailureListener { exception ->
            promise.reject("TRANSLATION_ERROR", exception.message, exception)
          }
      } catch (e: Exception) {
        promise.reject("TRANSLATION_ERROR", e.message, e)
      }
    }
    
    AsyncFunction("isModelDownloaded") { language: String, promise: Promise ->
      try {
        val languageTag = getTranslateLanguage(language)
        val modelManager = RemoteModelManager.getInstance()
        val model = TranslateRemoteModel.Builder(languageTag).build()
        
        modelManager.isModelDownloaded(model)
          .addOnSuccessListener { isDownloaded ->
            promise.resolve(isDownloaded)
          }
          .addOnFailureListener { exception ->
            promise.reject("MODEL_CHECK_ERROR", exception.message, exception)
          }
      } catch (e: Exception) {
        promise.reject("MODEL_CHECK_ERROR", e.message, e)
      }
    }
    
    AsyncFunction("downloadModel") { language: String, options: Map<String, Any>?, promise: Promise ->
      try {
        val languageTag = getTranslateLanguage(language)
        val modelManager = RemoteModelManager.getInstance()
        val model = TranslateRemoteModel.Builder(languageTag).build()
        
        val allowsCellular = options?.get("allowsCellularAccess") as? Boolean ?: false
        val conditionsBuilder = DownloadConditions.Builder()
        
        if (!allowsCellular) {
          conditionsBuilder.requireWifi()
        }
        
        val conditions = conditionsBuilder.build()
        
        modelManager.download(model, conditions)
          .addOnSuccessListener {
            promise.resolve(null)
          }
          .addOnFailureListener { exception ->
            promise.reject("MODEL_DOWNLOAD_ERROR", exception.message, exception)
          }
      } catch (e: Exception) {
        promise.reject("MODEL_DOWNLOAD_ERROR", e.message, e)
      }
    }
    
    AsyncFunction("deleteModel") { language: String, promise: Promise ->
      try {
        val languageTag = getTranslateLanguage(language)
        val modelManager = RemoteModelManager.getInstance()
        val model = TranslateRemoteModel.Builder(languageTag).build()
        
        modelManager.deleteDownloadedModel(model)
          .addOnSuccessListener {
            promise.resolve(null)
          }
          .addOnFailureListener { exception ->
            promise.reject("MODEL_DELETE_ERROR", exception.message, exception)
          }
      } catch (e: Exception) {
        promise.reject("MODEL_DELETE_ERROR", e.message, e)
      }
    }
    
    AsyncFunction("getDownloadedModels") { promise: Promise ->
      try {
        val modelManager = RemoteModelManager.getInstance()
        
        // Get all possible language models
        val allLanguages = listOf(
          TranslateLanguage.AFRIKAANS, TranslateLanguage.ALBANIAN, TranslateLanguage.ARABIC,
          TranslateLanguage.BELARUSIAN, TranslateLanguage.BENGALI, TranslateLanguage.BULGARIAN,
          TranslateLanguage.CATALAN, TranslateLanguage.CHINESE, TranslateLanguage.CROATIAN,
          TranslateLanguage.CZECH, TranslateLanguage.DANISH, TranslateLanguage.DUTCH,
          TranslateLanguage.ENGLISH, TranslateLanguage.ESPERANTO, TranslateLanguage.ESTONIAN,
          TranslateLanguage.FINNISH, TranslateLanguage.FRENCH, TranslateLanguage.GALICIAN,
          TranslateLanguage.GEORGIAN, TranslateLanguage.GERMAN, TranslateLanguage.GREEK,
          TranslateLanguage.GUJARATI, TranslateLanguage.HAITIAN_CREOLE, TranslateLanguage.HEBREW,
          TranslateLanguage.HINDI, TranslateLanguage.HUNGARIAN, TranslateLanguage.ICELANDIC,
          TranslateLanguage.INDONESIAN, TranslateLanguage.IRISH, TranslateLanguage.ITALIAN,
          TranslateLanguage.JAPANESE, TranslateLanguage.KANNADA, TranslateLanguage.KOREAN,
          TranslateLanguage.LATVIAN, TranslateLanguage.LITHUANIAN, TranslateLanguage.MACEDONIAN,
          TranslateLanguage.MALAY, TranslateLanguage.MALTESE, TranslateLanguage.MARATHI,
          TranslateLanguage.NORWEGIAN, TranslateLanguage.PERSIAN, TranslateLanguage.POLISH,
          TranslateLanguage.PORTUGUESE, TranslateLanguage.ROMANIAN, TranslateLanguage.RUSSIAN,
          TranslateLanguage.SLOVAK, TranslateLanguage.SLOVENIAN, TranslateLanguage.SPANISH,
          TranslateLanguage.SWAHILI, TranslateLanguage.SWEDISH, TranslateLanguage.TAMIL,
          TranslateLanguage.TELUGU, TranslateLanguage.THAI, TranslateLanguage.TAGALOG,
          TranslateLanguage.TURKISH, TranslateLanguage.UKRAINIAN, TranslateLanguage.URDU,
          TranslateLanguage.VIETNAMESE, TranslateLanguage.WELSH
        )
        
        val downloadedLanguages = mutableListOf<String>()
        var completed = 0
        
        if (allLanguages.isEmpty()) {
          promise.resolve(emptyList<String>())
          return@AsyncFunction
        }
        
        allLanguages.forEach { language ->
          val model = TranslateRemoteModel.Builder(language).build()
          modelManager.isModelDownloaded(model)
            .addOnCompleteListener { task ->
              completed++
              if (task.isSuccessful && task.result == true) {
                downloadedLanguages.add(getLanguageCode(language))
              }
              
              if (completed == allLanguages.size) {
                promise.resolve(downloadedLanguages)
              }
            }
        }
      } catch (e: Exception) {
        promise.reject("GET_MODELS_ERROR", e.message, e)
      }
    }
  }
  
  private fun getTranslateLanguage(languageCode: String): String {
    return when (languageCode) {
      "af" -> TranslateLanguage.AFRIKAANS
      "sq" -> TranslateLanguage.ALBANIAN
      "ar" -> TranslateLanguage.ARABIC
      "be" -> TranslateLanguage.BELARUSIAN
      "bn" -> TranslateLanguage.BENGALI
      "bg" -> TranslateLanguage.BULGARIAN
      "ca" -> TranslateLanguage.CATALAN
      "zh" -> TranslateLanguage.CHINESE
      "hr" -> TranslateLanguage.CROATIAN
      "cs" -> TranslateLanguage.CZECH
      "da" -> TranslateLanguage.DANISH
      "nl" -> TranslateLanguage.DUTCH
      "en" -> TranslateLanguage.ENGLISH
      "eo" -> TranslateLanguage.ESPERANTO
      "et" -> TranslateLanguage.ESTONIAN
      "fi" -> TranslateLanguage.FINNISH
      "fr" -> TranslateLanguage.FRENCH
      "gl" -> TranslateLanguage.GALICIAN
      "ka" -> TranslateLanguage.GEORGIAN
      "de" -> TranslateLanguage.GERMAN
      "el" -> TranslateLanguage.GREEK
      "gu" -> TranslateLanguage.GUJARATI
      "ht" -> TranslateLanguage.HAITIAN_CREOLE
      "he" -> TranslateLanguage.HEBREW
      "hi" -> TranslateLanguage.HINDI
      "hu" -> TranslateLanguage.HUNGARIAN
      "is" -> TranslateLanguage.ICELANDIC
      "id" -> TranslateLanguage.INDONESIAN
      "ga" -> TranslateLanguage.IRISH
      "it" -> TranslateLanguage.ITALIAN
      "ja" -> TranslateLanguage.JAPANESE
      "kn" -> TranslateLanguage.KANNADA
      "ko" -> TranslateLanguage.KOREAN
      "lv" -> TranslateLanguage.LATVIAN
      "lt" -> TranslateLanguage.LITHUANIAN
      "mk" -> TranslateLanguage.MACEDONIAN
      "ms" -> TranslateLanguage.MALAY
      "mt" -> TranslateLanguage.MALTESE
      "mr" -> TranslateLanguage.MARATHI
      "no" -> TranslateLanguage.NORWEGIAN
      "fa" -> TranslateLanguage.PERSIAN
      "pl" -> TranslateLanguage.POLISH
      "pt" -> TranslateLanguage.PORTUGUESE
      "ro" -> TranslateLanguage.ROMANIAN
      "ru" -> TranslateLanguage.RUSSIAN
      "sk" -> TranslateLanguage.SLOVAK
      "sl" -> TranslateLanguage.SLOVENIAN
      "es" -> TranslateLanguage.SPANISH
      "sw" -> TranslateLanguage.SWAHILI
      "sv" -> TranslateLanguage.SWEDISH
      "ta" -> TranslateLanguage.TAMIL
      "te" -> TranslateLanguage.TELUGU
      "th" -> TranslateLanguage.THAI
      "tl" -> TranslateLanguage.TAGALOG
      "tr" -> TranslateLanguage.TURKISH
      "uk" -> TranslateLanguage.UKRAINIAN
      "ur" -> TranslateLanguage.URDU
      "vi" -> TranslateLanguage.VIETNAMESE
      "cy" -> TranslateLanguage.WELSH
      else -> TranslateLanguage.ENGLISH
    }
  }
  
  private fun getLanguageCode(translateLanguage: String): String {
    return when (translateLanguage) {
      TranslateLanguage.AFRIKAANS -> "af"
      TranslateLanguage.ALBANIAN -> "sq"
      TranslateLanguage.ARABIC -> "ar"
      TranslateLanguage.BELARUSIAN -> "be"
      TranslateLanguage.BENGALI -> "bn"
      TranslateLanguage.BULGARIAN -> "bg"
      TranslateLanguage.CATALAN -> "ca"
      TranslateLanguage.CHINESE -> "zh"
      TranslateLanguage.CROATIAN -> "hr"
      TranslateLanguage.CZECH -> "cs"
      TranslateLanguage.DANISH -> "da"
      TranslateLanguage.DUTCH -> "nl"
      TranslateLanguage.ENGLISH -> "en"
      TranslateLanguage.ESPERANTO -> "eo"
      TranslateLanguage.ESTONIAN -> "et"
      TranslateLanguage.FINNISH -> "fi"
      TranslateLanguage.FRENCH -> "fr"
      TranslateLanguage.GALICIAN -> "gl"
      TranslateLanguage.GEORGIAN -> "ka"
      TranslateLanguage.GERMAN -> "de"
      TranslateLanguage.GREEK -> "el"
      TranslateLanguage.GUJARATI -> "gu"
      TranslateLanguage.HAITIAN_CREOLE -> "ht"
      TranslateLanguage.HEBREW -> "he"
      TranslateLanguage.HINDI -> "hi"
      TranslateLanguage.HUNGARIAN -> "hu"
      TranslateLanguage.ICELANDIC -> "is"
      TranslateLanguage.INDONESIAN -> "id"
      TranslateLanguage.IRISH -> "ga"
      TranslateLanguage.ITALIAN -> "it"
      TranslateLanguage.JAPANESE -> "ja"
      TranslateLanguage.KANNADA -> "kn"
      TranslateLanguage.KOREAN -> "ko"
      TranslateLanguage.LATVIAN -> "lv"
      TranslateLanguage.LITHUANIAN -> "lt"
      TranslateLanguage.MACEDONIAN -> "mk"
      TranslateLanguage.MALAY -> "ms"
      TranslateLanguage.MALTESE -> "mt"
      TranslateLanguage.MARATHI -> "mr"
      TranslateLanguage.NORWEGIAN -> "no"
      TranslateLanguage.PERSIAN -> "fa"
      TranslateLanguage.POLISH -> "pl"
      TranslateLanguage.PORTUGUESE -> "pt"
      TranslateLanguage.ROMANIAN -> "ro"
      TranslateLanguage.RUSSIAN -> "ru"
      TranslateLanguage.SLOVAK -> "sk"
      TranslateLanguage.SLOVENIAN -> "sl"
      TranslateLanguage.SPANISH -> "es"
      TranslateLanguage.SWAHILI -> "sw"
      TranslateLanguage.SWEDISH -> "sv"
      TranslateLanguage.TAMIL -> "ta"
      TranslateLanguage.TELUGU -> "te"
      TranslateLanguage.THAI -> "th"
      TranslateLanguage.TAGALOG -> "tl"
      TranslateLanguage.TURKISH -> "tr"
      TranslateLanguage.UKRAINIAN -> "uk"
      TranslateLanguage.URDU -> "ur"
      TranslateLanguage.VIETNAMESE -> "vi"
      TranslateLanguage.WELSH -> "cy"
      else -> "en"
    }
  }
}
