import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Drawer, Segment, Form, Item, Input,
  Icon, Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, H1 } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
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
import PopupContainer from '../component/PopupContainer';

const { width, height } = Dimensions.get('window');

class TNXemLaiTruocDay extends Component {
  constructor(props) {
    super(props);

    this.originEditPopupStyle = {
      container: {
        width: width,
        height: height
      },
      inner: {
        width: width - 4,
        height: height - 120,
      },
      landscape: {
        container: {
          width: height,
          height: width
        },
        inner: {
          width: height - 4,
          height: width - 120,
        }
      }
    };

    this.state = {
      spinner: true,
      userMenuVisible: false,
      segmentActive: "ngay",
      ngayContent: null,
      tuanContent: null,

      fromDay: "",
      fromMonth: "",
      fromYear: "",

      toDay: "",
      toMonth: "",
      toYear: "",

      dayAddNew: "",
      monthAddNew: "",
      yearAddNew: "",

      day: "",
      month: "",
      year: "",

      calendarVisible: false,

      fromMonth2: "",
      fromWeek: "",
      toMonth2: "",
      toWeek: "",

      fromMonth2Elements: [],
      toMonth2Elements: [],

      fromWeekElements: [],
      toWeekElements: [],
      orientation: "",
      editPopupVisible: false,

      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",
      tocDoNiemPhat: "",
      congPhuNgayId: 0,
      addNew: false
    };

    this.currentCalendarFor = "";
    this.weeksInMonths = [];

    this.hasUpdate = false;
  }

