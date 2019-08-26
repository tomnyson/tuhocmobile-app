import React, { Component } from 'react';
import { Header} from 'native-base';

// Our custom files and classes import
import Colors from '../Colors';

export default class Navbar extends Component {
  render() {
    return(
      <Header
        style={{backgroundColor: Colors.navbarBackgroundColor}}
        backgroundColor={Colors.navbarBackgroundColor}
        androidStatusBarColor={Colors.statusBarColor}
        noShadow={true}
        >
        {this.props.left ? this.props.left : {}}
        {this.props.body ? this.props.body : {}}
        {this.props.right ? this.props.right : {}}
      </Header>
    );
  }
}

const styles={
  body: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  title: {
    fontFamily: 'Roboto',
    fontWeight: '100'
  }
};
