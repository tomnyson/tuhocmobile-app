import React, { Component } from 'react';
import { Image, Dimensions, TouchableOpacity } from 'react-native';
import { View, Icon } from 'native-base';
import Text from "./Text";
const { width, height } = Dimensions.get('window');

export default class PopoverContent extends Component {
    constructor(props){
        super(props);
    }

    onClosePress() {
        this.props.onClose && this.props.onClose(this.props.data);
    }

    onObservePress() {
        this.props.onObserver && this.props.onObserver(this.props.data);
    }

    onVehicleInfoPress() {
        this.props.onVehicleInfo && this.props.onVehicleInfo(this.props.data);
    }

    onJourneysPress() {
        this.props.onJourneys && this.props.onJourneys(this.props.data);
    }

    onPlayBackPress() {
        this.props.onPlayBack && this.props.onPlayBack(this.props.data);
    }

    renderHeader() {
        return (
            <TouchableOpacity onPress={this.onClosePress.bind(this)}>
                <View style={s.header.container}>
                    <Text style={s.header.title}>{this.props.data.BienSo}</Text>
                    <Icon name="close"></Icon>
                </View>
            </TouchableOpacity>
        );
    }

    renderBody() {
        return (
            <View style={s.body.container}>
                <View style={s.body.line1}>
                    <Text style={[{ color: this.props.data.StatusColor1, width: "29%" }]}>
                        {this.props.data.TrangThai}
                    </Text>
                    <Text note style={{ textAlign: "left" }}>{this.props.data.ThoiGianDung}</Text>
                </View>
                <Text note style={[{ color: this.props.data.StatusColor3 }, s.body.line2]}>{this.props.data.ViTri}</Text>
            </View>
        );
    }

    renderFooter() {
        return (
            <View style={s.footer.container}>
                <View style={s.footer.button}>
                    <TouchableOpacity onPress={this.onVehicleInfoPress.bind(this)}
                        style={s.footer.button}>
                        <Image style={s.footer.image} source={require("../assets/images/Demo/1.thongtin64.png")} />
                        <Text>Thông tin</Text>
                    </TouchableOpacity>
                </View>
                <View style={s.footer.button}>
                    <TouchableOpacity onPress={this.onObservePress.bind(this)}
                        style={s.footer.button}>
                        <Image style={s.footer.image} source={require("../assets/images/Demo/2.theodoi64.png")} />
                        <Text>Theo dõi</Text>
                    </TouchableOpacity>
                </View>
                <View style={s.footer.button}>
                    <TouchableOpacity onPress={this.onJourneysPress.bind(this)}
                        style={s.footer.button}>
                        <Image style={s.footer.image} source={require("../assets/images/Demo/3.hanhtrinh64.png")} />
                        <Text>Hành trình</Text>
                    </TouchableOpacity>
                </View>
                <View style={s.footer.button}>
                    <TouchableOpacity onPress={this.onPlayBackPress.bind(this)}
                        style={s.footer.button}>
                        <Image style={s.footer.image} source={require("../assets/images/Demo/4.xemlai64.png")} />
                    <Text>Xem lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        return this.props.visible ? (
            <View style={[s.container, this.props.style]}>
                {
                    this.props.data ? this.renderHeader() : null
                }
                {
                    this.props.data ? this.renderBody() : null
                }
                {
                    this.props.data ? this.renderFooter() : null
                }
            </View>
            ) : null;
    }
}
const s = {
  container: {
      width: width,
      flexDirection: "column",
      backgroundColor: "#ffffff",
      position: "absolute",
      bottom: 0,
      left: 0,
      padding: 4
  },
  header: {
    container: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F3F3"
    },
    title: {
        fontWeight: "bold"
    }
  },
  body: {
    container: {
        flexDirection: "column",
        marginTop: 10
    },
    line1: {
        flexDirection: "row"
    },
    line2: {
        marginTop: 10
    }
  },
  footer: {
      container: {
        flexDirection: "row",
        justifyContent: 'space-between',
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#F3F3F3",
        paddingTop: 10
      },
      image: {
        width: 32,
        height: 32
      },
      button: {
        flexDirection: "column",
        justifyContent: 'space-between',
        alignItems: "center"
      }
  }
};
