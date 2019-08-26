import React, { Component } from 'react';
import { Image, StatusBar, StyleSheet, View, TouchableOpacity } from 'react-native';
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

class RequestPassSuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false
    };
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent>
              <Thumbnail small source={require("../assets/images/icon_logo.png")} />
            </Button>
            <Text style={styles.headerText}>Khôi phục mật thành công</Text>
            <View></View>
          </View>
          <Content>
            <View style={[s.successMsgContainer]}>
              <Text style={s.successMsg}>Khôi phục mật khẩu thành công!.</Text>
            </View>
            <TouchableOpacity onPress={() => funcs.goToLogin()} style={s.textLink}>
                <Text style={[s.dangNhap.text, s.dangNhapButton]}>Tới trang đăng nhập!</Text>
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
  successMsgContainer: {
    flexDirection : "row",
    justifyContent: "center",
    marginTop: 30
  },
  successMsg: {
    fontSize: 18,
    color: "green"
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

export default RequestPassSuccess;