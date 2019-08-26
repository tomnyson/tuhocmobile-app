import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions, View } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Item, Input, Drawer, Segment,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, H1, Form } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from "moment";
import Orientation from 'react-native-orientation';
import IconSimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

// Our custom files and classes import
import TruongNhomSideBar from '../component/TruongNhomSideBar';
import Text from '../component/Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import FooterTabTruongNhom from "../component/FooterTabTruongNhom";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import Label from '../component/Label';
import ErrorMsg from '../component/ErrorMsg';
import TNXemNotify from './TNXemNotify';
import TNXemNotifyCanSua from './TNXemNotifyCanSua';
import YoutubeSection from './YoutubeSection';

const { width, height } = Dimensions.get('window');

class HomeTruongNhom extends Component {
  constructor(props) {
    super(props);

    this.thoiGianRanhPopupOriginStyle = {
      container: {
        width: width,
        height: height
      },
      inner: {
        width: width - 4,
        height: 320
      },
      landscape: {
        container: {
          width: height,
          height: width
        },
        inner: {
          width: height - 4,
          height: width - 200
        }
      }
    };

    this.state = {
      spinner: true,
      userMenuVisible: false,
      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",
      daNhap: false,
      thoiGianRanhInfoPopupVisible: false,
      tocDoNiemPhatInfoPopupVisible: false,
      orientation: "",
      notify: null,
      notifyCanSua: null
    };
  }

