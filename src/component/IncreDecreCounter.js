import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
import { Icon, View  } from 'native-base';
import Text from "./Text";

interface  Size {
    width?: Number,
    height?: Number
}

export default class IncreDecreCounter extends Component<Size> {
  constructor(props) {
    super(props);
    this.state = {
      number: 1
    };
  }

  componentWillMount() {
    if (typeof this.props.initNumber == "undefined") {
      this.setState({
        number: 1,
        operator: "cong",
        step: 1
      });
    }
    else {
      this.setState({
        number: this.props.initNumber
      });
    }

    if (typeof this.props.operator != "undefined") {
      this.setState({
        operator: this.props.operator.toLowerCase()
      });
    }

    if (typeof this.props.step != "undefined") {
      this.setState({
        step: this.props.step
      });
    }
  }

  onIncrease() {
    let number = this.state.number;
    
    if (typeof this.props.maxValue == "undefined" || number < this.props.maxValue) {
      
      if (this.state.operator == "cong") {
        number += this.state.step;
      } else if (this.state.operator == "nhan") {
        number *= this.state.step;
      }

      this.setState({
        number: number
      });

      this.props.onNumberChange && this.props.onNumberChange(number);
    }
  }

  onDecrease() {
    let number = this.state.number;
    if (typeof this.props.minValue == "undefined" || number > this.props.minValue) {
      if (this.state.operator == "cong") {
        number -= this.state.step;
      } else if (this.state.operator == "nhan") {
        number = number / this.state.step;
      }

      this.setState({
        number: number
      });

      this.props.onNumberChange && this.props.onNumberChange(number);
    }
  }

  render() {
    return (
      <View style={[s.container, this.props.style, { 
              width: (this.props.width != null ? this.props.width : 40),
              height: (this.props.height != null ? this.props.height : 120)
          }]}>
            <View style={s.topContainer}>
              <TouchableOpacity onPress={this.onIncrease.bind(this)}>
                <Icon name="add" style={s.controlIcon} />
              </TouchableOpacity>
            </View>
            <View style={s.middleContainer}>
                <Text>{this.props.prefix}{this.state.number}</Text>
            </View>
            <View style={s.bottomContainer}>
              <TouchableOpacity onPress={this.onDecrease.bind(this)}>
                <Icon name="remove" style={s.controlIcon} />
              </TouchableOpacity>
            </View>
      </View>
    )
  }
}

const borderColor = "#EAF1F4";

const s = {
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: borderColor
  },
  topContainer: {
    width: "100%",
    height: "35%",
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#529FF3"
  },
  middleContainer: {
    width: "100%",
    height: "30%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  bottomContainer: {
    width: "100%",
    height: "35%",
    borderTopWidth: 1,
    borderTopColor: borderColor,
    backgroundColor: "#EB9E3E",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  controlIcon: {
    color: "#ffffff"
  }
};
