import React, { Component } from 'react';
import ReactNative, {
  ActionSheetIOS,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { contentsMargin, fieldCols, themeColor, themeLightColor } from '../../shared/utils/constants';
import { Theme } from "../../shared/selectors/themeSelectors";
import { Layout } from "../../shared/selectors/layoutSelectors";
import Field from "../../shared/components/Field";
import _ from 'lodash';
import { getStackForRendering } from "../../shared/models/stack";
import { t, formatDateTime } from '../../shared/platformServices/i18n';
import Loading from "../../shared/components/Loading";
import { NavigationScreenProps } from "react-navigation";
import { Archive } from "../../types";

export interface Props {
  componentId: string,

  theme: Theme,
  puyoSkin: string,
  layout: Layout,

  archives: Archive[],
  isLoading: boolean,

  onArchiveOpened: () => void,
  onItemPressed: (id: string) => void,
  onEndReached: () => void,
  onDeleteSelected: (id: string) => void
  onLoginRequested: () => void
}

interface State {
}

export default class ArchiveList extends Component<Props & NavigationScreenProps, State> {
  itemRefs: any = [];

  static navigationOptions = ({ navigation }) => ({
    title: 'Archive'
  }); // TODO: i18n

  componentDidMount() {
    this.props.onArchiveOpened();
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  handleItemClicked(id: string) {
    this.props.onItemPressed(id);
    this.props.navigation.pop();
  }

  handleDeleteConfirmed(item: Archive) {
    // TODO: delete item
    LayoutAnimation.easeInEaseOut();
    this.props.onDeleteSelected(item.play.id);
  }

  handlePopupMenuItemSelected(event: string, index: number, item: Archive): void {
    if (event === 'itemSelected') {
      switch (index) {
        case 0: // edit
          this.props.navigation.push('saveModal', {
            editItem: item
          });
          break;
        case 1: // delete
          Alert.alert(
            t('delete'),
            t('deleteMessage'),
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'OK',
                onPress: () => this.handleDeleteConfirmed(item)
              },
            ],
            { cancelable: false }
          );
          break;
      }
    }
  }

  handleItemLongPressed(item: Archive, itemIndex: number) {
    if (Platform.OS === 'android') {
      UIManager.showPopupMenu(
        // @ts-ignore
        ReactNative.findNodeHandle(this.itemRefs[itemIndex]),
        [
          t('edit'),
          t('delete')
        ],
        () => console.warn('something went wrong with the popup menu'),
        (event, index) => this.handlePopupMenuItemSelected(event, index, item)
      );
    } else {
      ActionSheetIOS.showActionSheetWithOptions({
        options: [
          t('edit'),
          t('delete')
        ],
      }, buttonIndex => {
        this.handlePopupMenuItemSelected('itemSelected', buttonIndex, item);
      })
    }
  }

  handleEndReached() {
    this.props.onEndReached();
  }

  renderItem({ item, index, separators }: { item: Archive, index: number, separators: any }) {
    return (
      <TouchableOpacity
        ref={ e => { this.itemRefs[index] = e } }
        onPress={ this.handleItemClicked.bind(this, item.play.id) }
        onLongPress={ () => this.handleItemLongPressed(item, index) }
        style={ styles.itemWrapper }>
        <View style={ styles.fieldWrapper }>
          <Field
            layout={ this.props.layout }
            theme={ this.props.theme }
            puyoSkin={ this.props.puyoSkin }
            isActive={ false }
            stack={ getStackForRendering(_.chunk(item.play.stack, fieldCols), []) }
            ghosts={ [] }
            style={ { width: 10 } }
          />
        </View>
        <View style={ styles.description }>
          <View>
            <Text style={ styles.title }>
              { item.title }
            </Text>
            <Text style={ styles.lastModified }>
              { t('lastModified') }: { formatDateTime(item.play.updatedAt) }
            </Text>
            <Text style={ styles.stats }>
              { item.play.maxChain } chain, { item.play.score } pts.
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={ styles.container }>
        <View style={ styles.contents }>
          <Loading isLoading={ this.props.isLoading } theme={ this.props.theme }>
            <FlatList
              data={ this.props.archives }
              renderItem={ this.renderItem.bind(this) }
              keyExtractor={ item => item.play.id }
              onEndReached={ this.handleEndReached.bind(this) }
            />
          </Loading>
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
    flexDirection: 'column'
  },
  itemWrapper: {
    flexDirection: 'row',
    flex: 1,
    padding: contentsMargin,
    margin: contentsMargin,
    backgroundColor: themeLightColor,
    elevation: 2
  },
  fieldWrapper: {
    borderColor: themeColor + '33',
    borderWidth: 1,
    margin: contentsMargin
  },
  description: {
    justifyContent: 'space-between',
    margin: contentsMargin,
    flexGrow: 1
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  lastModified: {
    lineHeight: 21
  },
  stats: {
    lineHeight: 21
  },
  controls: {
    flexDirection: 'row',
    alignContent: 'flex-end',
    justifyContent: 'flex-end'
  }
});
