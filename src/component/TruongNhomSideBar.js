import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions, ImageBackground  } from 'react-native';
import { Container, Content, View, Button, List, ListItem, Picker,
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
import * as styles from "../Styles";

const { width, height } = Dimensions.get('window');

class TruongNhomSideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    return(
        <Content style={{backgroundColor:'#FFFFFF'}}>
            <ImageBackground source={require("../assets/images/sidebar.png")} style={s.img}></ImageBackground>
            <List>
                <ListItem>
                    <TouchableOpacity onPress={() => {funcs.goTo("TNNhapDuLieuChoTVOffline");}}>
                        <Text style={s.text}>Nhập dữ liệu cho thành viên offline</Text>
                    </TouchableOpacity>
                </ListItem>
                <ListItem>
                    <TouchableOpacity onPress={() => {funcs.goTo("TNXacNhanDLChoTVOnline");}}>
                        <Text style={s.text}>Xác nhận dữ liệu cho thành viên online</Text>
                    </TouchableOpacity>
                </ListItem>
                <ListItem>
                    <TouchableOpacity onPress={() => {funcs.goTo("TNXemDanhSachChuaXem");}}>
                        <Text style={s.text}>Danh sách dữ liệu online chưa xem</Text>
                    </TouchableOpacity>
                </ListItem>
                <ListItem>
                    <TouchableOpacity onPress={() => {funcs.goTo("TNXemTVChuaNhapLieu");}}>
                        <Text style={s.text}>Danh sách thành viên chưa nhập liệu</Text>
                    </TouchableOpacity>
                </ListItem>
                <ListItem>
                    <TouchableOpacity onPress={() => {funcs.goTo("TNXemDanhSachThanhVien");}}>
                        <Text style={s.text}>Danh sách thành viên</Text>
                    </TouchableOpacity>
                </ListItem>
                <ListItem>
                    <TouchableOpacity onPress={() => {funcs.goTo("TNDangKyThanhVien");}}>
                        <Text style={s.text}>Đăng ký thành viên</Text>
                    </TouchableOpacity>
                </ListItem>
            </List>
        </Content>  
    );
  }
}

const s = {
    container: {
        flexDirection : "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    img: {
        width: '100%',
        height: 100
    },
    text: {
        paddingTop: 5,
        paddingBottom: 5
    }
};

export default TruongNhomSideBar;