import * as appActionTypes from "../actions/appActionTypes";

const initialState = {
  loginInfo: {},
  currentSceen: "",
  sceenStack: [],
  truongNhom: null,
  settings: {},
  conTiepNhan: false,
  isTruongNhom: false
};

export default function (state = initialState, action) {
    switch (action.type) {
      case appActionTypes.SAVE_LOGIN_INFO:
      {
          state.loginInfo = action.payload;
          break;
      }
      case appActionTypes.SAVE_CURRENT_SCEEN:
      {
          state.currentSceen = action.payload;
          break;
      }
      case appActionTypes.SAVE_SCEEN_STACK:
      {
          state.sceenStack = action.payload;
          break;
      }
      case appActionTypes.SAVE_TRUONG_NHOM:
      {
          state.truongNhom = action.payload;
          break;
      }
      case appActionTypes.SAVE_SETTINGS:
      {
          state.settings = action.payload;
          break;
      }
      case appActionTypes.SAVE_CON_TIEP_NHAN:
      {
          state.conTiepNhan = action.payload;
          break;
      }
      case appActionTypes.SAVE_IS_TRUONG_NHOM:
      {
          state.isTruongNhom = action.payload;
          break;
      }
    }
  
    return JSON.parse(JSON.stringify(state));
  }