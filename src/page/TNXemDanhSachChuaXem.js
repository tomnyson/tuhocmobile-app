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

const { width, height } = Dimensions.get('window');

class TNXemDanhSachChuaXem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      orientation: "",
      
      showFilterPanel: true,
      tuanContent: null,

      fromMonth: "",
      fromWeek: "",
      toMonth: "",
      toWeek: "",

      fromMonthElements: [],
      toMonthElements: [],

      fromWeekElements: [],
      toWeekElements: [],
    };
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

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.getInitDateRanges();
    this.renderDropboxsMonth();
    await this.onSearchByWeekPress();
    this.setState({spinner: false});
  }

  async getInitDateRanges() {
    var result = await api.getInitDateRanges();
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
            this.weeksInMonths = data.weeks;

            this.initWeeksRange = {
                toMonth: data.initTuanChuaXem.toThang,
                fromMonth: data.initTuanChuaXem.fromThang,
                toWeek: data.initTuanChuaXem.toTuan,
                fromWeek: data.initTuanChuaXem.fromTuan
            };

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

    this.renderTuanContent(this.listRows);
  }

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  async onSearchByWeekPress() {
    this.setState({spinner: true});
    var result = await api.getDSTuanChuaXem({
        idThanhVien: this.app.loginInfo.id,
        FromTuan: this.state.fromWeek,
        FromThang: this.state.fromMonth,
        ToTuan: this.state.toWeek,
        ToThang: this.state.toMonth
    });
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
          this.listRows = data.results;
          this.renderTuanContent(this.listRows);
        } else {
          funcs.showMsg(data.message);  
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  renderTuanContent(listRows) {
      if (typeof listRows == "undefined" || listRows == null) {
          return;
      }

      if (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN") {
        this.renderTuanContentPORTRAIT(listRows);
      } else {
        this.renderTuanContentLANDSCAPE(listRows);
      }
  }

  renderTuanContentPORTRAIT(listRows) {
    var arr = [];

    arr.push(
        <View key="header1" style={[s.theoNgay.table.headerContainer, s.theoNgay.table.headerContainerMargin, {backgroundColor: Colors.navbarBackgroundColor}]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "50%"}]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp Danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "25%"}]}>
                <Text style={[s.theoNgay.table.headerText]}>Tuần</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
                <Text style={[s.theoNgay.table.headerText]}>Số Ngày Chưa Xem</Text>
            </View>
        </View>
    );

    arr.push(
        <View key="header2" style={[s.theoNgay.table.headerContainer, {backgroundColor: Colors.navbarBackgroundColor}]}>
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
    funcs.goTo("TNXemTVOnline", {id: item.id, hoTen: item.hoTen, phapDanh: phapDanh, fromDate: item.fromDate, toDate: item.toDate});
  }

  getJSXRowPORTRAIT(i, item, chan) {
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";
    return [
        <View key={"item0" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "50%"}]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.hoTen}{phapDanh}</Text>
            </View>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "25%"}]}>
              <Text style={[s.theoNgay.table.itemText]}>Tuần {item.week}{"\n"}Tháng {item.month}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
            <TouchableOpacity onPress={()=>this.goTo(item, phapDanh)}>
                <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.soNgayChXem} Ngày CXem</Text>
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
        <View key="header" style={[s.theoNgay.table.headerContainer, {backgroundColor: Colors.navbarBackgroundColor, marginTop: 2}]}>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Tuần</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.headerColumn]}>
                <Text style={[s.theoNgay.table.headerText]}>Số Ngày Chưa Xem</Text>
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
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
            <Text style={[s.theoNgay.table.itemText]}>Tuần {item.week}{"\n"}Tháng {item.month}</Text>    
          </View>
          <View style={[s.theoNgay.table.headerWidthLandscape, s.theoNgay.table.bodyColumn]}>
            <TouchableOpacity onPress={()=>this.goTo(item, phapDanh)}>
                <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.soNgayChXem} Ngày CXem</Text>
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
      fromMonth: this.initWeeksRange.fromMonth.toString(),
      fromWeek: this.initWeeksRange.fromWeek.toString(),
      toMonth: this.initWeeksRange.toMonth.toString(),
      toWeek: this.initWeeksRange.toWeek.toString()
    });

    this.renderFromMonth(this.weeksInMonths);
    this.renderFromWeek(this.initWeeksRange.fromMonth);

    this.renderToMonth(this.weeksInMonths);
    this.renderToWeek(this.initWeeksRange.toMonth);
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

  render() {
    return(
        <Container>
            <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
            <View style={[s.header.container]}>
                <Button transparent onPress={()=>funcs.back()}>
                  <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
                </Button>
                <Text style={styles.headerText}>Danh Sách Tuần Chưa Xem</Text>
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
                    <Text style={[s.theoTuan.filter.labelLandscape, {marginLeft: 2}]}>Từ</Text>
                    <View style={[styles.dropbox, {width: "19%"}]}>
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
                    <View style={[styles.dropbox, {width: "18%"}]}>
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
                    <Text style={[s.theoTuan.filter.labelLandscape]}>Đến</Text>
                    <View style={[styles.dropbox, {width: "19%"}]}>
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
                    <View style={[styles.dropbox, {width: "18%"}]}>
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
          marginLeft: 2
        },
        labelLandscape: {
            marginLeft: 2,
        }
    }
  },
  pickerText: {
    
  },
  theoNgay: {
    table: {
        headerContainerMargin: {
            marginTop: 5
        },
        headerContainer: {
            flexDirection : "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            borderWidth: 1,
            borderColor: Colors.statusBarColor,
            backgroundColor: Colors.buttonColor
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
            width: "25%",
            alignItems: "center",
            justifyContent: "center"
        },
        headerWidthLandscape: {
            flexDirection : "row",
            width: "14.2%",
            alignItems: "center",
            justifyContent: "center"
        },
        headerStyle: {
            flexDirection : "row",
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
};

export default TNXemDanhSachChuaXem;