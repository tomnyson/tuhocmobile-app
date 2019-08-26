import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio, Alert } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item, Segment,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';
import { CheckBox } from 'react-native-elements';

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
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import FooterTabTruongDoan from "../component/FooterTabTruongDoan";

const { width, height } = Dimensions.get('window');

class TDXemDanhSachTV extends Component {
  constructor(props) {
    super(props);

    this.thanhVienPopupOriginStyle = {
      container: {
        width: width,
        height: height
      },
      inner: {
        width: width - 4,
        height: height - 100
      },
      landscape: {
        container: {
          width: height,
          height: width
        },
        inner: {
          width: height - 4,
          height: width - 100
        }
      }
    };

    this.state = {
      spinner: true,
      userMenuVisible: false,
      diaChi: "",
      diaChiElements: [],
      city: "",
      district: "",
      ward: "",
      phapDanh: "",
      showFilterPanel: false,
      orientation: "",
      thanhVienInfoPopupVisible: false,
      thanhVien: {},
      thanhVienContent: [],
      truongNhom: "",
      truongNhomElements: [],
      checkAll: false,
      truongNhomKhacForTVElements: [],
      truongNhomKhacForTV: ""
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});

      if (orientation == "LANDSCAPE") {
        this.setState({
          showFilterPanel: false
        });
      }
    }).bind(this));

    this.IDTruongNhom = this.props.navigation.getParam('IDTruongNhom', "").toString();
    if (this.IDTruongNhom != "") {
      this.setState({truongNhom: this.IDTruongNhom});
    }
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    var result = await api.getThanhVienTrongDoan(this.app.loginInfo.id);

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.listAddress = data.listAddress;
        this.listTruongNhom = data.listTruongNhom;
        this.listThanhVien = data.list;
        var arr = [];
        if (this.IDTruongNhom != "") {
          for (var i = 0; i < data.list.length; ++i) {
            var item = data.list[i];
            if (item.idTruongNhom.toString() == this.IDTruongNhom) {
              arr.push(item);
            }
          }
          this.listThanhVien = arr;
        }
        this.buildListThanhVien(this.listThanhVien);
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.renderAddresses();
    this.renderTruongNhoms();
    this.renderListTruongNhomKhacForTV();

    this.setState({spinner: false});

    let msg = this.props.navigation.getParam('msg', null);
    if (msg != null) {
      funcs.showMsg(msg);
    }
  }

  renderListTruongNhomKhacForTV() {
    var list = this.listTruongNhom;
    if (list == null) {
      return;
    }

    let truongNhomKhacForTVElements = []

    truongNhomKhacForTVElements.push(
      <Picker.Item key={"tnk00"} label={"Đổi sang trưởng nhóm khác"} value={""} />
    );

    for (var i = 0; i < list.length; ++i) {
      let item = list[i];

      truongNhomKhacForTVElements.push(
        <Picker.Item key={"tnk" + i} label={item.hoTen + funcs.getPhapDanh(item)} value={item.id} />
      );
    }

    this.setState({
      truongNhomKhacForTVElements: truongNhomKhacForTVElements
    });
  }

  onDiaChiChange(value) {
    this.setState({diaChi: value});
    var found = false;
    for(var i = 0; i < this.listAddress.length; ++i) {
      var item = this.listAddress[i];
      if(item.diaChi == value) {
        this.setState({
          city: item.maTinhThanh,
          district: item.maQuanHuyen,
          ward: item.maPhuongXaTT
        });

        found = true;
        break;
      }
    }

    if (!found) {
      this.setState({
        city: "",
        district: "",
        ward: ""
      });
    }
  }

  renderAddresses() {
    if (typeof this.listAddress == "undefined") {
      return;
    }

    let diaChiElements = []

    diaChiElements.push(
      <Picker.Item key={"city00"} label="Địa chỉ" value={""} />
    );

    for (var i = 0; i < this.listAddress.length; ++i) {
      let item = this.listAddress[i];

      diaChiElements.push(
        <Picker.Item key={"city" + i} label={item.diaChi} value={item.diaChi} />
      );
    }

    this.setState({
      diaChiElements: diaChiElements
    });
  }

  onTruongNhomKhacForTVChange(value) {
    this.setState({truongNhomKhacForTV: value});
  }

  renderTruongNhoms() {
    if (typeof this.listTruongNhom == "undefined") {
      return;
    }

    let truongNhomElements = []

    truongNhomElements.push(
      <Picker.Item key={"city00"} label="Trưởng Nhóm" value={""} />
    );

    for (var i = 0; i < this.listTruongNhom.length; ++i) {
      let item = this.listTruongNhom[i];

      var phapDanh = item.phapDanh == null || item.phapDanh.trim() == "" ? "" : " (" + item.phapDanh + ")";

      truongNhomElements.push(
        <Picker.Item key={"city" + i} label={item.hoTen + phapDanh} value={item.id.toString()} />
      );
    }

    this.setState({
        truongNhomElements: truongNhomElements
    });
  }

  onPhapDanhChange(value) {
    this.setState({phapDanh: value});
  }

  onTruongNhomChange(value) {
    this.setState({truongNhom: value});
  }

  async onFilterClick() {
    this.setState({spinner: true});

    var result = await api.truongDoanFilterThanhVien({
      IDTruongDoan: this.app.loginInfo.id,
      tinhThanh: this.state.city,
      quanHuyen: this.state.district,
      xaphuong: this.state.ward,
      tenPhapdanh: this.state.phapDanh,
      IDTruongNhom: this.state.truongNhom
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.listThanhVien = data.listThanhVien;
        this.buildListThanhVien(data.listThanhVien);
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
  }

  componentWillUnmount() {
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });

    if (orientation == "LANDSCAPE") {
      this.setState({
        showFilterPanel: false
      });
    }

    this.buildListThanhVien(this.listThanhVien);
  }

  showThanhVienInfo(id) {
    var item = this.getThanhVien(id);
    if (item == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }

    this.setState({
      thanhVienInfoPopupVisible: true,
      thanhVien: item
    });
  }

  getThanhVien(id) {
    if (typeof this.listThanhVien == "undefined" || this.listThanhVien == null) {
      return null;
    }

    for(var i = 0; i < this.listThanhVien.length; ++i) {
      var item = this.listThanhVien[i];
      if (item.id == id) {
        return item;
      }
    }

    return null;
  }

  buildListThanhVien(listThanhVien) {
    if (typeof listThanhVien == "undefined") {
        return;
    }
    var arr = [];

    arr.push((
        <View key="header" style={[s.table.row, s.table.border, {marginTop: 5, backgroundColor: Colors.navbarBackgroundColor}]}>
          <View style={[s.table.column, s.table.width10, s.table.borderRight]}>

          </View>
          <View style={[s.table.column, s.table.width45, s.table.borderRight]}>
            <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                <View style={[s.table.align, s.table.width50, s.table.borderRight]}>
                  <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Họ Tên</Text>
                </View>
                <View style={[s.table.align, s.table.width50]}>
                    <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Pháp Danh</Text>
                </View>
            </View>
            <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Địa Chỉ</Text>
            </View>
            <View style={[s.table.row, s.table.width100]}>
                <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Trưởng Nhóm</Text>
            </View>
          </View>
          <View style={[s.table.column, s.table.width20, s.table.borderRight]}>
            <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Đổi{"\n"}Tr.Nhóm</Text>
          </View>
          <View style={[s.table.column, s.table.width25]}>
            <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Phân Quyền</Text>
          </View>
        </View>
    ));

    var chan = true;
    for(var i = 0; i < listThanhVien.length; ++i) {
        var item = listThanhVien[i];
        arr.push(this.renderJSXRow(i, item, chan));
        chan = !chan;
    }

    if (listThanhVien.length == 0) {
      arr.push((
        <View key={"noData"} style={[s.table.border]}>
          <Text style={[s.table.text]}>Không tìm thấy dữ liệu</Text>
        </View>
      ));
    }

    this.setState({thanhVienContent: arr});
  }

  renderJSXRow(i, item, chan) {
    if (typeof item.checked == "undefined") {
      item.checked = false;
    }

    var onCheckBoxPress = (function () {
      item.checked = !item.checked; 
      this.buildListThanhVien(this.listThanhVien);

      var checkAll = true;

      if (typeof this.listThanhVien != "undefined") {
        for (var n = 0; n < this.listThanhVien.length; ++n) {
          if (!this.listThanhVien[n].checked) {
            checkAll = false;
            break;
          }
        }
      }

      this.setState({checkAll: checkAll});
    }).bind(this);

    return (
        <View key={"item" + i} style={[s.table.row, s.table.borderLeft, s.table.borderRight, s.table.borderBottom, chan ? styles.chan : styles.le]}>
          <View style={[styles.rowCenter, s.table.width10, s.table.borderRight]}>
            {
              !item.offline ?
              (
                <Text style={styles.cbxPaddingLeft30}>{""}</Text>
              )
              : null
            }
            {
              !item.offline ?
              (
                <CheckBox title={" "} checked={item.checked} onPress={onCheckBoxPress}
                  checkedColor={Colors.navbarBackgroundColor}
                  containerStyle={[styles.cbx]}/>
              )
              : null
            }
          </View>
          <View style={[s.table.column, s.table.width45, s.table.borderRight]}>
              <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                <TouchableOpacity style={[s.table.align, s.table.width50, s.table.borderRight]} onPress={()=> this.showThanhVienInfo(item.id)}>
                  <Text style={[s.table.text, s.table.textLeft, styles.actionText]}>{item.hoTen}</Text>
                </TouchableOpacity>
                <View style={[s.table.align, s.table.width50]}>
                  <Text style={[s.table.text, s.table.textCenter]}>{item.phapDanh}</Text>
                </View>
              </View>
              <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                <Text style={[s.table.text, s.table.textLeft]}>
                  {funcs.getDiaChi(item)}
                </Text>
              </View>
              <View style={[s.table.row, s.table.width100]}>
                <Text style={[s.table.text, s.table.textLeft]}>
                  Trưởng Nhóm: {item.hoTenTruongNhom}{item.phapDanhTruongNhom != "" && item.phapDanhTruongNhom.trim() != "" ? " (" + item.phapDanhTruongNhom + ")" : ""}
                </Text>
              </View>
          </View>
          <View style={[s.table.column, s.table.width20, s.table.borderRight]}>
            <TouchableOpacity onPress={item.offline ? () => funcs.showMsg(this.app.settings.khongDuocNangCapTVOfflineNote) : () => funcs.goTo("TDDoiTNChoTV", {thanhVien: item})}>
              <Text style={[s.table.text, s.table.textCenter, styles.actionText]}>Đổi{"\n"}Tr.Nhóm</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.table.column, s.table.width25]}>
            <TouchableOpacity onPress={() => this.onCapQuyenTruongNhomPress(item)}>
              <Text style={[s.table.text, s.table.textCenter, styles.actionText]}>Cấp Quyền{"\n"}Tr.Nhóm</Text>
            </TouchableOpacity>
            <Text style={item.offline ? {color: "red"} : {color: "green"}}>{item.offline ? "offline" : "online"}</Text>
          </View>
        </View>
    );
  }

  getCheckedItems() {
    var arr = [];
    if (typeof this.listThanhVien != "undefined") {
      for (var n = 0; n < this.listThanhVien.length; ++n) {
        var item = this.listThanhVien[n];
        if (item.checked) {
          arr.push(item);
        }
      }
    }
    return arr;
  }

  async onDoiTruongNhomForThanhVienSendPress() {
    if (this.state.truongNhomKhacForTV == "") {
      funcs.showMsg("Hãy chọn 1 trưởng nhóm khác");
      return;
    }

    var checkedItems = this.getCheckedItems();
    var arr = [];
    for(var i = 0; i < checkedItems.length; ++i) {
      var item = checkedItems[i];
      arr.push({
        IDThanhVien: item.id,
        IDTruongNhomNew: this.state.truongNhomKhacForTV
      });
    }

    if (arr.length == 0) {
      funcs.showMsg("Hãy chọn ít nhất 1 thành viên");
      return;
    }

    this.setState({spinner: true});

    var result = await api.truongDoanDoiTruongNhoms(arr);

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        await this.onFilterClick();
        funcs.showMsg(this.app.settings.luuThanhCong);
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
  }

  onCapQuyenTruongNhomPress(item) {
    if (item.offline) {
      funcs.showMsg("Không được nhâng cấp thành viên offline lên làm trưởng nhóm");
      return;
    }
    Alert.alert(
      'Cấp Quyền Trưởng Nhóm',
      'Bạn có muốn cấp quyền trưởng nhóm cho thành viên "' + item.hoTen + funcs.getPhapDanh(item) + '"',
      [
        {text: 'Cancel'},
        {text: 'OK', onPress: () => this.capQuyenTruongNhom(item)},
      ],
      {cancelable: false},
    );
  }

  async capQuyenTruongNhom(item) {
    this.setState({spinner: true});

    var result = await api.capQuyenTruongNhom({
      IDTruongDoan: this.app.loginInfo.id,
      IDThanhVien: item.id
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        await this.onFilterClick();
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
  }

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  hideThanhVienInfoPopup() {
    this.setState({thanhVienInfoPopupVisible: false});
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

  onCheckAllPress() {
    var checkAll = !this.state.checkAll;
    this.setState({checkAll: checkAll});
    if (typeof this.listThanhVien == "undefined") {
      return;
    }

    for (var i = 0; i < this.listThanhVien.length; ++i) {
      var item = this.listThanhVien[i];
      item.checked = checkAll;
    }

    this.buildListThanhVien(this.listThanhVien);
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

        if (typeof data.conTiepNhan != "undefined" && data.conTiepNhan != null) {
          await store.dispatch(appActions.saveConTiepNhan(data.conTiepNhan));
        } else {
          await store.dispatch(appActions.saveConTiepNhan(false));
        }

        await store.dispatch(appActions.saveIsTruongNhom(true));

        funcs.goTo("homeTruongNhom");
      } else {
        funcs.showMsg(data.message);
        this.setState({spinner: false});  
      }
    } else {
      funcs.showMsg(result.message);
      this.setState({spinner: false});
    }
  }

  render() {
    return(
        <Container>
            <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
            <View style={[s.header.container]}>
              {
                this.app.loginInfo.truongNhom ?
                (
                  <Button transparent onPress={this.switchLogin.bind(this)}>
                    <Thumbnail small source={require("../assets/images/nhom.png")} />
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
              <View>
                <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                    <IconAntDesign name="filter" style={s.iconFilter}/>
                </TouchableOpacity>
              </View>
            </View>
            <Segment style={{backgroundColor: Colors.buttonColor, borderWidth: 1, borderColor: Colors.navbarBackgroundColor}}>
              <Button style={[s.segmentButton, s.segmentButtonActive]}
                first active={true}>
                <Text style={[s.segmentTextActive]}>DS Thành Viên Trong Nhóm</Text>
              </Button>
              <Button style={[s.segmentButton]}
                last active={false} 
                onPress={() => funcs.goTo("TDXemDanhSachTVNgoaiNhom")}>
                <Text style={[]}>DS Thành Viên Ngoài Nhóm</Text>
              </Button>
            </Segment>
            <View style={[s.header.rowContainer1, this.state.showFilterPanel ? {} : styles.displayNone]}>
                <View style={s.header.rowContainer2}>
                    <View style={[styles.dropbox,{width: "48%"}]}>
                        <Picker
                        headerStyle={s.pickerText}
                        textStyle={s.pickerText}
                        mode="dropdown"
                        iosHeader="Địa chỉ"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        style={s.dropbox}
                        selectedValue={this.state.diaChi}
                        onValueChange={this.onDiaChiChange.bind(this)}
                        >
                            {this.state.diaChiElements}
                        </Picker>
                    </View>
                    <View style={[styles.textbox, {width: "48%"}]}>
                        <Input style={{width: "100%"}} placeholderTextColor="gray" placeholder="Pháp danh" value={this.state.phapDanh} onChangeText={this.onPhapDanhChange.bind(this)}/>
                    </View>
                </View>
                <View style={[s.header.rowContainer2, {marginTop: 10}]}>
                <View style={[styles.dropbox,{width: "48%"}]}>
                    <Picker
                        headerStyle={s.pickerText}
                        textStyle={s.pickerText}
                        mode="dropdown"
                        iosHeader="Trưởng Nhóm"
                        iosIcon={<Icon name="ios-arrow-down" />}
                        style={s.dropbox}
                        selectedValue={this.state.truongNhom}
                        onValueChange={this.onTruongNhomChange.bind(this)}
                        >
                            {this.state.truongNhomElements}
                        </Picker>
                    </View>
                    <TouchableOpacity style={[s.button, {width: "48%"}]} onPress={this.onFilterClick.bind(this)}>
                        <Text style={s.buttonText}>Tìm kiếm</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Content removeClippedSubviews={true}>
                {this.state.thanhVienContent}
            </Content>
            <View style={[{paddingTop: 5, paddingBottom: 5, paddingLeft: 5, flexDirection : "column", justifyContent: "space-between", alignItems: "flex-start", borderTopWidth: 1, borderTopColor: Colors.navbarBackgroundColor,borderBottomWidth: 1, borderBottomColor: Colors.navbarBackgroundColor}]}>
              <CheckBox  title={"Chọn tất cả"} checked={this.state.checkAll} containerStyle={styles.cbx}
                onPress={this.onCheckAllPress.bind(this)} checkedColor={Colors.navbarBackgroundColor} />
              <View style={[styles.dropbox, {width: "100%"}]}>
                <Picker
                  headerStyle={s.pickerText}
                  mode="dropdown"
                  iosHeader="Chọn Trưởng Nhóm Khác"
                  iosIcon={<Icon name="ios-arrow-down" />}
                  style={{width: "100%"}}
                  selectedValue={this.state.truongNhomKhacForTV}
                  onValueChange={this.onTruongNhomKhacForTVChange.bind(this)}
                  >
                    {this.state.truongNhomKhacForTVElements}
                </Picker>
              </View>
              <TouchableOpacity onPress={this.onDoiTruongNhomForThanhVienSendPress.bind(this)}
                style={{width: "20%", marginTop: 5, marginRight: 5, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.navbarBackgroundColor, borderRadius: 10}}>
                <Text style={{color: Colors.navbarBackgroundColor, padding: 5}}>Gửi</Text>
              </TouchableOpacity>
            </View>
            <FooterTabTruongDoan screen={this.props.navigation.getParam('screen', null)}></FooterTabTruongDoan>
            {this.state.thanhVienInfoPopupVisible 
            ?  
            (
              <View style={[s.thanhVienPopupStyle.container, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.container : this.thanhVienPopupOriginStyle.container]}>
                <View style={[s.thanhVienPopupStyle.inner, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.inner : this.thanhVienPopupOriginStyle.inner]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                    <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thông tin thành viên</Text>
                    <TouchableOpacity onPress={this.hideThanhVienInfoPopup.bind(this)} style={{paddingRight: 10}}>
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
    },
    rowContainer1: {
      flexDirection : "column"
    },
    rowContainer2: {
      flexDirection : "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: 2,
      paddingRight: 2
    }
  },
  pickerText: {
    
  },
  dropbox: {
    width: "100%"
  },
  button: {
    backgroundColor: Colors.navbarBackgroundColor,
    flexDirection : "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius:10
  },
  buttonText: {
    color: Colors.buttonColor
  },
  bottomText: {
    color: Colors.navbarBackgroundColor,
    textAlign: "center"
  },
  bold: {
    fontWeight: "bold"
  },
  containerIconFilter: {
    flexDirection : "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  iconFilter: {
    fontSize: 32,
    color: Colors.buttonColor
  },
  textStyle: {
    color: "#5F5F5F"
  },
  activeTextStyle: {
    color: Colors.navbarBackgroundColor
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
  table: {
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "stretch"
    },
    column: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        width: "100%",
        padding: 5
    },
    textCenter: {
        textAlign: "center"
    },
    textLeft: {
        textAlign: "left"
    },
    align: {
        justifyContent: "center",
        alignItems: "center"
    },
    width100: {
        width: "100%"
    },
    width75: {
        width: "75%"
    },
    width50: {
      width: "50%"
    },
    width45: {
      width: "45%"
    },
    width40: {
      width: "40%"
    },
    width25: {
        width: "25%"
    },
    width20: {
      width: "20%"
    },
    width10: {
      width: "10%"
    },
    headerText: {
        color: Colors.buttonColor,
        fontWeight: "bold"
    },
    border: {
        borderWidth: 1,
        borderColor: Colors.statusBarColor
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.statusBarColor
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.statusBarColor
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: Colors.statusBarColor
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopColor: Colors.statusBarColor
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

export default TDXemDanhSachTV;