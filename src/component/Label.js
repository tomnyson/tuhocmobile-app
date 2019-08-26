import React, { Component } from 'react';
import { Label as LabelRN } from 'native-base';
import * as s from "../Styles";

export default class Label extends Component {
  render() {
    return (
      <LabelRN style={[styles.font, this.props.style]} {...this.props}> 
        {this.props.children}
      </LabelRN>
    )
  }
}
const styles = {
  font: {
    fontFamily: s.fontName
  }
};
