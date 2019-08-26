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
import FooterTabThanhVien from "../component/FooterTabThanhVien";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";

const { width, height } = Dimensions.get('window');

class TVDuocPhepChinhSua extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      orientation: "",
      userMenuVisible: false,
      listContent: []
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
    await this.renderContent();
    this.setState({spinner: false});
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });
  }

  onUserMenuClick() {
    this.setState({
      userMenuVisible: !this.state.userMenuVisible
    });
  }

  async getData() {
    var result = await api.getTVDuocSuaLai({
      idThanhVien: this.app.loginInfo.id
    });
    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        return data.results;
      } else {
        funcs.showMsg(data.message);  
        return null;
      }
    } else {
      funcs.showMsg(result.message);
      return null;
    }
  }

  async renderContent() {
    var arr = [];

    arr.push(
      <View key="header0" style={[s.table.row, s.table.borderBottom, s.table.borderLeft, s.table.borderRight, s.table.borderTop, {marginTop: 5}]}>
        <View style={[s.table.row, s.table.width75, s.table.borderRight, s.table.borderBottom]}>
          <View style={[s.table.column, s.table.width50, s.table.borderRight]}>
            <View style={[s.table.align, s.table.width100, s.table.borderBottom]}>
              <Text style={[s.table.text, s.table.textHeader]}>Tuần</Text>
            </View>
            <View style={[s.table.row]}>
              <View style={[s.table.width50, s.table.borderRight]}>
                <Text style={[s.table.text, s.table.textHeader]}>TG nghe pháp</Text>
              </View>
              <View style={[s.table.width50]}>
                <Text style={[s.table.text, s.table.textHeader]}>TG tụng kinh</Text>
              </View>
            </View>
          </View>
          <View style={[s.table.column, s.table.width50]}>
            <View style={[s.table.align, s.table.width100, s.table.borderBottom]}>
                <Text style={[s.table.text, s.table.textHeader]}>Ngày</Text>
            </View>
            <View style={[s.table.row]}>
              <View style={[s.table.width50, s.table.borderRight]}>
                <Text style={[s.table.text, s.table.textHeader]}>TG rãnh</Text>
              </View>
              <View style={[s.table.width50]}>
                <Text style={[s.table.text, s.table.textHeader]}>SL danh hiệu</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[s.table.width25, s.table.borderBottom]}>
          <Text style={[s.table.text, s.table.textHeader]}>TN Xác Nhận</Text>
        </View>
      </View>
    );

    var results = await this.getData();
    if (results != null && results.rows.length > 0) {
      this.listDataTheoNgay = results.rows;
      var listRows = results.rows;
      var chan = true;
      for(var i = 0; i < listRows.length; ++i) {
        var item = listRows[i];
        arr.push(this.getJSXRow(i, item, chan));
        chan = !chan;
      }
    } else {
      arr.push(
        <View key="nodata" style={[s.table.row, s.table.borderBottom, s.table.borderLeft, s.table.borderRight]}>
          <Text style={[s.table.text]}>Không tìm thấy dữ liệu</Text>
        </View>
      );
    }

    this.setState({
      listContent: arr
    });
  }

  getJSXRow(i, item, chan) {
    var goOne = function() {
      funcs.goTo("TVCapNhatCongPhuNgay", {date: item.fromDate, week: item.week, month: item.month});
    };

    var goMore = function() {
      funcs.goTo("TVXemDuocPhepSuaTrongTuan", {fromDate: item.fromDateWeek, toDate: item.toDateWeek});
    };

    return (
      <View key={"item" + i} style={[s.table.row, s.table.borderBottom, s.table.borderLeft, s.table.borderRight, chan ? styles.chan : styles.le]}>
        <View style={[s.table.row, s.table.width75, s.table.borderRight]}>
          <View style={[s.table.column, s.table.width50, s.table.borderRight]}>
            <View style={[s.table.align, s.table.width100, s.table.borderBottom]}>
              <Text style={[s.table.text]}>Tuần {item.week}/{item.month}</Text>
            </View>
            <View style={[s.table.row]}>
              <View style={[s.table.width50, s.table.borderRight]}>
                <Text style={[s.table.text]}>{item.tgNghePhap}</Text>
              </View>
              <View style={[s.table.width50]}>
                <Text style={[s.table.text]}>{item.tgTungKinh}</Text>
              </View>
            </View>
          </View>
          <View style={[s.table.column, s.table.width50]}>
            <View style={[s.table.align, s.table.width100, s.table.borderBottom]}>
              <Text style={[s.table.text]}>
                {
                  item.fromDate == item.toDate ? 
                  funcs.getValueFromServerDate(item.fromDate, "day") + "/" + funcs.getValueFromServerDate(item.fromDate, "month")
                  : funcs.getValueFromServerDate(item.fromDate, "day") + "/" + funcs.getValueFromServerDate(item.fromDate, "month")
                  + " -> " + funcs.getValueFromServerDate(item.toDate, "day") + "/" + funcs.getValueFromServerDate(item.toDate, "month")
                }
              </Text>
            </View>
            <View style={[s.table.row]}>
              <View style={[s.table.width50, s.table.borderRight]}>
                <Text style={[s.table.text]}>{item.thoiGianRanh}</Text>
              </View>
              <View style={[s.table.width50]}>
                <Text style={[s.table.text]}>{item.soLuongDH}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[s.table.width25]}>
          <TouchableOpacity onPress={item.fromDate == item.toDate ? goOne : goMore}>
            <Text style={[s.table.text, styles.actionText]}>{item.trNhXacNhan}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  async onSearchPress() {
    this.setState({spinner: true});
    await this.renderContent();
    this.setState({spinner: false});
  }

  renderUserMenuDropdown() {
    return (
      <UserMenuDropdown onPressOut={this.onUserMenuClick.bind(this)}/>
    );
  }

  render() {
    return(
        <Container>
            <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
            <View style={[s.header.container]}>
              <Button transparent>
                <Thumbnail small source={require("../assets/images/icon_logo.png")} />
              </Button>
              <Text style={styles.headerText}>Được Phép Chỉnh Sửa</Text>
              <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
            </View>
            <Content removeClippedSubviews={true}>
              {this.state.listContent}
            </Content>
            {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
            <View style={[styles.borderTop]}>
              <Text style={{padding: 5}}>{this.app.settings.thanhVienDuocSuaLaiNote}</Text>
            </View>
            <FooterTabThanhVien screen={this.props.navigation.getParam('screen', null)}></FooterTabThanhVien>
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
    align: {
      justifyContent: "center",
      alignItems: "center"
    },
    width100: {
      width: "100%",
    },
    width75: {
      width: "75%"
    },
    width50: {
      width: "50%",
      justifyContent: "center",
      alignItems: "center"
    },
    width25: {
      width: "25%",
      justifyContent: "center",
      alignItems: "center"
    },
    text: {
      width: "100%",
      textAlign: "center",
      padding: 5
    },
    textHeader: {
      color: Colors.navbarBackgroundColor,
      fontWeight: "bold"
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.navbarBackgroundColor
    },
    borderLeft: {
      borderLeftWidth: 1,
      borderLeftColor: Colors.navbarBackgroundColor
    },
    borderRight: {
      borderRightWidth: 1,
      borderRightColor: Colors.navbarBackgroundColor
    },
    borderTop: {
      borderTopWidth: 1,
      borderTopColor: Colors.navbarBackgroundColor
    }
  }
};

export default TVDuocPhepChinhSua;