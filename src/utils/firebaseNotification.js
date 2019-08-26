import firebase from 'react-native-firebase';
import * as funcs from "./funcs";
import { Platform, Linking } from "react-native";

import store from "../store/index";

var _ref;
var onNotificationDisplayed;
var onNotification;
var onNotificationOpened;
var channel;
var channelId = "default_notification_channel_id";
export const ctor = async function() {
    _ref =  firebase.notifications();
    _ref.setBadge(0);

    onNotificationDisplayed = _ref.onNotificationDisplayed((notification) => {
        funcs.log("onNotificationDisplayed");
    });

    onNotification = _ref.onNotification((notification) => {
        funcs.log("onNotification");
        if (Platform.OS === 'ios') {
            //notification.ios.setBadge(2);
        } else {
            notification.android.setChannelId(channelId).android.setSmallIcon('ic_launcher');
            //_ref.setBadge(1);
        }
        notification.setSound(channel.sound);
        
        _ref.displayNotification(notification);
    });

    onNotificationOpened = _ref.onNotificationOpened((notificationOpen) => {
        var action = notificationOpen.action;
        var notification = notificationOpen.notification;
        funcs.log("onNotificationOpened");
    });

    _ref.getInitialNotification().then((notificationOpen) => {
        if (notificationOpen) {
            
            const action = notificationOpen.action;
            
            const notification = notificationOpen.notification;  
            funcs.log("onNotificationOpened - background");
            
            if (typeof notification._data.u != "undefined") {
                if (Platform.OS === 'ios') {
                    Linking.openURL('itms://itunes.apple.com/us/app/apple-store/1468236240?mt=8')
                } else {
                    Linking.openURL("market://details?id=com.tuhoconline");
                }
                funcs.log("CH Play opened");
            }
        }
    });

    if (Platform.OS === 'android') {
        channel = new firebase.notifications.Android.Channel(channelId, channelId, firebase.notifications.Android.Importance.High)
        .setDescription(channelId)
        .setSound("default");

        _ref.android.createChannel(channel);
    }
};

export const dtor = function() {
    onNotificationDisplayed();
    onNotification();
    onNotificationOpened();
};