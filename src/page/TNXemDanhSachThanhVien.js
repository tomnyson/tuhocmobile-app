import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item, Segment,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';

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

const { width, height } = Dimensions.get('window');

class TNXemDanhSachThanhVien extends Component {
  constructor(props) {
    super(props);

    this.thanhVienPopupOriginStyle = {
      container: {
        width: width,
        height: height
      },
      inner: {
        width: width - 4,
        height: height - 60
      },
      landscape: {
        container: {
          width: height,
          height: width
        },
        inner: {
          width: height - 4,
          height: width - 60
        }
      }
    };

    this.state = {
      spinner: true,
      diaChi: "",
      diaChiElements: [],
      city: "",
      district: "",
      ward: "",
      phapDanh: "",
      tabs: [],
      showFilterPanel: true,
      orientation: "",
      thanhVienInfoPopupVisible: false,
      thanhVien: {}
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
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    var result = await api.getThanhVienByTruongNhom(this.app.loginInfo.id);

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.listAddress = data.listAddress;
        this.buildListThanhVien(data.list);
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.renderAddresses();

    this.setState({spinner: false});
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

  onPhapDanhChange(value) {
    this.setState({phapDanh: value});
  }

  async onFilterClick() {
    this.setState({spinner: true});

    var result = await api.filterThanhVien({
      IDTruongNhom: this.app.loginInfo.id,
      tinhThanh: this.state.city,
      quanHuyen: this.state.district,
      xaphuong: this.state.ward,
      tenPhapdanh: this.state.phapDanh
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
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

    this.renderTabs(this.listThanhVien);
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
    this.listThanhVien = listThanhVien;
    this.renderTabs(listThanhVien);
  }

  renderTabs(listThanhVien) {
    if (typeof listThanhVien == "undefined" || listThanhVien == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }
    var tabs = [];

    if (listThanhVien.length == 0) {
      tabs.push(
        <Tab heading="Trang 1" key="t00" tabStyle={s.tabStyle} activeTabStyle={s.activeTabStyle} textStyle={s.textStyle} activeTextStyle={s.activeTextStyle}>
          <View style={{marginTop: 10}}>
            <Text style={{width: "100%", textAlign: "center", fontWeight: "bold", color: Colors.statusBarColor}}>
              Không tìm thấy dữ liệu
            </Text>
          </View>
        </Tab>
      );

      this.setState({tabs: tabs});

      return;
    }

    var pageSize = 30;
    var totalTabs = Math.ceil(listThanhVien.length / pageSize);
    var startIndex = -1;
    var endIndex = -1;
    for(var i = 1; i <= totalTabs; ++i) {
      startIndex = endIndex + 1;
      endIndex += pageSize;
      tabs.push(
        <Tab key={"tab" + i} heading={"Trang " + i} tabStyle={s.tabStyle} activeTabStyle={s.activeTabStyle} textStyle={s.textStyle} activeTextStyle={s.activeTextStyle}>
          {
            this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN" ? 
            (
              <Content removeClippedSubviews={true}>
                {this.renderPortraitItems(listThanhVien, startIndex, endIndex)}
              </Content>
            ) 
            : 
            null
          }
          {
            this.state.orientation == "LANDSCAPE" ? 
            (
              <Content removeClippedSubviews={true}>
                {this.renderLandscapeTableHeader()}
                {this.renderLandscapeTableRows(listThanhVien, startIndex, endIndex)}
              </Content>
            ) 
            : 
            null
          }
        </Tab>
      );
    }

    this.setState({tabs: tabs});
  }

  renderPortraitItems(listThanhVien, startIndex, endIndex) {
    var arr = [];
    var chan = true;
    for(var n = startIndex; n <= endIndex && n < listThanhVien.length; ++ n) {
      var item = listThanhVien[n];
      arr.push(this.getJSXPortraitItem(n, item, chan, startIndex));
      chan = !chan;
    }   

    return arr;
  }

  getJSXPortraitItem(n, item, chan, startIndex) {
    return (
      <View key={"item" + n} style={[s.portrait.item, n != startIndex ? {marginTop: 5} : {}, chan ? styles.chan : styles.le]}>
        <View style={{flexDirection : "row"}}>
          <View style={{width: "50%", borderRightWidth: 1, borderRightColor: Colors.navbarBackgroundColor}}>
            <TouchableOpacity onPress={() => this.showThanhVienInfo(item.id)}>
              <Text style={[s.bold, styles.actionText]}>{item.hoTen}</Text>
            </TouchableOpacity>
            <Text style={[item.offline ? styles.offline : styles.online]}>{item.offline ? "offline" : "online"}</Text>
          </View>
          <View style={{width: "50%"}}>
            <Text style={s.bold}>Pháp danh: {item.phapDanh}</Text>
          </View>
        </View>
        <View style={{flexDirection : "row", borderTopWidth: 1, borderTopColor: Colors.navbarBackgroundColor}}>
          <View style={{width: "50%", borderRightWidth: 1, borderRightColor: Colors.navbarBackgroundColor}}>
            <Text style={s.bold}>Số điện thoại: {item.soDienThoai}</Text>
          </View>
          <View style={{width: "50%"}}>
            <Text style={s.bold}>Email: {item.email}</Text>
          </View>
        </View>
        <View style={{flexDirection : "row", borderTopWidth: 1, borderTopColor: Colors.navbarBackgroundColor}}>
          <View style={{width: "20%", borderRightWidth: 1, borderRightColor: Colors.navbarBackgroundColor}}>
            <Text style={s.bold}>Địa chỉ</Text>
          </View>
          <View style={{width: "80%"}}>
            <Text>{item.duongNha} {item.xaPhuongTT} {item.quanHuyen} {item.tinhThanh}</Text>
          </View>
        </View>
      </View>
    );
  }

  renderLandscapeTableHeader() {
    return (
      <View style={[{
          marginTop: 2,
          borderWidth: 1, 
          borderColor: Colors.navbarBackgroundColor
        }, s.table.head]}>
        <View style={[s.landscape.colCommon]}>
          <Text style={s.table.headText}>Họ và tên</Text>
        </View>
        <View style={[s.landscape.colCommon]}>
          <Text style={s.table.headText}>Pháp danh</Text>
        </View>
        <View style={[s.landscape.colCommon]}>
          <Text style={s.table.headText}>Số điện thoại</Text>
        </View>
        <View style={[s.landscape.colCommon]}>
          <Text style={s.table.headText}>Email</Text>
        </View>
        <View style={[s.landscape.colDiaChi]}>
          <Text style={s.table.headText}>Địa chỉ</Text>
        </View>
      </View>
    );
  }

  renderLandscapeTableRows(listThanhVien, startIndex, endIndex) {
    var arr = [];

    var chan = true;
    for(var n = startIndex; n <= endIndex && n < listThanhVien.length; ++ n) {
      var item = listThanhVien[n];
      arr.push(this.getJSXTableRow(n, item, chan, startIndex));
      chan = !chan;
    }   
    return arr;
  }

  getJSXTableRow(n, item, chan, startIndex) {
    return (
      <View key={n} style={[s.table.row, chan ? styles.chan : styles.le]}>
        <View key={1} style={[s.landscape.colCommon]}>
          <TouchableOpacity onPress={() => this.showThanhVienInfo(item.id)}>
            <Text style={[s.bold, {width: "100%", textAlign: "center"}, styles.actionText]}>{item.hoTen}</Text>
          </TouchableOpacity>
          <Text style={[item.offline ? styles.offline : styles.online, {textAlign: "center"}]}>{item.offline ? "offline" : "online"}</Text>
        </View>
        <View key={2} style={[s.landscape.colCommon]}>
          <Text style={[{width: "100%", textAlign: "center"}]}>{item.phapDanh}</Text>
        </View>
        <View key={3} style={[s.landscape.colCommon]}>
          <Text style={[{width: "100%", textAlign: "center"}]}>{item.soDienThoai}</Text>
        </View>
        <View key={4} style={[s.landscape.colCommon]}>
          <Text style={[{width: "100%", textAlign: "center"}]}>{item.email}</Text>
        </View>
        <View key={5} style={[s.landscape.colDiaChi]}>
          <Text style={[{width: "100%", textAlign: "center"}]}>
            {item.duongNha + " " + item.xaPhuongTT + " " + item.quanHuyen + " " + item.tinhThanh}
          </Text>
        </View>
      </View>
    );
  }

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  hideThanhVienInfoPopup() {
    this.setState({thanhVienInfoPopupVisible: false});
  }

  async loaiKhoiNhomPress(id) {
    this.setState({spinner: true});
    var result = await api.removeThanhVienOffline(id);

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.hideThanhVienInfoPopup();
        await this.onFilterClick();
        funcs.showMsg("Đã loại thành viên khỏi nhóm");
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
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Danh sách thành viên</Text>
            <View>
              <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                  <IconAntDesign name="filter" style={s.iconFilter}/>
              </TouchableOpacity>
            </View>
          </View>
          <Segment style={{backgroundColor: Colors.buttonColor, borderWidth: 1, borderColor: Colors.navbarBackgroundColor}}>
            <Button style={[s.segmentButton, s.segmentButtonActive]}
              first active={true}>
              <Text style={[s.segmentTextActive]}>DS T.Viên Đã Vào Nhóm</Text>
            </Button>
            <Button style={[s.segmentButton]}
              last active={false} 
              onPress={() => funcs.goToWithoutPushStack("TNXemDanhSachTVChuaCoNhom")}>
              <Text style={[]}>DS T.Viên Chưa Có Nhóm</Text>
            </Button>
          </Segment>
          <View style={[s.header.rowContainer1, this.state.showFilterPanel ? {} : styles.displayNone]}>
            <View style={s.header.rowContainer2}>
              <View style={[styles.dropbox,{width: "99%"}]}>
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
            </View>
            <View style={[s.header.rowContainer2, {marginTop: 10}]}>
              <View style={[styles.textbox, {width: "48%"}]}>
                <Input style={{width: "100%"}} placeholderTextColor="gray" placeholder="Pháp danh" value={this.state.phapDanh} onChangeText={this.onPhapDanhChange.bind(this)}/>
              </View>
              <TouchableOpacity style={[s.button, {width: "48%"}]} onPress={this.onFilterClick.bind(this)}>
                <Text style={s.buttonText}>Tìm kiếm</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Tabs renderTabBar={() => <ScrollableTab style={{ backgroundColor: "#ffffff", marginTop: 1 }}/>} tabBarUnderlineStyle={s.tabBarUnderlineStyle}>
            {this.state.tabs}
          </Tabs>
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
                  <Button style={[s.thanhVienPopupStyle.button]} full rounded onPress={()=>funcs.goTo("TNChinhSuaProfileTV", {thanhVien: this.state.thanhVien})}>
                    <Text style={s.thanhVienPopupStyle.buttonText}>Chỉnh Sửa</Text>
                  </Button>
                  {
                    this.state.thanhVien.offline ?
                    (
                      <Button style={[s.thanhVienPopupStyle.button]} full rounded onPress={()=>this.loaiKhoiNhomPress(this.state.thanhVien.id)}>
                        <Text style={s.thanhVienPopupStyle.buttonText}>Loại khỏi nhóm</Text>
                      </Button>
                    )
                    : null
                  }
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
  bottomContainer: {
    flexDirection : "column", 
    borderTopWidth: 1, 
    borderTopColor: Colors.navbarBackgroundColor, 
    alignItems: "center",
    padding: 5
  },
  portrait: {
    item: {
      borderTopColor: Colors.navbarBackgroundColor,
      borderBottomColor: Colors.navbarBackgroundColor,
      borderLeftColor: Colors.navbarBackgroundColor,
      borderRightColor: Colors.navbarBackgroundColor,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      flexDirection : "column"
    }
  },
  bold: {
    fontWeight: "bold"
  },
  table: {
    head: { 
        flexDirection: 'row',
        height: 40, 
        backgroundColor: Colors.statusBarColor
    },
    headText: {
        width: "100%",
        textAlign: "center",
        color: "#ffffff"
    },
    row: { 
        flexDirection: 'row' ,
        borderBottomWidth: 1, 
        borderBottomColor: Colors.navbarBackgroundColor
    }
  },
  landscape: {
    colCommon: {
      width: "15%",
      borderRightColor: Colors.navbarBackgroundColor,
      borderRightWidth: 1
    },
    colDiaChi: {
      width: "40%"
    }
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
  tabBarUnderlineStyle: {
    backgroundColor: Colors.navbarBackgroundColor
  },
  tabStyle: {
    backgroundColor: "#ffffff"
  },
  activeTabStyle: {
    backgroundColor: "#ffffff"
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
      top: 10,
      left: 2,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: Colors.navbarBackgroundColor,
      flexDirection : "column"
    },
    buttonText: {
      color: Colors.buttonColor
    },
    button: {
      backgroundColor: Colors.navbarBackgroundColor,
      marginTop: 10,
      marginLeft: 20,
      marginRight: 20
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

export default TNXemDanhSachThanhVien;