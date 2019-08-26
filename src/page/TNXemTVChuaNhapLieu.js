import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Drawer, Segment, Form, Item, Input,
  Icon, Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, H1 } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import IconEntypo from 'react-native-vector-icons/Entypo';
import moment from "moment";
import Orientation from 'react-native-orientation';

// Our custom files and classes import
import TruongNhomSideBar from '../component/TruongNhomSideBar';
import Text from '../component/Text';
import Label from '../component/Label';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import FooterTabTruongNhom from "../component/FooterTabTruongNhom";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import DaySelect from "../component/DaySelect";
import ErrorMsg from '../component/ErrorMsg';

const { width, height } = Dimensions.get('window');

class TNXemTVChuaNhapLieu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      tuanContent: null,

      fromMonth: "",
      fromWeek: "",
      toMonth: "",
      toWeek: "",

      fromMonthElements: [],
      toMonthElements: [],

      fromWeekElements: [],
      toWeekElements: [],
      orientation: "",
      showFilterPanel: true
    };

    this.weeksInMonths = [];
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

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.getInitDateRanges();
    this.renderDropboxsMonth();
    await this.getDataTheoTuan();
    this.renderTuanContent(this.listRows);
    this.setState({spinner: false});
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

    this.renderTuanContent(this.listRows);
  }

  async getInitDateRanges() {
    var result = await api.getInitDateRanges();
    if (result.code === 200) {
      var data = result.data;

      if (data.success) {
        this.initChuaNhapDuLieu = data.initChuaNhapDuLieu;

        this.weeksInMonths = data.weeks;
        this.setState({
          fromMonth: this.initChuaNhapDuLieu.fromThang.toString(),
          fromWeek: this.initChuaNhapDuLieu.fromTuan.toString(),
          toMonth: this.initChuaNhapDuLieu.toThang.toString(),
          toWeek: this.initChuaNhapDuLieu.toTuan.toString()
        });
      } else {
        funcs.showMsg(data.message);  
      }
    } else {
      funcs.showMsg(result.message);
    }
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async getDataTheoTuan() {
    this.listRows = [];
    var result = await api.getThVChuaNhapLieu({
      idThanhVien: this.app.loginInfo.id,
      fromTuan: this.state.fromWeek,
      fromThang: this.state.fromMonth,
      toTuan: this.state.toWeek,
      toThang: this.state.toMonth
    });
    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        this.listRows = data.list;
      } else {
        funcs.showMsg(data.message);  
      }
    } else {
      funcs.showMsg(result.message);
    }
  }

  renderTuanContentPORTRAIT(listRows) {
    var arr = [];

    arr.push(
        <View key="header1" style={[s.theoNgay.table.headerContainer, {marginTop: 2}]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "50%"}]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp Danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "25%"}]}>
                <Text style={[s.theoNgay.table.headerText]}>Tuần</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
                <Text style={[s.theoNgay.table.headerText]}>Số Ngày Chưa Nhập</Text>
            </View>
        </View>
    );

    arr.push(
        <View key="header2" style={[s.theoNgay.table.headerContainer]}>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Nghe Pháp</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Tụng Kinh</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
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
      tuanContent: arr
    });
  }

  goTo(item, phapDanh) {
    if (item.offline) {
      funcs.goTo("TNXemTVOffline", {id: item.idThanhVien, hoTen: item.hoTen, phapDanh: phapDanh, fromWeek: item.week, fromMonth: item.month, toWeek: item.week, toMonth: item.month});
    } else {
      funcs.goTo("TNXemTVOnline", {id: item.idThanhVien, hoTen: item.hoTen, phapDanh: phapDanh, fromDate: item.fromDate, toDate: item.toDate});
    }
  }

  getJSXRowPORTRAIT(i, item, chan) {
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";
    return [
        <View key={"item0" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "50%"}]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.hoTen}{phapDanh}</Text>
              <Text style={[item.offline ? styles.offline : styles.online]}>{item.offline ? "offline" : "online"}</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "25%"}]}>
              <TouchableOpacity onPress={()=>this.goTo(item, phapDanh)}>
                <Text style={[s.theoNgay.table.itemText, styles.actionText]}>Tuần {item.week}{"\n"} Thg {item.month}</Text>
              </TouchableOpacity>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
              <TouchableOpacity onPress={()=>this.goTo(item, phapDanh)}>
                <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.thanhvienCN}</Text>    
              </TouchableOpacity>
            </View>
        </View>
        ,
        <View key={"item1" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.bodyColumn]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.tgNghePhap}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.bodyColumn]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.tgTungKinh}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.bodyColumn]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
                <Text style={[s.theoNgay.table.itemText]}>{item.thoiGianRanh}</Text>
            </View>
        </View>
    ];
  }

  renderTuanContentLANDSCAPE(listRows) {
    var arr = [];

    arr.push(
        <View key="header" style={[s.theoNgay.table.headerContainer, {marginTop: 2}]}>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Tuần</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Số Ngày Chưa Nhập</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Nghe Pháp</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Tụng Kinh</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>SL DHiệu</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape]}>
                <Text style={[s.theoNgay.table.headerText]}>TG Rãnh/Ngày</Text>
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
      tuanContent: arr
    });
  }

  getJSXRowLANDSCAPE(i, item, chan) {
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";
    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.hoTen}{phapDanh}</Text>
              <Text style={[item.offline ? styles.offline : styles.online]}>{item.offline ? "offline" : "online"}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
            <TouchableOpacity onPress={()=>this.goTo(item, phapDanh)}>
              <Text style={[s.theoNgay.table.itemText, styles.actionText]}>Tuần {item.week}{"\n"} Thg {item.month}</Text>    
            </TouchableOpacity>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
            <TouchableOpacity onPress={()=>this.goTo(item, phapDanh)}>
              <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.thanhvienCN}</Text>  
            </TouchableOpacity>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.tgNghePhap}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.tgTungKinh}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.thoiGianRanh}</Text>
          </View>
      </View>
    );
  }

  onFromMonthChange (value) {
    this.setState({
      fromMonth : value,
      fromWeek: "1"
    });
    this.renderFromWeek(value);
  }

  onFromWeekChange (value) {
    this.setState({
      fromWeek : value
    });
  }

  onToWeekChange (value) {
    this.setState({
      toWeek : value
    });
  }

  onToMonthChange (value) {
    this.setState({
      toMonth : value,
      toWeek: "1"
    });
    this.renderToWeek(value);
  }

  renderDropboxsMonth() {
    this.setState({
      fromMonth: this.initChuaNhapDuLieu.fromThang.toString(),
      fromWeek: this.initChuaNhapDuLieu.fromTuan.toString(),
      toMonth: this.initChuaNhapDuLieu.toThang.toString(),
      toWeek: this.initChuaNhapDuLieu.toTuan.toString()
    });

    this.renderFromMonth(this.weeksInMonths);
    this.renderFromWeek(this.initChuaNhapDuLieu.fromThang);

    this.renderToMonth(this.weeksInMonths);
    this.renderToWeek(this.initChuaNhapDuLieu.toThang);
  }

  renderFromWeek(month) {
    var numberOfWeeks = 0;
    for (var j = 0; j < this.weeksInMonths.length; ++ j) {
      if (this.weeksInMonths[j].month == parseInt(month)) {
        numberOfWeeks = this.weeksInMonths[j].week;
        break;
      }
    }

    let fromWeekElements = []
    
    for (var i = 1; i <= numberOfWeeks; ++i) {
      let item = i;

      fromWeekElements.push(
        <Picker.Item key={"week" + i} label={"Tuần " + item.toString()} value={item.toString()} />
      );
    }

    this.setState({
      fromWeekElements: fromWeekElements
    });
  }

  renderFromMonth(months) {
    let fromMonthElements = []
    
    for (var i = 0; i < months.length; ++i) {
      let item = months[i];

      fromMonthElements.push(
        <Picker.Item key={"month" + i} label={"Tháng " + item.month.toString()} value={item.month.toString()} />
      );
    }

    this.setState({
        fromMonthElements: fromMonthElements
    });
  }

  renderToWeek(month) {
    var numberOfWeeks = 0;
    for (var j = 0; j < this.weeksInMonths.length; ++ j) {
      if (this.weeksInMonths[j].month == parseInt(month)) {
        numberOfWeeks = this.weeksInMonths[j].week;
        break;
      }
    }

    let toWeekElements = []
    
    for (var i = 1; i <= numberOfWeeks; ++i) {
      let item = i;

      toWeekElements.push(
        <Picker.Item key={"week" + i} label={"Tuần " + item.toString()} value={item.toString()} />
      );
    }

    this.setState({
      toWeekElements: toWeekElements
    });
  }

  renderToMonth(months) {
    let toMonthElements = []
    
    for (var i = 0; i < months.length; ++i) {
      let item = months[i];

      toMonthElements.push(
        <Picker.Item key={"month" + i} label={"Tháng " + item.month.toString()} value={item.month.toString()} />
      );
    }

    this.setState({
        toMonthElements: toMonthElements
    });
  }

  async onSearchByWeekPress() {
    this.setState({spinner: true});
    await this.getDataTheoTuan();
    this.renderTuanContent(this.listRows);
    this.setState({spinner: false});
  }

  renderTuanContent(list) {
    if (this.state.orientation == "LANDSCAPE") {
        this.renderTuanContentLANDSCAPE(list);
    } else  {
        this.renderTuanContentPORTRAIT(list);
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
          <Text style={styles.headerText}>Danh sách chưa nhập liệu</Text>
          <View>
              <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                  <IconAntDesign name="filter" style={s.iconFilter}/>
              </TouchableOpacity>
          </View>
        </View>

        {
          this.state.showFilterPanel
          ?
          (
            this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN" ? 
            [
              <View key="tfv1" style={[s.theoTuan.filter.container]}>
                <Text style={[s.theoTuan.filter.label]}>Từ tuần</Text>
                <View style={[{width: "35%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tháng"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.fromMonth}
                    onValueChange={this.onFromMonthChange.bind(this)}
                    >
                      {this.state.fromMonthElements}
                  </Picker>
                </View>
                <View style={[{width: "33%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tuần"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.fromWeek}
                    onValueChange={this.onFromWeekChange.bind(this)}
                    >
                      {this.state.fromWeekElements}
                  </Picker>
                </View>
              </View>,
              <View key="tfv2" style={[s.theoTuan.filter.container]}>
                <Text style={[s.theoTuan.filter.label]}>Đến tuần</Text>
                <View style={[{width: "35%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tháng"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.toMonth}
                    onValueChange={this.onToMonthChange.bind(this)}
                    >
                      {this.state.toMonthElements}
                  </Picker>
                </View>
                <View style={[{width: "33%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tuần"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.toWeek}
                    onValueChange={this.onToWeekChange.bind(this)}
                    >
                      {this.state.toWeekElements}
                  </Picker>
                </View>
              </View>
            ]
            :
            [
              <View key="tfv1" style={[s.theoTuan.filter.container]}>
                <Text style={[s.theoTuan.filter.labelLandscape, {marginLeft: 2}]}>Từ tuần</Text>
                <View style={[{width: "15%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tháng"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.fromMonth}
                    onValueChange={this.onFromMonthChange.bind(this)}
                    >
                      {this.state.fromMonthElements}
                  </Picker>
                </View>
                <View style={[{width: "15%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tuần"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.fromWeek}
                    onValueChange={this.onFromWeekChange.bind(this)}
                    >
                      {this.state.fromWeekElements}
                  </Picker>
                </View>
                <Text style={[s.theoTuan.filter.labelLandscape]}>Đến tuần</Text>
                <View style={[{width: "15%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tháng"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.toMonth}
                    onValueChange={this.onToMonthChange.bind(this)}
                    >
                      {this.state.toMonthElements}
                  </Picker>
                </View>
                <View style={[{width: "15%"}, styles.dropbox]}>
                  <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tuần"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.theoTuan.filter.dropbox}
                    selectedValue={this.state.toWeek}
                    onValueChange={this.onToWeekChange.bind(this)}
                    >
                      {this.state.toWeekElements}
                  </Picker>
                </View>
                <TouchableOpacity style={{borderRadius: 10,padding: 10, backgroundColor: Colors.navbarBackgroundColor, marginRight: 2}} onPress={this.onSearchByWeekPress.bind(this)}>
                  <Text style={{color: Colors.buttonColor,textAlign: "center", paddingLeft: 10, paddingRight: 10}}>Xem</Text>
                </TouchableOpacity>
              </View>
            ]
          )
          : null
        }

        {
          this.state.showFilterPanel && (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN")
          ?
          (
            <View style={{flexDirection : "row", justifyContent: "center", marginTop: 5}}>
              <TouchableOpacity style={{borderRadius: 10, padding: 10, backgroundColor: Colors.navbarBackgroundColor, width: "60%"}} onPress={this.onSearchByWeekPress.bind(this)}>
                <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
              </TouchableOpacity>
            </View>
          )
          : null
        }

        <Content removeClippedSubviews={true}>
          {this.state.tuanContent}
        </Content>
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
  iconFilter: {
    fontSize: 32,
    color: Colors.buttonColor
  },
  theoNgay: {
    table: {
      headerContainer: {
        flexDirection : "row",
        justifyContent: "space-between",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: Colors.statusBarColor,
        backgroundColor: Colors.navbarBackgroundColor
      },
      noDataCotainer: {
        flexDirection : "row",
        justifyContent: "space-between",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: Colors.statusBarColor,
        backgroundColor: Colors.buttonColor,
      },
      headerStyle: {
        alignItems: "center",
        justifyContent: "center"
      },
      headerWidth: {
        width: "25%",
        alignItems: "center",
        justifyContent: "center"
      },
      headerWidthLandscape: {
        width: "14.2%",
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
      label: {
        marginLeft: 10,
        marginRight: 10,
        width: 60
      },
      labelLandscape: {
      }
    }
  },
  pickerText: {
    
  },
};

export default TNXemTVChuaNhapLieu;