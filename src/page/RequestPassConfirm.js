import React, { Component } from 'react';
import { Image, StatusBar, View,StyleSheet, TouchableOpacity } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item,
    Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
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
import Label from '../component/Label';

class RequestPassConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      token: "",
      passwordNew: "",
      passwordOn: true
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

  onPasswordNewChange(text) {
    this.setState({
        passwordNew: text,
        errorPasswordNew: null
    });
  }

  async submitClick() {
    var validate = true;

    if (this.state.token.trim() == "") {
        this.setState({
          errorToken: "Token không hợp lệ"
        });
        validate = false;
    }

    if (this.state.passwordNew.trim() == "") {
        validate = false;
        this.setState({errorPassword: "Hãy nhập mật khẩu"});
    }

    if (!validate) {
        return;
      }
    
    this.setState({spinner: true});
    var result = await api.updateMatkhauWhenForget({
      token: this.state.token,
      matKhauMoi: this.state.passwordNew
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        funcs.goTo("requestPassSuccess");      
      } else {
        this.setState({spinner: false});
        funcs.showMsg(data.message);
      }
    } else {
      this.setState({spinner: false});
      funcs.showMsg(result.message);
    }
  }

  onTokenChange(text) {
    this.setState({
        token: text,
        errorToken: null
    });
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent>
              <Thumbnail small source={require("../assets/images/icon_logo.png")} />
            </Button>
            <Text style={styles.headerText}>Khôi phục mật khẩu</Text>
            <View></View>
          </View>
          <Content>
            <Form>
                <Item>
                    <Label style={{marginTop: 30, color: "green"}}>Chúng tôi đã gửi token đến email của bạn. Hãy nhập token đó vào ô bên dưới!</Label>
                </Item>
                <Item stackedLabel>
                    <Label style={{marginTop: 30}}>Token</Label>
                    <Input value={this.state.token} placeholder="Token" placeholderTextColor="gray" keyboardType="numeric"
                    onChangeText={this.onTokenChange.bind(this)}/>
                </Item>
                <ErrorMsg style={[this.state.errorToken ? {} : styles.displayNone, s.errorMsg]}>
                    {this.state.errorToken}
                </ErrorMsg>
                <Item stackedLabel>
                    <Label style={{marginTop: 30}}>Mật khẩu mới</Label>
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
            </Form>
            <Button style={[s.button, s.item]} full rounded onPress={this.submitClick.bind(this)}>
                <Text style={s.buttonText}>Xác nhận</Text>
            </Button>
            <TouchableOpacity onPress={() => funcs.goToLogin()} style={s.textLink}>
                <Text style={[s.dangNhap.text, s.dangNhapButton]}>Quay lại trang đăng nhập!</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => funcs.goTo(funcs.appleMode() ? "AppleDangKyMoi" : "leaderList")} style={s.textLink}>
                <Text style={[s.dangKy.text, s.dangKyButton]}>Đăng ký tài khoản mới!</Text>
            </TouchableOpacity>
          </Content>
          <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor} />
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
  textLink: {
    flexDirection : "row",
    justifyContent: "center",
  },
  container: {
    flexDirection : "column",
    alignItems: "center"
  },
  img: {
    marginTop: 50
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
  dangNhap: StyleSheet.create({
    text: {
      textDecorationLine: "underline"
    }
  }),
  dangNhapButton: {
    marginTop: 40
  },
  errorMsg: {
    marginLeft: 30,
    marginRight: 30,
  },
  dangKy: StyleSheet.create({
    text: {
      textDecorationLine: "underline"
    }
  }),
  dangKyButton: {
    marginTop: 40
  },
};

export default RequestPassConfirm;