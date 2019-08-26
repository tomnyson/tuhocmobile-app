import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio, TextInput } from 'react-native';
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

class LeaderList extends Component {
  constructor(props) {
    super(props);
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
      dangKyMoiNote: ""
    };

    this.currentFunc = "";
  }

  componentWillMount() {
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
    var result = await api.getTruongNhomAll();

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.setState({dangKyMoiNote: data.settings.dangKyMoiNote});
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
          {
            this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN" ? 
            (
              <Content removeClippedSubviews={true}>
                {this.renderPortraitItems(listTruongNhom, startIndex, endIndex)}
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
                {this.renderLandscapeTableRows(listTruongNhom, startIndex, endIndex)}
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

  renderPortraitItems(listTruongNhom, startIndex, endIndex) {
    var arr = [];
    var chan = true;
    for(var n = startIndex; n <= endIndex && n < listTruongNhom.length; ++ n) {
      var item = listTruongNhom[n];
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
            <Text style={s.bold}>{item.hoTen}</Text>
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
            <Text>{funcs.getDiaChi(item)}</Text>
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

  renderLandscapeTableRows(listTruongNhom, startIndex, endIndex) {
    var arr = [];

    var chan = true;
    for(var n = startIndex; n <= endIndex && n < listTruongNhom.length; ++ n) {
      var item = listTruongNhom[n];
      arr.push(this.getJSXLandscapeTableRow(n, item, chan, startIndex));
      chan = !chan;
    }   

    return arr;
  }

  getJSXLandscapeTableRow(n, item, chan, startIndex) {
    return (
      <View key={n} style={[s.table.row, chan ? styles.chan : styles.le]}>
        <View key={1} style={[s.landscape.colCommon]}>
          <Text style={[{width: "100%", textAlign: "center"}]}>{item.hoTen}</Text>
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
                  <Button style={[s.button, {width: "48%"}]} full rounded onPress={this.onFilterClick.bind(this)}>
                    <Text style={s.buttonText}>Tìm kiếm</Text>
                  </Button>
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
                <Button style={[s.button, {width: "15%", marginTop: 5}]} full rounded onPress={this.onFilterClick.bind(this)}>
                    <Text style={s.buttonText}>Tìm kiếm</Text>
                </Button>
              </View>
            )
          }
          <Tabs renderTabBar={() => <ScrollableTab style={{ backgroundColor: "white" }}/>} tabBarUnderlineStyle={s.tabBarUnderlineStyle}>
            {this.state.tabs}
          </Tabs>
          <View style={s.bottomContainer}>
            <Text style={s.bottomText}>
              {this.state.dangKyMoiNote}
            </Text>
          </View>
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
};

export default LeaderList;