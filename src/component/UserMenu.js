import React, { Component } from 'react';
import { Image, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Container, Content, View, Button, List, ListItem, Picker,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';

// Our custom files and classes import
import Text from '../component/Text';
import Colors from "../Colors";
import store from "../store/index";
import api from '../utils/api';
import * as funcs from "../utils/funcs";
import * as appActions from "../actions/appActions";
import * as styles from "../Styles";

const { width, height } = Dimensions.get('window');

class UserMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
    this.unmounted = true;
   
  }

  onUserMenuClick() {
      this.props.onClick && this.props.onClick();
  }

  render() {
    return(
        <View style={[this.props.style, {width: 30},s.container]}>
            <TouchableOpacity onPress={this.onUserMenuClick.bind(this)}>
                <IconFontAwesome name="caret-down" style={styles.iconHeaderLeft}/>
            </TouchableOpacity>
        </View>    
    );
  }
}

const s = {
    container: {
        flexDirection : "row",
        justifyContent: "center",
        alignItems: "center"
    }
};

export default UserMenu;