import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item,Segment,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';
import { CheckBox } from 'react-native-elements';

// Our custom files and classes import
import Label from '../component/Label';
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
import UserMenu from "../component/UserMenu";
import UserMenuDropdown from "../component/UserMenuDropdown";

const { width, height } = Dimensions.get('window');

class TNXemTVDaSuaLai extends Component {
  constructor(props) {
    super(props);

    this.originEditPopupStyle = {
      container: {
        width: width,
        height: height
      },
      inner: {
        width: width - 4,
        height: height - 50,
      },
      landscape: {
        container: {
          width: height,
          height: width
        },
        inner: {
          width: height - 4,
          height: 250,
        }
      }
    };

    this.state = {
      spinner: true,
      orientation: "",
      listContent: null,
      userMenuVisible: false,
      editPopupVisible: false,
      xacDinhInPopup: "",
      xacDinhInPopupElements: [],
      checkAll: false,

      xacDinh: "",
      xacDinhElements: []
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.getInitDateRanges();
    await this.onSearchPress();
    this.renderXacDinhDropdownBox();
    this.setState({spinner: false});
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });

    this.renderListContent(this.listRows);
  }

  async getInitDateRanges() {
    var result = await api.getInitDateRanges();
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
            this.listXacDinh = data.listXacDinh;
        } else {
            funcs.showMsg(data.message);  
        }
    } else {
        funcs.showMsg(result.message);
    }
  }

  async onSearchPress() {
    this.setState({spinner: true});
    var result = await api.getThVDaSua(this.app.loginInfo.id);
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
          this.listRows = data.list;
          this.renderListContent(this.listRows);
        } else {
          funcs.showMsg(data.message);  
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  renderListContent(listRows) {
    if (typeof listRows == "undefined" || listRows == null) {
        return;
    }

    if (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN") {
        this.renderListContentPORTRAIT(listRows);
    } else {
        this.renderListContentLANDSCAPE(listRows);
    }
  }

  renderListContentPORTRAIT(listRows) {
    var arr = [];

    arr.push(
        <View key="header1" style={[s.theoNgay.table.headerContainer, s.theoNgay.table.headerContainerMargin, {backgroundColor: Colors.navbarBackgroundColor, borderBottomWidth: 0}]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "10%", borderBottomWidth: 0}]}>
                
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "50%", borderBottomWidth:1, borderBottomColor: Colors.statusBarColor}]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp Danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "15%", borderBottomWidth:1, borderBottomColor: Colors.statusBarColor}]}>
                <Text style={[s.theoNgay.table.headerText]}>Ngày</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, {borderBottomWidth:1, borderBottomColor: Colors.statusBarColor}]}>
                <Text style={[s.theoNgay.table.headerText]}>Tình Trạng</Text>
            </View>
        </View>
    );

    arr.push(
        <View key="header2" style={[s.theoNgay.table.headerContainer, {backgroundColor: Colors.navbarBackgroundColor, borderTopWidth: 0}]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "10%", borderTopWidth: 0}]}>
                
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Nghe Pháp</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Tụng Kinh</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "15%"}]}>
                <Text style={[s.theoNgay.table.headerText]}>SL DHiệu</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Rãnh</Text>
            </View>
        </View>
    );

    if (listRows.length > 0) {
        var chan = true;
        for(var i = 0; i < listRows.length; ++i) {
            var item = listRows[i];
            arr.push(this.getJSXRowPORTRAIT(i, item, chan));
            chan = !chan;
        }
    } else {
        arr.push(
            <View key="nodata" style={[s.theoNgay.table.noDataCotainer]}>
                <View style={[{width: "100%"}]}>
                    <Text style={[s.theoNgay.table.itemText]}>Không tìm thấy dữ liệu</Text>
                </View>
            </View>
        );
    }

    this.setState({
      listContent: arr
    });
  }

  getJSXRowPORTRAIT(i, item, chan) {
    if (typeof item.checked == "undefined") {
      item.checked = false;
    }

    var onCheckBoxPress = (function () {
      item.checked = !item.checked; 
      this.renderListContent(this.listRows);

      var checkAll = true;

      if (typeof this.listRows != "undefined") {
        for (var n = 0; n < this.listRows.length; ++n) {
          if (!this.listRows[n].checked) {
            checkAll = false;
            break;
          }
        }
      }

      this.setState({checkAll: checkAll});
    }).bind(this);

    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? "\n(" + item.phapDanh + ")" : "";
    var ngay = funcs.getValueFromServerDate(item.ngay, "day");
    var thang = funcs.getValueFromServerDate(item.ngay, "month");
    return [
        <View key={"item0" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le, {borderBottomWidth: 0}]}>
            <View style={[s.theoNgay.table.bodyColumn, {width: "10%", borderBottomWidth: 0}, styles.rowCenter]}>
              <Text style={styles.cbxPaddingLeft35}>{""}</Text>
              <CheckBox title={" "} checked={item.checked} onPress={onCheckBoxPress}
              checkedColor={Colors.navbarBackgroundColor} 
              containerStyle={styles.cbx}/>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "50%", borderBottomWidth: 1, borderBottomColor: Colors.statusBarColor}]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.hoTen}{phapDanh}</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "15%", borderBottomWidth: 1, borderBottomColor: Colors.statusBarColor}]}>
              <Text style={[s.theoNgay.table.itemText]}>{ngay}/{thang}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, {borderBottomWidth: 1, borderBottomColor: Colors.statusBarColor}]}>
              <TouchableOpacity onPress={() => this.showEditPopup(item.id)}>
                <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.trNhXacNhan}</Text>
              </TouchableOpacity>
            </View>
        </View>
        ,
        <View key={"item1" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "10%", borderTopWidth: 0}]}>
                
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.bodyColumn]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.tgNghePhap}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.bodyColumn]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.tgTungKinh}</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "15%"}]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.thoiGianRanh}</Text>
            </View>
        </View>
    ];
  }

  renderListContentLANDSCAPE(listRows) {
    var arr = [];

    arr.push(
        <View key="header" style={[s.theoNgay.table.headerContainer, {backgroundColor: Colors.navbarBackgroundColor}]}>
            <View style={[{width: "10%"}, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                
            </View>
            <View style={[{width: "30%"}, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Ngày</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Tình Trạng</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Nghe Pháp</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Tụng Kinh</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>SL DHiệu</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Rãnh</Text>
            </View>
        </View>
    );

    if (listRows.length > 0) {
        var chan = true;
        for(var i = 0; i < listRows.length; ++i) {
            var item = listRows[i];
            arr.push(this.getJSXRowLANDSCAPE(i, item, chan));
            chan = !chan;
        }
    } else {
        arr.push(
            <View key="nodata" style={[s.theoNgay.table.noDataCotainer]}>
                <View style={[{width: "100%"}]}>
                    <Text style={[s.theoNgay.table.itemText]}>Không tìm thấy dữ liệu</Text>
                </View>
            </View>
        );
    }

    this.setState({
      listContent: arr
    });
  }

  getJSXRowLANDSCAPE(i, item, chan) {
    if (typeof item.checked == "undefined") {
      item.checked = false;
    }

    var onCheckBoxPress = (function () {
      item.checked = !item.checked; 
      this.renderListContent(this.listRows);

      var checkAll = true;

      if (typeof this.listRows != "undefined") {
        for (var n = 0; n < this.listRows.length; ++n) {
          if (!this.listRows[n].checked) {
            checkAll = false;
            break;
          }
        }
      }

      this.setState({checkAll: checkAll});
    }).bind(this);
    
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? "\n(" + item.phapDanh + ")" : "";
    var ngay = funcs.getValueFromServerDate(item.ngay, "day");
    var thang = funcs.getValueFromServerDate(item.ngay, "month");
    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
          <View style={[{width: "10%"}, styles.rowCenter, s.theoNgay.table.bodyColumn]}>
            <Text style={styles.cbxPaddingLeft35}>{""}</Text>
            <CheckBox title={" "} checked={item.checked} onPress={onCheckBoxPress}
              checkedColor={Colors.navbarBackgroundColor} 
              containerStyle={styles.cbx}/>
          </View>
          <View style={[{width: "30%"}, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.hoTen}{phapDanh}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{ngay}{thang}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.bodyColumn]}>
            <TouchableOpacity onPress={() => this.showEditPopup(item.id)}>
              <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.trNhXacNhan}</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.tgNghePhap}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.tgTungKinh}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerLandscapeStyle]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.thoiGianRanh}</Text>
          </View>
      </View>
    );
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

  onXacDinhInPopupChange (value) {
    this.setState({
      xacDinhInPopup: value
    });
  }

  getRowDataTheoNgay(id) {
    for(var i = 0; i < this.listRows.length; ++i) {
      if (this.listRows[i].id == id) {
        return this.listRows[i];
      }
    }
    return null;
  }

  showEditPopup(id) {
    var item = this.getRowDataTheoNgay(id);

    if (item == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }

    var ngay = funcs.getValueFromServerDate(item.ngay, "day");
    var thang = funcs.getValueFromServerDate(item.ngay, "month");
    var nam = funcs.getValueFromServerDate(item.ngay, "year");

    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";

    this.setState({
      editPopupVisible: true,
      selectedItem: item,
      hoTenPhapDanh: item.hoTen + phapDanh,
      selectedNgayText: "Ngày " + ngay + "/" + thang + "/" + nam,
      congPhuNgayId: item.id,
      xacDinhInPopup: item.xacDinh.toString(),
      thoiGianNghePhap: item.tgNghePhap.toString(),
      thoiGianTungKinh: item.tgTungKinh.toString(),
      soLuongDanhHieu: item.soLuongDH.toString()
    });

    this.renderXacDinhInPopupDropdownBox();
  }

  hideEditPopup() {
    this.setState({
      editPopupVisible: false
    });
  }

  renderXacDinhInPopupDropdownBox() {
    let xacDinhInPopupElements = []
    
    for (var i = 0; i < this.listXacDinh.length; ++i) {
      let item = this.listXacDinh[i];

      xacDinhInPopupElements.push(
        <Picker.Item key={"month" + i} label={item.name} value={item.value.toString()} />
      );
    }

    this.setState({
      xacDinhInPopupElements: xacDinhInPopupElements
    });
  }

  async saveInPopup() {
    var list = [];
    list.push({
      id: this.state.selectedItem.id,
      xacDinh: this.state.xacDinhInPopup
    });

    this.setState({spinner: true});

    var result = await api.saveXacNhans(list);
    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        await this.onSearchPress();
        this.hideEditPopup();
        funcs.showMsg(this.app.settings.luuThanhCong);
      } else {
        funcs.showMsg(data.message);  
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
  }

  onCheckAllPress() {
    var checkAll = !this.state.checkAll;
    this.setState({checkAll: checkAll});
    if (typeof this.listRows == "undefined") {
      return;
    }

    for (var i = 0; i < this.listRows.length; ++i) {
      var item = this.listRows[i];
      item.checked = checkAll;
    }

    this.renderListContent(this.listRows);
  }

  onXacDinhChange(value) {
    this.setState({
      xacDinh: value
    });
  }

  renderXacDinhDropdownBox() {
    let xacDinhElements = []
    
    xacDinhElements.push(
      <Picker.Item key={"month0" + i} label={"Xác nhận"} value={""} />
    );

    for (var i = 0; i < this.listXacDinh.length; ++i) {
      let item = this.listXacDinh[i];

      xacDinhElements.push(
        <Picker.Item key={"month" + i} label={item.name} value={item.value.toString()} />
      );
    }

    this.setState({
      xacDinhElements: xacDinhElements
    });
  }

  async onSendAllPress() {
    var arrCheckedIds = [];

    if (typeof this.listRows != "undefined") {
      for (var n = 0; n < this.listRows.length; ++n) {
        var item = this.listRows[n];
        if (item.checked) {
          arrCheckedIds.push({
            id: item.id,
            xacDinh: this.state.xacDinh
          });
        }
      }
    }

    if (arrCheckedIds.length == 0) {
      funcs.showMsg("Hãy chọn ít nhất 1 dòng");
      return;
    }

    if (this.state.xacDinh == "") {
      funcs.showMsg("Hãy chọn loại xác nhận");
      return;
    }

    this.setState({spinner: true});

    var result = await api.saveXacNhans(arrCheckedIds);
    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        await this.onSearchPress();
        funcs.showMsg(this.app.settings.luuThanhCong);
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
            <View style={[s.header.container]}>
                <Button transparent onPress={()=>funcs.back()}>
                    <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
                </Button>
                <Text style={styles.headerText}>Danh Sách Đã Sửa Lại</Text>
                <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
            </View>
            <Segment style={{backgroundColor: Colors.buttonColor, borderWidth: 1, borderColor: Colors.navbarBackgroundColor}}>
              <Button style={[s.segmentButton]} onPress={() => funcs.goToWithoutPushStack("TNXacNhanDLChoTVOnline")}
                first active={true} >
                <Text>Theo tuần</Text>
              </Button>
              <Button style={[s.segmentButton]} onPress={() => funcs.goToWithoutPushStack("TNXemTVDaNhapSai")}>
                <Text>Đã nhập sai</Text>
              </Button>
              <Button style={[s.segmentButton, s.segmentButtonActive]} last>
                <Text style={[s.segmentTextActive]}>Đã sửa lại</Text>
              </Button>
            </Segment>
            <Content removeClippedSubviews={true}>
              {this.state.listContent}
            </Content>
            <View style={{paddingTop: 5, paddingBottom: 5, paddingLeft: 5, flexDirection : "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.navbarBackgroundColor}}>
              <CheckBox  title={"Chọn tất cả"} checked={this.state.checkAll} containerStyle={styles.cbx}
                onPress={this.onCheckAllPress.bind(this)} checkedColor={Colors.navbarBackgroundColor} />
              <View style={[styles.dropbox, {width: "37%"}]}>
                <Picker
                  headerStyle={s.pickerText}
                  mode="dropdown"
                  iosHeader="Xác nhận"
                  iosIcon={<Icon name="ios-arrow-down" />}
                  style={{width: "100%"}}
                  selectedValue={this.state.xacDinh}
                  onValueChange={this.onXacDinhChange.bind(this)}
                  >
                    {this.state.xacDinhElements}
                </Picker>
              </View>
              <TouchableOpacity onPress={this.onSendAllPress.bind(this)}
                style={{width: "20%", marginRight: 5, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.navbarBackgroundColor, borderRadius: 10}}>
                <Text style={{color: Colors.navbarBackgroundColor, padding: 5}}>Gửi</Text>
              </TouchableOpacity>
            </View>
            {this.state.editPopupVisible 
            ? 
            (
              <View style={[s.editPopup.container, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.container : this.originEditPopupStyle.container]}>
                <View style={[s.editPopup.inner, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.inner : this.originEditPopupStyle.inner]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                    <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Chỉnh sửa công phu</Text>
                    <TouchableOpacity onPress={this.hideEditPopup.bind(this)} style={{paddingRight: 10}}>
                      <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                    </TouchableOpacity>
                  </View>
                  <Content>
                    <Form>
                      <Item style={s.editPopup.item}>
                        <View style={[{padding:5, backgroundColor: Colors.navbarBackgroundColor, width: "100%", marginTop: 10}]}>
                          <Text style={{color: "#ffffff"}}>{this.state.selectedNgayText}</Text>
                        </View>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Họ và tên (pháp danh)</Label>
                        <Text style={s.editPopup.itemValue}>{this.state.hoTenPhapDanh}</Text>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Thời gian nghe pháp</Label>
                        <Text style={s.editPopup.itemValue}>{this.state.selectedItem.tgNghePhap}</Text>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Thời gian tụng kinh</Label>
                        <Text style={s.editPopup.itemValue}>{this.state.selectedItem.tgTungKinh}</Text>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Số lượng danh hiệu</Label>
                        <Text style={s.editPopup.itemValue}>{this.state.selectedItem.soLuongDH}</Text>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Tốc độ niệm phật (số danh hiệu/phút)</Label>
                        <Text style={s.editPopup.itemValue}>{this.state.selectedItem.tocDoNiemPhat}</Text>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Thời gian rãnh (tiếng)</Label>
                        <Text style={s.editPopup.itemValue}>{this.state.selectedItem.thoiGianRanh}</Text>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Trưởng nhóm xác nhận</Label>
                        <View style={[styles.dropbox, {width: "50%"}]}>
                          <Picker
                            headerStyle={s.pickerText}
                            mode="dropdown"
                            iosHeader="Xác nhận"
                            iosIcon={<Icon name="ios-arrow-down" />}
                            style={s.theoTuan.filter.dropbox}
                            selectedValue={this.state.xacDinhInPopup}
                            onValueChange={this.onXacDinhInPopupChange.bind(this)}
                            >
                              {this.state.xacDinhInPopupElements}
                          </Picker>
                        </View>
                      </Item>
                      <Button style={[s.editPopup.button]} full rounded onPress={this.saveInPopup.bind(this)}>
                        <Text style={s.editPopup.buttonText}>Cập nhật</Text>
                      </Button>
                    </Form>
                  </Content>
                </View>
              </View>
            ) : null}
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
      alignItems: "center"
    }
  },
  iconFilter: {
    fontSize: 32,
    color: Colors.buttonColor
  },
  theoTuan: {
    filter: {
        container: {
            flexDirection : "row",
            justifyContent: "space-around",
            alignItems: "center",
        },
        dropbox: {
          width: "100%"
        },
        dropboxLandscape: {
            width: "100%"
        },
        label: {
            marginLeft: 10
        },
        labelLandscape: {
            width: 100,
            marginLeft: 10,
        }
    }
  },
  pickerText: {
    
  },
  theoNgay: {
    table: {
        headerContainerMargin: {
            marginTop: 5
        },
        headerContainer: {
            flexDirection : "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            borderWidth: 1,
            borderColor: Colors.statusBarColor,
            backgroundColor: Colors.buttonColor
        },
        noDataCotainer: {
            flexDirection : "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            borderWidth: 1,
            borderColor: Colors.navbarBackgroundColor,
            backgroundColor: Colors.buttonColor,
        },
        headerWidth: {
            width: "25%",
            alignItems: "center",
            justifyContent: "center"
        },
        headerWidthLandscape: {
            width: "12%",
        },
        headerLandscapeStyle: {
          flexDirection : "row",
          alignItems: "center",
          justifyContent: "center"
        },
        headerStyle: {
            flexDirection : "row",
            alignItems: "center",
            justifyContent: "center"
        },
        headerText: {
            color: Colors.buttonColor,
            width: "100%",
            textAlign: "center",
            paddingTop: 5,
            paddingBottom: 5
        },
        headerColumn: {
            borderRightWidth: 1,
            borderRightColor: Colors.statusBarColor
        },
        bodyColumn: {
            borderRightWidth: 1,
            borderRightColor: Colors.statusBarColor
        },
        itemText: {
            width: "100%",
            textAlign: "center",
            paddingTop: 5,
            paddingBottom: 5
        },
        itemContainer: {
            flexDirection : "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            borderBottomWidth: 1,
            borderBottomColor: Colors.statusBarColor,
            borderLeftWidth: 1,
            borderLeftColor: Colors.statusBarColor,
            borderRightWidth: 1,
            borderRightColor: Colors.statusBarColor,
        }
    }
  },
  segmentButton: {
    borderColor: Colors.navbarBackgroundColor,
    paddingLeft: 10,
    paddingRight: 10
  },
  segmentButtonActive: {
    backgroundColor: Colors.navbarBackgroundColor
  },
  segmentTextActive: {
    color: Colors.buttonColor
  },
  editPopup: {
    buttonText: {
      color: Colors.buttonColor
    },
    button: {
      backgroundColor: Colors.navbarBackgroundColor,
      marginTop: 15,
      marginBottom: 10,
      marginLeft: 20,
      marginRight: 20
    },
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
      right: 2,
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
      flexDirection : "column",
      alignItems: "flex-start",
      marginRight: 20
    },
    itemValue: {
      fontWeight: "bold",
      paddingTop: 10
    }
  }
};

export default TNXemTVDaSuaLai;