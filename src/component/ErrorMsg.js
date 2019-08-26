import React, { Component } from 'react';
import Text from "./Text";
import { Button } from 'native-base';
export default class ErrorMsg extends Component {
  render() {
    return (
        <Button style={[this.props.style]} {...this.props} transparent disabled>
            <Text style={styles.text}>{this.props.children}</Text>
        </Button>
    )
  }
}

const styles = {
    text: {
      color: '#ff0000'
    }
};
  