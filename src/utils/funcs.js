import { Toast } from 'native-base';
import store from "../store/index";
import * as appActions from "../actions/appActions";
import NavigatorService from "../utils/navigatorService";
import {decode as atob, encode as btoa} from 'base-64';
import {Platform} from "react-native";

var moment = require('moment');

export const log = function(msg){
    if (__DEV__) {
        console.log('devapp:', msg);
    }
};

export const showMsg = function(msg) {
    Toast.show({
        text: typeof msg != "undefined" && msg != null ? msg.toString() : "Error. Hãy liên hệ admin",
        buttonText: 'OK',
        duration: 7000
    });
};

var navTimer = 1000;

export const goToWithoutPushStack = function(sceen, params = null) {
    if (typeof sceen == "undefined" || sceen == null || sceen.trim() == "") {
        return;
    }

    sceen = sceen.trim();
    
    if (params != null) {
        params.screen = sceen;
    } else {
        params = { screen: sceen };
    }

    NavigatorService.navigate(sceen, params);

    return true;
};

var _goTo = function (sceen, params = null) {
    if (typeof sceen == "undefined" || sceen == null || sceen.trim() == "") {
        return true;
    }

    sceen = sceen.trim();

    if (params != null) {
        params.screen = sceen;
    } else {
        params = { screen: sceen };
    }

    NavigatorService.navigate(sceen, params);

    let sceenStack = store.getState().app.sceenStack;
    if(sceenStack.length > 0 && sceenStack[sceenStack.length - 1] == sceen){
        return true;
    }

    sceenStack.push(sceen);

    store.dispatch(appActions.saveCurrentSceen(sceen));
    store.dispatch(appActions.saveSceenStack(sceenStack));

    return true;
};

export const goTo = function(sceen, params = null) {
    return _goTo(sceen, params);
};

export const back = function(params = null) {
    let sceenStack = store.getState().app.sceenStack;
    if (sceenStack.length == 1) {
      return true;
    }

    sceenStack.pop();
    let sceen = sceenStack[sceenStack.length - 1];

    if (params != null) {
        params.screen = sceen;
    } else {
        params = { screen: sceen };
    }

    NavigatorService.navigate(sceen, params);

    setTimeout(function() {
        store.dispatch(appActions.saveSceenStack(sceenStack));
        store.dispatch(appActions.saveCurrentSceen(sceen));
    } ,navTimer);

    return true;
}

export const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 1;
};

export const chunk = function (arr, len) {
    var chunks = [],
    i = 0,
    n = arr.length;

    while (i < n) {
    chunks.push(arr.slice(i, i += len));
    }

    return chunks;
};

export const days = function(){
    let arr = [];
    for(let i = 1; i <= 31; ++i) {
        arr.push(i.toString());
    }
    return arr;
};

export const daysInMonth = function(year, month){
    let arr = [];
  
    var _lastDay = function(y, m){
        return  new Date(y, m + 1, 0).getDate();
    }
    
    var lastDay = _lastDay(year, month);

    for (var i = 1; i <= lastDay; ++i) {
        arr.push(i);
    }

    return arr;
};

export const months = function(){
    let arr = [];
    for(let i = 1; i <= 12; ++i) {
        arr.push(i.toString());
    }
    return arr;
};

function getYears() {
    let currentYear = (new Date()).getFullYear();
    let arr = [];
    for (let y = 2010; y <= currentYear; ++y) {
        arr.push(y);
    }

    return arr;
}

export const years = function(){
    let arr = [];
    let years = getYears();
    for (let i = 0; i < years.length; ++i) {
        arr.push(years[i].toString());
    }
    return arr;
};

export const yearIndex = function(year){
    let arr = getYears();
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i] == parseInt(year)) {
            return i;
        }
    }

    return 0;
};

function getHours() {
    let arr = [];
    for (let i = 0; i <= 23; ++i) {
        arr.push(i)
    }
    return arr;
}

export const hours = function(){
    let hours = getHours();

    let arr = [];

    for (let i = 0; i < hours.length; ++i) {
        let hour = hours[i];
        if (hour.toString().length == 1) {
            arr.push("0" + "" + hour);
        }
        else {
            arr.push(hour.toString());
        }
    }

    return arr;
};

export const hourIndex = function(hour) {
    let hours = getHours(); 
    for (let i = 0; i < hours.length; ++i) {
        if (hours[i] == parseInt(hour)) {
            return i;
        }
    }
    return 0;
}

function getMinutes() {
    let arr = [];
    for (let i = 0; i <= 59; ++i) {
        arr.push(i)
    }
    return arr;
}

