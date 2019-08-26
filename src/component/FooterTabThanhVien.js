import React, { Component } from 'react';
import { FooterTab as FooterTabNB, Footer, Button } from 'native-base';
import { Image, View, TouchableOpacity } from 'react-native';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Colors from "../Colors";
import * as funcs from "../utils/funcs";
import Text from './Text';
import * as styles from "../Styles";

export default class FooterTabThanhVien extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      return(
        <View style={[styles.footerTab.container]}>
            <TouchableOpacity style={[styles.footerTab.borderRight, styles.footerTab.buttonTab]} onPress={() => funcs.goTo("homeThanhVien")}>
                <Text style={[styles.footerTab.text, this.props.screen == "homeThanhVien" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Trang chủ
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerTab.buttonTab]} onPress={() => funcs.goTo("TVXemLaiTruocDay")}>
                <Text style={[styles.footerTab.text, this.props.screen == "TVXemLaiTruocDay" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Xem lại trước đây
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerTab.borderLeft, styles.footerTab.buttonTab]} onPress={() => funcs.goTo("TVDuocPhepChinhSua")}>
                <Text style={[styles.footerTab.text, this.props.screen == "TVDuocPhepChinhSua" ? styles.footerTab.activeColor : styles.footerTab.inactiveColor]}>
                    Được phép chỉnh sửa
                </Text>
            </TouchableOpacity>
        </View>
      );
    }
}
