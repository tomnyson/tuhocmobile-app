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

class TNXemNotifyCanSua extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      orientation: "",
      messageType: 0,
      message: ""
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));

    this.notifyCanSua = this.props.notifyCanSua;
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    if (this.notifyCanSua != null) {
      var message = this.getMessage(this.notifyCanSua.messageCanSua);
      if (this.notifyCanSua.entityYeuCauSua != null) {
        message = funcs.strReplaceAll(message, "[NameOfThanhVien]", this.notifyCanSua.entityYeuCauSua.hoTen);
        message = funcs.strReplaceAll(message, "[NgayDuLieuCanSua]", funcs.getValueFromServerDate(this.notifyCanSua.entityYeuCauSua.ngay, "day")
        + "/" + funcs.getValueFromServerDate(this.notifyCanSua.entityYeuCauSua.ngay, "month")
        + "/" + funcs.getValueFromServerDate(this.notifyCanSua.entityYeuCauSua.ngay, "year"));
      }

      this.setState({
        messageType: this.notifyCanSua.messageCanSua,
        message: message
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

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async onDongYPress() {
    this.props.spinner && this.props.spinner();
    var result = await api.yeuCauDuocSua_TruongNhomDongY(this.notifyCanSua.listCanSua);
  
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
              this.state.messageType == 7 ?
              (
                  <View style={[s.buttonGroup.container]}>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={this.onDongYPress.bind(this)}>
                          <Text style={[s.buttonGroup.text]}>Đồng Ý</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={()=>funcs.goTo("TNXemDuLieuCanSua", {notifyCanSua: this.notifyCanSua})}>
                          <Text style={[s.buttonGroup.text]}>Xem dữ liệu cần sửa</Text>
                      </TouchableOpacity>
                  </View>
              )
              : null
            }

            {
              this.state.messageType == 8 || this.state.messageType == 9 ?
              (
                  <View style={[s.buttonGroup.container]}>
                      <TouchableOpacity style={[s.buttonGroup.buttonStyle, s.buttonGroup.button]} onPress={()=>funcs.goTo("TNXemDuLieuCanSua", {notifyCanSua: this.notifyCanSua})}>
                          <Text style={[s.buttonGroup.text]}>Xem dữ liệu cần sửa</Text>
                      </TouchableOpacity>
                  </View>
              )
              : null
            }
          </View>
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

export default TNXemNotifyCanSua;