declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { FC, ReactElement } from 'react';
  import { StyleProp, TextStyle } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string | number;
    style?: StyleProp<TextStyle>;
    allowFontScaling?: boolean;
  }

  const MaterialCommunityIcons: FC<IconProps>;
  export default MaterialCommunityIcons;
}
