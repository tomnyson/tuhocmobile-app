import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item, Drawer, Textarea,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import IconEntypo from 'react-native-vector-icons/Entypo';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';
import { CheckBox } from 'react-native-elements';

// Our custom files and classes import
import TruongNhomSideBar from '../component/TruongNhomSideBar';
import ErrorMsg from '../component/ErrorMsg';
import Text from '../component/Text';
import Label from '../component/Label';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import FooterTabTruongNhom from "../component/FooterTabTruongNhom";
import FooterTabThanhVien from "../component/FooterTabThanhVien";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import Storage from "../storage/index";

const { width, height } = Dimensions.get('window');

class TNChinhSuaProfileTV extends Component {
  constructor(props) {
    super(props);

    this.state = {
      spinner: true,
      userMenuVisible: false,
      user: {},
      city: "",
      cityElements: [<Picker.Item key={"city00"} label="Lựa chọn" value={""} />],
      district: "",
      districtElements: [<Picker.Item key={"district00"} label="Lựa chọn" value={""} />],
      ward: "",
      wardElements: [<Picker.Item key={"ward00"} label="Lựa chọn" value={""} />],
      ngheNghiep: "",
      ngheNghiepElements: [<Picker.Item key={"nghe00"} label="Lựa chọn" value={""} />],
      thoiGianRanh: "",
      thoiGianRanhElements: [<Picker.Item key={"tgr00"} label="Lựa chọn" value={""} />],
      orientation: "",
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    Orientation.getOrientation(((err, orientation) => {
      this.setState({orientation: orientation});
    }).bind(this));
    this.thanhVien = this.props.navigation.getParam('thanhVien', {});
  }

  async componentDidMount() {
    this._orientationDidChange = this.orientationDidChange.bind(this);
    Orientation.addOrientationListener(this._orientationDidChange);

    var user = this.thanhVien;
    if (user.ngaySinh != null) {
      user.DayOfBirth = funcs.getValueFromServerDate(user.ngaySinh, "day");
      user.MonthOfBirth = funcs.getValueFromServerDate(user.ngaySinh, "month");
      user.YearOfBirth = funcs.getValueFromServerDate(user.ngaySinh, "year");
    }
    
    this.setState({
      city: user.maTinhThanh,
      district: user.maQuanHuyen,
      ward: user.maPhuongXaTT
    });

    user.tocDoNiemPhat = user.tocDoNiemPhat.toString();
    this.setState({user: user});

    await this.getCities_ThoiGianRanhs_NgheNghieps();
    this.renderCities();
    await this.renderDistricts(user.maTinhThanh, true);
    await this.renderWards(user.maQuanHuyen, true);
    this.renderNgheNghieps();
    this.renderThoiGianRanhs();

    this.setState({spinner: false});
  }

  async getCities_ThoiGianRanhs_NgheNghieps() {
    this.listCities = [];
    this.listNgheNghieps = [];
    this.listThoiGianRanhs = [];

    let result = await api.getCities_ThoiGianRanhs_NgheNghieps();
    
    if (result.code === 200) {
      var data = result.data;
      this.listCities = data.tinhThanhs;
      this.listNgheNghieps = data.ngheNghieps;
      this.listThoiGianRanhs = data.thoiGianRanhs;
    } else {
      funcs.showMsg(result.message);
    }
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
      <UserMenuDropdown onPressOut={this.onUserMenuClick.bind(this)}/>
    );
  }

  renderNgheNghieps() {
    let ngheNghiepElements = []
    let arr = this.listNgheNghieps;

    ngheNghiepElements.push(
      <Picker.Item key={"nghe00"} label="Lựa chọn" value={""} />
    );
    for (var i = 0; i < arr.length; ++i) {
      let item = arr[i];

      ngheNghiepElements.push(
        <Picker.Item key={"nghe" + i} label={item.name} value={item.value} />
      );
    }

    this.setState({
      ngheNghiepElements: ngheNghiepElements
    });
  }

  renderThoiGianRanhs() {
    let thoiGianRanhElements = []
    let arr = this.listThoiGianRanhs;

    thoiGianRanhElements.push(
      <Picker.Item key={"tgr00"} label="Lựa chọn" value={""} />
    );
    for (var i = 0; i < arr.length; ++i) {
      let item = arr[i];

      thoiGianRanhElements.push(
        <Picker.Item key={"tgr" + i} label={item.name} value={item.value} />
      );
    }

    this.setState({
      thoiGianRanhElements: thoiGianRanhElements
    });
  }

