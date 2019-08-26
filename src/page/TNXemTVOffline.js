import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';

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
import PopupContainer from '../component/PopupContainer';

const { width, height } = Dimensions.get('window');

class TNXemTVOffline extends Component {
  constructor(props) {
    super(props);

    this.originEditPopupStyle = {
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
      wellcomeText: "",

      fromMonth: "",
      fromWeek: "",
      toMonth: "",
      toWeek: "",

      fromMonthElements: [],
      toMonthElements: [],

      fromWeekElements: [],
      toWeekElements: [],
      orientation: "",
      editPopupVisible: false,
      showFilterPanel: true,
      tuanContent: null,

      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",

      month: "",
      week: "",
      monthElements: [],
      weekElements: [],

      popupTitle: ""
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

    this.id = this.props.navigation.getParam('id', null);
    var phapDanh = this.props.navigation.getParam('phapDanh', '');
    var hoTen = this.props.navigation.getParam('hoTen', '');

    this.fromWeek = this.props.navigation.getParam('fromWeek', '').toString();
    this.fromMonth = this.props.navigation.getParam('fromMonth', '').toString();
    this.toWeek = this.props.navigation.getParam('toWeek', '').toString();
    this.toMonth = this.props.navigation.getParam('toMonth', '').toString();

    this.setState({
      wellcomeText: hoTen + (phapDanh != "" ? "\n" + phapDanh : "")
    });
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.getInitDateRanges();
    this.renderDropboxsMonth();
    await this.renderTuanContent();
    this.setState({spinner: false});
  }

  onKeyboard(show) {
    if (show) {
      this.setState({isHeightHalf: false});
      if (this.state.orientation == "LANDSCAPE") {
        return;
      }
      this.setState({isHeightHalf: true});
    } else {
      this.setState({isHeightHalf: false});
    }
  }

  async getInitDateRanges() {
    var result = await api.getInitDateRanges();
    if (result.code === 200) {
      var data = result.data;

      if (data.success) {
        this.initWeeksRange = {
          toWeek: data.toWeek,
          fromWeek: data.fromWeek
        };

        this.weeksInMonths = data.weeks;
      } else {
        funcs.showMsg(data.message);  
      }
    } else {
      funcs.showMsg(result.message);
    }
  }

  renderDropboxsMonth() {
    this.setState({
      fromMonth: this.fromMonth == "" ? this.initWeeksRange.fromWeek.month.toString() : this.fromMonth,
      fromWeek: this.fromWeek == "" ? this.initWeeksRange.fromWeek.week.toString() : this.fromWeek,
      toMonth: this.toMonth == "" ? this.initWeeksRange.toWeek.month.toString() : this.toMonth,
      toWeek: this.toWeek == "" ? this.initWeeksRange.toWeek.week.toString() : this.toWeek
    });

    this.renderFromMonth(this.weeksInMonths);
    this.renderFromWeek(this.fromMonth == "" ? this.initWeeksRange.fromWeek.month.toString() : this.fromMonth);

    this.renderToMonth(this.weeksInMonths);
    this.renderToWeek(this.toMonth == "" ? this.initWeeksRange.toWeek.month.toString() : this.toMonth);
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

  async renderTuanContent() {
    var arr = [];
    arr.push(
      <View key="header" style={[s.theoNgay.table.headerContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Tuần</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Thời gian nghe pháp</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Thời gian tụng kinh</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Thời gian rãnh</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth]}>
          <Text style={[s.theoNgay.table.headerText]}>Số lượng danh hiệu</Text>
        </View>
      </View>
    );

    var results = await this.getDataTheoTuan();
    if (results != null && results.listRows.length > 0) {
      var listRows = results.listRows;
      for(var i = 0; i < listRows.length; ++i) {
        var item = listRows[i];
        arr.push(this.getJSXRow(i, item));
      }

      arr.push(
        <View key={"tongket"} style={[s.theoNgay.table.itemContainer]}>
          <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
            <Text style={[s.theoNgay.table.itemText]}>Tổng kết</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
            <Text style={[s.theoNgay.table.itemText]}>{results.totalTGNghePhap}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
            <Text style={[s.theoNgay.table.itemText]}>{results.totalTGTungKinh}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
            <Text style={[s.theoNgay.table.itemText]}>{results.totalThoiGianRanh}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidth]}>
            <Text style={[s.theoNgay.table.itemText]}>{results.totalSoLuongDH}</Text>
          </View>
        </View>
      );
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

  getJSXRow(i, item) {
    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <TouchableOpacity onPress={() => this.editRow(item.id)} style={{width: "100%"}}>
            <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.point}</Text>
          </TouchableOpacity>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.tgNghePhap}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.tgTungKinh}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.thoiGianRanh}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
        </View>
      </View>
    );
  }

  editRow(id) {
    if (typeof this.listRows == "undefined" || this.listRows == null) {
      return;
    }

    var item = null;
    for(var i = 0; i < this.listRows.length; ++i) {
      if (this.listRows[i].id === id) {
        item = this.listRows[i];
        break;
      }
    }

    if (item == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }

    this.setState({
      month: item.month.toString(),
      week: item.week.toString(),
      thoiGianNghePhap: item.tgNghePhap.toString(),
      thoiGianTungKinh: item.tgTungKinh.toString(),
      thoiGianRanh: item.thoiGianRanh.toString(),
      soLuongDanhHieu: item.soLuongDH.toString(),
      tocDoNiemPhat: item.tocDoNiemPhat.toString(),
      editPopupVisible: true,
      popupTitle: "Chỉnh sửa công phu " + item.point
    });

    this.renderDropboxMonth(this.weeksInMonths);
    this.renderWeek(item.month);
  }

  async getDataTheoTuan() {
    var result = await api.getXemThanhVienOffline({
      idThanhVien: this.id,
      FromTuan: this.state.fromWeek,
      FromThang: this.state.fromMonth,
      ToTuan: this.state.toWeek,
      ToThang: this.state.toMonth
    });
    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        this.listRows = data.result.listRows;
        return data.result;
      } else {
        funcs.showMsg(data.message);  
        return null;
      }
    } else {
      funcs.showMsg(result.message);
      return null;
    }
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });
  }

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
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

  async onSearchByWeekPress() {
    this.setState({spinner: true});
    await this.renderTuanContent();
    this.setState({spinner: false});
  }

  showAddNewPopup() {
    this.setState({
      popupTitle: "Thêm mới công phu",
      editPopupVisible: true,
      month: this.state.toMonth.toString(),
      week: this.state.toWeek.toString(),
      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",
      tocDoNiemPhat: this.app.settings.tocDoNiemPhat.toString()
    });

    this.renderDropboxMonth(this.weeksInMonths);
    this.renderWeek(this.state.toMonth);
  }

  onThoiGianNghePhapChange(value) {
    this.setState({errorThoiGianNghePhap: null});
    this.setState({thoiGianNghePhap: value});
  }

  onThoiGianTungKinhChange(value) {
    this.setState({errorThoiGianTungKinh: null});
    this.setState({thoiGianTungKinh: value});
  }

  onThoiGianRanhChange(value) {
    this.setState({thoiGianRanh: value});
  }

  onSoLuongDanhHieuChange(value) {
    this.setState({errorSoLuongDanhHieu: null});
    this.setState({soLuongDanhHieu: value});
  }

  onTocDoNiemPhatChange(value) {
    this.setState({errorTocDoNiemPhat: null});
    this.setState({tocDoNiemPhat: value});
  }

  onMonthChange (value) {
    this.setState({
      month : value,
      week: "1"
    });
    this.renderWeek(value);
  }

  onWeekChange (value) {
    this.setState({
        week : value
    });
  }

  async saveCongPhu() {
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
      this.setState({errorTocDoNiemPhat: "Hãy nhập tốc độ niệm phật"});
    }

    if (!valid) {
      return;
    }

    this.setState({spinner: true});
    var result = await api.saveTuan({
      TGNghePhap: this.state.thoiGianNghePhap,
      TGTungKinh: this.state.thoiGianTungKinh,
      SoLuongDH: this.state.soLuongDanhHieu,
      thoiGianRanh: this.state.thoiGianRanh,
      tocDoNiemPhat: this.state.tocDoNiemPhat,
      IDTHanhVien: this.id,
      week: this.state.week,
      month: this.state.month
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        funcs.showMsg(this.app.settings.luuThanhCong);
        await this.renderTuanContent();
      } 
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
    this.setState({editPopupVisible: false});
  }

  hideAddNewPopup() {
    this.setState({editPopupVisible: false});
  }

  onMonthChange (value) {
    this.setState({
      month : value,
      week: "1"
    });
    this.renderWeek(value);
  }

  onWeekChange (value) {
    this.setState({
        week : value
    });
  }

  renderDropboxMonth(months) {
    let monthElements = []
    
    for (var i = 0; i < months.length; ++i) {
      let item = months[i];

      monthElements.push(
        <Picker.Item key={"month" + i} label={"Tháng " + item.month.toString()} value={item.month.toString()} />
      );
    }

    this.setState({
      monthElements: monthElements
    });
  }

  renderWeek(month) {
    var numberOfWeeks = 0;
    for (var j = 0; j < this.weeksInMonths.length; ++ j) {
      if (this.weeksInMonths[j].month == parseInt(month)) {
        numberOfWeeks = this.weeksInMonths[j].week;
        break;
      }
    }

    let weekElements = []
    
    for (var i = 1; i <= numberOfWeeks; ++i) {
      let item = i;

      weekElements.push(
        <Picker.Item key={"week" + i} label={"Tuần " + item.toString()} value={item.toString()} />
      );
    }

    this.setState({
      weekElements: weekElements
    });
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
              <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
              </Button>
              <Text style={[styles.headerText]}>{this.state.wellcomeText}</Text>
              <View>
              <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                  <IconAntDesign name="filter" style={s.iconFilter}/>
              </TouchableOpacity>
              </View>
          </View>
          { this.state.showFilterPanel ? 
            this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN" ? 
            [
            <View key="tfv1" style={[s.theoTuan.filter.container]}>
                <Text style={[s.theoTuan.filter.label]}>Từ tuần</Text>
                <View style={[styles.dropbox, {width: "35%"}]}>
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
                <View style={[styles.dropbox, {width: "35%"}]}>
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
                <View style={[styles.dropbox, {width: "35%"}]}>
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
                <View style={[styles.dropbox, {width: "35%"}]}>
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
                <View style={[styles.dropbox, {width: "20%"}]}>
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
                <View style={[styles.dropbox, {width: "20%"}]}>
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
                <View style={[styles.dropbox, {width: "20%"}]}>
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
                <View style={[styles.dropbox, {width: "20%"}]}>
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
            : null
          }
          <View style={[this.state.showFilterPanel ? {} : styles.displayNone, {flexDirection : "row", justifyContent: "center", alignItems: "center", marginTop: 5}]}>
            <TouchableOpacity style={{borderRadius: 10, padding: 10, backgroundColor: Colors.navbarBackgroundColor, width: "40%"}} onPress={this.onSearchByWeekPress.bind(this)}>
                <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{marginLeft: 5, borderWidth: 1, borderRadius: 10, padding: 10, borderColor: Colors.navbarBackgroundColor, width: "40%"}} onPress={this.showAddNewPopup.bind(this)}>
                <Text style={{color: Colors.navbarBackgroundColor, width: "100%", textAlign: "center"}}>Thêm mới</Text>
            </TouchableOpacity>
          </View>
          <Content removeClippedSubviews={true}>
            {this.state.tuanContent}
          </Content>
          {this.state.editPopupVisible 
          ? 
          (
            <PopupContainer onKeyboard={this.onKeyboard.bind(this)} style={[s.editPopup.container, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.container : this.originEditPopupStyle.container]}>
              <View style={[s.editPopup.inner, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.inner : this.originEditPopupStyle.inner, this.state.isHeightHalf ? styles.heightHalf : {}]}>
                <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                  <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>{this.state.popupTitle}</Text>
                  <TouchableOpacity onPress={this.hideAddNewPopup.bind(this)} style={{paddingRight: 10}}>
                    <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                  </TouchableOpacity>
                </View>
                <Content>
                  <Form>
                    <Item>
                      <View style={[s.theoTuan.filter.container]}>
                        <Text style={[{}]}>Tuần</Text>
                        <View style={[styles.dropbox, {width: "40%"}]}>
                          <Picker
                            headerStyle={s.pickerText}
                            mode="dropdown"
                            iosHeader="Tháng"
                            iosIcon={<Icon name="ios-arrow-down" />}
                            style={s.theoTuan.filter.dropbox}
                            selectedValue={this.state.month}
                            onValueChange={this.onMonthChange.bind(this)}
                            >
                              {this.state.monthElements}
                          </Picker>
                        </View>
                        <View style={[styles.dropbox, {width: "40%"}]}>
                          <Picker
                            headerStyle={s.pickerText}
                            mode="dropdown"
                            iosHeader="Tuần"
                            iosIcon={<Icon name="ios-arrow-down" />}
                            style={s.theoTuan.filter.dropbox}
                            selectedValue={this.state.week}
                            onValueChange={this.onWeekChange.bind(this)}
                            >
                              {this.state.weekElements}
                          </Picker>
                        </View>
                      </View>
                    </Item>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Thời gian nghe pháp</Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={4} placeholder="(phút)" value={this.state.thoiGianNghePhap} onChangeText={this.onThoiGianNghePhapChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorThoiGianNghePhap ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorThoiGianNghePhap}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Thời gian tụng kinh</Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={4} placeholder="(phút)" value={this.state.thoiGianTungKinh} onChangeText={this.onThoiGianTungKinhChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorThoiGianTungKinh ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorThoiGianTungKinh}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Số lượng danh hiệu</Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={6} placeholder="0" value={this.state.soLuongDanhHieu} onChangeText={this.onSoLuongDanhHieuChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorSoLuongDanhHieu ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorSoLuongDanhHieu}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Tốc độ niệm phật</Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(số danh hiệu/ phút)" value={this.state.tocDoNiemPhat} onChangeText={this.onTocDoNiemPhatChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorTocDoNiemPhat ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorTocDoNiemPhat}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Thời gian rãnh (tiếng)</Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(tiếng)" value={this.state.thoiGianRanh} onChangeText={this.onThoiGianRanhChange.bind(this)}/>
                    </Item>
                    <Button style={[s.editPopup.button]} full rounded onPress={this.saveCongPhu.bind(this)}>
                      <Text style={s.editPopup.buttonText}>Cập nhật</Text>
                    </Button>
                  </Form>
                </Content>
              </View>
            </PopupContainer>
          ) : null}
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
  theoNgay: {
    table: {
      headerContainer: {
        flexDirection : "row",
        justifyContent: "space-between",
        alignItems: "stretch",
        borderWidth: 1,
        borderColor: Colors.navbarBackgroundColor,
        backgroundColor: Colors.buttonColor,
        marginTop: 5
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
        width: "20%",
        alignItems: "center",
        justifyContent: "center"
      },
      headerText: {
        color: Colors.navbarBackgroundColor,
        width: "100%",
        textAlign: "center",
        paddingTop: 5,
        paddingBottom: 5
      },
      headerColumn: {
        borderRightWidth: 1,
        borderRightColor: Colors.navbarBackgroundColor
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
        borderBottomColor: Colors.navbarBackgroundColor,
        borderLeftWidth: 1,
        borderLeftColor: Colors.navbarBackgroundColor,
        borderRightWidth: 1,
        borderRightColor: Colors.navbarBackgroundColor,
      }
    }
  },
  editPopup: {
    buttonText: {
      color: Colors.buttonColor
    },
    button: {
      backgroundColor: Colors.navbarBackgroundColor,
      marginTop: 5,
      marginBottom: 10,
      marginLeft: 20,
      marginRight: 20
    },
    item: {
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
      top: 20,
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
      alignItems: "center"
    },
    itemValue: {
      fontWeight: "bold"
    }
  },
};

export default TNXemTVOffline;