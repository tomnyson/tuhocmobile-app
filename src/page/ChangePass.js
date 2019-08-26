import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions, View } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Form, Item, Input, Icon,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';

// Our custom files and classes import
import Text from '../component/Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import ErrorMsg from '../component/ErrorMsg';
import Storage from "../storage/index";

const { width, height } = Dimensions.get('window');

class ChangePass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: true,
      userMenuVisible: false,
      password: "",
      passwordNew: "",
      passwordNewConfirm: "",
      passwordOn: true,
      passwordOnOffIcon: "eye-off",
      user: {}
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }

  async componentDidMount() {
    this.setState({user: this.app.loginInfo});
    this.setState({spinner: false});
  }

  componentWillUnmount(){
    this.unmounted = true;
  }

  onOffPassword() {
    if (this.state.passwordOn) {
      this.setState({passwordOnOffIcon: "eye", passwordOn: false});
    }else {
      this.setState({passwordOnOffIcon: "eye-off", passwordOn: true});
    }
  }

  onUserMenuClick() {
    this.setState({
      userMenuVisible: !this.state.userMenuVisible
    });
  }

  renderUserMenuDropdown() {
    return (
      <UserMenuDropdown onPressOut={this.onUserMenuClick.bind(this)}/>
    );
  }

  onPasswordChange(value) {
    this.setState({errorPassword: null});
    this.setState({password: value});
  }

  onPasswordNewChange(value) {
    this.setState({errorPasswordNew: null});
    this.setState({passwordNew: value});
  }

  onPasswordNewConfirmChange(value) {
    this.setState({errorPasswordNewConfirm: null});
    this.setState({passwordNewConfirm: value});
  }

  async onChangePass() {
    var valid = true;

    if (this.state.password.trim() == "") {
        this.setState({errorPassword: "Hãy nhập mật khẩu hiện tại!"});
        valid = false;
    }

    if (this.state.passwordNew.trim() == "") {
        this.setState({errorPasswordNew: "Hãy nhập mật khẩu mới!"});
        valid = false;
    }

    if (this.state.passwordNewConfirm.trim() == "") {
        this.setState({errorPasswordNewConfirm: "Hãy xác nhận mật khẩu mới!"});
        valid = false;
    }

    if (this.state.passwordNew.trim() != this.state.passwordNewConfirm.trim()) {
        this.setState({errorPasswordNewConfirm: "Mật khẩu mới không khớp!"});
        valid = false;
    }

    if (!valid) {
        return;
    }

    var user = this.app.loginInfo;
    var result = await api.updateMatkhauWhenLoggedIn({
      id: user.id,
      matKhauCu: this.state.password.trim(),
      matKhauMoi: this.state.passwordNew.trim()
    });

    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        await Storage.setItemAsync(Storage.Keys.LOGIN_INFO, user.soDienThoai + ":" + this.state.passwordNew.trim());
        funcs.showMsg("Đổi mật khẩu thành công!");
      } else {
        funcs.showMsg(data.message);  
      }
    } else {
      funcs.showMsg(result.message);
    }
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Thay đổi mật khẩu</Text>  
            <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
          </View>
          <Content>
            <View style={s.avatarContainer}>
                <Thumbnail large source={this.state.user.Avatar ? 
                  {uri: 'data:image/jpeg;base64,' + this.state.user.Avatar}
                  : require("../assets/images/avatar.jpg")}/>
            </View>
            <Form style={s.container}>
              <Item bordered rounded style={[{ marginTop: 30 }, s.item]}>
                <Input
                    placeholderTextColor="gray"
                    placeholder="Mật khẩu hiện tại"
                    value={this.state.password}
                    secureTextEntry={this.state.passwordOn}
                    onChangeText={this.onPasswordChange.bind(this)}/>
                    <Icon active name={this.state.passwordOnOffIcon} 
                    onPress={this.onOffPassword.bind(this)} />
              </Item>
              <ErrorMsg style={[this.state.errorPassword ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorPassword}
              </ErrorMsg>
              <Item bordered rounded style={[{ marginTop: 10 }, s.item]}>
                <Input
                placeholderTextColor="gray"
                placeholder="Mật khẩu mới"
                value={this.state.passwordNew}
                secureTextEntry={this.state.passwordOn}
                onChangeText={this.onPasswordNewChange.bind(this)}/>
                <Icon active name={this.state.passwordOnOffIcon} 
                  onPress={this.onOffPassword.bind(this)} />
              </Item>
              <ErrorMsg style={[this.state.errorPasswordNew ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorPasswordNew}
              </ErrorMsg>
              <Item bordered rounded style={[{ marginTop: 10 }, s.item]}>
                <Input
                placeholderTextColor="gray"
                placeholder="Nhập lại mật khẩu mới"
                value={this.state.passwordNewConfirm}
                secureTextEntry={this.state.passwordOn}
                onChangeText={this.onPasswordNewConfirmChange.bind(this)}/>
                <Icon active name={this.state.passwordOnOffIcon} 
                  onPress={this.onOffPassword.bind(this)} />
              </Item>
              <ErrorMsg style={[this.state.errorPasswordNewConfirm ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorPasswordNewConfirm}
              </ErrorMsg>
              <Button style={[s.button, s.item]} full rounded onPress={this.onChangePass.bind(this)}>
                <Text style={s.buttonText}>Đổi mật khẩu</Text>
              </Button>
            </Form>
          </Content>
          {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
          <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor} overlayColor="#ffffff"/>
        </Container>
    );
  }
}

const s = {
    header: {
      container: {
        flexDirection : "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.navbarBackgroundColor,
        paddingLeft: 4,
        paddingRight: 4
      }
    },
    avatarContainer: {
        alignItems: "center",
        backgroundColor: "#F7F7F7", 
        height: 100, 
        flexDirection: "row", 
        justifyContent: "center"
    },
    container: {
        flexDirection : "column",
        alignItems: "center"
    },
    item: {
        marginLeft: 20,
        marginRight: 20
    },
    button: {
        backgroundColor: Colors.navbarBackgroundColor,
        marginTop: 30
    },
    buttonText: {
        color: Colors.buttonColor
    },
    errorMsg: {
        marginLeft: 30,
        marginRight: 30,
    }
};

export default ChangePass;