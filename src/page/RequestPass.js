import React, { Component } from 'react';
import { Image, StatusBar, View, StyleSheet, TouchableOpacity } from 'react-native';
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

class RequestPass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      email: ""
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }
  
  async sendTokenClick() {
    if (this.state.email.trim() == "" || !funcs.isEmail(this.state.email)) {
        this.setState({
          errorEmail: "Địa chỉ email không hợp lệ"
        });
  
        return;
    }
    
    this.setState({spinner: true});
    var result = await api.initForgetPassToken({
      email: this.state.email
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        funcs.goTo("requestPassConfirm");      
      } else {
        this.setState({spinner: false});
        funcs.showMsg(data.message);
      }
    } else {
      this.setState({spinner: false});
      funcs.showMsg(result.message);
    }
  }

  onEmailChange(text) {
    this.setState({
        email: text,
        errorEmail: null
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
              <Item stackedLabel>
                <Label style={{marginTop: 30}}>Hãy nhập email của bạn</Label>
                <Input value={this.state.email} placeholder="Email" placeholderTextColor="gray"
                onChangeText={this.onEmailChange.bind(this)}/>
              </Item>
              <ErrorMsg style={[this.state.errorEmail ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorEmail}
              </ErrorMsg>
            </Form>
            <Button style={[s.button, s.item]} full rounded onPress={this.sendTokenClick.bind(this)}>
                <Text style={s.buttonText}>Kế tiếp</Text>
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

export default RequestPass;