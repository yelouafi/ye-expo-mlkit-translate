import * as React from 'react';

import { ExpoMlkitTranslateViewProps } from './ExpoMlkitTranslate.types';

export default function ExpoMlkitTranslateView(props: ExpoMlkitTranslateViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
