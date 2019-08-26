import React, { Component } from 'react';
import { View, Keyboard } from 'react-native';

export default class PopupContainer extends Component {
    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow',(function(){
            this.props.onKeyboard && this.props.onKeyboard(true);
        }).bind(this));

        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide',(function(){
            this.props.onKeyboard && this.props.onKeyboard(false);
        }).bind(this));
    }

    componentWillUnmount(){
        this.unmounted = true;
        this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
    }

    render() {
        return (
        <View style={[this.props.style]}>
            {this.props.children}
        </View>
        )
    }
}

