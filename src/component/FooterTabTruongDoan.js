import React, { Component } from 'react';
import { FooterTab as FooterTabNB, Footer, Button } from 'native-base';
import { Image, View, TouchableOpacity } from 'react-native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from "../Colors";
import * as funcs from "../utils/funcs";
import Text from './Text';
import * as styles from "../Styles";

export default class FooterTabTruongDoan extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      return(
        <View style={[styles.footerTab.container]}>
            <TouchableOpacity style={[styles.footerTab.borderRight, styles.footerTab.buttonTab]} onPress={() => funcs.goTo("homeTruongDoan")}>
                <Text style={[styles.footerTab.text, this.props.screen == "homeTruongDoan" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Đăng Ký Trưởng Nhóm
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerTab.buttonTab} onPress={() => funcs.goTo("TDXemDanhSachTN")}>
                <Text style={[styles.footerTab.text, this.props.screen == "TDXemDanhSachTN" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Danh Sách Trưởng Nhóm
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerTab.borderLeft, styles.footerTab.buttonTab]} onPress={() => funcs.goTo("TDXemDanhSachTV")}>
                <Text style={[styles.footerTab.text, this.props.screen == "TDXemDanhSachTV" || this.props.screen == "TDXemDanhSachTVNgoaiNhom" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Danh Sách Thành Viên
                </Text>
            </TouchableOpacity>
        </View>
      );
    }
}

