import React, { Component } from 'react';
import { FooterTab as FooterTabNB, Footer, Button } from 'native-base';
import { Image, View, TouchableOpacity } from 'react-native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from "../Colors";
import * as funcs from "../utils/funcs";
import Text from './Text';
import * as styles from "../Styles";

export default class FooterTabTruongNhom extends Component {
    constructor(props) {
        super(props);
    }

    _onQuanLyThanhVienPress() {
        this.props.onQuanLyThanhVienPress && this.props.onQuanLyThanhVienPress();
    }

    render() {
      return(
        <View style={[styles.footerTab.container]}>
            <TouchableOpacity style={[styles.footerTab.borderRight, styles.footerTab.buttonTab]} onPress={() => funcs.goTo("homeTruongNhom")}>
                <Text style={[styles.footerTab.text, this.props.screen == "homeTruongNhom" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Trang chủ
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerTab.buttonTab} onPress={() => funcs.goTo("TNXemLaiTruocDay")}>
                <Text style={[styles.footerTab.text, this.props.screen == "TNXemLaiTruocDay" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Xem lại trước đây
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerTab.borderLeft, styles.footerTab.buttonTab]} onPress={this._onQuanLyThanhVienPress.bind(this)}>
                <Text style={[styles.footerTab.text, styles.footerTab.inactiveColor]}>
                    Quản lý thành viên
                </Text>
            </TouchableOpacity>
        </View>
      );
    }
}
