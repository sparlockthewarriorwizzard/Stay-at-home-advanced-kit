/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './package.json'; // We will need to make sure package.json has a "name" field or hardcode it

AppRegistry.registerComponent(appName, () => App);