export const minutes = function(){
    let mins = getMinutes();

    let arr = [];

    for (let i = 0; i < mins.length; ++i) {
        let min = mins[i];
        if (min.toString().length == 1) {
            arr.push("0" + "" + min);
        }
        else {
            arr.push(min.toString());
        }
    }

    return arr;
};

export const minuteIndex = function(minute) {
    let mins = getMinutes(); 
    for (let i = 0; i < mins.length; ++i) {
        if (mins[i] == parseInt(minute)) {
            return i;
        }
    }
    return 0;
}

export const guid = function() {
    return btoa(Math.random()) + btoa(Math.random());
}

export const toTime = function(dateStr) {
    let momentObj = moment(dateStr, "MM/DD/YYYY hh:mm:ss a");
    return momentObj.format("HH:mm:ss");
}

export const getCalendarData = function(e) {
    if (Platform.OS === 'ios') {
        return e;
    }

    return e.data;
}

export const isEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

var replaceAll = function(source, search, replacement) {
    var target = source;
    return target.split(search).join(replacement);
}

export const strReplaceAll =  replaceAll;

export const toNumberStr = function(value) {
    value = replaceAll(value, ".", "");
    value = replaceAll(value, ",", "");
    value = replaceAll(value, "-", "");
    return value;

}

export const formatMoney = function(amount, decimalCount = 0, decimal = ",", thousands = ".") {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
}

export const getLastDayOfMonth = function (year, month) {
    return (new Date(year, month + 1, 0)).getDate();
}

export const getDaysInWeeksOfMonth = function(year, month) {
    var lastDayOfMonth = getLastDayOfMonth(year, month);
    var arr = [];
    var step = 0;
    for(var day = 1; day <= lastDayOfMonth; ++day) {
        if (arr.length == 0) {
            arr.push({
                week: arr.length + 1,
                days: []
            });
        }

        ++step;

        if (step <= 7) {
            arr[arr.length - 1].days.push(day);
        } else {
            step = 1;
            arr.push({
                week: arr.length + 1,
                days: [day]
            });
        }
    }

    return arr;
}

export const getValueFromServerDate = function (dateTime, part) {
    var arr = dateTime.split('T');
    var date = arr[0];
    var time = arr[1];
    switch(part)
    {
        case "year":
        {
            var arr2 = date.split('-');
            return arr2[0];
        }
        case "month":
        {
            var arr2 = date.split('-');
            return arr2[1];
        }
        case "day":
        {
            var arr2 = date.split('-');
            return arr2[2];
        }
        case "hour":
        {
            var arr2 = time.split(':');
            return arr2[0];
        }
        case "minute":
        {
            var arr2 = time.split(':');
            return arr2[1];
        }
        case "second":
        {
            var arr2 = time.split(':');
            return arr2[2];
        }
    }

    return 0;
}

export const getCurrentDayOfWeek = function () {
    var val = moment().format('dddd'); 
    switch(val)
    {
        case "Monday":
            return "Thứ 2";
        case "Tuesday":
            return "Thứ 3";
        case "Wednesday":
            return "Thứ 4";
        case "Thursday":
            return "Thứ 5";
        case "Friday":
            return "Thứ 6";
        case "Saturday":
            return "Thứ 7";
        case "Sunday":
            return "Chủ nhật";
    }
    return "";
}

//------------app utils-----------
export const getXinChaoText = function(user){
    if (typeof user.phapDanh != "undefined" && user.phapDanh != null) {
        return user.phapDanh;
    }

    return user.hoTen;
};

export const getDiaChi = function(item){
    var arr = [];

    if (item.duongNha != null && item.duongNha.trim() != "") {
        arr.push(item.duongNha);
    }

    if (item.xaPhuongTT != null && item.xaPhuongTT.trim() != "") {
        arr.push(item.xaPhuongTT);
    }

    if (item.quanHuyen != null && item.quanHuyen.trim() != "") {
        arr.push(item.quanHuyen);
    }

    if (item.tinhThanh != null && item.tinhThanh.trim() != "") {
        arr.push(item.tinhThanh);
    }

    return arr.join(", ");
};

export const getPhapDanh = function(item){
    var phapDanh = item.phapDanh != null && item.phapDanh.trim() != "" ? " (" + item.phapDanh + ")" : "";
    return phapDanh;
};

var _appleMode = function() {
    var app = store.getState().app;
    return Platform.OS === 'ios' && app.settings.appleMode;
};

export const appleMode = function() {
    return _appleMode();
};

export const ios = function() {
    return Platform.OS === 'ios';
};

export const randomPhoneNumber = function() {
    var length = 10;
    var val = Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1));
    return val.toString();
};

export const goToLogin = function() {
    if (_appleMode()) {
        _goTo("AppleLogin");
    } else {
        _goTo("login");
    }
};
