import { AppRegistry, YellowBox } from 'react-native';
import React from 'react';
import { Provider } from 'react-redux';
import Simulator from './src/native/screens/SimulatorContainer';
import About from './src/native/screens/AboutContainer';
import Settings from './src/native/screens/SettingsContainer';
import Share from './src/native/screens/ShareOptionContainer';
import Viewer from './src/native/screens/ViewerContainer';
import Archive from './src/native/screens/ArchiveContainer';
import SaveModal from './src/native/screens/SaveModalContainer';
import RightDrawer from './src/native/screens/RightDrawerContainer';
import Editor from './src/native/screens/EditorContainer';
import { getStore } from './src/shared/store/store';

import sagas from './src/shared/sagas';
import reducers from './src/shared/reducers'

import { SENTRY_DSN } from 'react-native-dotenv'

import { Sentry } from 'react-native-sentry';
import { themeColor, themeLightColor } from './src/shared/utils/constants';
import { createAppContainer, createDrawerNavigator, createStackNavigator } from 'react-navigation';

// native-base theming
import { StyleProvider, Container, Content } from 'native-base';
import getTheme from './native-base-theme/components';
import material from './native-base-theme/variables/material';

// https://github.com/facebook/react-native/issues/18175#issuecomment-370575211
YellowBox.ignoreWarnings([
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: componentWillUpdate is deprecated',
  'Warning: isMounted(...) is deprecated'
]);

if (!__DEV__ && SENTRY_DSN) {
  Sentry
    .config(SENTRY_DSN)
    .install();
}

const store = getStore(reducers, sagas);

const AppNavigator = createStackNavigator(
  {
    simulator: {
      screen: createDrawerNavigator(
        {
          simulator: {
            screen: Simulator
          },
        },
        {
          drawerPosition: 'right',
          navigationOptions: Simulator.navigationOptions,
          contentComponent: RightDrawer,
          edgeWidth: 10
        }
      ),
    },
    about: About,
    settings: Settings,
    share: Share,
    viewer: Viewer,
    editor: Editor,
    archive: Archive,
    saveModal: SaveModal
  },
  {
    initialRouteName: 'simulator',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: themeColor,
      },
      headerTintColor: themeLightColor,
    }
  }
);

const Navigation = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return (
      <Provider store={ store }>
        <StyleProvider style={getTheme(material)}>
          <Navigation/>
        </StyleProvider>
      </Provider>
    );
  }
}

AppRegistry.registerComponent('PuyoSimulator', () => App);