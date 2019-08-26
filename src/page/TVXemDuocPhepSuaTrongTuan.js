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
import Text from '../component/Text';
import Label from '../component/Label';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import FooterTabThanhVien from "../component/FooterTabThanhVien";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import DaySelect from "../component/DaySelect";
import ErrorMsg from '../component/ErrorMsg';
import PopupContainer from '../component/PopupContainer';

const { width, height } = Dimensions.get('window');

class TVXemDuocPhepSuaTrongTuan extends Component {
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
      ngayContent: null,
     
      orientation: "",
      editPopupVisible: false,

      thoiGianNghePhap: "",
      thoiGianTungKinh: "",
      thoiGianRanh: "",
      soLuongDanhHieu: "",
      tocDoNiemPhat: "",
      congPhuNgayId: 0,

      sendRequestEditPopupVisible: false,
      isShowForm: false,
      hadSendRequest: false
    };

    this.weeksInMonths = [];
  }

  componentWillMount() {
    this.app = store.getState().app;
    
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));

    this.fromDate = this.props.navigation.getParam('fromDate', '');
    this.toDate = this.props.navigation.getParam('toDate', '');
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);
    await this.renderNgayContent();
    this.setState({spinner: false});
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
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

  async getDataTheoNgay() {
    var result = await api.getCongPhuTheoNgay({
      idThanhVien: this.app.loginInfo.id,
      tuNgay: this.fromDate,
      toiNgay: this.toDate
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
          <Text style={[s.theoNgay.table.headerText]}>Từ ngày{"\n"}{funcs.getValueFromServerDate(this.fromDate, "day")} - Thg {funcs.getValueFromServerDate(this.fromDate, "month")}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Thời gian nghe pháp</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Thời gian tụng kinh</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.headerText]}>Số lượng danh hiệu</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth]}>
          <Text style={[s.theoNgay.table.headerText]}>Trưởng Nhóm Xác Nhận</Text>
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
            <Text style={[s.theoNgay.table.itemText]}>{results.totalSoLuongDH}</Text>
          </View>
          <View style={[s.theoNgay.table.headerWidth]}>
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
    var onPress = (function() {
      if (item.isShowForm) {
        this.showSendRequestEditPopup(item.id);
      } else {
        this.showEditPopup(item.id);
      }
    }).bind(this);

    return (
      <View key={"item" + i} style={[s.theoNgay.table.itemContainer]}>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <TouchableOpacity onPress={onPress}>
            <Text style={[s.theoNgay.table.itemText, item.hadSendRequest ? styles.actionTextBlue : styles.actionText]}>{item.point}</Text>
          </TouchableOpacity>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.tgNghePhap}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.tgTungKinh}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth, s.theoNgay.table.headerColumn]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.soLuongDH}</Text>
        </View>
        <View style={[s.theoNgay.table.headerWidth]}>
          <Text style={[s.theoNgay.table.itemText]}>{item.trNhXacNhan}</Text>
        </View>
      </View>
    );
  }

  async onSearchByDayPress() {
    this.setState({spinner: true});
    await this.renderNgayContent();
    this.setState({spinner: false});
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
      editPopupVisible: true,
      selectedItem: item,
      congPhuNgayId: item.id,
      thoiGianNghePhap: item.tgNghePhap.toString(),
      thoiGianTungKinh: item.tgTungKinh.toString(),
      soLuongDanhHieu: item.soLuongDH.toString(),
      thoiGianRanh: item.thoiGianRanh.toString(),
      tocDoNiemPhat: item.tocDoNiemPhat.toString()
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
    var result = await api.updateCongPhuById({
      id: this.state.congPhuNgayId,
      TGNghePhap: this.state.thoiGianNghePhap,
      TGTungKinh: this.state.thoiGianTungKinh,
      SoLuongDH: this.state.soLuongDanhHieu,
      thoiGianRanh: this.state.thoiGianRanh,
      tocDoNiemPhat: this.state.tocDoNiemPhat
    });

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

  showSendRequestEditPopup(id) {
    var item = this.getRowDataTheoNgay(id);

    if (item == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }

    this.setState({
      sendRequestEditPopupVisible: true,
      selectedItem: item,
      congPhuNgayId: item.id,
      thoiGianNghePhap: item.tgNghePhap.toString(),
      thoiGianTungKinh: item.tgTungKinh.toString(),
      soLuongDanhHieu: item.soLuongDH.toString(),
      thoiGianRanh: item.thoiGianRanh.toString(),
      tocDoNiemPhat: item.tocDoNiemPhat.toString(),
      hadSendRequest: item.hadSendRequest
    });
  }

  hideSendRequestEditPopup() {
    this.setState({
      sendRequestEditPopupVisible: false
    });
  }

  async sendRequestEdit() {
    this.setState({spinner: true});

    var result = await api.yeuCauDuocSuaGui({
      IDCongPhu: this.state.selectedItem.id,
      IDTHanhVien: this.app.loginInfo.id
    });

    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        funcs.showMsg("Gửi yêu cầu thành công");
        await this.renderNgayContent();
        this.hideSendRequestEditPopup();
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
            <View style={[s.header.container, (this.state.orientation == "PORTRAIT" || this.state.orientation == "PORTRAITUPSIDEDOWN" || this.state.orientation == "UNKNOWN") ? {} : styles.displayNone]}>
                <Button transparent onPress={()=>funcs.back()}>
                  <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
                </Button>
                <Text style={styles.headerText}>Được Phép Chỉnh Sửa</Text>
                <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
            </View>
          
            <Content removeClippedSubviews={true}>
                {this.state.ngayContent}
            </Content>
          
            {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
          
            {this.state.editPopupVisible 
            ? 
            (
              <PopupContainer onKeyboard={this.onKeyboard.bind(this)} style={[s.editPopup.container, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.container : this.originEditPopupStyle.container]}>
                <View style={[s.editPopup.inner, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.inner : this.originEditPopupStyle.inner, this.state.isHeightHalf ? styles.heightHalf : {}]}>
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
                                <Text style={{color: "#ffffff"}}>
                                  {this.state.selectedItem.point},
                                  Ngày {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "day")}/
                                  {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "month")}/
                                  {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "year")}
                                </Text>
                            </View>
                        </Item>
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

            {this.state.sendRequestEditPopupVisible 
              ? 
              (
                <PopupContainer onKeyboard={this.onKeyboard.bind(this)} style={[s.editPopup.container, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.container : this.originEditPopupStyle.container, {zIndex: 30}]}>
                  <View style={[s.editPopup.inner, this.state.orientation == "LANDSCAPE" ? this.originEditPopupStyle.landscape.inner : this.originEditPopupStyle.inner, this.state.isHeightHalf ? styles.heightHalf : {}]}>
                    <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                      <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thông tin công phu</Text>
                      <TouchableOpacity onPress={this.hideSendRequestEditPopup.bind(this)} style={{paddingRight: 10}}>
                        <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                      </TouchableOpacity>
                    </View>
                    <Content>
                      <Form>
                        {
                          this.state.hadSendRequest ?
                          (
                            <Item style={s.editPopup.item}>
                              <Label style={styles.note}>{this.app.settings.hadSentRequestEditNote}</Label>
                            </Item>
                          )
                          : null
                        }
                        <Item style={s.editPopup.item}>
                          <View style={[{padding:5, backgroundColor: Colors.navbarBackgroundColor, width: "100%", marginTop: 10}]}>
                            <Text style={{color: "#ffffff"}}>{this.state.selectedItem.point}, Ngày {funcs.getValueFromServerDate(this.state.selectedItem.ngay, "day")}/{funcs.getValueFromServerDate(this.state.selectedItem.ngay, "month")}/{funcs.getValueFromServerDate(this.state.selectedItem.ngay, "year")}</Text>
                          </View>
                        </Item>
                        <Item stackedLabel style={s.editPopup.item}>
                          <Label>Thời gian nghe pháp</Label>
                          <Text style={[s.editPopup.itemText]}>{this.state.thoiGianNghePhap}</Text>
                        </Item>
                        <Item stackedLabel style={s.editPopup.item}>
                          <Label>Thời gian tụng kinh</Label>
                          <Text style={[s.editPopup.itemText]}>{this.state.thoiGianTungKinh}</Text>
                        </Item>
                        <Item stackedLabel style={s.editPopup.item}>
                          <Label>Số lượng danh hiệu</Label>
                          <Text style={[s.editPopup.itemText]}>{this.state.soLuongDanhHieu}</Text>
                        </Item>
                        <Item stackedLabel style={s.editPopup.item}>
                          <Label>Tốc độ niệm phật (số danh hiệu/ phút)</Label>
                          <Text style={[s.editPopup.itemText]}>{this.state.tocDoNiemPhat}</Text>
                        </Item>
                        <Item stackedLabel style={s.editPopup.item}>
                          <Label>Thời gian rãnh (tiếng)</Label>
                          <Text style={[s.editPopup.itemText]}>{this.state.thoiGianRanh}</Text>
                        </Item>
                        {
                          this.state.hadSendRequest ? null :
                          (
                            <Button style={[s.editPopup.button]} full rounded onPress={this.sendRequestEdit.bind(this)}>
                              <Text style={s.editPopup.buttonText}>Gửi yêu cầu được sửa lại</Text>
                            </Button>   
                          )
                        }

                        {
                          this.state.hadSendRequest ? null :
                          (
                            <Item style={s.editPopup.item}>
                              <Label style={styles.note}>{this.app.settings.thanhVienYeuCauChinhSua}</Label>
                            </Item>
                          )
                        }
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
    itemText: {
      textAlign: "left",
      width: "100%",
      paddingTop: 10,
      fontWeight: "bold"
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
      alignItems: "center",
      marginRight: 20
    },
    itemValue: {
      fontWeight: "bold"
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

export default TVXemDuocPhepSuaTrongTuan;