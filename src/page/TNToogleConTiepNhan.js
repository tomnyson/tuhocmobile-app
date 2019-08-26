import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Container, Content, View, Button, List, ListItem, Picker,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import Orientation from 'react-native-orientation';

// Our custom files and classes import
import Text from '../component/Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import UserMenuDropdown from "../component/UserMenuDropdown";
import UserMenu from "../component/UserMenu";
import * as styles from "../Styles";
import ErrorMsg from '../component/ErrorMsg';
import Storage from "../storage/index";

const { width, height } = Dimensions.get('window');

class TNToogleConTiepNhan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      orientation: "",
      spinner: false
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
  }

  orientationDidChange(orientation) {
    this.setState({orientation: orientation});
  }

  componentWillUnmount(){
    this.unmounted = true;
    Orientation.removeOrientationListener(this._orientationDidChange)
  }

  async updateConTiepNhan() {
    this.setState({spinner: true});
    var result = await api.updateConTiepNhan({
      truongNhom: this.app.loginInfo.id,
      conTiepNhan: !this.app.conTiepNhan
    });

    if (result.code == 200) {
      var data = result.data;
      if (data.success) {
        await store.dispatch(appActions.saveConTiepNhan(!this.app.conTiepNhan));
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

  render() {
    return (
        <Container>
            <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
            <View style={[s.header.container]}>
                <Button transparent onPress={()=>funcs.back()}>
                <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
                </Button>
                <Text style={styles.headerText}>
                    {this.app.conTiepNhan ? this.app.settings.conTiepNhanText.off : this.app.settings.conTiepNhanText.on}
                </Text>  
                <UserMenu onClick={this.onUserMenuClick.bind(this)}/>
            </View>
            <Content>
                <Text style={[{padding: 10}]}>
                    { this.app.conTiepNhan ? this.app.settings.thongBaoNgungTiepNhan : this.app.settings.thongBaoConTiepNhan }
                </Text>
                <Button style={[s.button, s.item, {marginTop: 20}]} full rounded onPress={this.updateConTiepNhan.bind(this)}>
                    <Text style={s.buttonText}>
                        {this.app.conTiepNhan ? this.app.settings.conTiepNhanText.off : this.app.settings.conTiepNhanText.on}
                    </Text>
                </Button>
            </Content>
            {this.state.userMenuVisible ? this.renderUserMenuDropdown() : null}  
            <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor}/>
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
      }
    },
    avatarContainer: {
        alignItems: "center",
        backgroundColor: "#F7F7F7", 
        height: 100, 
        flexDirection: "row", 
        justifyContent: "center"
    },
    container: {
        flexDirection : "column",
        alignItems: "center"
    },
    item: {
        marginLeft: 20,
        marginRight: 20
    },
    button: {
        backgroundColor: Colors.navbarBackgroundColor,
        marginTop: 30
    },
    buttonText: {
        color: Colors.buttonColor
    },
    errorMsg: {
        marginLeft: 30,
        marginRight: 30,
    }
};


export default TNToogleConTiepNhan;