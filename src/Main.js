import React, { Component } from 'react';
import {Provider} from 'react-redux';
import { BackHandler, Platform } from 'react-native';
import { Root } from 'native-base';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
const axios = require('axios');
import {default as SS} from 'react-native-splash-screen';

// Our custom files and classes import
import YoutubePlayListList from './page/YoutubePlayListList';
import YoutubePlayList from './page/YoutubePlayList';
import AppleDangKyMoi from './page/AppleDangKyMoi';
import TNToogleConTiepNhan from './page/TNToogleConTiepNhan';
import TNXemDuLieuCanSua from './page/TNXemDuLieuCanSua';
import XemYKienPhanHoi from './page/XemYKienPhanHoi';
import YKienPhanHoi from './page/YKienPhanHoi';
import TNChinhSuaProfileTV from './page/TNChinhSuaProfileTV';
import TNXemDanhSachTVChuaCoNhom from './page/TNXemDanhSachTVChuaCoNhom';
import TNXemDanhSachTVMoiDangKy from './page/TNXemDanhSachTVMoiDangKy';
import TDXemDanhSachTVNgoaiNhom from './page/TDXemDanhSachTVNgoaiNhom';
import TVDoiTN from './page/TVDoiTN';
import TDDoiTNChoTV from './page/TDDoiTNChoTV';
import TDXoaQuyenTruongNhom from './page/TDXoaQuyenTruongNhom';
import TDXemDanhSachTN from './page/TDXemDanhSachTN';
import TDXemDanhSachTV from './page/TDXemDanhSachTV';
import HomeTruongDoan from './page/HomeTruongDoan';
import TVCapNhatCongPhuNgay from './page/TVCapNhatCongPhuNgay';
import TVXemDuocPhepSuaTrongTuan from './page/TVXemDuocPhepSuaTrongTuan';
import TNXemTVChuaNhapLieu from './page/TNXemTVChuaNhapLieu';
import TVDuocPhepChinhSua from './page/TVDuocPhepChinhSua';
import TVXemLaiTruocDay from './page/TVXemLaiTruocDay';
import TNXemDanhSachChuaXem from './page/TNXemDanhSachChuaXem';
import TNXemTVDaSuaLai from './page/TNXemTVDaSuaLai';
import TNXemTVDaNhapSai from './page/TNXemTVDaNhapSai';
import TNXemTVOnline from './page/TNXemTVOnline';
import TNXacNhanDLChoTVOnline from './page/TNXacNhanDLChoTVOnline';
import TNXemTVOffline from './page/TNXemTVOffline';
import TNNhapDuLieuChoTVOffline from './page/TNNhapDuLieuChoTVOffline';
import TNXemDanhSachThanhVien from './page/TNXemDanhSachThanhVien';
import LeaderList from './page/LeaderList';
import RequestPassSuccess from './page/RequestPassSuccess';
import RequestPassConfirm from './page/RequestPassConfirm';
import RequestPass from './page/RequestPass';
import ChangePass from './page/ChangePass';
import Login from './page/Login';
import TNDangKyThanhVien from './page/TNDangKyThanhVien';
import SplashScreen from './page/SplashScreen';
import HomeTruongNhom from './page/HomeTruongNhom';
import TNXemLaiTruocDay from './page/TNXemLaiTruocDay';
import HomeThanhVien from './page/HomeThanhVien';
import Profile from './page/Profile';
import AppleLogin from './page/AppleLogin';
import * as appActions from "./actions/appActions";
import * as funcs from "./utils/funcs";
import Storage from "./storage/index";
import store from './store';
import NavigatorService from "./utils/navigatorService";
import * as firebaseNotification from "./utils/firebaseNotification";

