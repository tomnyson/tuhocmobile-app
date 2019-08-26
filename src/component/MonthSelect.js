import React, { Component } from 'react';
import { Image, StatusBar, Dimensions, Platform, ImageBackground, TouchableOpacity } from 'react-native';
import { Container, Content, View, Button, Icon, Header, List, ListItem  } from 'native-base';
var moment = require('moment');

// Our custom files and classes import
import Text from '../component/Text';
import ScrollPicker from "../component/ScrollPicker";
import Colors from "../Colors";
import * as funcs from "../utils/funcs";
const { width, height } = Dimensions.get('window');

export default class MonthSelect extends Component {
    constructor(props) {
        super(props);

        this.year = moment().year();
        this.month = moment().month() + 1
    }

    render() {
        return (
            <View style={s.calendar.container}>
                <View style={s.calendar.header.container}>
                    <TouchableOpacity onPress={this.props.onCancel} style={{width: "30%"}}>
                        <Text style={[{fontWeight: "bold", width: "100%"}, s.calendar.header.text]}>Hủy bỏ</Text>
                    </TouchableOpacity>
                    <Text style={[s.calendar.header.text, {width: "40%"}]}>Chọn ngày</Text>
                    <TouchableOpacity style={{width: "30%"}} onPress={this.props.onOK}>
                        <Text style={[{fontWeight: "bold", width: "100%"}, s.calendar.header.text]}>Lựa chọn</Text>
                    </TouchableOpacity>
                </View>
                <View style={s.calendar.select.container}>
                    <View style={[s.calendar.select.row, {height: 40}]}>
                        <View style={[s.calendar.select.col40, s.calendar.select.cellContainer]}>
                            <Text style={s.calendar.select.headerText}>Tháng</Text>
                        </View>
                        <View style={s.calendar.select.col10}>
                        </View>
                        <View style={[s.calendar.select.col40, s.calendar.select.cellContainer]}>
                            <Text style={s.calendar.select.headerText}>Năm</Text>
                        </View>
                    </View>
                    <View style={[s.calendar.select.row, {flex: 1}]}>
                        <View style={[s.calendar.select.col40, s.calendar.select.cellContainer]}>
                            <ScrollPicker dataSource={funcs.months()} selectedIndex={this.props.month - 1}
                                selectedValue={this.props.month} 
                                style={s.calendar.select.scrollPicker}
                                onValueChange={this.props.onMonthChange}/>
                        </View>
                        <View style={[s.calendar.select.col10, s.calendar.select.cellContainer]}>
                            <Text style={s.calendar.select.dash}>-</Text>
                        </View>
                        <View style={[s.calendar.select.col40, s.calendar.select.cellContainer]}>
                            <ScrollPicker dataSource={funcs.years()} selectedIndex={funcs.yearIndex(this.props.year)} 
                                selectedValue={this.props.year}
                                style={s.calendar.select.scrollPicker}
                                onValueChange={this.props.onYearChange}/>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

const s = {
    calendar: {
        select: {
          container: {
            flex: 1,
            flexDirection: "column"
          },
          row: {
            flexDirection: "row"
          },
          col10: {
            width: "10%"
          },
          col40: {
            width: "40%"
          },
          cellContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          },
          cell2: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center"
          },
          headerText: {
            color: "#979797",
            fontWeight: "bold",
            paddingTop: 4,
            paddingBottom: 4,
            textAlign: "center",
            fontSize: 12
          },
          scrollPicker:{
            height: "95%",
            width: "100%"
          },
          dash: {
            fontSize: 15,
            color: "#979797"
          }
        },
        container: {
          width: width,
          height: "40%",
          position: "relative"
        },
        header: {
          container: {
            width: "100%",
            height: 40,
            flexDirection: "row", 
            alignItems: "center",
            backgroundColor: Colors.navbarBackgroundColor
          },
          text: {
            color: "#ffffff",
            textAlign: 'center'
          }
        },
    }
};
