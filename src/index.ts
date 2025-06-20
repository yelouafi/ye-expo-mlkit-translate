// Reexport the native module. On web, it will be resolved to ExpoMlkitTranslateModule.web.ts
// and on native platforms to ExpoMlkitTranslateModule.ts
export { default } from './ExpoMlkitTranslateModule';
export { default as ExpoMlkitTranslateView } from './ExpoMlkitTranslateView';
export * from  './ExpoMlkitTranslate.types';
