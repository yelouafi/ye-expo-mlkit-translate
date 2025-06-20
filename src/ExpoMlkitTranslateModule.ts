import { NativeModule, requireNativeModule } from 'expo';

import { ExpoMlkitTranslateModuleEvents } from './ExpoMlkitTranslate.types';

declare class ExpoMlkitTranslateModule extends NativeModule<ExpoMlkitTranslateModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoMlkitTranslateModule>('ExpoMlkitTranslate');
