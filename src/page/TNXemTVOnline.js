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
import DaySelect from "../component/DaySelect";

const { width, height } = Dimensions.get('window');

class TNXemTVOnline extends Component {
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
      showFilterPanel: true,

      day: "",
      month: "",
      year: "",

      calendarVisible: false,

      editPopupVisible: false,
      xacDinhInPopup: "",
      xacDinhInPopupElements: [],
      editPopupStyle: this.originEditPopupStyle,
      checkAll: false,

      xacDinh: "",
      xacDinhElements: []
    };

    this.currentCalendarFor = "";
  }

  componentWillMount() {
    this.app = store.getState().app;
    
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
      if (orientation == "LANDSCAPE") {
        this.setState({showFilterPanel: false});  
      }
  
      if (orientation == "LANDSCAPE") {
        this.setState({
          editPopupStyle: this.originEditPopupStyle.landscape
        });
      }
    }).bind(this));

    this.id = this.props.navigation.getParam('id', null);
    var phapDanh = this.props.navigation.getParam('phapDanh', '');
    this.phapDanh = phapDanh;
    var hoTen = this.props.navigation.getParam('hoTen', '');
    this.hoTen = hoTen;

    this.fromDate = this.props.navigation.getParam('fromDate', '');
    this.toDate = this.props.navigation.getParam('toDate', '');
    this.setState({
      wellcomeText: hoTen + (phapDanh != "" ? "\n" + phapDanh : "")
    });
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.getInitDateRanges();
    await this.renderNgayContent();
    this.renderXacDinhDropdownBox();
    this.setState({spinner: false});
  }

  async getInitDateRanges() {
    var result = await api.getInitDateRanges();
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
          this.listXacDinh = data.listXacDinh;
          this.setState({
            fromDay: this.fromDate == "" ? funcs.getValueFromServerDate(data.start, "day") : funcs.getValueFromServerDate(this.fromDate, "day"),
            fromMonth: this.fromDate == "" ? funcs.getValueFromServerDate(data.start, "month") : funcs.getValueFromServerDate(this.fromDate, "month"),
            fromYear: this.fromDate == "" ? funcs.getValueFromServerDate(data.start, "year") : funcs.getValueFromServerDate(this.fromDate, "year"),
            toDay: this.toDate == "" ? funcs.getValueFromServerDate(data.end, "day") : funcs.getValueFromServerDate(this.toDate, "day"),
            toMonth: this.toDate == "" ? funcs.getValueFromServerDate(data.end, "month") : funcs.getValueFromServerDate(this.toDate, "month"),
            toYear: this.toDate == "" ? funcs.getValueFromServerDate(data.end, "year") : funcs.getValueFromServerDate(this.toDate, "year"),
          });
        } else {
            funcs.showMsg(data.message);  
        }
    } else {
        funcs.showMsg(result.message);
    }
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });

    if (orientation == "LANDSCAPE") {
      this.setState({showFilterPanel: false});  
    }

    if (orientation == "PORTRAIT" || orientation == "PORTRAITUPSIDEDOWN" || orientation == "UNKNOWN") {
      this.setState({
        editPopupStyle: this.originEditPopupStyle
      });
    } else {
      this.setState({
        editPopupStyle: this.originEditPopupStyle.landscape
      });
    }
  }

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  onXacDinhInPopupChange (value) {
    this.setState({
      xacDinhInPopup: value
    });
  }

  onXacDinhChange(value) {
    this.setState({
      xacDinh: value
    });
  }

  async onSearchByDayPress() {
    this.setState({spinner: true});
    await this.renderNgayContent();
    this.setState({spinner: false});
  }

  async getDataTheoNgay() {
    var result = await api.getCongPhuTheoNgay({
      idThanhVien: this.id,
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

  getRowDataTheoNgay(id) {
    for(var i = 0; i < this.listDataTheoNgay.length; ++i) {
      if (this.listDataTheoNgay[i].id == id) {
        return this.listDataTheoNgay[i];
      }
    }
    return null;
  }
  
  async renderNgayContent(callAPI) {
    if (typeof callAPI == "undefined") {
      callAPI = true;
    }

    var arr = [];

    arr.push(
      <View key="header" style={[s.theoNgay.table.headerContainer]}>
        <View style={[s.theoNgay.table.headerColumn, {width: "8%"}]}>

        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Từ ngày{"\n"}{this.state.fromDay} - Thg {this.state.fromMonth}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>TG nghe pháp</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>TG tụng kinh</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>TG rãnh</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>SL danh hiệu</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, {width: "20.4%"}]}>
          <Text style={[s.theoNgay.table.headerText]}>TN Xác Định</Text>
        </View>
      </View>
    );

    var results = [];

    if (callAPI) {
      results = await this.getDataTheoNgay();
      this.results = results;
    } else {
      results = this.results;
    }

    if (results != null && results.listRows.length > 0) {
      this.listDataTheoNgay = results.listRows;
      var listRows = results.listRows;
      for(var i = 0; i < listRows.length; ++i) {
        var item = listRows[i];
        arr.push(this.getJSXNgayRow(i, item));
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
      ngayContent: arr
    });
  }
  
  getJSXNgayRow(i, item) {
    if (typeof item.checked == "undefined") {
      item.checked = false;
    }

    var onCheckBoxPress = function () {
      item.checked = !item.checked; 
      this.renderNgayContent(false);

      var checkAll = true;

      if (typeof this.listDataTheoNgay != "undefined") {
        for (var n = 0; n < this.listDataTheoNgay.length; ++n) {
          if (!this.listDataTheoNgay[n].checked) {
            checkAll = false;
            break;
          }
        }
      }

      this.setState({checkAll: checkAll});
    };

    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer]}>
        <View style={[s.theoNgay.table.headerColumn, {width: "8%"}, styles.rowCenter]}>
          <Text style={styles.cbxPaddingLeft35}>{""}</Text>
          <CheckBox title={" "} checked={item.checked} onPress={onCheckBoxPress.bind(this)}
            checkedColor={Colors.navbarBackgroundColor} 
            containerStyle={styles.cbx}/>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.point}</Text>
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
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, {width: "20.4%"}]}>
          <TouchableOpacity onPress={()=>this.showEditPopup(item.id)}>
            <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.trNhXacNhan}</Text>  
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  showEditPopup(id) {
    var item = this.getRowDataTheoNgay(id);

    if (item == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }

    this.setState({
      editPopupVisible: true,
      selectedItem: item,
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
    else {
      this.setState({
        calendarVisible: false,
        toYear: this.state.year,
        toMonth: this.state.month,
        toDay: this.state.day,
      });
    }

    this.currentCalendarFor = "";
  }

  onCalendarCancel() {
    this.setState({
      calendarVisible: false
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
        await this.renderNgayContent();
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
    if (typeof this.listDataTheoNgay == "undefined") {
      return;
    }

    for (var i = 0; i < this.listDataTheoNgay.length; ++i) {
      var item = this.listDataTheoNgay[i];
      item.checked = checkAll;
    }

    this.renderNgayContent(false);
  }

  async onSendAllPress() {
    var arrCheckedIds = [];

    if (typeof this.listDataTheoNgay != "undefined") {
      for (var n = 0; n < this.listDataTheoNgay.length; ++n) {
        var item = this.listDataTheoNgay[n];
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
        await this.renderNgayContent();
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
                <Text style={styles.headerText}>{this.state.wellcomeText}</Text>
                <View>
                  <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                      <IconAntDesign name="filter" style={s.iconFilter}/>
                  </TouchableOpacity>
                </View>
            </View>
            {
              this.state.showFilterPanel ? (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN") ?
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
                  <View style={{flexDirection : "row", justifyContent: "center", width: 100}}>
                    <TouchableOpacity style={{padding: 10, backgroundColor: Colors.navbarBackgroundColor, borderRadius:10}} onPress={this.onSearchByDayPress.bind(this)}>
                      <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            }
            {
              this.state.showFilterPanel ? (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN") ?
              (
                <View style={{flexDirection : "row", justifyContent: "center", marginTop: 5}}>
                  <TouchableOpacity style={{borderRadius:10,paddingTop: 10, paddingBottom: 10, backgroundColor: Colors.navbarBackgroundColor, width: "60%"}} onPress={this.onSearchByDayPress.bind(this)}>
                    <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
                  </TouchableOpacity>
                </View>
              )
              : null : null
            }
            <Content removeClippedSubviews={true}>
              {this.state.ngayContent}
            </Content>
            {
              this.state.calendarVisible ? (
                <DaySelect onDayChange={this.onDayChange.bind(this)} 
                  day={this.state.day} 
                  month={this.state.month}
                  year={this.state.year}
                  onMonthChange={this.onMonthChange.bind(this)}
                  onYearChange={this.onYearChange.bind(this)}
                  onCancel={this.onCalendarCancel.bind(this)}
                  onOK={this.onCalendarOK.bind(this)}></DaySelect>
              ) : null
            }
            <View style={{paddingTop: 5, paddingBottom: 5, paddingLeft: 5, flexDirection : "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.navbarBackgroundColor}}>
              <CheckBox title={"Chọn tất cả"} checked={this.state.checkAll} containerStyle={styles.cbx}
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
              <View style={[s.editPopup.container, this.state.editPopupStyle.container]}>
                <View style={[s.editPopup.inner, this.state.editPopupStyle.inner]}>
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
                          <Text style={{color: "#ffffff"}}>{this.state.selectedItem.point}, 
                            Ngày {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "day")}/
                            {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "month")}/
                            {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "year")}
                          </Text>
                        </View>
                      </Item>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Họ và tên (pháp danh)</Label>
                        <Text style={s.editPopup.itemValue}>{this.hoTen}{this.phapDanh != "" ? this.phapDanh : ""}</Text>
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
                        <Label>Tốc độ niệm phật (số danh hiệu/ phút)</Label>
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
  dateTextBox: {
    backgroundColor: "#F1F1F1",
    padding: 8,
    flexDirection : "row",
    alignItems: "center"
  },
  dateTextBoxIcon: {
    marginLeft: 5
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
        width: "14.2%",
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
  },
  pickerText: {
    
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
        width: 100
      },
      labelLandscape: {
      }
    }
  },
};

export default TNXemTVOnline;