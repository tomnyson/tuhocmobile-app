// import firebase from 'react-native-firebase';
// import * as funcs from "./funcs";
// const _ref =  firebase.messaging();
// var onTokenRefreshListener;
// var messageListener;

// export const ctor = async function() {
//     try {
//         await _ref.requestPermission();
//         // User has authorised
//     } catch (error) {
//         // User has rejected permissions
//     }

//     var fcmToken = await _ref.getToken();
//     if (fcmToken) {
//         // user has a device token
//     } else {
//         // user doesn't have a device token yet
//     }
//     onTokenRefreshListener = _ref.onTokenRefresh(fcmToken => {});

//     messageListener = _ref.onMessage((message) => {
//         funcs.log(JSON.stringify(message));
//     });
// };

// export const dtor = function() {
//     onTokenRefreshListener();
//     messageListener();
// };