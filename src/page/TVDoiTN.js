import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio, TextInput, Alert } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item,
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

class TVDoiTN extends Component {
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
      city: "",
      cityElements: [<Picker.Item key={"city00"} label="Tỉnh/ Thành phố" value={""} />],
      district: "",
      districtElements: [<Picker.Item key={"district00"} label="Quận/ Huyện" value={""} />],
      phapDanh: "",
      tabs: [],
      showFilterPanel: true,
      orientation: "",
      truongNhomInfoPopupVisible: false,
      thanhVien: {}
    };

    this.currentFunc = "";
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
      if (orientation == "LANDSCAPE") {
        this.setState({showFilterPanel: false});
      }
    }).bind(this));
  }

  async componentDidMount() {
    this.currentFunc = "componentDidMount";
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    await this.renderCities();
    var result = await api.thanhVienGetListTruongNhomKhac(this.app.loginInfo.id);

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.buildListTruongNhom(data.listTruongNhom);
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
    this.currentFunc = "";
  }

  async renderCities() {
    let cityElements = []
    let arr = [];

    let result = await api.getCities();
    
    if (result.code === 200) {
      if (result.data.listTinhThanh) {
        arr = result.data.listTinhThanh;
      }
    } else {
      funcs.showMsg(result.message);
      return;
    }

    cityElements.push(
      <Picker.Item key={"city00"} label="Tỉnh/T.Phố" value={""} />
    );
    for (var i = 0; i < arr.length; ++i) {
      let item = arr[i];

      cityElements.push(
        <Picker.Item key={"city" + i} label={item.name} value={item.matp} />
      );
    }

    this.setState({
      cityElements: cityElements
    });
  }

  async onCityChange (value) {
    this.setState({
      city : value,
      district: "",
      errorCity: null
    });
    
    if (this.currentFunc == "") {
      this.setState({spinner: true});
    }

    await this.renderDistricts(value);
    if (this.currentFunc == "") {
      setTimeout((function(){
        this.setState({spinner: false});
      }).bind(this), 1000);
    }
  }

  async renderDistricts(city) {

    if (isNaN(parseInt(city))) {
      this.setState({
        districtElements: [<Picker.Item key={"district00"} label="Quận/ Huyện" value={""} />]
      });
      return;
    }

    let districtElements = []
    let arr = [];
    
    let result = await api.getDistrictsByCity(city);
    
    if (result.code === 200) {
      if (result.data.listQuanHuyen) {
        arr = result.data.listQuanHuyen;
      }
    } else {
      funcs.showMsg(result.message);
      setTimeout((function(){
        this.setState({spinner: false});
      }).bind(this), 1000);
      return;
    }

    districtElements.push(
      <Picker.Item key={"district00"} label="Quận/ Huyện" value={""} />
    );

    for (var i = 0; i < arr.length; ++i) {
      let item = arr[i];

      districtElements.push(
        <Picker.Item key={"district" + i} label={item.name} value={item.maqh} />
      );
    }

    this.setState({
      districtElements: districtElements
    });

  }

  async onDistrictChange (value) {
    this.setState({
      district : value,
      errorDistrict: null
    });
  }

  onPhapDanhChange(value) {
    this.setState({phapDanh: value});
  }

  async onFilterClick() {
    this.setState({spinner: true});

    var result = await api.filterTruongNhom({
      tinhThanh: this.state.city,
      quanHuyen: this.state.district,
      tenPhapdanh: this.state.phapDanh
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.buildListTruongNhom(data.listTruongNhom);
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

    this.renderTabs(this.listTruongNhom);
  }

  showTruongNhomInfo(item) {
    this.setState({
      truongNhomInfoPopupVisible: true,
      thanhVien: item
    });
  }

  hideTruongNhomInfo() {
    this.setState({
      truongNhomInfoPopupVisible: false,
    });
  }

  buildListTruongNhom(listTruongNhom) {
    this.listTruongNhom = listTruongNhom;
    this.renderTabs(listTruongNhom);
  }

  renderTabs(listTruongNhom) {
    if (typeof listTruongNhom == "undefined" || listTruongNhom == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }
    var tabs = [];

    if (listTruongNhom.length == 0) {
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
    var totalTabs = Math.ceil(listTruongNhom.length / pageSize);
    var startIndex = -1;
    var endIndex = -1;
    for(var i = 1; i <= totalTabs; ++i) {
      startIndex = endIndex + 1;
      endIndex += pageSize;
      tabs.push(
        <Tab key={"tab" + i} heading={"Trang " + i} tabStyle={s.tabStyle} activeTabStyle={s.activeTabStyle} textStyle={s.textStyle} activeTextStyle={s.activeTextStyle}>
            <Content removeClippedSubviews={true}>
                {this.renderLandscapeTableHeader()}
                {this.renderLandscapeTableRows(listTruongNhom, startIndex, endIndex)}
            </Content>
        </Tab>
      );
    }

    this.setState({tabs: tabs});
  }

  renderLandscapeTableHeader() {
      return (
        <View key="header" style={[s.table.row, s.table.border, {marginTop: 5, backgroundColor: Colors.navbarBackgroundColor}]}>
            <View style={[s.table.column, s.table.width75, s.table.borderRight]}>
                <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                    <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                    <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Họ Tên</Text>
                    </View>
                    <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                        <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Pháp Danh</Text>
                    </View>
                    <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                        <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Số ĐT</Text>
                    </View>
                    <View style={[s.table.align, s.table.width25]}>
                        <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Email</Text>
                    </View>
                </View>
                <View style={[s.table.row, s.table.width100]}>
                    <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Địa Chỉ</Text>
                </View>
            </View>
            <View style={[s.table.column, s.table.width25]}>
                <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Chọn</Text>
            </View>
        </View>
      ); 
  }

  renderLandscapeTableRows(listTruongNhom, startIndex, endIndex) {
    var arr = [];

    var chan = true;
    for(var n = startIndex; n <= endIndex && n < listTruongNhom.length; ++ n) {
      var item = listTruongNhom[n];
      arr.push(this.getJSXLandscapeTableRow(n, item, chan));
      chan = !chan;
    }   

    return arr;
  }

  getJSXLandscapeTableRow(i, item, chan) {
    return (
        <View key={"item" + i} style={[s.table.row, s.table.borderLeft, s.table.borderRight, s.table.borderBottom, chan ? styles.chan : styles.le]}>
            <View style={[s.table.column, s.table.width75, s.table.borderRight]}>
                <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                    <TouchableOpacity style={[s.table.align, s.table.width25, s.table.borderRight]} onPress={()=> this.showTruongNhomInfo(item)}>
                      <Text style={[s.table.text, s.table.textLeft, styles.actionText]}>{item.hoTen}</Text>
                    </TouchableOpacity>
                    <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                      <Text style={[s.table.text, s.table.textCenter]}>{item.phapDanh}</Text>
                    </View>
                    <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                      <Text style={[s.table.text, s.table.textCenter]}>{item.soDienThoai}</Text>
                    </View>
                    <View style={[s.table.align, s.table.width25]}>
                      <Text style={[s.table.text, s.table.textCenter]}>{item.email}</Text>
                    </View>
                </View>
                <View style={[s.table.row, s.table.width100]}>
                    <Text style={[s.table.text, s.table.textLeft]}>
                      {funcs.getDiaChi(item)}
                    </Text>
                </View>
            </View>
            <View style={[s.table.column, s.table.width25]}>
              <TouchableOpacity onPress={() => this.onChonPress(item)}>
                <Text style={[s.table.text, s.table.textCenter, styles.actionText]}>Chọn</Text>
              </TouchableOpacity>
            </View>
        </View>
    );
  }

  onChonPress(item) {
    Alert.alert(
      'Đổi trưởng nhóm',
      'Đổi qua trưởng nhóm ' + item.hoTen + " ?",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK', onPress: () => this.doiTruongNhom(item)},
      ],
      {cancelable: false},
    );
  }

  async doiTruongNhom(item) {
    this.setState({spinner: true});
    var result = await api.thanhVienDoiTruongNhom({
        IDThanhVien: this.app.loginInfo.id,
        IDTruongNhomNew: item.id
    });
  
    if (result.code == 200) {
        var data = result.data;
        if (data.success) {
            funcs.showMsg(this.app.settings.doiTruongNhomThanhCong);
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

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Danh sách trưởng nhóm</Text>
            <View>
              <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                  <IconAntDesign name="filter" style={s.iconFilter}/>
              </TouchableOpacity>
            </View>
          </View>
          {
            this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN" ?
            (
              <View style={[s.header.rowContainer1, this.state.showFilterPanel ? {} : styles.displayNone]}>
                <View style={s.header.rowContainer2}>
                  <View style={[styles.dropbox, {width: "48%"}]}>
                    <Picker
                      headerStyle={s.pickerText}
                      textStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Tỉnh/T.Phố"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.dropbox}
                      selectedValue={this.state.city}
                      onValueChange={this.onCityChange.bind(this)}
                      >
                        {this.state.cityElements}
                    </Picker>
                  </View>
                  <View style={{width: "48%"}}>
                    <Input style={{width: "100%", borderBottomColor: "gray", borderBottomWidth: 1}} placeholderTextColor="gray" placeholder="Pháp danh" value={this.state.phapDanh} onChangeText={this.onPhapDanhChange.bind(this)}/>
                  </View>
                </View>
                <View style={[s.header.rowContainer2, {marginTop: 10}]}>
                  <View style={[styles.dropbox, {width: "48%"}]}>
                    <Picker
                      headerStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Quận/Huyện"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.dropbox}
                      selectedValue={this.state.district}
                      onValueChange={this.onDistrictChange.bind(this)}
                      >
                        {this.state.districtElements}
                    </Picker>
                  </View>
                  <TouchableOpacity style={[s.button, {width: "48%"}]} onPress={this.onFilterClick.bind(this)}>
                    <Text style={s.buttonText}>Tìm kiếm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
            :
            (
              <View style={[s.header.rowContainer2, this.state.showFilterPanel ? {} : styles.displayNone]}>
                <View style={[styles.dropbox, {width: "25%"}]}>
                  <Picker
                    headerStyle={s.pickerText}
                    textStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tỉnh/TP"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.dropbox}
                    selectedValue={this.state.city}
                    onValueChange={this.onCityChange.bind(this)}
                    >
                      {this.state.cityElements}
                  </Picker>
                </View>
                <View style={[styles.dropbox, {width: "25%"}]}>
                  <Picker
                      headerStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Quận/Huyện"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.dropbox}
                      selectedValue={this.state.district}
                      onValueChange={this.onDistrictChange.bind(this)}
                      >
                        {this.state.districtElements}
                  </Picker>
                </View>
                <TextInput style={[styles.textbox, {width: "25%"}]} placeholderTextColor="gray" placeholder="Pháp danh" value={this.state.phapDanh} onChangeText={this.onPhapDanhChange.bind(this)}/>
                <TouchableOpacity style={[s.button, {width: "15%", marginTop: 5}]} onPress={this.onFilterClick.bind(this)}>
                    <Text style={s.buttonText}>Tìm kiếm</Text>
                </TouchableOpacity>
              </View>
            )
          }
          <Tabs renderTabBar={() => <ScrollableTab style={{ backgroundColor: "white" }}/>} tabBarUnderlineStyle={s.tabBarUnderlineStyle}>
            {this.state.tabs}
          </Tabs>
          {this.state.truongNhomInfoPopupVisible 
          ?  
          (
            <View style={[s.thanhVienPopupStyle.container, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.container : this.thanhVienPopupOriginStyle.container]}>
              <View style={[s.thanhVienPopupStyle.inner, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.inner : this.thanhVienPopupOriginStyle.inner]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                      <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thông tin trưởng nhóm</Text>
                      <TouchableOpacity onPress={this.hideTruongNhomInfo.bind(this)} style={{paddingRight: 10}}>
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
    width25: {
        width: "25%"
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
};

export default TVDoiTN;