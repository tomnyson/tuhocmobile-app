import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Container, Content, View, Button, List, ListItem, Picker,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import Orientation from 'react-native-orientation';

// Our custom files and classes import
import Text from './Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import * as styles from "../Styles";
import Storage from "../storage/index";

const { width, height } = Dimensions.get('window');

class UserMenuDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: "",
      spinner: false
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
  }

  orientationDidChange(orientation) {
    this.setState({orientation: orientation});
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  _onPressOut() {
    this.props.onPressOut && this.props.onPressOut();
  }

  async onSignOut() {
    await store.dispatch(appActions.saveIsTruongNhom(false));
    await store.dispatch(appActions.saveConTiepNhan(false));
    await Storage.removeItem(Storage.Keys.LOGIN_INFO);
    funcs.goToLogin();
  }

  render() {
    return [
      <TouchableOpacity key="o1" style={[s.container, this.props.style]} 
        onPress={this._onPressOut.bind(this)}>
      </TouchableOpacity>,
      <View key="o2" style={[s.inner]}>
        <Card>
          {
            !this.app.loginInfo.truongNhom && !this.app.loginInfo.truongDoan
            ?
            (
              <CardItem bordered button onPress={() => funcs.goTo("TVDoiTN")}>
                  <Text>Đổi trưởng nhóm</Text>
              </CardItem>
            )
            : null
          }
          {
            this.app.isTruongNhom ?
            (
              <CardItem bordered button onPress={() => funcs.goTo("TNToogleConTiepNhan")}>
                <Text>{this.app.conTiepNhan ? this.app.settings.conTiepNhanText.off : this.app.settings.conTiepNhanText.on}</Text>
              </CardItem>
            )
            : null
          }
          <CardItem bordered button onPress={() => funcs.goTo("profile")}>
            <Text>Thông tin cá nhân</Text>
          </CardItem>
          <CardItem bordered button onPress={() => funcs.goTo("changePass")}>
            <Text>Đổi mật khẩu</Text>
          </CardItem>
          <CardItem bordered button onPress={() => funcs.goTo("YKienPhanHoi")}>
            <Text>Ý kiến phản hồi</Text>
          </CardItem>
          <CardItem bordered button onPress={this.onSignOut.bind(this)}>
            <Text>Đăng xuất</Text>
          </CardItem>
        </Card>
      </View>,
      <Spinner key="o3" visible={this.state.spinner} color={Colors.navbarBackgroundColor} />
    ];
  }
}

const menuWidth = 250;

const s = {
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width + height,
    height: height + width
  },
  inner: {
    position: "absolute",
    width: menuWidth,
    height: 250,
    top: 40,
    right: 2,
    zIndex: 20
  }
};

export default UserMenuDropdown;