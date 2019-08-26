import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions, View } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Item, Input, Drawer, Icon, Textarea,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, H1, Form } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from "moment";
import Orientation from 'react-native-orientation';

// Our custom files and classes import
import Text from '../component/Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import FooterTabThanhVien from "../component/FooterTabThanhVien";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import Label from '../component/Label';
import ErrorMsg from '../component/ErrorMsg';
import TVXemNotify from './TVXemNotify';

const { width, height } = Dimensions.get('window');

class XemYKienPhanHoi extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      userMenuVisible: false,
      orientation: "",
      email: "",
      loai: "",
      loaiElements: [],
      tieuDe: "",
      noiDung: "",
      traLoi: ""
    };
  }

  componentWillMount() {
    this.app = store.getState().app;

    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));
    this.setState({
      email: this.app.loginInfo.email,
      loai: this.app.settings.defaultLoaiYKienPhanHoi.toString()
    });

    this.ngay = this.props.navigation.getParam('ngay', null);
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    
    await this.getYKienPhanHoi();

    await this.getYKienTypes();
    this.renderLoai();

    this.setState({spinner: false});  
  }

  async getYKienPhanHoi() {
    this.yKienPhanHoiRows = [];

    let result = await api.getYKienByDate({
        IDThanhVien: this.app.loginInfo.id,
        ngay: this.ngay
    });
    
    if (result.code === 200) {
      var data = result.data;
      if (typeof data.yKienPhanHoi != "undefined" && data.yKienPhanHoi != null) {
        var row = data.yKienPhanHoi;
        this.setState({
            email: row.email,
            loai: row.type.toString(),
            tieuDe: row.title,
            noiDung: row.content,
            traLoi: row.reply == null ? "" : row.reply
        });
      }
    } else {
      funcs.showMsg(result.message);
    }
  }

  async getYKienTypes() {
    this.listYKienType = [];

    let result = await api.getYKienType();
    
    if (result.code === 200) {
      var data = result.data;
      this.listYKienType = data.list;
    } else {
      funcs.showMsg(result.message);
    }
  }

  orientationDidChange(orientation) {
    this.setState({orientation: orientation});
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  onUserMenuClick() {
    this.setState({
      userMenuVisible: !this.state.userMenuVisible
    });
  }

  renderUserMenuDropdown() {
    return (
      <UserMenuDropdown onPressOut={this.onUserMenuClick.bind(this)} style={{zIndex: 10}}/>
    );
  }

  renderLoai() {
    let loaiElements = []
    let arr = this.listYKienType;
    
    for (var i = 0; i < arr.length; ++i) {
      let item = arr[i];

      loaiElements.push(
        <Picker.Item key={"tgr" + i} label={item.name} value={item.value} />
      );
    }

    this.setState({
      loaiElements: loaiElements
    });
  }

  onEmailChange(value) {
    this.setState({
      email: value,
      errorEmail: null
    });
  }

  onTieuDeChange(value) {
    this.setState({
      tieuDe: value,
      errorTieuDe: null
    });
  }

  onLoaiChange(value) {
    this.setState({
      loai: value
    });
  }

  onNoiDungChange(value) {
    this.setState({
      noiDung: value,
      errorNoiDung: null
    });
  }

  async onSendPress() {
    var valid = true;

    if (this.state.email.trim() == "" || !funcs.isEmail(this.state.email)) {
      this.setState({errorEmail: "Email không hợp lệ"});
      valid = false;
    }

    if (this.state.tieuDe.trim() == "") {
      this.setState({errorTieuDe: "Hãy nhập tiêu đề"});
      valid = false;
    }

    if (this.state.noiDung.trim() == "") {
      this.setState({errorNoiDung: "Hãy nhập nội dung"});
      valid = false;
    }

    if (!valid) {
      return;
    }

    this.setState({spinner: true});

    let result = await api.saveYKienPhanHoi({
      IDThanhVien: this.app.loginInfo.id,
      Ngay: this.ngay,
      Type: this.state.loai,
      Email: this.state.email,
      Title: this.state.tieuDe,
      Content: this.state.noiDung
    });

    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        funcs.showMsg("Gửi phản hồi thành công");
      } else {
        funcs.showMsg(data.message);  
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
  }

  render() {
    return(
      <Container>
        <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
        <View style={[s.header.container, {zIndex: 5}]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Xem Ý Kiến Phản Hồi Trước Đây</Text>
            <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
        </View>
        <Content style={{zIndex: 1}} removeClippedSubviews={true}>
          <Form>
            <Item stackedLabel style={s.item}>
              <Label>Email</Label>
              <Input placeholderTextColor="gray" placeholder="Email" value={this.state.email} onChangeText={this.onEmailChange.bind(this)}/>
            </Item>
            <ErrorMsg style={[this.state.errorEmail ? {} : styles.displayNone, s.errorMsg]}>
              {this.state.errorEmail}
            </ErrorMsg>
            <Item stackedLabel style={[s.itemDropbox]}>
              <Label>Loại</Label>
              <Picker
              headerStyle={s.pickerText}
              textStyle={s.pickerText}
              mode="dropdown"
              iosHeader="Loại"
              iosIcon={<Icon name="ios-arrow-down" />}
              style={s.dropbox}
              selectedValue={this.state.loai}
              onValueChange={this.onLoaiChange.bind(this)}
              >
                {this.state.loaiElements}
              </Picker>
            </Item>
            <Item stackedLabel style={s.item}>
              <Label>Tiêu đề</Label>
              <Input placeholderTextColor="gray" placeholder="Tiêu đề" value={this.state.tieuDe} onChangeText={this.onTieuDeChange.bind(this)}/>
            </Item>
            <ErrorMsg style={[this.state.errorTieuDe ? {} : styles.displayNone, s.errorMsg]}>
              {this.state.errorTieuDe}
            </ErrorMsg>
            <Item stackedLabel style={s.item}>
              <Label>Nội dung</Label>
              <Textarea style={{width: "100%"}} rowSpan={5} bordered value={this.state.noiDung} onChangeText={this.onNoiDungChange.bind(this)} />
            </Item>
            <ErrorMsg style={[this.state.errorNoiDung ? {} : styles.displayNone, s.errorMsg]}>
              {this.state.errorNoiDung}
            </ErrorMsg>
            <Item stackedLabel style={s.item}>
              <Label>Câu Trả lời</Label>
              <Textarea style={{width: "100%"}} rowSpan={5} bordered value={this.state.traLoi} />
            </Item>
            {
                this.state.traLoi.trim() == "" ?
                (
                    <Button style={[s.button]} full rounded onPress={this.onSendPress.bind(this)}>
                        <Text style={s.buttonText}>Cập Nhật</Text>
                    </Button>
                )
                : null
            }
          </Form>
        </Content>
        {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
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
  container: {
    flexDirection : "column",
    alignItems: "center"
  },
  img: {
    marginTop: 10
  },
  item: {
    marginRight: 20
  },
  button: {
    backgroundColor: Colors.navbarBackgroundColor,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20
  },
  errorMsg: {
    marginLeft: 20,
  },
  buttonText: {
    color: Colors.buttonColor
  },
  dropbox: {
    width: "100%"
  }
};

export default XemYKienPhanHoi;