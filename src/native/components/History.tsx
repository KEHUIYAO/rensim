import React, { Component } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import {
  contentsMargin,
  themeColor,
  themeLightColor
} from '../../shared/utils/constants';
import Field from '../../shared/components/Field';
import HandlingPuyos from '../../shared/components/HandlingPuyos';
import SlimHistoryTree from "../../shared/components/HistoryTree/SlimHistoryTree";
import { HistoryRecord } from "../../shared/models/history";
import { Theme } from "../../shared/selectors/themeSelectors";
import { Layout } from "../../shared/selectors/layoutSelectors";

// @ts-ignore
import t from '../../shared/utils/i18n';

export interface Props {
  navigator: any,

  theme: Theme,
  layout: Layout,

  stack: any,
  ghosts: any,
  droppingPuyos: any,
  vanishingPuyos: any,
  isActive: boolean,
  puyoSkin: string,
  pendingPair: any,
  onDroppingAnimationFinished: Function,
  onVanishingAnimationFinished: Function,

  history: HistoryRecord[],
  historyIndex: number,
  onHistoryNodePressed: Function,
}

interface State {
}

export default class Simulator extends Component<Props, State> {
  static navigatorStyle = {
    navBarBackgroundColor: themeColor,
    navBarTextColor: themeLightColor,
    navBarButtonColor: themeLightColor
  };

  static navigatorButtons = {
    rightButtons: [
      {
        title: 'feedback',
        id: 'feedback',
        showAsAction: 'always'
      }
    ]
  };

  feedbackURL = 'http://puyos.im/feedback.html';

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.props.navigator.setTitle({ title: "History (beta)" });
  }

  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      switch (event.id) {
        case 'feedback':
          Linking.openURL(this.feedbackURL)
          break;
      }
    }
  }

  render() {
    return (
      <View style={ styles.container }>
        <View style={ styles.contents }>
          <View>
            <HandlingPuyos
              pair={ this.props.pendingPair }
              puyoSkin={ this.props.puyoSkin }>
            </HandlingPuyos>
            <Field
              stack={ this.props.stack }
              ghosts={ this.props.ghosts }
              isActive={ this.props.isActive }
              style={ styles.field }
              puyoSkin={ this.props.puyoSkin }
              theme={ this.props.theme }
              layout={ this.props.layout }>
            </Field>
          </View>
          <View style={ styles.side }>
            <SlimHistoryTree
              history={ this.props.history }
              currentIndex={ this.props.historyIndex }
              onNodePressed={ this.props.onHistoryNodePressed }
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#F5F5F5'
  },
  contents: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    flexDirection: 'row'
  },
  side: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: contentsMargin,
    marginRight: contentsMargin,
    marginBottom: contentsMargin
  },
  sideHead: {
    flex: 1
  },
  field: {
    margin: contentsMargin
  }
});