  componentWillMount() {
    this.app = store.getState().app;
    
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.getInitDateRanges();
    await this.renderNgayContent();
    this.renderDropboxsMonth();
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

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });
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

        this.setState({
          fromDay: funcs.getValueFromServerDate(data.start, "day"),
          fromMonth: funcs.getValueFromServerDate(data.start, "month"),
          fromYear: funcs.getValueFromServerDate(data.start, "year"),
          toDay: funcs.getValueFromServerDate(data.end, "day"),
          toMonth: funcs.getValueFromServerDate(data.end, "month"),
          toYear: funcs.getValueFromServerDate(data.end, "year"),
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
    Orientation.removeOrientationListener(this._orientationDidChange);
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

  closeDrawer() {
    this.drawer._root.close();
  };

  openDrawer() { 
    this.drawer._root.open() ;
  };

  async onSegmentPress() {
    if (this.state.segmentActive == "ngay") {
      this.setState({segmentActive : "tuan"});
      if (this.state.tuanContent == null || this.hasUpdate) {
        this.hasUpdate = false;
        await this.renderTuanContent();
      }
    } else {
      this.setState({segmentActive : "ngay"});
      await this.renderNgayContent();
    }
  }

  onDayChange(e) {
    let value = funcs.getCalendarData(e);
    this.setState({day: value});
  }

  onMonthChange(e) {
      let value = funcs.getCalendarData(e);
      this.setState({
        month: value,
        day: "1"
      });
  }

  onYearChange(e) {
      let value = funcs.getCalendarData(e);
      this.setState({year: value});
  }

  onCalendarOK() {
    if (this.currentCalendarFor == "from") {
      this.setState({
        calendarVisible: false,
        fromYear: this.state.year,
        fromMonth: this.state.month,
        fromDay: this.state.day,
      });
    }
    else if (this.currentCalendarFor == "to") {
      this.setState({
        calendarVisible: false,
        toYear: this.state.year,
        toMonth: this.state.month,
        toDay: this.state.day,
      });
    } else if (this.currentCalendarFor == "add-new") {
      this.setState({
        calendarVisible: false,
        yearAddNew: this.state.year,
        monthAddNew: this.state.month,
        dayAddNew: this.state.day,
      });
    }

    this.currentCalendarFor = "";
  }

  onCalendarCancel() {
    this.setState({
      calendarVisible: false
    });
  }

  async getDataTheoNgay() {
    var result = await api.getCongPhuTheoNgay({
      idThanhVien: this.app.loginInfo.id,
      tuNgay: this.state.fromYear + "-" + this.state.fromMonth + "-" + this.state.fromDay,
      toiNgay: this.state.toYear + "-" + this.state.toMonth + "-" + this.state.toDay
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

  async getDataTheoTuan() {
    var result = await api.getCongPhuTheoTuan({
      idThanhVien: this.app.loginInfo.id,
      FromTuan: this.state.fromWeek,
      FromThang: this.state.fromMonth2,
      ToTuan: this.state.toWeek,
      ToThang: this.state.toMonth2
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

  async renderNgayContent() {
    var arr = [];

    arr.push(
      <View key="header" style={[s.theoNgay.table.headerContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Từ ngày{"\n"}{this.state.fromDay} - Thg {this.state.fromMonth}</Text>
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

    var results = await this.getDataTheoNgay();
    if (results != null && results.listRows.length > 0) {
      this.listDataTheoNgay = results.listRows;
      var listRows = results.listRows;
      for(var i = 0; i < listRows.length; ++i) {
        var item = listRows[i];
        arr.push(this.getJSXNgayRow(i, item));
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
      ngayContent: arr
    });
  }

  getJSXNgayRow(i, item) {
    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <TouchableOpacity onPress={()=>this.showEditPopup(item.id)}>
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

  async onSearchByDayPress() {
    this.setState({spinner: true});
    await this.renderNgayContent();
    this.setState({spinner: false});
  }

  showCalendarFromDate() {
    this.currentCalendarFor = "from";
    this.setState({
        calendarVisible: true,
        day: this.state.fromDay,
        month: this.state.fromMonth,
        year: this.state.fromYear
    });
  }

  showCalendarToDate() {
    this.currentCalendarFor = "to";
    this.setState({
        calendarVisible: true,
        day: this.state.toDay,
        month: this.state.toMonth,
        year: this.state.toYear
    });
  }

  showCalendarDateAddNew() {
    this.currentCalendarFor = "add-new";
    this.setState({
        calendarVisible: true,
        day: this.state.dayAddNew,
        month: this.state.monthAddNew,
        year: this.state.yearAddNew
    });
  }

  //-----

  async renderTuanContent() {
    this.setState({spinner: true});
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
    if (results != null && results.rows.length > 0) {
      var listRows = results.rows;
      for(var i = 0; i < listRows.length; ++i) {
        var item = listRows[i];
        arr.push(this.renderJSXTuanRow(i, item));
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
    this.setState({spinner: false});
  }

  renderJSXTuanRow(i, item) {
    var obj = (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>Tuần {item.week} - Tháng {item.month}</Text>
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
    
    return obj;
  }

  onFromMonth2Change (value) {
    this.setState({
      fromMonth2 : value,
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

  onToMonth2Change (value) {
    this.setState({
      toMonth2 : value,
      toWeek: "1"
    });
    this.renderToWeek(value);
  }

  renderDropboxsMonth() {
    this.setState({
      fromMonth2: this.initWeeksRange.fromWeek.month.toString(),
      fromWeek: this.initWeeksRange.fromWeek.week.toString(),
      toMonth2: this.initWeeksRange.toWeek.month.toString(),
      toWeek: this.initWeeksRange.toWeek.week.toString()
    });

    this.renderFromMonth2(this.weeksInMonths);
    this.renderFromWeek(this.initWeeksRange.fromWeek.month);

    this.renderToMonth2(this.weeksInMonths);
    this.renderToWeek(this.initWeeksRange.toWeek.month);
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

  renderFromMonth2(months) {
    let fromMonth2Elements = []
    
    for (var i = 0; i < months.length; ++i) {
      let item = months[i];

      fromMonth2Elements.push(
        <Picker.Item key={"month" + i} label={"Tháng " + item.month.toString()} value={item.month.toString()} />
      );
    }

    this.setState({
      fromMonth2Elements: fromMonth2Elements
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

  renderToMonth2(months) {
    let toMonth2Elements = []
    
    for (var i = 0; i < months.length; ++i) {
      let item = months[i];

      toMonth2Elements.push(
        <Picker.Item key={"month" + i} label={"Tháng " + item.month.toString()} value={item.month.toString()} />
      );
    }

    this.setState({
      toMonth2Elements: toMonth2Elements
    });
  }

  async onSearchByWeekPress() {
    await this.renderTuanContent();
  }

  getRowDataTheoNgay(id) {
    for(var i = 0; i < this.listDataTheoNgay.length; ++i) {
      if (this.listDataTheoNgay[i].id == id) {
        return this.listDataTheoNgay[i];
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

    this.setState({
      addNew: false,
      editPopupVisible: true,
      selectedItem: item,
      congPhuNgayId: item.id,
      thoiGianNghePhap: item.tgNghePhap.toString(),
      thoiGianTungKinh: item.tgTungKinh.toString(),
      soLuongDanhHieu: item.soLuongDH.toString(),
      tocDoNiemPhat: item.tocDoNiemPhat.toString()
    });
  }

  onThemMoiPress() {
    this.setState({
      addNew: true,
      editPopupVisible: true,
      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      soLuongDanhHieu: "",
      tocDoNiemPhat: this.app.loginInfo.tocDoNiemPhat.toString(),
      thoiGianRanh: this.app.loginInfo.thoiGianRanh == null ? "" : this.app.loginInfo.thoiGianRanh.toString(),
      dayAddNew: this.state.toDay,
      monthAddNew: this.state.toMonth,
      yearAddNew: this.state.toYear
    });
  }

  hideEditPopup() {
    this.setState({
      editPopupVisible: false
    });
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
    this.setState({thoiGianRanh: value, errorThoiGianRanh: null});
  }

  onSoLuongDanhHieuChange(value) {
    this.setState({errorSoLuongDanhHieu: null});
    this.setState({soLuongDanhHieu: value});
  }

  onTocDoNiemPhatChange(value) {
    this.setState({errorTocDoNiemPhat: null});
    this.setState({tocDoNiemPhat: value});
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

    if (this.state.thoiGianRanh.trim() == "") {
      valid = false;
      this.setState({errorThoiGianRanh: "Hãy nhập thời gian rãnh"});
    }

    if (!valid) {
      return;
    }

    this.setState({spinner: true});
    var result = {};
    if (this.state.addNew) {
      result = await api.congPhuSave({
        IDTHanhVien: this.app.loginInfo.id,
        ngay: this.state.yearAddNew + "-" + this.state.monthAddNew + "-" + this.state.dayAddNew,
        TGNghePhap: this.state.thoiGianNghePhap,
        TGTungKinh: this.state.thoiGianTungKinh,
        SoLuongDH: this.state.soLuongDanhHieu,
        thoiGianRanh: this.state.thoiGianRanh,
        tocDoNiemPhat: this.state.tocDoNiemPhat
      });
    } else {
      result = await api.updateCongPhuById({
        id: this.state.congPhuNgayId,
        TGNghePhap: this.state.thoiGianNghePhap,
        TGTungKinh: this.state.thoiGianTungKinh,
        SoLuongDH: this.state.soLuongDanhHieu,
        thoiGianRanh: this.state.thoiGianRanh,
        tocDoNiemPhat: this.state.tocDoNiemPhat
      });
    }

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        await this.renderNgayContent();
        this.hideEditPopup();
        this.hasUpdate = true;
      } 
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
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

  render() {
    return(
      <Drawer ref={(ref) => { this.drawer = ref; }} content={<TruongNhomSideBar/>} onClose={this.closeDrawer.bind(this)}>
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container, (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN") ? {} : styles.displayNone]}>
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
          <Segment style={{backgroundColor: Colors.buttonColor, borderWidth: 1, borderColor: Colors.navbarBackgroundColor}}>
            <Button style={[s.segmentButton, this.state.segmentActive == "ngay" ? s.segmentButtonActive : {}]}
              first active={this.state.segmentActive == "ngay"} 
              onPress={this.onSegmentPress.bind(this)}>
              <Text style={[this.state.segmentActive == "ngay" ? s.segmentTextActive : {}]}>Xem theo ngày</Text>
            </Button>
            <Button style={[s.segmentButton, this.state.segmentActive == "tuan" ? s.segmentButtonActive : {}]}
              last active={this.state.segmentActive == "tuan"} 
              onPress={this.onSegmentPress.bind(this)}>
              <Text style={[this.state.segmentActive == "tuan" ? s.segmentTextActive : {}]}>Xem theo tuần</Text>
            </Button>
          </Segment>
          {
            this.state.segmentActive == "ngay" 
            ? 
            (
              this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN" ? 
              (
                <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 2, paddingRight: 2, marginTop: 5}}>
                  <Text>Từ ngày</Text>
                  <TouchableOpacity style={s.dateTextBox} onPress={this.showCalendarFromDate.bind(this)}>
                    <Text>{this.state.fromDay}-{this.state.fromMonth}-{this.state.fromYear}</Text>
                    <Icon name='arrow-dropdown' style={s.dateTextBoxIcon} />
                  </TouchableOpacity>
                  <Text>Đến ngày</Text>
                  <TouchableOpacity style={s.dateTextBox} onPress={this.showCalendarToDate.bind(this)}>
                    <Text>{this.state.toDay}-{this.state.toMonth}-{this.state.toYear}</Text>
                    <Icon name='arrow-dropdown' style={s.dateTextBoxIcon} />
                  </TouchableOpacity>
                </View>
              )
              : 
              (
                <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", paddingLeft: 2, paddingRight: 2, marginTop: 5}}>
                  <Text>Từ ngày</Text>
                  <TouchableOpacity style={s.dateTextBox} onPress={this.showCalendarFromDate.bind(this)}>
                      <Text>{this.state.fromDay}-{this.state.fromMonth}-{this.state.fromYear}</Text>
                      <Icon name='arrow-dropdown' style={s.dateTextBoxIcon} />
                  </TouchableOpacity>
                  <Text>Đến ngày</Text>
                  <TouchableOpacity style={s.dateTextBox} onPress={this.showCalendarToDate.bind(this)}>
                      <Text>{this.state.toDay}-{this.state.toMonth}-{this.state.toYear}</Text>
                      <Icon name='arrow-dropdown' style={s.dateTextBoxIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{padding: 10, backgroundColor: Colors.navbarBackgroundColor, borderRadius:10}} onPress={this.onSearchByDayPress.bind(this)}>
                    <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{padding: 10, backgroundColor: Colors.navbarBackgroundColor, borderRadius:10}} onPress={this.onThemMoiPress.bind(this)}>
                    <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Thêm mới</Text>
                  </TouchableOpacity>
                </View>
              )
            )
            : null
          }

          {
            this.state.segmentActive == "ngay" && (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN")
            ? 
            (
              <View style={{flexDirection : "row", justifyContent: "space-around", alignItems: "center", marginTop: 5}}>
                <TouchableOpacity style={{borderRadius:10,paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.navbarBackgroundColor, width: "45%"}} onPress={this.onSearchByDayPress.bind(this)}>
                  <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.border, {borderRadius:10,paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.buttonColor, width: "45%"}]} onPress={this.onThemMoiPress.bind(this)}>
                  <Text style={{color: Colors.navbarBackgroundColor, width: "100%", textAlign: "center"}}>Thêm mới</Text>
                </TouchableOpacity>
              </View>
            )
            : null
          }

          {
            this.state.segmentActive == "ngay" 
            ? 
            (
              <Content removeClippedSubviews={true}>
                {this.state.ngayContent}
              </Content>
            )
            : null
          }

          {
            this.state.segmentActive == "tuan"
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
                      selectedValue={this.state.fromMonth2}
                      onValueChange={this.onFromMonth2Change.bind(this)}
                      >
                        {this.state.fromMonth2Elements}
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
                      selectedValue={this.state.toMonth2}
                      onValueChange={this.onToMonth2Change.bind(this)}
                      >
                        {this.state.toMonth2Elements}
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
                      selectedValue={this.state.fromMonth2}
                      onValueChange={this.onFromMonth2Change.bind(this)}
                      >
                        {this.state.fromMonth2Elements}
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
                      selectedValue={this.state.toMonth2}
                      onValueChange={this.onToMonth2Change.bind(this)}
                      >
                        {this.state.toMonth2Elements}
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
            this.state.segmentActive == "tuan" && (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN")
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

          {
            this.state.segmentActive == "tuan"
            ?
            (
              <Content removeClippedSubviews={true}>
                {this.state.tuanContent}
              </Content>
            )
            : null
          }
          {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
          {
            this.state.calendarVisible ? (
              <DaySelect onDayChange={this.onDayChange.bind(this)} 
                style={{zIndex: 40}}
                day={this.state.day} 
                month={this.state.month}
                year={this.state.year}
                onMonthChange={this.onMonthChange.bind(this)}
                onYearChange={this.onYearChange.bind(this)}
                onCancel={this.onCalendarCancel.bind(this)}
                onOK={this.onCalendarOK.bind(this)}></DaySelect>
            ) : null
          }
          {this.state.editPopupVisible 
          ? 
          (
            <PopupContainer onKeyboard={this.onKeyboard.bind(this)} style={[s.editPopup.container, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.container : this.originEditPopupStyle.container]}>
              <View style={[s.editPopup.inner, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.inner : this.originEditPopupStyle.inner, this.state.isHeightHalf ? styles.heightHalf : {}]}>
                <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                  <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>{this.state.addNew ? "Thêm mới công phu" : "Chỉnh sửa công phu"}</Text>
                  <TouchableOpacity onPress={this.hideEditPopup.bind(this)} style={{paddingRight: 10}}>
                    <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                  </TouchableOpacity>
                </View>
                <Content>
                  <Form>
                    {
                      !this.state.addNew ?
                      (
                        <Item style={s.editPopup.item}>
                          <View style={[{padding:5, backgroundColor: Colors.navbarBackgroundColor, width: "100%", marginTop: 10}]}>
                            <Text style={{color: "#ffffff"}}>{this.state.selectedItem.point}, Ngày {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "day")}/{funcs.getValueFromServerDate(this.state.selectedItem.ngay, "month")}/{funcs.getValueFromServerDate(this.state.selectedItem.ngay, "year")}</Text>
                          </View>
                        </Item>
                      )
                      : null
                    }
                    {
                      this.state.addNew ?
                      (
                        <View style={[{flexDirection: "row", alignItems: "center", justifyContent: "flex-start"}, s.editPopup.marginLeft, s.editPopup.marginTop]}>
                          <Label>Ngày</Label>
                          <TouchableOpacity style={[s.editPopup.marginLeft, s.dateTextBox]} onPress={this.showCalendarDateAddNew.bind(this)}>
                              <Text>{this.state.dayAddNew}-{this.state.monthAddNew}-{this.state.yearAddNew}</Text>
                              <Icon name='arrow-dropdown' style={s.dateTextBoxIcon} />
                            </TouchableOpacity>
                        </View>
                      )
                      : null
                    }
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Thời gian nghe pháp<Text style={styles.required}>{" *"}</Text></Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(phút)" value={this.state.thoiGianNghePhap} onChangeText={this.onThoiGianNghePhapChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorThoiGianNghePhap ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorThoiGianNghePhap}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Thời gian tụng kinh<Text style={styles.required}>{" *"}</Text></Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(phút)" value={this.state.thoiGianTungKinh} onChangeText={this.onThoiGianTungKinhChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorThoiGianTungKinh ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorThoiGianTungKinh}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Số lượng danh hiệu<Text style={styles.required}>{" *"}</Text></Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={6} placeholder="0" value={this.state.soLuongDanhHieu} onChangeText={this.onSoLuongDanhHieuChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorSoLuongDanhHieu ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorSoLuongDanhHieu}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Tốc độ niệm phật (số danh hiệu/ phút)<Text style={styles.required}>{" *"}</Text></Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={2} placeholder="số danh hiệu/ phút" value={this.state.tocDoNiemPhat} onChangeText={this.onTocDoNiemPhatChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorTocDoNiemPhat ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorTocDoNiemPhat}
                    </ErrorMsg>
                    <Item stackedLabel style={s.editPopup.item}>
                      <Label>Thời gian rãnh (tiếng)<Text style={styles.required}>{" *"}</Text></Label>
                      <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(tiếng)" value={this.state.thoiGianRanh} onChangeText={this.onThoiGianRanhChange.bind(this)}/>
                    </Item>
                    <ErrorMsg style={[this.state.errorThoiGianRanh ? {} : styles.displayNone, s.errorMsg]}>
                      {this.state.errorThoiGianRanh}
                    </ErrorMsg>
                    <Button style={[s.editPopup.button]} full rounded onPress={this.saveCongPhu.bind(this)}>
                      <Text style={s.editPopup.buttonText}>Cập nhật</Text>
                    </Button>
                  </Form>
                </Content>
              </View>
            </PopupContainer>
          ) : null}  
          <FooterTabTruongNhom screen={this.props.navigation.getParam('screen', null)} onQuanLyThanhVienPress={this.openDrawer.bind(this)}></FooterTabTruongNhom>
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
  editPopup: {
    buttonText: {
      color: Colors.buttonColor
    },
    button: {
      backgroundColor: Colors.navbarBackgroundColor,
      marginTop: 30,
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
    },
    marginLeft: {
      marginLeft: 15
    },
    marginTop: {
      marginTop: 10
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.borderGray
    }
  },
  dateTextBox: {
    backgroundColor: "#F1F1F1",
    padding: 8,
    flexDirection : "row",
    alignItems: "center"
  },
  dateTextBoxIcon: {
    marginLeft: 5
  }
};

export default TNXemLaiTruocDay;