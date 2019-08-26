import axios from 'axios';
import * as funcs from "./funcs";
import store from "../store/index";
import {decode as atob, encode as btoa} from 'base-64';
import * as settings from "./Settings";

const baseURL = settings.serverAddress;
const networkInterupMsg = "Vui lòng kiểm tra kết nối internet. Hoặc liên hệ với Admin.";
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

function processSaveCongPhu(data) {
  if (typeof data.ThoiGianRanh != "undefined" && data.ThoiGianRanh == "") {
    data.ThoiGianRanh = 0;
  }

  if (typeof data.thoiGianRanh != "undefined" && data.thoiGianRanh == "") {
    data.thoiGianRanh = 0;
  }
}

export default {
  networkInterupMsg: networkInterupMsg,

  getYoutubeEmbedUrl(videoId) {
    return "https://www.youtube.com/embed/" + videoId + "?rel=0&modestbranding=1&autohide=1&showinfo=0&controls=0&autoplay=1";
  },

  async login(data) {
    return this.fetch('POST', '/thanhvien/login', data);
  },

  async getCities() {
    return this.fetch('GET', '/thanhvien/getCities', null);
  },

  async getLiveVideoId() {
    return this.fetch('GET', '/youtube/GetLiveVideoId', null);
  },

  async getPlayListListItems() {
    return this.fetch('GET', '/youtube/getPlayListListItems', null);
  },

  async getPlayListItems(playListId) {
    return this.fetch('GET', '/youtube/GetPlayListItems?playListId=' + playListId, null);
  },

  async getDistrictsByCity(cityId) {
    return this.fetch('GET', '/thanhvien/getDistrictsByCity?matp=' + cityId, null);
  },

  async getWardsByDistrict(districtId) {
    return this.fetch('GET', '/thanhvien/getWardsByDistrict?maqh=' + districtId, null);
  },

  async saveProfile(data) {
    return this.fetch('POST', '/thanhvien/SaveProfile', data);
  },

  async thanhVienDangKy(data) {
    return this.fetch('POST', '/thanhvien/DangKy', data);
  },

  async truongNhomUpdateProfile(data) {
    return this.fetch('POST', '/TruongNhom/UpdateProfile', data);
  },

  async updateMatkhauWhenLoggedIn(data) {
    return this.fetch('POST', '/thanhvien/UpdateMatkhauWhenLoggedIn', data);
  },

  async initForgetPassToken(data) {
    return this.fetch('POST', '/thanhvien/InitForgetPassToken', data);
  },

  async updateMatkhauWhenForget(data) {
    return this.fetch('POST', '/thanhvien/UpdateMatkhauWhenForget', data);
  },

  async getTruongNhomAll() {
    return this.fetch('GET', '/truongnhom/all', null);
  },

  async filterTruongNhom(data) {
    return this.fetch('POST', '/truongnhom/filter', data);
  },

  async congPhuSave(data) {
    processSaveCongPhu(data);

    return this.fetch('POST', '/congphu/save', data);
  },

  async thanhVienHome(data) {
    return this.fetch('POST', '/thanhvien/home', data);
  },

  async getNgheNghieps() {
    return this.fetch('GET', '/thanhvien/getNgheNghieps', null);
  },

  async getThoiGianRanhs() {
    return this.fetch('GET', '/thanhvien/getThoiGianRanhs', null);
  },

  async getInitDateRanges() {
    return this.fetch('GET', '/congphu/GetInitDateRanges', null);
  },

  async getCongPhuTheoNgay(data) {
    return this.fetch('POST', '/congphu/GetCongPhuTheoNgay', data);
  },

  async updateCongPhuById(data) {
    processSaveCongPhu(data);
    return this.fetch('POST', '/congphu/UpdateById', data);
  },

  async getCongPhuTheoTuan(data) {
    return this.fetch('POST', '/congphu/GetCongPhuTheoTuan', data);
  },

  async getThanhVienByTruongNhom(IDTruongNhom) {
    return this.fetch('GET', '/thanhvien/GetThanhVienByTruongNhom?IDTruongNhom=' + IDTruongNhom, null);
  },

  async getThanhVienOnlineByTruongNhom(IDTruongNhom) {
    return this.fetch('GET', '/thanhvien/GetThanhVienOnlineByTruongNhom?IDTruongNhom=' + IDTruongNhom, null);
  },

  async getThVNhapSai(IDTruongNhom) {
    return this.fetch('GET', '/congphu/GetThVNhapSai?idTruongNhom=' + IDTruongNhom, null);
  },

  async getThVDaSua(IDTruongNhom) {
    return this.fetch('GET', '/congphu/GetThVDaSua?idTruongNhom=' + IDTruongNhom, null);
  },

  async filterThanhVien(data) {
    return this.fetch('POST', '/thanhvien/TVfilter', data);
  },

  async getTrNhNhapDuLieu(data) {
    return this.fetch('POST', '/congphu/GetTrNhNhapDuLieu', data);
  },

  async saveTuan(data) {
    processSaveCongPhu(data);
    return this.fetch('POST', '/congphu/saveTuan', data);
  },

  async getXemThanhVienOffline(data) {
    return this.fetch('POST', '/congphu/GetXemThanhVienOffline', data);
  },

  async getTrNhXacNhanDuLieu(data) {
    return this.fetch('POST', '/congphu/GetTrNhXacNhanDuLieu', data);
  },

  async saveXacNhans(data) {
    return this.fetch('POST', '/congphu/saveXacNhans', data);
  },

  async getDSTuanChuaXem(data) {
    return this.fetch('POST', '/congphu/GetDSTuanChuaXem', data);
  },

  async getTVDuocSuaLai(data) {
    return this.fetch('POST', '/congphu/GetTVDuocSuaLai', data);
  },

  async getThVChuaNhapLieu(data) {
    return this.fetch('POST', '/congphu/GetThVChuaNhapLieu', data);
  },

  async dangKyTruongNhom(data) {
    return this.fetch('POST', '/TruongDoan/DangKyTruongNhom', data);
  },

  async getCities_ThoiGianRanhs_NgheNghieps(data) {
    return this.fetch('GET', '/thanhvien/GetCities_ThoiGianRanhs_NgheNghieps', data);
  },

  async getThanhVienTrongDoan(IDTruongDoan) {
    return this.fetch('GET', '/TruongDoan/GetThanhVienTrongDoan?IDTruongDoan=' + IDTruongDoan, null);
  },

  async truongDoanFilterThanhVien(data) {
    return this.fetch('POST', '/TruongDoan/TVDoanfilter', data);
  },

  async capQuyenTruongNhom(data) {
    return this.fetch('POST', '/TruongDoan/CapQuyenTruongNhom', data);
  },

  async getTruongNhomsTrongDoan(IDTruongDoan) {
    return this.fetch('GET', '/TruongDoan/GetTruongNhomsTrongDoan?IDTruongDoan=' + IDTruongDoan, null);
  },

  async truongDoanFilterTruongNhom(data) {
    return this.fetch('POST', '/TruongDoan/DoanNhomfilter', data);
  },

  async getListTruongNhomKhac(IDTruongDoan, IDTruongNhom) {
    return this.fetch('GET', '/TruongDoan/GetListTruongNhomKhac?IDTruongDoan=' + IDTruongDoan + "&IDTruongNhom=" + IDTruongNhom, null);
  },

  async thanhVienGetListTruongNhomKhac(IDThanhVien) {
    return this.fetch('GET', '/truongnhom/GetListTruongNhomKhac?IDThanhVien=' + IDThanhVien, null);
  },

  async truongDoanDoiTruongNhoms(data) {
    return this.fetch('POST', '/TruongDoan/DoiTruongNhoms', data);
  },

  async truongDoanDoiTruongNhom(data) {
    return this.fetch('POST', '/TruongDoan/DoiTruongNhom', data);
  },

  async truongDoanXoaQuyenTruongNhom(data) {
    return this.fetch('POST', '/TruongDoan/XoaQuyenTruongNhom', data);
  },

  async getTruongNhomsKhacByThanhVienID(IDTruongDoan, IDThanhVien) {
    return this.fetch('GET', '/TruongDoan/GetTruongNhomsKhacByThanhVienID?IDTruongDoan=' + IDTruongDoan + "&IDThanhVien=" + IDThanhVien, null);
  },

  async thanhVienDongYTruongNhom(data) {
    return this.fetch('POST', '/thanhvien/DongYTruongNhom', data);
  },

  async thanhVienDoiTruongNhom(data) {
    return this.fetch('POST', '/thanhvien/DoiTruongNhom', data);
  },

  async appleRegister(data) {
    return this.fetch('POST', '/thanhvien/AppleRegister', data);
  },

  async removeThanhVienOffline (IDThanhVien) {
    return this.fetch('GET', '/truongnhom/removeThanhVienOffline?IDThanhVien=' + IDThanhVien, null);
  },

  async getTVTDoanNgoaiNhom(IDTruongDoan) {
    return this.fetch('GET', '/TruongDoan/GetTVTDoanNgoaiNhom?IDTruongDoan=' + IDTruongDoan, null);
  },

  async truongDoanTVNgoaiNhomfilter(data) {
    return this.fetch('POST', '/TruongDoan/TVNgoaiNhomfilter', data);
  },

  async dongYThemThanhVien(IDThanhVien) {
    return this.fetch('GET', '/truongnhom/DongYThemThanhVien?IDThanhVien=' + IDThanhVien, null);
  },

  async tuChoiThemThanhVien(IDThanhVien) {
    return this.fetch('GET', '/truongnhom/TuChoiThemThanhVien?IDThanhVien=' + IDThanhVien, null);
  },

  async getDSThVDangKy(IDTruongNhom) {
    return this.fetch('GET', '/truongnhom/GetDSThVDangKy?IDTruongNhom=' + IDTruongNhom, null);
  },

  async getDSThVChuaCoNhom(IDTruongNhom) {
    return this.fetch('GET', '/truongnhom/GetDSThVChuaCoNhom?IDTruongNhom=' + IDTruongNhom, null);
  },

  async themThanhVienOffline(data) {
    return this.fetch('POST', '/TruongNhom/ThemThanhVienOffline', data);
  },

  async getSettings() {
    return this.fetch('GET', '/thanhvien/GetSettings', null);
  },

  async switchLogin(data) {
    return this.fetch('POST', '/thanhvien/switchLogin', data);
  },

  async updateConTiepNhan(data) {
    return this.fetch('POST', '/truongnhom/ConTiepNhan', data);
  },

  async getYKienType() {
    return this.fetch('GET', '/YKienPhanHoi/getYKienType', null);
  },

  async saveYKienPhanHoi(data) {
    return this.fetch('POST', '/YKienPhanHoi/save', data);
  },

  async getYKienPhanHoi(IDThanhVien) {
    return this.fetch('GET', '/YKienPhanHoi/getYKienPhanHoi?IDThanhVien=' + IDThanhVien, null);
  },

  async getYKienByDate(data) {
    return this.fetch('POST', '/YKienPhanHoi/getYKienByDate', data);
  },

  async yeuCauDuocSuaGui(data) {
    return this.fetch('POST', '/YeuCauDuocSua/Gui', data);
  },

  async yeuCauDuocSua_TruongNhomDongY(data) {
    return this.fetch('POST', '/YeuCauDuocSua/TruongNhomDongY', data);
  },

  fetch(method, url, data) {
    let appState = store.getState().app;
    if (typeof appState.loginInfo.soDienThoai != "undefined") {
      axios.defaults.headers.common.Authorization = "Basic "
        + btoa(appState.loginInfo.soDienThoai + ":" + appState.loginInfo.plainPassword);
    }

    return axios({
      method,
      url,
      timeout: 30000,
      data,
    })
    .then((res) => {
      return { data: res.data, code: res.status };
    })
    .catch((error) => {
      if (!error.response) {
        return {
          code: -999,
          message: networkInterupMsg
        };
      }
      return {
        code: error.response.status,
        message: error.response.status.toString() == "401" ? "Tài khoản đã thay đổi. Làm ơn logout và login lại." : "Error. Hãy liên hệ với Admin"
      };
    });
  }
};