const AppNavigator = createSwitchNavigator({
  splashScreen: {
    screen: SplashScreen
  },
  YoutubePlayListList: {
    screen: YoutubePlayListList
  },
  YoutubePlayList: {
    screen: YoutubePlayList
  },
  AppleLogin: {
    screen: AppleLogin
  },
  login: {
    screen: Login
  },
  TNDangKyThanhVien: {
    screen: TNDangKyThanhVien
  },
  homeTruongNhom: {
    screen: HomeTruongNhom
  },
  homeThanhVien: {
    screen: HomeThanhVien
  },
  profile: {
    screen: Profile
  },
  changePass: {
    screen: ChangePass
  },
  requestPass: {
    screen: RequestPass
  },
  requestPassConfirm: {
    screen: RequestPassConfirm
  },
  requestPassSuccess: {
    screen: RequestPassSuccess
  },
  leaderList: {
    screen: LeaderList
  },
  TNXemLaiTruocDay: {
    screen: TNXemLaiTruocDay
  },
  TNXemDanhSachThanhVien: {
    screen: TNXemDanhSachThanhVien
  },
  TNNhapDuLieuChoTVOffline: {
    screen: TNNhapDuLieuChoTVOffline
  },
  TNXemTVOffline: {
    screen: TNXemTVOffline
  },
  TNXacNhanDLChoTVOnline: {
    screen: TNXacNhanDLChoTVOnline
  },
  TNXemTVOnline: {
    screen: TNXemTVOnline
  },
  TNXemTVDaNhapSai: {
    screen: TNXemTVDaNhapSai
  },
  TNXemTVDaSuaLai: {
    screen: TNXemTVDaSuaLai
  },
  TNXemDanhSachChuaXem: {
    screen: TNXemDanhSachChuaXem
  },
  TVXemLaiTruocDay: {
    screen: TVXemLaiTruocDay
  },
  TVDuocPhepChinhSua: {
    screen: TVDuocPhepChinhSua
  },
  TNXemTVChuaNhapLieu: {
    screen: TNXemTVChuaNhapLieu
  },
  TVXemDuocPhepSuaTrongTuan: {
    screen: TVXemDuocPhepSuaTrongTuan
  },
  TVCapNhatCongPhuNgay: {
    screen: TVCapNhatCongPhuNgay
  },
  homeTruongDoan: {
    screen: HomeTruongDoan
  },
  TDXemDanhSachTV: {
    screen: TDXemDanhSachTV
  },
  TDXemDanhSachTN: {
    screen: TDXemDanhSachTN
  },
  TDXoaQuyenTruongNhom: {
    screen: TDXoaQuyenTruongNhom
  },
  TDDoiTNChoTV: {
    screen: TDDoiTNChoTV
  },
  TVDoiTN: {
    screen: TVDoiTN
  },
  TDXemDanhSachTVNgoaiNhom: {
    screen: TDXemDanhSachTVNgoaiNhom
  },
  TNXemDanhSachTVMoiDangKy: {
    screen: TNXemDanhSachTVMoiDangKy
  },
  TNXemDanhSachTVChuaCoNhom: {
    screen: TNXemDanhSachTVChuaCoNhom
  },
  TNChinhSuaProfileTV: {
    screen: TNChinhSuaProfileTV
  },
  YKienPhanHoi: {
    screen: YKienPhanHoi
  },
  XemYKienPhanHoi: {
    screen: XemYKienPhanHoi
  },
  TNXemDuLieuCanSua: {
    screen: TNXemDuLieuCanSua
  },
  TNToogleConTiepNhan: {
    screen: TNToogleConTiepNhan
  },
  AppleDangKyMoi: {
    screen: AppleDangKyMoi
  }
}, {
  headerMode: "none"
});

const AppContainer = createAppContainer(AppNavigator);

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', () => this.backPress());
    if (Platform.OS === 'android') {
      firebaseNotification.ctor();
      SS.hide();
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      firebaseNotification.dtor();  
    }
  }

  backPress() {
    return funcs.back();
  }

  render() {
    return( 
      <Provider store = {store}>
        <Root>
          <AppContainer ref={navigatorRef => { NavigatorService.setContainer(navigatorRef); }} />
        </Root>
      </Provider>
    );
  }
}
  
export default Main;