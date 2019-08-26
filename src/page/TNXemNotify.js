import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions, View } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Item, Input, Drawer ,
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

const { width, height } = Dimensions.get('window');

class TNXemNotify extends Component {
  constructor(props) {
    super(props);

    this.thanhVienPopupOriginStyle = {
        container: {
          width: width,
          height: height
        },
        inner: {
          width: width - 4,
          height: height - 160
        },
        landscape: {
          container: {
            width: height,
            height: width
          },
          inner: {
            width: height - 4,
            height: width - 160
          }
        }
    };

    this.state = {
      spinner: true,
      orientation: "",
      thanhVienInfoPopupVisible: false,
      thanhVien: {},
      messageType: 0,
      message: "",
      truongDoan: {}
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));

    this.notify = this.props.notify;
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    if (this.notify != null) {
        var message = funcs.strReplaceAll(this.getMessage(this.notify.messageType), "[NameOfThanhVien]", this.notify.thanhVien.hoTen);

        this.setState({
            messageType: this.notify.messageType,
            message: message,
            thanhVien: this.notify.thanhVien,
            truongDoan: this.notify.truongDoan
        });
    }
    
    this.setState({spinner: false});
  }

  getMessage(messageType) {
    for(var i = 0; i < this.app.settings.fireBaseMessage.length; ++i) {
        var item = this.app.settings.fireBaseMessage[i];
        if (item.messageType == messageType) {
            return item.message;
        }
    }
    return "";
  }

  orientationDidChange(orientation) {
    this.setState({orientation: orientation});
  }

  showThanhVienInfo() {
    this.setState({
      thanhVienInfoPopupVisible: !this.state.thanhVienInfoPopupVisible
    });
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async onDongYPress() {
    this.props.spinner && this.props.spinner();
    var result = await api.dongYThemThanhVien(this.notify.thanhVien.id);
  
    if (result.code == 200) {
        var data = result.data;
        if (data.success) {
          this.props.hide && this.props.hide();
        } else {
            funcs.showMsg(data.message);    
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.props.spinner && this.props.spinner();
  }

  async onTuChoiPress() {
    this.props.spinner && this.props.spinner();
    var result = await api.tuChoiThemThanhVien(this.notify.thanhVien.id);
  
    if (result.code == 200) {
        var data = result.data;
        if (data.success) {
          this.props.hide && this.props.hide();
        } else {
            funcs.showMsg(data.message);    
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.props.spinner && this.props.spinner();
  }

  render() {
    return(
        <View style={[this.props.style]}>
          <View style={{borderWidth: 1, borderColor: Colors.navbarBackgroundColor, padding: 5, marginTop: 2}}>
            <View style={[styles.rowCenter, {padding: 10}]}>
                <Text>{this.state.message}</Text>
            </View>
            {
              this.state.messageType == 4 ?
              (
                  <View style={[s.buttonGroup.container]}>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={this.onDongYPress.bind(this)}>
                          <Text style={[s.buttonGroup.text]}>Đồng Ý</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={this.showThanhVienInfo.bind(this)}>
                          <Text style={[s.buttonGroup.text]}>Thông Tin Thành Viên</Text>
                      </TouchableOpacity>
                  </View>
              )
              : null
            }

            {
              this.state.messageType == 5 ?
              (
                  <View style={[s.buttonGroup.container]}>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={this.onDongYPress.bind(this)}>
                          <Text style={[s.buttonGroup.text]}>Chấp Nhận</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={this.onTuChoiPress.bind(this)}>
                          <Text style={[s.buttonGroup.text]}>Từ Chối</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={this.showThanhVienInfo.bind(this)}>
                          <Text style={[s.buttonGroup.text]}>Thông Tin Thành Viên</Text>
                      </TouchableOpacity>
                  </View>
              )
              : null
            }

            {
              this.state.messageType == 6 ?
              (
                  <View style={[s.buttonGroup.container]}>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, {width: "90%"}]} onPress={()=>funcs.goTo("TNXemDanhSachTVMoiDangKy")}>
                          <Text style={[s.buttonGroup.text]}>Xem Danh Sách Mới Đăng Ký Vào Nhóm</Text>
                      </TouchableOpacity>
                  </View>
              )
              : null
            }
          </View>

          {this.state.thanhVienInfoPopupVisible 
          ?  
          (
            <View style={[s.thanhVienPopupStyle.container, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.container : this.thanhVienPopupOriginStyle.container]}>
              <View style={[s.thanhVienPopupStyle.inner, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.inner : this.thanhVienPopupOriginStyle.inner]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                      <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thông tin trưởng nhóm</Text>
                      <TouchableOpacity onPress={this.showThanhVienInfo.bind(this)} style={{paddingRight: 10}}>
                          <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                      </TouchableOpacity>
                  </View>
                  <Content>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.hoTen}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text>Pháp danh: </Text>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.phapDanh}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text>Số điện thoại: </Text>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.soDienThoai}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text>Email: </Text>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.email}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text>Nghề nghiệp: </Text>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.ngheNghiepDisplay}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, {height: 60}]}>
                          <View style={{flexDirection : "column", paddingTop: 5, paddingBottom: 2}}>
                              <Text style={s.thanhVienPopupStyle.itemValue}>Địa chỉ:</Text>
                              <Text>{funcs.getDiaChi(this.state.thanhVien)}</Text>
                          </View>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text>Thời gian rãnh: </Text>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.thoiGianRanhDisplay}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                          <Text>Tốc độ niệm phật (số danh hiệu/ phút): </Text>
                          <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.tocDoNiemPhat}</Text>
                      </View>
                      <View style={[s.thanhVienPopupStyle.item, {height: 60}]}>
                          <View style={{flexDirection : "column", paddingTop: 5, paddingBottom: 2}}>
                              <Text style={s.thanhVienPopupStyle.itemValue}>Mô tả công việc:</Text>
                              <Text>{this.state.thanhVien.moTaCongViec}</Text>
                          </View>
                      </View>
                  </Content>
              </View>
          </View>
        ) 
        : null}  
      </View>
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
  thanhVienPopupStyle: {
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      flexDirection : "column",
      backgroundColor: "#ffffff"
    },
    inner: {
      position: "absolute",
      top: 10,
      left: 2,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: Colors.navbarBackgroundColor,
      flexDirection : "column"
    },
    itemHeight: {
      height: 50,
    },
    item: {
      borderBottomWidth: 1,
      borderBottomColor: "#F8F9FA",
      justifyContent: "flex-start",
      flexDirection : "row",
      alignItems: "center",
      paddingLeft: 10
    },
    itemValue: {
      fontWeight: "bold"
    }
  },
  buttonGroup: {
      container: {
        flexDirection: "row", 
        justifyContent: "space-around", 
        alignItems: "stretch"
      },
      button: {
        width: "30%",
      },
      buttonStyle: {
        padding: 5, 
        borderColor: Colors.navbarBackgroundColor, 
        borderWidth: 1,
        justifyContent: "center", 
        alignItems: "center"
      },
      text: {
          width: "100%",
          textAlign: "center",
          color: Colors.navbarBackgroundColor
      }
  }
};

export default TNXemNotify;