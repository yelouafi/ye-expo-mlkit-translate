import { NativeModule, requireNativeModule } from "expo";
import {
  TranslateLanguage,
  ModelDownloadOptions,
} from "./ExpoMlkitTranslate.types";

declare class ExpoMlkitTranslateModule extends NativeModule {
  translate(
    text: string,
    sourceLanguage: TranslateLanguage,
    targetLanguage: TranslateLanguage
  ): Promise<string>;
  isModelDownloaded(language: TranslateLanguage): Promise<boolean>;
  downloadModel(
    language: TranslateLanguage,
    options?: ModelDownloadOptions
  ): Promise<void>;
  deleteModel(language: TranslateLanguage): Promise<void>;
  getDownloadedModels(): Promise<TranslateLanguage[]>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoMlkitTranslateModule>(
  "ExpoMlkitTranslate"
);
