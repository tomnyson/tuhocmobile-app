import React, { Component } from 'react';
import { Image, TouchableOpacity, View, StatusBar, Dimensions, PixelRatio, TextInput, Alert } from 'react-native';
import { Container, Content, Button, List, ListItem, Picker, Input, Form, Item,
  Header, Body, Tab, Tabs, ScrollableTab, Card, CardItem, Left, Thumbnail, Right, Icon } from 'native-base';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconAntDesign from 'react-native-vector-icons/AntDesign';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';
import axios from 'axios';
import { WebView } from 'react-native-webview';

// Our custom files and classes import
import Text from '../component/Text';
import ErrorMsg from '../component/ErrorMsg';
import Navbar from '../component/Navbar';
import * as styles from "../Styles";
import Colors from "../Colors";
import store from "../store/index";
import * as funcs from "../utils/funcs";
import Storage from "../storage/index";
import * as appActions from "../actions/appActions";
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

class YoutubePlayListList extends Component {
  constructor(props) {
    super(props);

    this.items = [];

    this.state = {
      spinner: true,
      youtubePlayer: null,
      playList: [],
      title: "Danh sách video"
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }

  async componentDidMount() {
    var result = await api.getPlayListListItems();
    if (result.code == 200) {
      var data = result.data;
      var jsonStr = data.jsonStr;
      if (jsonStr != null && jsonStr != "") {
        var json = JSON.parse(jsonStr);
        if (json != null && typeof json.items != "undefined") {
          this.items = json.items;
        }
      }
      
      if (this.items.length > 0) {
        var item = this.items[0];
        if (item.snippet) {
          this.setState({title: item.snippet.channelTitle});
        }
      }

      if (!data.success) {
        funcs.showMsg(data.message);
      }

      this.renderListItems();
    } else {
      funcs.showMsg(result.message);
    }
    this.setState({spinner: false});
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  renderListItems() {
    var arr = [];
    var items = this.items;

    if (items.length > 0) {
      for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        arr.push(this.renderListItem(item, i));
      }
    } else {
      arr.push((
        <ListItem key={"a" + funcs.guid()}>
          <Text>Không tìm thấy dữ liệu</Text>
        </ListItem>
      ));
    }
    
    this.setState({playList: arr});
  }

  renderListItem(item, i) {
    var url = "";
    if (item.snippet.thumbnails && item.snippet.thumbnails.default) {
        url = item.snippet.thumbnails.default.url;
    }
    return (
      <ListItem key={"a" + funcs.guid()} thumbnail>
          <Left>
            <Thumbnail square source={{ uri: url }} />
          </Left>
          <Body>
            <TouchableOpacity onPress={()=>this.onPlayListPress(item.id, item.snippet.title)}>
                <Text>{item.snippet.title}</Text>
            </TouchableOpacity>
          </Body>
      </ListItem>
    );
  }

  onPlayListPress(id, title) {
    funcs.goTo("YoutubePlayList", {playListId: id, title: title});
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>{this.state.title}</Text>
            <View>
              <Text>{""}</Text>
            </View>
          </View>
          <Content removeClippedSubviews={true}>
            <List>
                {this.state.playList}
            </List>
          </Content>
          <Spinner visible={this.state.spinner} color={Colors.navbarBackgroundColor} />
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
  }
};

export default YoutubePlayListList;