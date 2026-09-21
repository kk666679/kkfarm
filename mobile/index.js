/**
 * @format
 */

// Side-effect imports must come before the entry point so React Native
// registers gesture-handler and reanimated plugins before App renders.
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);