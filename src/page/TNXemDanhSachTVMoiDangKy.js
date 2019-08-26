import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio, TextInput, Alert } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';

// Our custom files and classes import
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

class TNXemDanhSachTVMoiDangKy extends Component {
  constructor(props) {
    super(props);

    this.thanhVienPopupOriginStyle = {
        container: {
          width: width,
          height: height
        },
        inner: {
          width: width - 4,
          height: height - 100
        },
        landscape: {
          container: {
            width: height,
            height: width
          },
          inner: {
            width: height - 4,
            height: width - 100
          }
        }
    };

    this.state = {
      spinner: true,
      orientation: "",
      thanVienContent: [],
      thanhVienInfoPopupVisible: false,
      thanhVien: {}
    };
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

    await this.refreshData();

    this.setState({spinner: false});
  }

  async refreshData() {
    var result = await api.getDSThVDangKy(this.app.loginInfo.id);
    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        this.buildListThanhVien(data.listTruongDoanThemVao, data.listThanhVienDangKy);
      } else {
        funcs.showMsg(data.message);
      }
    } else {
      funcs.showMsg(result.message);
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  orientationDidChange(orientation) {
    this.setState({
      orientation: orientation
    });
  }

  buildListThanhVien(listTruongDoanThemVao, listThanhVienDangKy) {
    this.listTruongDoanThemVao = listTruongDoanThemVao;
    this.listThanhVienDangKy = listThanhVienDangKy;
    this.renderThanhVienContent(listTruongDoanThemVao, listThanhVienDangKy);
  }

  renderThanhVienContent(listTruongDoanThemVao, listThanhVienDangKy) {
    var arr = [];

    arr.push(this.renderLandscapeTableHeader());

    if ((typeof listTruongDoanThemVao == "undefined" || listTruongDoanThemVao == null || listTruongDoanThemVao.length == 0)
      && (typeof listThanhVienDangKy == "undefined" || listThanhVienDangKy == null || listThanhVienDangKy.length == 0)){
      arr.push((
        <View key={"nodata"} style={[styles.rowCenter, styles.border]}>
          <Text style={{padding: 10}}>Không tìm thấy dữ liệu</Text>
        </View>
      ));
    }
    else {
      var chan = true;

      if (typeof listTruongDoanThemVao != "undefined" && listTruongDoanThemVao != null) {
        for(var i = 0; i < listTruongDoanThemVao.length; ++i) {
          var item = listTruongDoanThemVao[i];
          arr.push(this.getJSXLandscapeTableRow(i, item, chan, {them: false, dongY: true, chapNhan: false, tuChoi: false}));
          chan = !chan;
        }
      }
      
      if (typeof listThanhVienDangKy != "undefined" && listThanhVienDangKy != null) {
        chan = true;
        for(var i = 0; i < listThanhVienDangKy.length; ++i) {
          var item = listThanhVienDangKy[i];
          arr.push(this.getJSXLandscapeTableRow(i, item, chan, {them: false, dongY: false, chapNhan: true, tuChoi: true}));
          chan = !chan;
        }
      }
    }

    this.setState({thanVienContent: arr});
  }

  renderLandscapeTableHeader() {
    return (
      <View key="header" style={[s.table.row, s.table.border, {marginTop: 5, backgroundColor: Colors.navbarBackgroundColor}]}>
          <View style={[s.table.column, s.table.width100, s.table.borderRight]}>
              <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                  <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                  <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Họ Tên</Text>
                  </View>
                  <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                      <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Pháp Danh</Text>
                  </View>
                  <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                      <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}>Chọn</Text>
                  </View>
                  <View style={[s.table.align, s.table.width25]}>
                      <Text style={[s.table.text, s.table.textCenter, s.table.headerText]}></Text>
                  </View>
              </View>
              <View style={[s.table.row, s.table.width100]}>
                  <Text style={[s.table.text, s.table.textLeft, s.table.headerText]}>Địa Chỉ</Text>
              </View>
          </View>
      </View>
    ); 
  }

  getJSXLandscapeTableRow(i, item, chan, actions) {
    return (
      <View key={"item" + i} style={[s.table.row, s.table.borderLeft, s.table.borderRight, s.table.borderBottom, chan ? styles.chan : styles.le]}>
          <View style={[s.table.column, s.table.width100, s.table.borderRight]}>
              <View style={[s.table.row, s.table.width100, s.table.borderBottom]}>
                  <TouchableOpacity style={[s.table.align, s.table.width25, s.table.borderRight]} onPress={()=> this.showThanhVienInfo(item.id)}>
                    <Text style={[s.table.text, s.table.textLeft, styles.actionText]}>{item.hoTen}</Text>
                  </TouchableOpacity>
                  <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                    <Text style={[s.table.text, s.table.textCenter]}>{item.phapDanh}</Text>
                  </View>
                  <View style={[s.table.align, s.table.width25, s.table.borderRight]}>
                    {
                      actions.dongY ?
                      (
                        <TouchableOpacity onPress={()=>this.onDongYPress(item)}>
                          <Text style={[s.table.text, s.table.textCenter, styles.actionText]}>Đồng Ý</Text>
                        </TouchableOpacity>
                      )
                      : null
                    }

                    {
                      actions.chapNhan ?
                      (
                        <TouchableOpacity onPress={()=>this.onDongYPress(item)}>
                          <Text style={[s.table.text, s.table.textCenter, styles.actionText]}>Chấp Nhận</Text>
                        </TouchableOpacity>
                      )
                      : null
                    }
                  </View>
                  <View style={[s.table.align, s.table.width25]}>
                    {
                      actions.tuChoi ?
                      (
                        <TouchableOpacity onPress={()=>this.onTuChoiPress(item)}>
                          <Text style={[s.table.text, s.table.textCenter, styles.actionText]}>Từ Chối</Text>
                        </TouchableOpacity>
                      )
                      : null
                    }
                  </View>
              </View>
              <View style={[s.table.row, s.table.width100]}>
                  <Text style={[s.table.text, s.table.textLeft]}>
                    {funcs.getDiaChi(item)}
                  </Text>
              </View>
          </View>
      </View>
    );
  }

  async onDongYPress(item) {
    this.setState({spinner: true});
    var result = await api.dongYThemThanhVien(item.id);
  
    if (result.code == 200) {
        var data = result.data;
        if (data.success) {
          await this.refreshData();
          funcs.showMsg(this.app.settings.luuThanhCong);
        } else {
          funcs.showMsg(data.message);
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  async onTuChoiPress(item) {
    this.setState({spinner: true});
    var result = await api.tuChoiThemThanhVien(item.id);
  
    if (result.code == 200) {
        var data = result.data;
        if (data.success) {
          await this.refreshData();
          funcs.showMsg(this.app.settings.luuThanhCong);
        } else {
          funcs.showMsg(data.message);    
        }
    } else {
        funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  showThanhVienInfo(id) {
    var item = this.getThanhVien(id);
    if (item == null) {
      funcs.showMsg("Không tìm thấy dữ liệu");
      return;
    }

    this.setState({
      thanhVienInfoPopupVisible: true,
      thanhVien: item
    });
  }

  getThanhVien(id) {
    if (typeof this.listTruongDoanThemVao != "undefined" && this.listTruongDoanThemVao != null) {
      for(var i = 0; i < this.listTruongDoanThemVao.length; ++i) {
        var item = this.listTruongDoanThemVao[i];
        if (item.id == id) {
          return item;
        }
      }
    }
    
    if (typeof listThanhVienDangKy != "undefined" && listThanhVienDangKy != null) {
      for(var i = 0; i < this.listThanhVienDangKy.length; ++i) {
        var item = this.listThanhVienDangKy[i];
        if (item.id == id) {
          return item;
        }
      }
    }

    return null;
  }

  hideThanhVienInfoPopup() {
    this.setState({thanhVienInfoPopupVisible: false});
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>Danh sách thành viên mới đăng ký</Text>
            <View>
              <TouchableOpacity style={s.containerIconFilter}>
                  
              </TouchableOpacity>
            </View>
          </View>
          <Content removeClippedSubviews={true}>
            {this.state.thanVienContent}
          </Content>
          {this.state.thanhVienInfoPopupVisible 
            ?  
            (
                <View style={[s.thanhVienPopupStyle.container, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.container : this.thanhVienPopupOriginStyle.container]}>
                    <View style={[s.thanhVienPopupStyle.inner, this.state.orientation == "LANDSCAPE" ? this.thanhVienPopupOriginStyle.landscape.inner : this.thanhVienPopupOriginStyle.inner]}>
                        <View style={{flexDirection : "row", justifyContent: "space-between", alignItems: "center", height: 50, backgroundColor: Colors.navbarBackgroundColor}}>
                            <Text style={{paddingLeft: 10, color: Colors.buttonColor, fontWeight: "bold"}}>Thông tin thành viên</Text>
                            <TouchableOpacity onPress={this.hideThanhVienInfoPopup.bind(this)} style={{paddingRight: 10}}>
                                <IconFontAwesome name="close" style={{color: Colors.buttonColor, fontSize: 20}}/>
                            </TouchableOpacity>
                        </View>
                        <Content>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.hoTen}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text>Pháp danh: </Text>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.phapDanh}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text>Số điện thoại: </Text>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.soDienThoai}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text>Email: </Text>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.email}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text>Nghề nghiệp: </Text>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.ngheNghiepDisplay}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, {height: 60}]}>
                                <View style={{flexDirection : "column", paddingTop: 5, paddingBottom: 2}}>
                                  <Text style={s.thanhVienPopupStyle.itemValue}>Địa chỉ:</Text>
                                  <Text>{funcs.getDiaChi(this.state.thanhVien)}</Text>
                                </View>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text>Thời gian rãnh: </Text>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.thoiGianRanhDisplay}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, s.thanhVienPopupStyle.itemHeight]}>
                                <Text>Tốc độ niệm phật (số danh hiệu/ phút): </Text>
                                <Text style={s.thanhVienPopupStyle.itemValue}>{this.state.thanhVien.tocDoNiemPhat}</Text>
                            </View>
                            <View style={[s.thanhVienPopupStyle.item, {height: 60}]}>
                                <View style={{flexDirection : "column", paddingTop: 5, paddingBottom: 2}}>
                                  <Text style={s.thanhVienPopupStyle.itemValue}>Mô tả công việc:</Text>
                                  <Text>{this.state.thanhVien.moTaCongViec}</Text>
                                </View>
                            </View>
                        </Content>
                    </View>
                </View>
            ) 
            : null} 
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
      alignItems: "center",
      paddingLeft: 2,
      paddingRight: 2
    }
  },
  pickerText: {
    
  },
  dropbox: {
    width: "100%"
  },
  button: {
    backgroundColor: Colors.navbarBackgroundColor,
  },
  buttonText: {
    color: Colors.buttonColor
  },
  bottomText: {
    color: Colors.navbarBackgroundColor,
    textAlign: "center"
  },
  bottomContainer: {
    flexDirection : "column", 
    borderTopWidth: 1, 
    borderTopColor: Colors.navbarBackgroundColor, 
    alignItems: "center",
    padding: 5
  },
  bold: {
    fontWeight: "bold"
  },
  containerIconFilter: {
    flexDirection : "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  iconFilter: {
    fontSize: 32,
    color: Colors.buttonColor
  },
  tabBarUnderlineStyle: {
    backgroundColor: Colors.navbarBackgroundColor
  },
  tabStyle: {
    backgroundColor: "#ffffff"
  },
  activeTabStyle: {
    backgroundColor: "#ffffff"
  },
  textStyle: {
    color: "#5F5F5F"
  },
  activeTextStyle: {
    color: Colors.navbarBackgroundColor
  },
  table: {
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "stretch"
    },
    column: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    text: {
        width: "100%",
        padding: 5
    },
    textCenter: {
        textAlign: "center"
    },
    textLeft: {
        textAlign: "left"
    },
    align: {
        justifyContent: "center",
        alignItems: "center"
    },
    width100: {
        width: "100%"
    },
    width75: {
        width: "75%"
    },
    width25: {
        width: "25%"
    },
    headerText: {
        color: Colors.buttonColor,
        fontWeight: "bold"
    },
    border: {
        borderWidth: 1,
        borderColor: Colors.statusBarColor
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.statusBarColor
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.statusBarColor
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: Colors.statusBarColor
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopColor: Colors.statusBarColor
    }
  },
  thanhVienPopupStyle: {
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
      left: 2,
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
      flexDirection : "row",
      alignItems: "center",
      paddingLeft: 10
    },
    itemValue: {
      fontWeight: "bold"
    }
  },
};

export default TNXemDanhSachTVMoiDangKy;