import * as appActionTypes from "./appActionTypes";
export const saveLoginInfo = (payload) => ({type:appActionTypes.SAVE_LOGIN_INFO, payload: payload});
export const saveCurrentSceen = (payload) => ({type:appActionTypes.SAVE_CURRENT_SCEEN, payload: payload});
export const saveSceenStack = (payload) => ({type:appActionTypes.SAVE_SCEEN_STACK, payload: payload});
export const saveTruongNhom = (payload) => ({type:appActionTypes.SAVE_TRUONG_NHOM, payload: payload});
export const saveSettings = (payload) => ({type:appActionTypes.SAVE_SETTINGS, payload: payload});
export const saveConTiepNhan = (payload) => ({type:appActionTypes.SAVE_CON_TIEP_NHAN, payload: payload});
export const saveIsTruongNhom = (payload) => ({type:appActionTypes.SAVE_IS_TRUONG_NHOM, payload: payload});