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
import IconSimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

class YoutubePlayList extends Component {
  constructor(props) {
    super(props);

    this.selectedIndex = 0;
    this.items = [];

    this.state = {
      spinner: true,
      url: "",
      fullScreen: false,
      playList: [],
      title: "Play list"
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
    this.playListId = this.props.navigation.getParam('playListId', "");
    var title = this.props.navigation.getParam('title', this.state.title);
    this.setState({title: title});
  }

  async componentDidMount() {
    var result = await api.getPlayListItems(this.playListId);
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
        this.renderVideoPlayer(this.items[0]);
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

  onYoutubePlayerStateChanged(e) {
    this.youtubePlayerState = e.state;
  }

  renderVideoPlayer(videoId) {
    this.setState({url: api.getYoutubeEmbedUrl(videoId)});
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
          <TouchableOpacity onPress={()=>this.onChangeVideo(item.snippet.resourceId.videoId, i)}>
            <Text style={this.selectedIndex == i ? {color: Colors.navbarBackgroundColor} : {}}>{item.snippet.title}</Text>
          </TouchableOpacity>
        </Body>
      </ListItem>
    );
  }

  onChangeVideo(videoId, i) {
    this.selectedIndex = i;
    this.renderVideoPlayer(videoId);
    this.renderListItems();
  }

  onFullScreenTextPress() {
    Orientation.lockToLandscape();
    this.setState({fullScreen: true});
  }

  onFullScreenPress() {
    Orientation.unlockAllOrientations();
    Orientation.lockToPortrait();
    this.setState({fullScreen: false});
  }

  render() {
    return(
        <Container>
          <StatusBar hidden={funcs.ios()} backgroundColor={Colors.statusBarColor} barStyle="light-content"></StatusBar>
          <View style={[s.header.container, this.state.fullScreen ? styles.displayNone : {}]}>
            <Button transparent onPress={()=>funcs.back()}>
              <IconFontAwesome name="arrow-left" style={styles.iconHeaderLeft}/>
            </Button>
            <Text style={styles.headerText}>{this.state.title}</Text>
            <View>
              <Text>{""}</Text>
            </View>
          </View>
          <View style={[styles.columnCenter, this.state.url != "" ? (this.state.fullScreen ? s.playerFullScreen : s.playerNormal) : {}]}>
            {
              this.state.url != "" ? (
                <WebView allowsInlineMediaPlayback={true}
                  source={{ uri: this.state.url}}
                  style={[this.state.fullScreen ? s.playerFullScreen : s.playerNormal]}/>
              ) : null
            }
            
            {
              this.state.url != "" ? (
                <View style={[s.fullScreenTextRow, this.state.fullScreen ? styles.displayNone : {}]}>
                  <TouchableOpacity onPress={this.onFullScreenTextPress.bind(this)}>
                    <Text style={s.textFullScreen}>Toàn màng hình</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
            {
              this.state.fullScreen ? (
                <TouchableOpacity style={s.fullScreenButton} onPress={this.onFullScreenPress.bind(this)}>
                  <IconMaterialCommunityIcons style={s.fullScreenIcon} name="fullscreen"/>
                </TouchableOpacity>
              ) : null
            }
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
  },
  textFullScreen: {
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: Colors.navbarBackgroundColor,
    color: Colors.navbarBackgroundColor,
    fontStyle: 'italic',
    paddingRight: 5
  },
  fullScreenTextRow: {
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "flex-end", 
    width: "100%"
  },
  fullScreenButton: {
    width: 32,
    height: 32,
    position: "absolute",
    bottom: 20,
    right: 10,
    zIndex: 1000
  },
  fullScreenIcon: {
    fontSize: 32,
    color: Colors.navbarBackgroundColor
  },
  playerNormal: {
    height: styles.playerConatinerHeight, 
    width: width
  },
  playerFullScreen: {
    width: height,
    height: width
  }
};

export default YoutubePlayList;