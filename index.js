import {AppRegistry, UIManager} from 'react-native';
import {name as appName} from './app.json';
import Main from './src/Main';

AppRegistry.registerComponent(appName, () => Main);

//AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); 

//console.disableYellowBox = true;
