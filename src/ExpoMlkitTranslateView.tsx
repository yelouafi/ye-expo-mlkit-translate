import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoMlkitTranslateViewProps } from './ExpoMlkitTranslate.types';

const NativeView: React.ComponentType<ExpoMlkitTranslateViewProps> =
  requireNativeView('ExpoMlkitTranslate');

export default function ExpoMlkitTranslateView(props: ExpoMlkitTranslateViewProps) {
  return <NativeView {...props} />;
}