  componentWillMount() {
    this.app = store.getState().app;

    this.setState({
      tocDoNiemPhat: this.app.settings.tocDoNiemPhat.toString(),
      thoiGianRanh: this.app.loginInfo.thoiGianRanh == null ? "" : this.app.loginInfo.thoiGianRanh.toString()
    });
    
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    var result = await api.thanhVienHome({
      IDTHanhVien: this.app.loginInfo.id,
      ngay: moment().format("YYYY-M-D")
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.setState({
          daNhap: true,
          thoiGianNghePhap: data.entity.tgNghePhap != null ? data.entity.tgNghePhap.toString() : "",
          thoiGianTungKinh: data.entity.tgTungKinh != null ? data.entity.tgTungKinh.toString() : "",
          soLuongDanhHieu: data.entity.soLuongDH != null ? data.entity.soLuongDH.toString() : "",
          thoiGianRanh: data.entity.thoiGianRanh != null ? data.entity.thoiGianRanh.toString() : ""
        });
      } else {
        this.setState({
          daNhap: false
        });
      }

      if (typeof data.notify != "undefined" && data.notify != null && 
        4 <= data.notify.messageType && data.notify.messageType <= 6 
        && data.notify.thanhVien != null) {
        this.setState({notify: data.notify});
      }

      if (typeof data.notifyCanSua != "undefined" && data.notifyCanSua != null && 
        7 <= data.notifyCanSua.messageCanSua && data.notifyCanSua.messageCanSua <= 9) {
        this.setState({notifyCanSua: data.notifyCanSua});
      }
    } else {
      funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  orientationDidChange(orientation) {
    this.setState({orientation: orientation});
  }

  onThoiGianNghePhapChange(value) {
    this.setState({errorThoiGianNghePhap: null});
    this.setState({thoiGianNghePhap: value});
  }

  onThoiGianTungKinhChange(value) {
    this.setState({errorThoiGianTungKinh: null});
    this.setState({thoiGianTungKinh: value});
  }

  onSoLuongDanhHieuChange(value) {
    this.setState({errorSoLuongDanhHieu: null});
    this.setState({soLuongDanhHieu: value});
  }

  onThoiGianRanhChange(value) {
    this.setState({
      thoiGianRanh: value,
      errorThoiGianRanh: null
    });
  }

  onTocDoNiemPhatChange(value) {
    this.setState({tocDoNiemPhat: value});
    this.setState({errorTocDoNiemPhat: null});
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

  async save() {
    var valid = true;
    if (this.state.thoiGianNghePhap.trim() == "") {
      valid = false;
      this.setState({errorThoiGianNghePhap: "Hãy nhập thời gian nghe pháp"});
    }

    if (this.state.thoiGianTungKinh.trim() == "") {
      valid = false;
      this.setState({errorThoiGianTungKinh: "Hãy nhập thời gian tụng kinh"});
    }

    if (this.state.soLuongDanhHieu.trim() == "") {
      valid = false;
      this.setState({errorSoLuongDanhHieu: "Hãy nhập số lượng danh hiệu"});
    }

    if (this.state.tocDoNiemPhat.trim() == "") {
      valid = false;
      this.setState({errorTocDoNiemPhat: "Hãy nhập tốc độ nhiệm phật"});
    }

    if (this.state.thoiGianRanh.trim() == "") {
      valid = false;
      this.setState({errorThoiGianRanh: "Hãy nhập thời gian rãnh"});
    }

    if (!valid) {
      return;
    }

    this.setState({spinner: true});
    var result = await api.congPhuSave({
      IDTHanhVien: this.app.loginInfo.id,
      ngay: moment().format("YYYY-M-D"),
      TGNghePhap: this.state.thoiGianNghePhap,
      TGTungKinh: this.state.thoiGianTungKinh,
      SoLuongDH: this.state.soLuongDanhHieu,
      ThoiGianRanh: this.state.thoiGianRanh,
      tocDoNiemPhat: this.state.tocDoNiemPhat
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
      } 

      funcs.showMsg(data.message);
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
  }

  closeDrawer() {
    this.drawer._root.close();
  };

  openDrawer() { 
    this.drawer._root.open() ;
  };

  showThoiGianRanhInfo() {
    this.setState({
      thoiGianRanhInfoPopupVisible: !this.state.thoiGianRanhInfoPopupVisible
    });
  }

  async switchLogin() {
    this.setState({spinner: true});
    
    var result = await api.switchLogin({
      id: this.app.loginInfo.id,
      matKhau: this.app.loginInfo.plainPassword
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        var entity = data.entity;
        entity.plainPassword = this.app.loginInfo.plainPassword;
        await store.dispatch(appActions.saveLoginInfo(entity));
        await store.dispatch(appActions.saveConTiepNhan(false));
        await store.dispatch(appActions.saveIsTruongNhom(false));
        funcs.goTo("homeTruongDoan");
      } else {
        funcs.showMsg(data.message);
        this.setState({spinner: false});  
      }
    } else {
      funcs.showMsg(result.message);
      this.setState({spinner: false});
    }
  }

  showTocDoNiemPhatInfo() {
    this.setState({
      tocDoNiemPhatInfoPopupVisible: !this.state.tocDoNiemPhatInfoPopupVisible
    });
  }

  render() {
    return(
        <Drawer ref={(ref) => { this.drawer = ref; }} content={<TruongNhomSideBar/>} onClose={this.closeDrawer.bind(this)}>
          <Container>
            <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
            <View style={[s.header.container, {zIndex: 5}]}>
              {
                  this.app.loginInfo.truongDoan ?
                  (
                    <Button transparent onPress={this.switchLogin.bind(this)}>
                      <Thumbnail small source={require("../assets/images/doan.png")} />
                    </Button>
                  )
                  : 
                  (
                    <Button transparent>
                      <Thumbnail small source={require("../assets/images/logo.png")} />
                    </Button>
                  )
              }
              
              <Text style={styles.headerText}>Xin chào : {funcs.getXinChaoText(this.app.loginInfo)}!</Text>
              <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
            </View>
            {this.state.notify != null ? 
              (
                <TNXemNotify notify={this.state.notify} hide={()=>this.setState({notify: null})} style={{zIndex: 2}}
                spinner={()=>this.setState({spinner: !this.state.spinner})}></TNXemNotify>
              ) 
            : null}
            {this.state.notifyCanSua != null ? 
              (
                <TNXemNotifyCanSua notifyCanSua={this.state.notifyCanSua} hide={()=>this.setState({notifyCanSua: null})} style={{zIndex: 2}}
                spinner={()=>this.setState({spinner: !this.state.spinner})}></TNXemNotifyCanSua>
              ) 
            : null}
            {
              this.app.loginInfo.truongDoan ?
              (
                <View style={{marginTop: 10, flexDirection: "row", justifyContent: "flex-start"}}>
                  <TouchableOpacity style={[styles.borderBottom, {paddingBottom: 1}]} onPress={this.switchLogin.bind(this)}>
                    <Text style={[{color: Colors.navbarBackgroundColor}]}>Truy Cập Quyền Trưởng Đoàn</Text>
                  </TouchableOpacity>
                </View>
              )
              : null
            }
            <YoutubeSection/>
            <Content style={{zIndex: 1}}>
              <Form style={this.state.notify == null ? {} : styles.displayNone}>
                <View style={[s.container]}>
                  <Thumbnail large style={{marginTop: 10}} source={require("../assets/images/icon_logo.png")} />
                </View>
              </Form>
              <Form>
                <Item style={s.item}>
                  <View style={[{padding:5, backgroundColor: Colors.navbarBackgroundColor, width: "100%", marginTop: 10}]}>
                    <Text style={{color: "#ffffff"}}>{funcs.getCurrentDayOfWeek()} - Ngày {moment().format("D/M/YYYY")}</Text>
                  </View>
                </Item>
                <Item stackedLabel style={s.item}>
                  <Label>Thời gian nghe pháp<Text style={styles.required}>{" *"}</Text></Label>
                  <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(phút)" value={this.state.thoiGianNghePhap} onChangeText={this.onThoiGianNghePhapChange.bind(this)}/>
                </Item>
                <ErrorMsg style={[this.state.errorThoiGianNghePhap ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorThoiGianNghePhap}
                </ErrorMsg>
                <Item stackedLabel style={s.item}>
                  <Label>Thời gian tụng kinh<Text style={styles.required}>{" *"}</Text></Label>
                  <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(phút)" value={this.state.thoiGianTungKinh} onChangeText={this.onThoiGianTungKinhChange.bind(this)}/>
                </Item>
                <ErrorMsg style={[this.state.errorThoiGianTungKinh ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorThoiGianTungKinh}
                </ErrorMsg>
                <Item stackedLabel style={s.item}>
                  <Label>Số lượng danh hiệu<Text style={styles.required}>{" *"}</Text></Label>
                  <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={6} placeholder="0" value={this.state.soLuongDanhHieu} onChangeText={this.onSoLuongDanhHieuChange.bind(this)}/>
                </Item>
                <ErrorMsg style={[this.state.errorSoLuongDanhHieu ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorSoLuongDanhHieu}
                </ErrorMsg>
                <Item stackedLabel style={s.item}>
                  <View style={{flexDirection : "row",justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                    <Label>Tốc độ niệm phật (số danh hiệu/ phút)<Text style={styles.required}>{" *"}</Text></Label>  
                    <TouchableOpacity style={{marginTop: 10}} onPress={this.showTocDoNiemPhatInfo.bind(this)}>
                      <IconAntDesign name="infocirlceo" style={{fontSize: 20}}/>
                    </TouchableOpacity>
                  </View>
                  <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={6} placeholder="0" value={this.state.tocDoNiemPhat} onChangeText={this.onTocDoNiemPhatChange.bind(this)}/>
                </Item>
                <ErrorMsg style={[this.state.errorTocDoNiemPhat ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorTocDoNiemPhat}
                </ErrorMsg>
                <Item stackedLabel style={s.item}>
                  <View style={{flexDirection : "row",justifyContent: "space-between", alignItems: "center", width: "100%"}}>
                    <Label>Thời gian rãnh (tiếng)<Text style={styles.required}>{" *"}</Text></Label>
                    <TouchableOpacity style={{marginTop: 10}} onPress={this.showThoiGianRanhInfo.bind(this)}>
                      <IconAntDesign name="infocirlceo" style={{fontSize: 20}}/>
                    </TouchableOpacity>
                  </View>
                  <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(tiếng)" value={this.state.thoiGianRanh} onChangeText={this.onThoiGianRanhChange.bind(this)}/>
                </Item>
                <ErrorMsg style={[this.state.errorThoiGianRanh ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorThoiGianRanh}
                </ErrorMsg>
                <Button style={[s.button]} full rounded onPress={this.save.bind(this)}>
                  <Text style={s.buttonText}>{this.state.daNhap ? "Cập nhật" : "Gửi"}</Text>
                </Button>
              </Form>
            </Content>
            {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
            <FooterTabTruongNhom screen={this.props.navigation.getParam('screen', null)} onQuanLyThanhVienPress={this.openDrawer.bind(this)}></FooterTabTruongNhom>
            {this.state.thoiGianRanhInfoPopupVisible 
            ?  
            (
              <View style={[s.thoiGianRanhPopupStyle.container, this.state.orientation == "LANDSCAPE" ? this.thoiGianRanhPopupOriginStyle.landscape.container : this.thoiGianRanhPopupOriginStyle.container, {zIndex: 30}]}>
                <View style={[s.thoiGianRanhPopupStyle.inner, this.state.orientation == "LANDSCAPE" ? this.thoiGianRanhPopupOriginStyle.landscape.inner : this.thoiGianRanhPopupOriginStyle.inner]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                    <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thời gian rãnh</Text>
                    <TouchableOpacity onPress={this.showThoiGianRanhInfo.bind(this)} style={{paddingRight: 10}}>
                      <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                    </TouchableOpacity>
                  </View>
                  <Content>
                    <Text style={[s.thoiGianRanhPopupStyle.itemValue, {padding: 5}]}>{this.app.settings.thoiGianRanhDescription}</Text>
                  </Content>
                </View>
              </View>
            ) 
            : null}  
            {this.state.tocDoNiemPhatInfoPopupVisible 
            ?  
            (
              <View style={[s.thoiGianRanhPopupStyle.container, this.state.orientation == "LANDSCAPE" ? this.thoiGianRanhPopupOriginStyle.landscape.container : this.thoiGianRanhPopupOriginStyle.container, {zIndex: 30}]}>
                <View style={[s.thoiGianRanhPopupStyle.inner, this.state.orientation == "LANDSCAPE" ? this.thoiGianRanhPopupOriginStyle.landscape.inner : this.thoiGianRanhPopupOriginStyle.inner]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                    <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Tốc độ niệm phật</Text>
                    <TouchableOpacity onPress={this.showTocDoNiemPhatInfo.bind(this)} style={{paddingRight: 10}}>
                      <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                    </TouchableOpacity>
                  </View>
                  <Content>
                    <Text style={[s.thoiGianRanhPopupStyle.itemValue, {padding: 5}]}>{this.app.settings.tocDoNiemPhatDescription}</Text>
                  </Content>
                </View>
              </View>
            ) 
            : null}
            <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor} />
          </Container>
        </Drawer>
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
  thoiGianRanhPopupStyle: {
    container: {
      position: "absolute",
      top: 0,
      left: 0,
      flexDirection : "column",
      backgroundColor: "#ffffff"
    },
    inner: {
      position: "absolute",
      top: 20,
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
  segmentButton: {
    borderColor: Colors.navbarBackgroundColor,
    paddingLeft: 5,
    paddingRight: 5
  },
  segmentButtonActive: {
    backgroundColor: Colors.navbarBackgroundColor
  },
  segmentTextActive: {
    color: Colors.buttonColor
  },
};

export default HomeTruongNhom;