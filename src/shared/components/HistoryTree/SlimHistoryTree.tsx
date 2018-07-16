/**
 * Small component for render history-tree
 */
import React, { Fragment } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  cardBackgroundColor,
  contentsPadding, isWeb,
  screenHeight,
  screenWidth,
  sideWidth,
  themeColor, themeLightColor,
} from '../../utils/constants';
import SvgPuyo from '../SvgPuyo';
import Svg, { G, Path, Rect, } from 'react-native-svg';
import HistoryTreeNode from './HistoryTreeNode';
import { HistoryRecord } from "../../models/history";

export interface Props {
  history: HistoryRecord[],
  currentIndex: number,
  onNodePressed: Function
}

interface State {
}

type RecordIndexPair = { record: HistoryRecord, historyIndex: number };

export default class SlimHistoryTree extends React.Component<Props, State> {

  // layout constants
  handsX = 8;
  handsY = 14;

  nodeWidth = (sideWidth - this.handsY * 2) / 3;
  nodeHeight = this.nodeWidth / 2;
  puyoMarginY = 10;
  pathRound = 30;

  nodeMarginTop = 10;
  nodeMarginLeft = (sideWidth - this.handsX) / 3 + this.handsX;
  nodeMarginBottom = 10;

  childrenLeft = this.nodeWidth;

  puyoSize = (this.nodeMarginLeft - this.handsX) / 2 - 5;

  handleNodePressed(historyIndex, e) {
    e.stopPropagation();
    this.props.onNodePressed(historyIndex);
  }

  renderPair(hand, index) {
    const x = this.handsX;
    const puyoSkin = 'puyoSkinDefault';

    return (
      <React.Fragment key={ index }>
        <SvgPuyo
          size={ this.puyoSize }
          puyo={ hand[0] }
          x={ x }
          y={ this.puyoMarginY }
          skin={ puyoSkin }
          connections={ null }
          a={ 1 }
        />
        <SvgPuyo
          size={ this.puyoSize }
          puyo={ hand[1] }
          x={ x + this.puyoSize }
          y={ this.puyoMarginY }
          skin={ puyoSkin }
          connections={ null }
          a={ 1 }
        />
      </React.Fragment>
    );
  }

  renderMainNode(node: HistoryRecord, index: number, isCurrentNode: boolean) {
    const { move } = node;

    return (
      <HistoryTreeNode
        x={ this.nodeMarginLeft }
        y={ this.nodeMarginTop }
        col={ move!.col }
        rotation={ move!.rotation }
        nodeWidth={ this.nodeWidth }
        isCurrentNode={ isCurrentNode }
        onPress={ e => this.handleNodePressed(index, e) }
      />
    );
  }

  renderRootNode(isCurrentNode: boolean) {
    const eventName = isWeb ? 'onClick' : 'onPress';
    const events = {
      [eventName]: e => this.handleNodePressed(0, e)
    };

    return (
      <G { ...events } >
        <Rect
          { ...events }
          x={ this.nodeMarginLeft }
          y={ this.nodeMarginTop }
          width={ this.nodeWidth }
          height={ this.nodeHeight }
          stroke={ themeColor }
          strokeWidth={ isCurrentNode ? 4 : 2 }
          fill={ themeLightColor }
          rx="4"
          ry="4"/>
      </G>
    );
  }

  renderSubNode(historyIndex: number, index: number) {
    const node = this.props.history[historyIndex];
    const { move } = node;

    return (
      <HistoryTreeNode
        x={ this.childrenLeft + this.nodeMarginLeft }
        y={ (index + 1) * (this.nodeHeight + this.nodeMarginBottom + this.nodeMarginTop) + this.nodeMarginTop}
        col={ move!.col }
        rotation={ move!.rotation }
        nodeWidth={ this.nodeWidth }
        isCurrentNode={ false }
        key={ index }
        onPress={ e => this.handleNodePressed(historyIndex, e) }
      />
    );
  }
  renderMainPath(svgHeight: number, hasNext: boolean, hasPrev: boolean) {
    const startX = this.nodeWidth / 2 + this.nodeMarginLeft;
    const startY = hasPrev ? -1 : this.nodeHeight / 2;
    const endX = this.nodeWidth / 2 + this.nodeMarginLeft;
    const endY = hasNext ? svgHeight + 1 : this.nodeHeight / 2;
    const path = `M ${startX} ${startY} C ${startX} ${startY} ${endX} ${endY} ${endX} ${endY}`;
    return (
      <Path
        d={ path }
        stroke={ themeColor }
        strokeWidth={ 2 }
        fill="none"
      />
    );
  }

  renderSubPath(index: number) {
    const y = (index + 1) * (this.nodeHeight + this.nodeMarginBottom + this.nodeMarginTop) +
      this.nodeHeight / 2 + this.nodeMarginTop;
    const startX = this.nodeWidth / 2 + this.nodeMarginLeft;
    const endX = this.childrenLeft + this.nodeMarginLeft;
    const path = `M ${startX} ${y - this.pathRound} C ${startX} ${y} ${endX} ${y} ${endX} ${y}`;
    return (
      <Path
        d={ path }
        stroke={ themeColor }
        strokeWidth={ 2 }
        strokeDasharray={ '4, 4' }
        fill="none"
      />
    );
  }

  renderItem({ itemIndex, item }: { itemIndex: number, item: RecordIndexPair }) {
    const hasNext = item.record.defaultNext !== null;
    const hasPrev = item.record.prev !== null;
    const isCurrentNode = item.historyIndex === this.props.currentIndex;

    if (item.record.move === null) {
      // root node
      const svgHeight = this.nodeMarginTop + this.nodeHeight + this.nodeMarginBottom;
      return (
        <Svg width={ 300 } height={ svgHeight }>
          { this.renderMainPath(svgHeight, true, false) }
          { this.renderRootNode(isCurrentNode) }
        </Svg>
      );
    }

    const children = item.record.next
      .filter(i => i !== item.record.defaultNext)
      .map((historyIndex, i) =>
        <Fragment key={ historyIndex }>
          { this.renderSubNode(historyIndex, i) }
          { this.renderSubPath(i) }
        </Fragment>
      );
    const svgHeight = (this.nodeMarginTop + this.nodeHeight + this.nodeMarginBottom) * (1 + children.length);
    return (
      <Svg width={ 300 } height={ svgHeight }>
        { this.renderPair(item.record.pair, itemIndex) }
        { this.renderMainPath(svgHeight, hasNext, hasPrev) }
        { this.renderMainNode(item.record, item.historyIndex, isCurrentNode) }
        { children }
      </Svg>
    )
  }

  render() {
    const { history } = this.props;

    // flatten history
    let flatHist: RecordIndexPair[] = [];
    let next: number | null = 0;
    while (next !== null) {
      const record = history[next];
      flatHist.push({
        record,
        historyIndex: next
      });
      next = record.defaultNext;
    }

    return (
      <View style={ styles.component }>
        <FlatList
          data={ flatHist }
          renderItem={ this.renderItem.bind(this) }
          keyExtractor={ (record, index) => String(record.historyIndex) }
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  component: {
    flex: 1,
    elevation: 2,
    backgroundColor: cardBackgroundColor,
    overflow: 'scroll',
    height: screenHeight - contentsPadding * 4,
    width: screenWidth - contentsPadding * 2
  }
});
