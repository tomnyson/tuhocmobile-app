import React, {Component} from 'react';
import { Platform, PickerIOS, PickerItemIOS } from 'react-native';
import { WheelPicker } from 'react-native-wheel-picker-android';
import * as Styles from "../Styles";
import * as funcs from "../utils/funcs";

export default class ScrollPicker extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            selectedValue: this.props.selectedValue.toString()
        });
    }

    onIOSValueChange(e) {
        let value = funcs.getCalendarData(e);
        this.setState({
            selectedValue: value
        });

        this.props.onValueChange && this.props.onValueChange(e);
    }

    render() {
        return Platform.OS === 'ios' ? (
            <PickerIOS style={[s.wheelPicker, this.props.style]}
                selectedValue={this.state.selectedValue}
                onValueChange={this.onIOSValueChange.bind(this)}>
                {
                    this.props.dataSource.map((item, index) => (
                        <PickerItemIOS
                            key={index}
                            value={item.toString()}
                            label={item.toString()} />
                    ))
                }
            </PickerIOS>
        ) : (
            <WheelPicker
                selectedItemPosition={this.props.selectedIndex}
                onItemSelected={this.props.onValueChange}
                isCurved={true}
                isCyclic={true}
                visibleItemCount={3}
                data={this.props.dataSource}
                selectedItemTextColor="#000000"
                itemTextFontFamily={Styles.fontName}
                itemTextSize={25}
                style={[s.wheelPicker, this.props.style]}/>
        )
    }
}

const s = {
    wheelPicker: {
    }
};