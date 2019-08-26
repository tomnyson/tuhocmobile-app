import React, { Component } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Container } from 'native-base';

// Our custom files and classes import
import Colors from "../Colors";
import store from "../store/index";
import * as funcs from "../utils/funcs";
import Storage from "../storage/index";
import * as appActions from "../actions/appActions";
import api from '../utils/api';

class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      app: store.getState().app
    };
  }

  async componentWillMount() {

    var result = await api.getSettings();
    if (result.code == 200) {
      await store.dispatch(appActions.saveSettings(result.data.settings));
    }

    let loginInfoStr = await Storage.getItem(Storage.Keys.LOGIN_INFO);

    if (loginInfoStr == null) {
      funcs.goToLogin();
      return;
    } 

    let userName = loginInfoStr.toString().split(":")[0];
    let password = loginInfoStr.toString().split(":")[1];

    result = await api.login({
      soDienThoai: userName,
      matKhau: password
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        var entity = data.entity;
        entity.plainPassword = password;
        await store.dispatch(appActions.saveLoginInfo(entity));
        await store.dispatch(appActions.saveTruongNhom(data.truongNhomEntity));
        await store.dispatch(appActions.saveSettings(data.settings));

        if (typeof data.conTiepNhan != "undefined" && data.conTiepNhan != null) {
          await store.dispatch(appActions.saveConTiepNhan(data.conTiepNhan));
        } else {
          await store.dispatch(appActions.saveConTiepNhan(false));
        }

        if (entity.truongNhom) {
          funcs.goTo("homeTruongNhom");
          await store.dispatch(appActions.saveIsTruongNhom(true));
          return;
        }

        if (entity.truongDoan) {
          funcs.goTo("homeTruongDoan");
          return;
        }

        if (!entity.truongDoan && !entity.truongNhom) {
          funcs.goTo("homeThanhVien");
        }
      } else {
        await store.dispatch(appActions.saveSettings(data.settings));
        funcs.goToLogin();
      }
    } else {
      funcs.goToLogin();
    }
  };

  render() {
    return(
        <Container>
            <View style={s.container}>
                <ActivityIndicator size="large" color={Colors.navbarBackgroundColor} />
            </View>
        </Container>
    );
  }
}

const s = {
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: "center"
    }
};

export default SplashScreen;