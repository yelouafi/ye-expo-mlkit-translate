import { registerWebModule, NativeModule } from 'expo';

import { ExpoMlkitTranslateModuleEvents } from './ExpoMlkitTranslate.types';

class ExpoMlkitTranslateModule extends NativeModule<ExpoMlkitTranslateModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoMlkitTranslateModule, 'ExpoMlkitTranslateModule');
