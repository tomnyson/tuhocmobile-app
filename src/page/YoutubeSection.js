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
import IconSimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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

class YoutubeSection extends Component {
  constructor(props) {
    super(props);
   
    this.youtubePlayerState = "";
    this.videoId = "";

    this.state = {
      url: "",
      fullScreen: false
    };
  }

  componentWillMount() {
    this.app = store.getState().app;
  }

  async componentDidMount() {
    await this.refreshYoutube();
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  async refreshYoutube() {
    if (this.unmounted) {
      return;
    }

    var result = await api.getLiveVideoId();
    if (result.code == 200) {
      var data = result.data;
      this.renderYoutubePlayer(data.videoId);
      if (!data.success) {
        funcs.showMsg(data.message);
      }

      if(data.videoId == "")
      setTimeout(this.refreshYoutube.bind(this), 2000);
    } else {
      setTimeout(this.refreshYoutube.bind(this), 2000);
    }
  }

  renderYoutubePlayer(videoId) {
    if (this.unmounted) {
      return;
    }

    if (this.videoId == videoId) {
      return;
    }

    this.videoId = videoId;

    if (videoId == null || videoId == "") {
      return;
    }

    this.setState({url: api.getYoutubeEmbedUrl(videoId)});
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
          <TouchableOpacity style={[this.state.fullScreen ? styles.displayNone : {}]} onPress={()=>funcs.goTo("YoutubePlayListList")}>
            <IconSimpleLineIcons name="playlist" style={styles.playList}/>
          </TouchableOpacity>
        </View>
    );
  }
}

const s = {
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
    height: width,
    position: "absolute",
    top: 0,
    left: 0
  }
};

export default YoutubeSection;