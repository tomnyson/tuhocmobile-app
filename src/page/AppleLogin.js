import React, { Component } from 'react';
import { Image, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Item, Input, Form, Content, Button, Icon } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';

// Our custom files and classes import
import Text from '../component/Text';
import ErrorMsg from '../component/ErrorMsg';
import Navbar from '../component/Navbar';
import * as styles from "../Styles";
import Colors from "../Colors";
import store from "../store/index";
import * as funcs from "../utils/funcs";
import Storage from "../storage/index";
import * as appActions from "../actions/appActions";
import api from '../utils/api';

class AppleLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",//03623252710//0362325282//0362325270
      password: "",//12345678
      passwordOn: true,
      passwordOnOffIcon: "eye-off",
      spinner: false
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }

  onOffPassword() {
    if (this.state.passwordOn) {
      this.setState({passwordOnOffIcon: "eye", passwordOn: false});
    }else {
      this.setState({passwordOnOffIcon: "eye-off", passwordOn: true});
    }
  }

  async login() {
    var validate = true;
    if (this.state.userName.trim() == "") {
      validate = false;
      this.setState({errorUserName: "Hãy nhập email"});
    }

    if (this.state.password.trim() == "") {
      validate = false;
      this.setState({errorPassword: "Hãy nhập mật khẩu"});
    }

    if (!validate) {
      return;
    }

    this.setState({spinner: true});
    var result = await api.login({
      soDienThoai: this.state.userName,
      matKhau: this.state.password
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        var entity = data.entity;
        entity.plainPassword = this.state.password;
        await Storage.setItemAsync(Storage.Keys.LOGIN_INFO, this.state.userName + ":" + this.state.password);
        await store.dispatch(appActions.saveLoginInfo(entity));
        await store.dispatch(appActions.saveTruongNhom(data.truongNhomEntity));
        await store.dispatch(appActions.saveSettings(data.settings));

        if (typeof data.conTiepNhan != "undefined" && data.conTiepNhan != null) {
          await store.dispatch(appActions.saveConTiepNhan(data.conTiepNhan));
        } else {
          await store.dispatch(appActions.saveConTiepNhan(false));
        }
        
        if (entity.truongNhom) {
          await store.dispatch(appActions.saveIsTruongNhom(true));
          funcs.goTo("homeTruongNhom");
          return;
        }

        if (entity.truongDoan) {
          funcs.goTo("homeTruongDoan");
          return;
        }

        if (!entity.truongDoan && !entity.truongNhom) {
          funcs.goTo("homeThanhVien");
        }

      } else {
        this.setState({spinner: false});
        funcs.showMsg(data.message);
      }
    } else {
      this.setState({spinner: false});
      funcs.showMsg(result.message);
    }
  }

  onUserNameChange(text) {
    this.setState({
        userName: text,
        errorUserName: null
    });
  }

  onPasswordChange(text) {
    this.setState({
      password: text,
      errorPassword: null
    });
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <Content>
            <Form style={s.container}>
              <Image style={s.img} source={require("../assets/images/logo.png")}></Image>
              <Item bordered rounded style={[{ marginTop: 30 }, s.item]}>
                <Input value={this.state.userName} placeholder="Email" placeholderTextColor="gray"
                onChangeText={this.onUserNameChange.bind(this)}/>
              </Item>
              <ErrorMsg style={[this.state.errorUserName ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorUserName}
              </ErrorMsg>
              <Item bordered rounded style={[{ marginTop: 10 }, s.item]}>
                <Input
                placeholderTextColor="gray"
                placeholder="Mật khẩu"
                value={this.state.password}
                secureTextEntry={this.state.passwordOn}
                onChangeText={this.onPasswordChange.bind(this)}/>
                <Icon active name={this.state.passwordOnOffIcon} 
                  onPress={this.onOffPassword.bind(this)} />
              </Item>
              <ErrorMsg style={[this.state.errorPassword ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorPassword}
              </ErrorMsg>
              <Button style={[s.button, s.item]} full rounded onPress={this.login.bind(this)}>
                <Text style={s.buttonText}>Đăng nhập</Text>
              </Button>
              <TouchableOpacity onPress={() => funcs.goTo(funcs.appleMode() ? "AppleDangKyMoi" : "leaderList")}>
                <Text style={[s.dangKy.text, s.dangKyButton]}>Đăng ký tài khoản mới!</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => funcs.goTo("requestPass")}>
                <Text style={[s.dangKy.text, s.dangKyButton]}>Quên mật khẩu!</Text>
              </TouchableOpacity>
            </Form>
          </Content>
          <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor} />
        </Container>
    );
  }
}

const s = {
  container: {
    flexDirection : "column",
    alignItems: "center"
  },
  img: {
    marginTop: 10
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
  dangKy: StyleSheet.create({
    text: {
      textDecorationLine: "underline"
    }
  }),
  dangKyButton: {
    marginTop: 40
  },
  errorMsg: {
    marginLeft: 30,
    marginRight: 30,
  }
};

export default AppleLogin;