  renderCities() {
    let cityElements = []
    let arr = this.listCities;

    cityElements.push(
      <Picker.Item key={"city00"} label="Lựa chọn" value={""} />
    );
    for (var i = 0; i < arr.length; ++i) {
      let item = arr[i];

      cityElements.push(
        <Picker.Item key={"city" + i} label={item.name} value={item.matp} />
      );
    }

    this.setState({
      cityElements: cityElements
    });
  }

  async onCityChange (value) {
    this.setState({
      city : value,
      district: "",
      wardElements: [<Picker.Item key={"ward00"} label="Lựa chọn" value={""} />],
      errorCity: null
    });

    await this.renderDistricts(value);
  }

  async renderDistricts(city, fromDidMount) {
    let districtElements = []
    let arr = [];

    districtElements.push(
      <Picker.Item key={"district00"} label="Lựa chọn" value={""} />
    );

    if (city != null && city.toString() != "") {
      if (!fromDidMount) {
        this.setState({spinner: true});
      }

      let result = await api.getDistrictsByCity(city);
    
      if (result.code === 200) {
        if (result.data.listQuanHuyen) {
          arr = result.data.listQuanHuyen;
        }
      } else {
        funcs.showMsg(result.message);
      }

      for (var i = 0; i < arr.length; ++i) {
        let item = arr[i];
  
        districtElements.push(
          <Picker.Item key={"district" + i} label={item.name} value={item.maqh} />
        );
      }

      if (!fromDidMount) {
        setTimeout((function(){
          this.setState({spinner: false});
        }).bind(this), 1000);
      }
    }

    this.setState({
      districtElements: districtElements
    });
  }

  async onDistrictChange (value) {
    this.setState({
      district : value,
      errorDistrict: null
    });
    
    await this.renderWards(value);
  }

  async renderWards(district, fromDidMount) {
    let wardElements = []
    let arr = [];
    
    wardElements.push(
      <Picker.Item key={"ward00"} label="Lựa chọn" value={""} />
    );

    if (district != null && district.toString() != "") {
      if (!fromDidMount) {
        this.setState({spinner: true});
      }

      let result = await api.getWardsByDistrict(district);
    
      if (result.code === 200) {
        if (result.data.listXaPhuongTT) {
          arr = result.data.listXaPhuongTT;
        }
      } else {
        funcs.showMsg(result.message);
      }
      
      for (var i = 0; i < arr.length; ++i) {
        let item = arr[i];
  
        wardElements.push(
          <Picker.Item key={"ward" + i} label={item.name} value={item.xaid} />
        );
      }

      if (!fromDidMount) {
        setTimeout((function(){
          this.setState({spinner: false});
        }).bind(this), 1000);
      }
    }

    this.setState({
      wardElements: wardElements
    });
  }

  onWardChange (value) {
    this.setState({
      ward : value,
      errorWard: null
    });
  }

