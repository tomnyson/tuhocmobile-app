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

class TNNhapDuLieuChoTVOffline extends Component {
  constructor(props) {
    super(props);

    this.originEditPopupStyle = {
      container: {
        width: width,
        height: height
      },
      inner: {
        width: width - 4,
        height: height - 80,
      },
      landscape: {
        container: {
          width: height,
          height: width
        },
        inner: {
          width: height - 4,
          height: width - 60,
        }
      }
    };

    this.state = {
      spinner: true,

      monthFilter: "",
      weekFilter: "",
      orientation: "",

      monthFilterElements: [],
      weekFilterElements: [],
      showFilterPanel: true,
      tuanContent: null,

      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",

      editPopupVisible: false,

      month: "",
      week: "",
      monthElements: [],
      weekElements: [],
      thanhVienId: "",
      thanhVienElements: []
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
    this.renderDropboxMonthFilter(this.weeksInMonths);
    this.renderWeekFilter(this.initWeeksRange.toWeek.month);
    await this.onSearchPress();
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
                toWeek: data.toWeek
            };

            this.weeksInMonths = data.weeks;

            this.setState({
                monthFilter: this.initWeeksRange.toWeek.month.toString(),
                weekFilter: this.initWeeksRange.toWeek.week.toString()
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
  }

  onMonthFilterChange (value) {
    this.setState({
      monthFilter : value,
      weekFilter: "1"
    });
    this.renderWeekFilter(value);
  }

  onWeekFilterChange (value) {
    this.setState({
        weekFilter : value
    });
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

  onThanhVienChange(value) {
    this.setState({
      thanhVienId : value,
      errorThanhVien: null
    });
  }

  renderDropboxMonthFilter(months) {
    let monthFilterElements = []
    
    for (var i = 0; i < months.length; ++i) {
      let item = months[i];

      monthFilterElements.push(
        <Picker.Item key={"month" + i} label={"Tháng " + item.month.toString()} value={item.month.toString()} />
      );
    }

    this.setState({
        monthFilterElements: monthFilterElements
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

  renderWeekFilter(month) {
    var numberOfWeeks = 0;
    for (var j = 0; j < this.weeksInMonths.length; ++ j) {
      if (this.weeksInMonths[j].month == parseInt(month)) {
        numberOfWeeks = this.weeksInMonths[j].week;
        break;
      }
    }

    let weekFilterElements = []
    
    for (var i = 1; i <= numberOfWeeks; ++i) {
      let item = i;

      weekFilterElements.push(
        <Picker.Item key={"week" + i} label={"Tuần " + item.toString()} value={item.toString()} />
      );
    }

    this.setState({
        weekFilterElements: weekFilterElements
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

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  async onSearchPress() {
    this.setState({spinner: true});
    var result = await api.getTrNhNhapDuLieu({
      id: this.app.loginInfo.id,
      month: this.state.monthFilter,
      week: this.state.weekFilter
    });
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
          this.listRows = data.list;
          this.renderTuanContent(data.list);
        } else {
          funcs.showMsg(data.message);  
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  renderThanhVienDropdownBox() {
    let thanhVienElements = []

    thanhVienElements.push(
      <Picker.Item key={"tv0"} label={"Thành viên"} value={""} />
    );
    
    for (var i = 0; i < this.listRows.length; ++i) {
      let item = this.listRows[i];

      thanhVienElements.push(
        <Picker.Item key={"tv" + i} 
          label={item.hoTen + (item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "")} 
          value={item.idThanhVien.toString()} />
      );
    }

    this.setState({
      thanhVienElements: thanhVienElements
    });
  }

  renderTuanContent(listRows) {
    this.setState({spinner: true});
    var arr = [];

    arr.push(
      <View key="header" style={[s.theoNgay.table.headerContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Họ và tên</Text>
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

    if (listRows.length > 0) {
      for(var i = 0; i < listRows.length; ++i) {
        var item = listRows[i];
        arr.push(this.getJSXRow(i, item));
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
    this.setState({spinner: false});
  }

  getJSXRow(i, item) {
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";
    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <TouchableOpacity style={{width: "100%"}} onPress={() => funcs.goTo("TNXemTVOffline", {id: item.idThanhVien, phapDanh: phapDanh, hoTen: item.hoTen})}>
            <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.hoTen}</Text>
            <Text style={{textAlign: "center"}}>{phapDanh}</Text>
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

  showAddNewPopup(id) {
    this.setState({
      editPopupVisible: true,
      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",
      tocDoNiemPhat: this.app.settings.tocDoNiemPhat.toString(),
      thanhVienId: "",
      month: this.state.monthFilter,
      week: this.state.weekFilter
    });

    this.renderDropboxMonth(this.weeksInMonths);
    this.renderWeek(this.state.monthFilter);
    this.renderThanhVienDropdownBox();
  }

  hideAddNewPopup() {
    this.setState({
      editPopupVisible: false
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

    if (this.state.thanhVienId.trim() == "") {
      valid = false;
      this.setState({errorThanhVien: "Hãy chọn thành viên"});
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
    var result = await api.saveTuan({
      TGNghePhap: this.state.thoiGianNghePhap,
      TGTungKinh: this.state.thoiGianTungKinh,
      SoLuongDH: this.state.soLuongDanhHieu,
      thoiGianRanh: this.state.thoiGianRanh,
      tocDoNiemPhat: this.state.tocDoNiemPhat,
      IDTHanhVien: this.state.thanhVienId,
      week: this.state.week,
      month: this.state.month
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        funcs.showMsg(this.app.settings.luuThanhCong);
        await this.onSearchPress();
      } 
    } else {
      funcs.showMsg(result.message);
    }

    this.setState({spinner: false});
    this.setState({editPopupVisible: false});
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Nhập dữ liệu cho TV offline</Text>
            <View>
              <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                  <IconAntDesign name="filter" style={s.iconFilter}/>
              </TouchableOpacity>
            </View>
          </View>
          {
              this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN"
              ? 
              [
                <View key="tfv1" style={[s.theoTuan.filter.container, this.state.showFilterPanel ? {} : styles.displayNone]}>
                  <Text style={[s.theoTuan.filter.label]}>Tuần</Text>
                  <View style={[styles.dropbox, {width: "35%"}]}>
                    <Picker
                      headerStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Tháng"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.theoTuan.filter.dropbox}
                      selectedValue={this.state.monthFilter}
                      onValueChange={this.onMonthFilterChange.bind(this)}
                      >
                        {this.state.monthFilterElements}
                    </Picker>
                  </View>
                  <View style={[styles.dropbox, {width: "32%"}]}>
                    <Picker
                      headerStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Tuần"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.theoTuan.filter.dropbox}
                      selectedValue={this.state.weekFilter}
                      onValueChange={this.onWeekFilterChange.bind(this)}
                      >
                        {this.state.weekFilterElements}
                    </Picker>
                  </View>
                </View>
              ]
              :
              [
                <View key="tfv1" style={[s.theoTuan.filter.container, this.state.showFilterPanel ? {} : styles.displayNone]}>
                  <Text style={[s.theoTuan.filter.labelLandscape, {marginLeft: 2}]}>Tuần</Text>
                  <View style={[styles.dropbox, {width: "20%"}]}>
                    <Picker
                      headerStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Tháng"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.theoTuan.filter.dropboxLandscape}
                      selectedValue={this.state.monthFilter}
                      onValueChange={this.onMonthFilterChange.bind(this)}
                      >
                        {this.state.monthFilterElements}
                    </Picker>
                  </View>
                  <View style={[styles.dropbox, {width: "20%"}]}>
                    <Picker
                      headerStyle={s.pickerText}
                      mode="dropdown"
                      iosHeader="Tuần"
                      iosIcon={<Icon name="ios-arrow-down" />}
                      style={s.theoTuan.filter.dropboxLandscape}
                      selectedValue={this.state.weekFilter}
                      onValueChange={this.onWeekFilterChange.bind(this)}
                      >
                        {this.state.weekFilterElements}
                    </Picker>
                  </View>
                  <TouchableOpacity style={{borderRadius: 10,padding: 10, backgroundColor: Colors.navbarBackgroundColor, marginRight: 2}} onPress={this.onSearchPress.bind(this)}>
                    <Text style={{color: Colors.buttonColor,textAlign: "center", paddingLeft: 10, paddingRight: 10}}>Xem</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{marginRight: 2, borderWidth: 1, borderRadius: 10, padding: 10, borderColor: Colors.navbarBackgroundColor}} onPress={this.showAddNewPopup.bind(this)}>
                    <Text style={{color: Colors.navbarBackgroundColor, textAlign: "center"}}>Thêm mới</Text>
                  </TouchableOpacity>
                </View>
              ]
            }

            {
                this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN"
                ?
                (
                  <View style={{flexDirection : "row", justifyContent: "center", marginTop: 5}}>
                      <TouchableOpacity style={{borderRadius: 10, padding: 10, backgroundColor: Colors.navbarBackgroundColor, width: "40%"}} onPress={this.onSearchPress.bind(this)}>
                          <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{marginLeft: 5, borderWidth: 1, borderRadius: 10, padding: 10, borderColor: Colors.navbarBackgroundColor, width: "40%"}} onPress={this.showAddNewPopup.bind(this)}>
                          <Text style={{color: Colors.navbarBackgroundColor, width: "100%", textAlign: "center"}}>Thêm mới</Text>
                      </TouchableOpacity>
                  </View>
                )
                : null
            }
            <Content removeClippedSubviews={true}>
              {this.state.tuanContent}
            </Content>
            {this.state.editPopupVisible 
            ? 
            (
              <PopupContainer onKeyboard={this.onKeyboard.bind(this)} style={[s.editPopup.container, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.container : this.originEditPopupStyle.container]}>
                <View style={[s.editPopup.inner, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.inner : this.originEditPopupStyle.inner, this.state.isHeightHalf ? styles.heightHalf : {}]}>
                  <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                    <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thêm công phu</Text>
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
                      <Item>
                        <View style={[styles.dropbox, {width: "100%"}]}>
                          <Picker
                            headerStyle={s.pickerText}
                            mode="dropdown"
                            iosHeader="Thành viên"
                            iosIcon={<Icon name="ios-arrow-down" />}
                            style={s.theoTuan.filter.dropbox}
                            selectedValue={this.state.thanhVienId}
                            onValueChange={this.onThanhVienChange.bind(this)}
                            >
                              {this.state.thanhVienElements}
                          </Picker>
                        </View>
                      </Item>
                      <ErrorMsg style={[this.state.errorThanhVien ? {} : styles.displayNone, s.errorMsg]}>
                        {this.state.errorThanhVien}
                      </ErrorMsg>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Thời gian nghe pháp<Text style={styles.required}>{" *"}</Text></Label>
                        <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={4} placeholder="(phút)" value={this.state.thoiGianNghePhap} onChangeText={this.onThoiGianNghePhapChange.bind(this)}/>
                      </Item>
                      <ErrorMsg style={[this.state.errorThoiGianNghePhap ? {} : styles.displayNone, s.errorMsg]}>
                        {this.state.errorThoiGianNghePhap}
                      </ErrorMsg>
                      <Item stackedLabel style={s.editPopup.item}>
                        <Label>Thời gian tụng kinh<Text style={styles.required}>{" *"}</Text></Label>
                        <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={4} placeholder="(phút)" value={this.state.thoiGianTungKinh} onChangeText={this.onThoiGianTungKinhChange.bind(this)}/>
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
                        <Input placeholderTextColor="gray" keyboardType="numeric" maxLength={3} placeholder="(số danh hiệu/ phút)" value={this.state.tocDoNiemPhat} onChangeText={this.onTocDoNiemPhatChange.bind(this)}/>
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
            marginLeft: 10,
            marginRight: 10,
            width: 60
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

export default TNNhapDuLieuChoTVOffline;