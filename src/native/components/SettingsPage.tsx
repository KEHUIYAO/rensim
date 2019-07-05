import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import SettingsList from 'react-native-settings-list';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { defaultValues } from '../../shared/models/config';
import { t } from '../../shared/platformServices/i18n';
import { NavigationScreenProps } from "react-navigation";

function evalItem(configItem, config) {
  if (typeof configItem === 'function') {
    return configItem(config);
  }
  return configItem;
}

export type Props = {
  componentId: string,
  configItems: any,
  targetItems: any,
  config: any,
  onChanged: (key: string, value: string) => void
}

export default class SettingsPage extends Component<Props & NavigationScreenProps, {}> {
  static navigationOptions = ({ navigation }) => ({
    title: 'Settings'
  });

  openDescendantScreen(descendantItems) {
    this.props.navigation.push('settings', {
      targetItems: descendantItems
    });
  }

  updateConfigValue(key, value) {
    const { onChanged } = this.props;
    onChanged(key, value);
  }

  handlePressed(parent, configItem) {
    if (parent && parent.type === 'radio') {
      this.updateConfigValue(parent.key, configItem.value);
    }
    if (!configItem.children) {
      this.props.navigation.pop();
    } else {
      this.openDescendantScreen(configItem);
    }
  }

  renderCheckBox(isChecked) {
    if (isChecked) {
      return (
        <Icon name="check" size={ 30 } color="green" style={ styles.checkBox }/>
      );
    } else {
      return (
        <View style={ styles.checkBox }/>
      );
    }
  }

  renderDirectoryItem(parent, item) {
    const { config } = this.props;
    let selectedChild = evalItem(item.children, config).find(c => c.value === config[item.key]);

    if (selectedChild === undefined) {
      // バージョン更新によって保存データの構造が変化したなどの理由で見つからない
      selectedChild = evalItem(item.children, config).find(c => c.value === defaultValues[item.key]);
    }

    return (
      <SettingsList.Item
        title={ item.name }
        titleInfo={ selectedChild.name }
        key={ item.key + item.value }
        itemWidth={ 70 }
        titleStyle={ styles.title }
        hasNavArrow={ true }
        onPress={ () => this.handlePressed(parent, item) }
      />
    );
  }

  renderRadioItem(parent, item) {
    const selected = this.props.config[parent.key];
    const selectedChild = this.props.config[item.key];

    const isChecked = selected === item.value;
    const hasNavArrow = !!item.children;

    let s = selectedChild && t(selectedChild);
    if (item.selectedValue) {
      s = item.selectedValue(this.props.config);
    }

    return (
      <SettingsList.Item
        title={ item.name }
        titleInfo={ s }
        key={ item.key + item.value }
        icon={ this.renderCheckBox(isChecked) }
        itemWidth={ 70 }
        titleStyle={ styles.title }
        hasNavArrow={ hasNavArrow }
        onPress={ () => this.handlePressed(parent, item) }
      />
    );
  }

  renderItem(item) {
    const children = evalItem(item.children, this.props.config);
    switch (item.type) {
      case 'directory':
        return children.map(child => this.renderDirectoryItem(item, child));
      case 'radio':
        return children.map(child => this.renderRadioItem(item, child));
    }
  }

  render() {
    const { configItems } = this.props;
    const { targetItems } = this.props.navigation.state.params || { targetItems: null };
    const item = targetItems || configItems;
    return (
      <View style={ styles.component }>
        <SettingsList borderColor='#d6d5d9' defaultItemSize={ 50 }>
          { this.renderItem(item) }
        </SettingsList>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  component: {
    alignItems: 'stretch'
  },
  checkBox: {
    top: 20,
    left: 20,
    width: 50
  },
  title: {
    color: 'black',
    fontSize: 16
  }
});
