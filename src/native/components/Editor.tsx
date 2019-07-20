import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import NextWindowContainer from '../../shared/containers/NextWindowContainer';
import { contentsMargin } from '../../shared/utils/constants';
import Field from '../../shared/components/Field';
import HandlingPuyos from '../../shared/components/HandlingPuyos';
import LayoutBaseContainer from '../containers/LayoutBaseContainer';
import { Layout } from "../../shared/selectors/layoutSelectors";
import { Theme } from "../../shared/selectors/themeSelectors";
import { DroppingPlan, VanishingPlan } from "../../shared/models/chainPlanner";
import EditorControls from "../../shared/components/EditorControls";
import { NavigationScreenProps } from "react-navigation";
import ChainResult from "../../shared/components/ChainResult";
import { PendingPair, PendingPairPuyo, StackForRendering } from "../../types";

export type Props = {
  stack: StackForRendering,
  ghosts: PendingPairPuyo[],
  pendingPair: PendingPair,
  droppings: DroppingPlan[],
  vanishings: VanishingPlan[],
  currentItem: number,

  score: number,
  chainScore: number,
  chain: number,

  puyoSkin: string,
  leftyMode: string,
  layout: Layout,
  theme: Theme,

  isActive: boolean,

  onMounted: () => void,
  onScreenBlur: () => void,
  onEditItemSelected: (item: number) => void,
  onFieldTouched: (row: number, col: number) => void,
  onPlaySelected: () => void,
  onUndoSelected: () => void,
  onResetSelected: () => void,
  onDroppingAnimationFinished: () => void,
  onVanishingAnimationFinished: () => void
}

type State = {
  isVisible: boolean
}

export default class Editor extends Component<Props & NavigationScreenProps, State> {
  static navigationOptions = () => ({
    title: 'Editor'
  });

  constructor(props) {
    super(props);

    this.state = {
      isVisible: true
    };

    this.props.onMounted();
  }

  componentWillUnmount(): void {
    this.props.onScreenBlur();
  }

  render() {
    return (
      <LayoutBaseContainer>
        <View
          style={ styles.container }>
          <SafeAreaView style={ { flex: 1 } }>
            <View style={ {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'stretch',
              flexDirection: (this.props.leftyMode === 'on' ? 'row-reverse' : 'row')
            } }>
              <View>
                <HandlingPuyos
                  pair={ this.props.pendingPair }
                  puyoSkin={ this.props.puyoSkin }
                  style={ styles.handlingPuyos }
                  layout={ this.props.layout }>
                </HandlingPuyos>
                <Field
                  stack={ this.props.stack }
                  ghosts={ [] }
                  isActive={ this.props.isActive }
                  droppings={ this.props.droppings }
                  vanishings={ this.props.vanishings }
                  style={ styles.field }
                  layout={ this.props.layout }
                  theme={ this.props.theme }
                  puyoSkin={ this.props.puyoSkin }
                  onTouched={ this.props.onFieldTouched }
                  onDroppingAnimationFinished={ this.state.isVisible ? this.props.onDroppingAnimationFinished : undefined }
                  onVanishingAnimationFinished={ this.state.isVisible ? this.props.onVanishingAnimationFinished : undefined }
                />
              </View>
              <View style={ styles.side }>
                <View style={ styles.sideHead }>
                  <NextWindowContainer/>
                  <ChainResult
                    score={ this.props.score }
                    chain={ this.props.chain }
                    chainScore={ this.props.chainScore }
                    textAlign={ this.props.leftyMode === 'on' ? 'right' : 'left' }
                  />
                </View>
                <EditorControls
                  layout={ this.props.layout }
                  puyoSkin={ this.props.puyoSkin }
                  selectedItem={ this.props.currentItem }
                  onSelected={ this.props.onEditItemSelected }
                  onPlaySelected={ this.props.onPlaySelected }
                  onUndoSelected={ this.props.onUndoSelected }
                  onResetSelected={ this.props.onResetSelected }
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </LayoutBaseContainer>
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
  handlingPuyos: {
    marginTop: 3,
    marginLeft: 3,
  },
  side: {
    flex: 1,
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
