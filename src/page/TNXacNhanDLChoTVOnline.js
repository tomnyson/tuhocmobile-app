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

class TNXacNhanDLChoTVOnline extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,

      monthFilter: "",
      weekFilter: "",
      orientation: "",

      monthFilterElements: [],
      weekFilterElements: [],
      showFilterPanel: true,
      tuanContent: null
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
    this.renderDropboxMonthFilter(this.weeksInMonths);
    this.renderWeekFilter(this.initWeeksRange.toWeek.month);
    await this.onSearchPress();
    this.setState({spinner: false});
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

    if (orientation == "LANDSCAPE") {
      this.setState({showFilterPanel: false});  
    }

    this.renderTuanContent(this.listRows);
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

  onFilterIconClick() {
    this.setState({showFilterPanel: !this.state.showFilterPanel});
  }

  async onSearchPress() {
    this.setState({spinner: true});
    var result = await api.getTrNhXacNhanDuLieu({
      id: this.app.loginInfo.id,
      month: this.state.monthFilter,
      week: this.state.weekFilter
    });
    if (result.code === 200) {
        var data = result.data;
        if (data.success) {
          this.listRows = data.results;
          this.fromDate = data.fromDate;
          this.toDate = data.toDate;
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
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.headerColumn, {width: "75%"}]}>
                <Text style={[s.theoNgay.table.headerText]}>Họ và Tên (Pháp Danh)</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
                <Text style={[s.theoNgay.table.headerText]}>Tình Trạng</Text>
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

  getJSXRowPORTRAIT(i, item, chan) {
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";
    return [
        <View key={"item0" + i} style={[s.theoNgay.table.itemContainer, chan ? styles.chan : styles.le]}>
            <View style={[s.theoNgay.table.headerStyle, s.theoNgay.table.bodyColumn, {width: "75%"}]}>
              <Text style={[s.theoNgay.table.itemText]}>{item.hoTen}{phapDanh}</Text>
            </View>
            <View style={[s.theoNgay.table.headerWidth]}>
              <TouchableOpacity onPress={() => funcs.goTo("TNXemTVOnline", {id: item.id, hoTen: item.hoTen, phapDanh: phapDanh, fromDate: this.fromDate, toDate: this.toDate})}>
                <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.tinhtrang}</Text>
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
                <Text style={[s.theoNgay.table.headerText]}>Tình Trạng</Text>
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
                <Text style={[s.theoNgay.table.headerText]}>TG Rãnh</Text>
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
            <TouchableOpacity onPress={() => funcs.goTo("TNXemTVOnline", {id: item.id, hoTen: item.hoTen, phapDanh: phapDanh, fromDate: this.fromDate, toDate: this.toDate})}>
              <Text style={[s.theoNgay.table.itemText, styles.actionText]}>{item.tinhtrang}</Text>
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

  render() {
    return(
        <Container>
            <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
            <View style={[s.header.container]}>
                <Button transparent onPress={()=>funcs.back()}>
                  <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
                </Button>
                <Text style={styles.headerText}>Xem Danh Sách Thành Viên</Text>
                <View>
                  <TouchableOpacity style={s.containerIconFilter} onPress={this.onFilterIconClick.bind(this)}>
                    <IconAntDesign name="filter" style={s.iconFilter}/>
                  </TouchableOpacity>
                </View>
            </View>
            <Segment style={{backgroundColor: Colors.buttonColor, borderWidth: 1, borderColor: Colors.navbarBackgroundColor}}>
              <Button style={[s.segmentButton, s.segmentButtonActive]}
                first active={true} >
                <Text style={[s.segmentTextActive]}>Theo tuần</Text>
              </Button>
              <Button style={[s.segmentButton]} onPress={() => funcs.goToWithoutPushStack("TNXemTVDaNhapSai")}>
                <Text>Đã nhập sai</Text>
              </Button>
              <Button style={[s.segmentButton]} last onPress={() => funcs.goToWithoutPushStack("TNXemTVDaSuaLai")}>
                <Text>Đã sửa lại</Text>
              </Button>
            </Segment>
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
                <TouchableOpacity style={{borderRadius: 10, padding: 10, backgroundColor: Colors.navbarBackgroundColor, width: "15%"}} onPress={this.onSearchPress.bind(this)}>
                    <Text style={{color: Colors.buttonColor, width: "100%", textAlign: "center"}}>Xem</Text>
                </TouchableOpacity>
            </View>
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
            width: 100,
            marginLeft: 10,
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
            width: "16.6%",
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

export default TNXacNhanDLChoTVOnline;