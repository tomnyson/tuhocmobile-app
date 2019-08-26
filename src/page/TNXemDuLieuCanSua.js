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

// Our custom files and classes import
import Text from '../component/Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import Label from '../component/Label';
import ErrorMsg from '../component/ErrorMsg';

const { width, height } = Dimensions.get('window');

class TNXemDuLieuCanSua extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      userMenuVisible: false,
      orientation: "",
      rows: []
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));

    this.notifyCanSua = this.props.navigation.getParam('notifyCanSua', {});
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    this.renderRows();
    this.setState({spinner: false});
  }

  renderRows() {
    var arr = [];

    var list = this.notifyCanSua.listCanSua;
    if (list.length > 0) {
        var chan = true;
        for(var i = 0; i < list.length; ++i) {
            var item = list[i];
            arr.push(this.renderJSXRow(i, item, chan));
            chan = !chan;
        }
    } else {
        arr.push((
            <View key="nodata" style={[s.table.row, s.table.borderLeft, s.table.borderBottom, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>Không tìm thấy dữ liệu</Text>
            </View>
        ));
    }

    this.setState({rows: arr});
  }

  renderJSXRow(i, item, chan) {
      return ([
        <View key={"item0" + i} style={[s.table.row, s.table.border, chan ? styles.chan : styles.le]}>
            <View style={[s.table.col50, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>{item.hoTen}</Text>
            </View>
            <View style={[s.table.col50, styles.alignCenter, s.table.cellHeader]}>
                <Text style={[s.table.textValue]}>{item.phapDanh}</Text>
            </View>
        </View>,
        <View key={"item1" + i} style={[s.table.row, s.table.borderLeft, s.table.borderBottom, s.table.borderRight, chan ? styles.chan : styles.le]}>
            <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>{funcs.getValueFromServerDate(item.ngayCanSua, "day")}/{funcs.getValueFromServerDate(item.ngayCanSua, "month")}</Text>
            </View>
            <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>{item.tgNghePhap}</Text>
            </View>
            <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>{item.tgTungKinh}</Text>
            </View>
            <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>{item.soLuongDH}</Text>
            </View>
            <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                <Text style={[s.table.textValue]}>{item.thoiGianRanh}</Text>
            </View>
            <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader]}>
                <Text style={[s.table.textValue]}>{item.tocDoNiemPhat}</Text>
            </View>
        </View>
      ]);
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  orientationDidChange(orientation) {
    this.setState({orientation: orientation});
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

  async onDongYPress() {
    this.setState({spinner: true});
    var result = await api.yeuCauDuocSua_TruongNhomDongY(this.notifyCanSua.listCanSua);
  
    if (result.code == 200) {
        var data = result.data;
        if (data.success) {
            funcs.back();
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
                <Text style={styles.headerText}>Xin chào : {funcs.getXinChaoText(this.app.loginInfo)}!</Text>
                <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
            </View>
            <Content removeClippedSubviews={true}>
              <View style={[s.table.row, {marginTop: 5}, s.table.border, s.table.header]}>
                  <View style={[s.table.col50, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                      <Text style={[s.table.textHeader]}>Họ Tên</Text>
                  </View>
                  <View style={[s.table.col50, styles.alignCenter, s.table.cellHeader]}>
                      <Text style={[s.table.textHeader]}>Pháp Danh</Text>
                  </View>
              </View>
              <View style={[s.table.row, s.table.borderLeft, s.table.borderBottom, s.table.borderRight, s.table.header]}>
                  <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                      <Text style={[s.table.textHeader]}>Ngày{"\n"}Tháng</Text>
                  </View>
                  <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                      <Text style={[s.table.textHeader]}>TGian{"\n"}NPháp</Text>
                  </View>
                  <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                      <Text style={[s.table.textHeader]}>TGian{"\n"}TKinh</Text>
                  </View>
                  <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                      <Text style={[s.table.textHeader]}>SL{"\n"}DHiệu</Text>
                  </View>
                  <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader, s.table.borderRight]}>
                      <Text style={[s.table.textHeader]}>TGian{"\n"}Rãnh</Text>
                  </View>
                  <View style={[s.table.col16, styles.alignCenter, s.table.cellHeader]}>
                      <Text style={[s.table.textHeader]}>TĐộ{"\n"}NPhật</Text>
                  </View>
              </View>
              {this.state.rows}
            </Content>
            <View style={[styles.alignCenter]}>
                <Button style={[s.button]} full rounded onPress={this.onDongYPress.bind(this)}>
                  <Text style={s.buttonText}>Đồng ý được sữa lại</Text>
                </Button>
            </View>
            <View style={[s.table.row, s.table.border, s.table.textValue]}>
                <Text>{this.app.settings.truongNhomDongYChuaDung}</Text>
            </View>
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
  table: {
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "stretch"
    },
    header: {
        backgroundColor: Colors.navbarBackgroundColor
    },
    textHeader: {
        color: Colors.buttonColor,
        fontWeight: "bold",
        paddingTop: 10,
        paddingBottom: 10
    },
    textValue: {
        paddingTop: 10,
        paddingBottom: 10
    },
    cellHeader: {

    },
    col50: {
        width: "50%"
    },
    col16: {
        width: "16.66%"
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopColor: Colors.statusBarColor
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: Colors.statusBarColor
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.statusBarColor
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.statusBarColor
    },
    border: {
        borderWidth: 1,
        borderColor: Colors.statusBarColor
    }
  }
};

export default TNXemDuLieuCanSua;