  avatarPress() {
    return;
    let options = {
      title: 'Lựa chọn Avatar',
      //takePhotoButtonTitle: '', // specify null or empty string to remove this button
      storageOptions: {
        skipBackup: true,
        path: 'images'
      },
      quality: 1
    };

    ImagePicker.showImagePicker(options, ((response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
      } else {
        this.uploadAvatar(response);
      }
    }).bind(this));
  }

  uploadAvatar(file) {
    if (this.unmounted) {
      return;
    }

    var user = this.state.user;
    user.Avatar = file.data;
    this.setState({user: user});
  }

  async save() {
    var valid = true;

    var user = this.state.user;
    if (user.email == null || user.email.trim() == "" || !funcs.isEmail(user.email)) {
      this.setState({
        errorEmail: "Địa chỉ email không hợp lệ"
      });
      valid = false;
    }

    if (this.state.user.tocDoNiemPhat.trim() == "") {
      valid = false;
      this.setState({errorTocDoNiemPhat: "Hãy nhập tốc độ nhiệm phật"});
    }

    if (!valid) {
      return;
    }

    user.ngaySinh = user.YearOfBirth + "-" + user.MonthOfBirth + "-" + user.DayOfBirth;
    if (isNaN(Date.parse(user.ngaySinh))) {
      user.ngaySinh = null;
    }

    user.tinhThanh = this.state.city;
    user.quanHuyen = this.state.district;
    user.xaPhuongTT = this.state.ward;

    if (user.tinhThanh == null) {
      user.tinhThanh = "";
    }

    if (user.quanHuyen == null) {
      user.quanHuyen = "";
    }

    if (user.xaPhuongTT == null) {
      user.xaPhuongTT = "";
    }

    if (user.duongNha == null) {
      user.duongNha = "";
    }

    this.setState({spinner: true});
    let result = await api.saveProfile(user);

    if (result.code === 200) {
      var data = result.data;
      if (data.success) {
        funcs.showMsg(this.app.settings.luuThanhCong);
        funcs.back();
      } else {
        funcs.showMsg(data.message);  
        this.setState({spinner: false});
      }
    } else {
      funcs.showMsg(result.message);
      this.setState({spinner: false});
    }
  }

  onHoTenChange(value) {
    var user = this.state.user;
    user.hoTen = value;
    this.setState({user: user});
  }

  onPhapDanhChange(value) {
    var user = this.state.user;
    user.phapDanh = value;
    this.setState({user: user});
  }

  onDuongNhaChange(value) {
    var user = this.state.user;
    user.duongNha = value;
    this.setState({user: user});
  }

  onTocDoNiemPhatChange(value) {
    var user = this.state.user;
    user.tocDoNiemPhat = value;
    this.setState({user: user, errorTocDoNiemPhat: null});
  }

  onNgheNghiepChange(value) {
    var user = this.state.user;
    user.ngheNghiep = value;
    this.setState({user: user});
  }

  onMoTaCongViecChange(value) {
    var user = this.state.user;
    user.moTaCongViec = value;
    this.setState({user: user});
  }

  onThoiGianRanhChange(value) {
    var user = this.state.user;
    user.thoiGianRanh = value;
    this.setState({user: user});
  }

  onEmailChange(value) {
    this.setState({errorEmail: null});
    var user = this.state.user;
    user.email = value;
    this.setState({user: user});
  }

  onDayOfBirthChange(value) {
    this.setState({errorDayOfBirth: null});

    var user = this.state.user;
    user.DayOfBirth = funcs.toNumberStr(value);
    if (user.DayOfBirth != "") {
      var val = parseInt(user.DayOfBirth);
      if (val == 0 || val > 31) {
        this.setState({errorDayOfBirth: "Ngày sinh không hợp lệ"});
        return;
      }
    }
    this.setState({user: user});
  }

  onMonthOfBirthChange(value) {
    this.setState({errorMonthOfBirth: null});

    var user = this.state.user;
    user.MonthOfBirth = funcs.toNumberStr(value);

    if (user.MonthOfBirth != "") {
      var val = parseInt(user.MonthOfBirth);
      if (val == 0 || val > 12) {
        this.setState({errorMonthOfBirth: "Tháng sinh không hợp lệ"});
        return;
      }
    }

    this.setState({user: user});
  }

  onYearOfBirthChange(value) {
    this.setState({errorYearOfBirth: null});

    var user = this.state.user;
    user.YearOfBirth = funcs.toNumberStr(value);

    if (user.YearOfBirth != "") {
      var val = parseInt(user.YearOfBirth);
      if (val == 0 || val > (new Date().getFullYear())) {
        this.setState({errorYearOfBirth: "Năm sinh không hợp lệ"});
        return;
      }
    }

    this.setState({user: user});
  }

  closeDrawer() {
    this.drawer._root.close();
  };

  openDrawer() { 
    this.drawer._root.open() ;
  };

  onOfflineChange() {
    var user = this.state.user;
    user.offline = !user.offline;
    this.setState({
      user: user
    });
  }

  render() {
    return(
      <Drawer ref={(ref) => { this.drawer = ref; }} content={<TruongNhomSideBar/>} onClose={this.closeDrawer.bind(this)}>
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Chỉnh Sửa Thông Tin Thành Viên</Text>  
            <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
          </View>
          <Content>
            <View style={s.avatarContainer}>
              <TouchableOpacity onPress={this.avatarPress.bind(this)}>
                <Thumbnail large source={this.state.user.Avatar ? 
                  {uri: 'data:image/jpeg;base64,' + this.state.user.Avatar}
                  : require("../assets/images/avatar.jpg")}/>
              </TouchableOpacity>
            </View>
            <Form>
              <Item stackedLabel disabled>
                <Label>Số điện thoại</Label>
                <Input disabled placeholderTextColor="gray" placeholder="Số điện thoại" value={this.state.user.soDienThoai}/>
              </Item>
              <Item stackedLabel>
                <Label>Họ và tên</Label>
                <Input placeholderTextColor="gray" placeholder="Họ và tên" value={this.state.user.hoTen} onChangeText={this.onHoTenChange.bind(this)}/>
              </Item>
              <Item stackedLabel>
                <Label>Pháp danh</Label>
                <Input placeholderTextColor="gray" placeholder="Pháp danh" value={this.state.user.phapDanh} onChangeText={this.onPhapDanhChange.bind(this)}/>
              </Item>
              <Item stackedLabel>
                <Label>Email</Label>
                <Input placeholderTextColor="gray" placeholder="Email" value={this.state.user.email} onChangeText={this.onEmailChange.bind(this)}/>
              </Item>
              <ErrorMsg style={[this.state.errorEmail ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorEmail}
              </ErrorMsg>
              <Item stackedLabel style={{borderBottomWidth: 0}}>
                <Label>Ngày tháng năm sinh</Label>
                <View style={s.birth}>
                  <Input onChangeText={this.onDayOfBirthChange.bind(this)} keyboardType="numeric" maxLength={2} placeholderTextColor="gray" placeholder="Ngày" value={this.state.user.DayOfBirth} style={s.birthTbx}/>
                  <Text>{" "}</Text>
                  <Input onChangeText={this.onMonthOfBirthChange.bind(this)} keyboardType="numeric" maxLength={2} placeholderTextColor="gray" placeholder="Tháng" value={this.state.user.MonthOfBirth} style={s.birthTbx}/>
                  <Text>{" "}</Text>
                  <Input onChangeText={this.onYearOfBirthChange.bind(this)} keyboardType="numeric" maxLength={4} placeholderTextColor="gray" placeholder="Năm" value={this.state.user.YearOfBirth} style={s.birthTbx}/>
                </View>
              </Item>
              <ErrorMsg style={[this.state.errorDayOfBirth ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorDayOfBirth}
              </ErrorMsg>
              <ErrorMsg style={[this.state.errorMonthOfBirth ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorMonthOfBirth}
              </ErrorMsg>
              <ErrorMsg style={[this.state.errorYearOfBirth ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorYearOfBirth}
              </ErrorMsg>
              <Card>
                <CardItem header bordered>
                  <Text>Địa chỉ</Text>
                </CardItem>
                <CardItem bordered>
                  <Item stackedLabel style={[s.itemDropbox]}>
                    <Label>Tỉnh/TP</Label>
                    <Picker
                    headerStyle={s.pickerText}
                    textStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Tỉnh/TP"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.dropbox}
                    selectedValue={this.state.city}
                    onValueChange={this.onCityChange.bind(this)}
                    >
                      {this.state.cityElements}
                    </Picker>
                  </Item>
                  <ErrorMsg style={[this.state.errorCity ? {} : styles.displayNone, s.errorMsg]}>
                    {this.state.errorCity}
                  </ErrorMsg>
                </CardItem>
                <CardItem bordered>
                  <Item stackedLabel style={[s.itemDropbox]}>
                    <Label>Quận/Huyện</Label>
                    <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Quận/Huyện"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.dropbox}
                    selectedValue={this.state.district}
                    onValueChange={this.onDistrictChange.bind(this)}
                    >
                      {this.state.districtElements}
                    </Picker>
                  </Item>
                  <ErrorMsg style={[this.state.errorDistrict ? {} : styles.displayNone, s.errorMsg]}>
                    {this.state.errorDistrict}
                  </ErrorMsg>
                </CardItem>
                <CardItem bordered>
                  <Item stackedLabel style={[s.itemDropbox]}>
                    <Label>Phường/Xã</Label>
                    <Picker
                    headerStyle={s.pickerText}
                    mode="dropdown"
                    iosHeader="Phường/Xã"
                    iosIcon={<Icon name="ios-arrow-down" />}
                    style={s.dropbox}
                    selectedValue={this.state.ward}
                    onValueChange={this.onWardChange.bind(this)}
                    >
                      {this.state.wardElements}
                    </Picker>
                  </Item>
                  <ErrorMsg style={[this.state.errorWard ? {} : styles.displayNone, s.errorMsg]}>
                    {this.state.errorWard}
                  </ErrorMsg>
                </CardItem>
                <CardItem bordered>
                  <Item stackedLabel>
                    <Label>Số nhà, tên đường</Label>
                    <Input placeholderTextColor="gray" placeholder="Số nhà, tên đường" value={this.state.user.duongNha} onChangeText={this.onDuongNhaChange.bind(this)}/>
                  </Item>
                </CardItem>
              </Card>
              <Item stackedLabel style={[s.itemDropbox]}>
                <Label>Nghề nghiệp</Label>
                <Picker
                headerStyle={s.pickerText}
                textStyle={s.pickerText}
                mode="dropdown"
                iosHeader="Nghề nghiệp"
                iosIcon={<Icon name="ios-arrow-down" />}
                style={s.dropbox}
                selectedValue={this.state.user.ngheNghiep}
                onValueChange={this.onNgheNghiepChange.bind(this)}
                >
                  {this.state.ngheNghiepElements}
                </Picker>
              </Item>
              <Item>
                <Textarea rowSpan={5} bordered value={this.state.user.moTaCongViec} onChangeText={this.onMoTaCongViecChange.bind(this)}
                  placeholder="Mô tả cụ thể hơn về công việc hàng ngày của bạn, để chúng tôi xác định chính xác hơn về thời gian rãnh trung bình của bạn" />
              </Item>
              <Item stackedLabel style={[s.itemDropbox]}>
                <Label>Thời gian rãnh</Label>
                <Picker
                headerStyle={s.pickerText}
                textStyle={s.pickerText}
                mode="dropdown"
                iosHeader="Thời gian rãnh"
                iosIcon={<Icon name="ios-arrow-down" />}
                style={s.dropbox}
                selectedValue={this.state.user.thoiGianRanh}
                onValueChange={this.onThoiGianRanhChange.bind(this)}
                >
                  {this.state.thoiGianRanhElements}
                </Picker>
              </Item>
              <Item stackedLabel>
                <Label>Tốc độ niệm phật (số danh hiệu/ phút)</Label>
                <Input keyboardType="numeric" maxLength={2} placeholderTextColor="gray" placeholder="số danh hiệu/ phút" value={this.state.user.tocDoNiemPhat} onChangeText={this.onTocDoNiemPhatChange.bind(this)}/>
              </Item>
              <ErrorMsg style={[this.state.errorTocDoNiemPhat ? {} : styles.displayNone, s.errorMsg]}>
                  {this.state.errorTocDoNiemPhat}
              </ErrorMsg>
              <Item>
                <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: 10, alignItems: "center"}}>
                  <CheckBox title='Offline' checked={this.state.user.offline} checkedColor={Colors.navbarBackgroundColor} onPress={this.onOfflineChange.bind(this)}/>
                </View>
              </Item>
              <Button style={[s.button, s.item]} full rounded onPress={this.save.bind(this)}>
                <Text style={s.buttonText}>Lưu</Text>
              </Button>
            </Form>
          </Content>
          {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
          <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor}/>
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
  avatarContainer: {
    alignItems: "center",
    backgroundColor: "#F7F7F7", 
    height: 100, 
    flexDirection: "row", 
    justifyContent: "center"
  },
  birth: {
    flexDirection : "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  birthTbx: {
    borderBottomWidth: 1,
    borderBottomColor: "gray"
  },
  item: {
    marginLeft: 20,
    marginRight: 20
  },
  itemDropbox: {
    width: "100%"
  },
  button: {
    backgroundColor: Colors.navbarBackgroundColor,
    marginTop: 30,
    marginBottom: 10
  },
  buttonText: {
    color: Colors.buttonColor
  },
  errorMsg: {
    marginLeft: 15
  },
  pickerText: {
    
  },
  dropbox: {
    width: "100%"
  },
};

export default TNChinhSuaProfileTV;