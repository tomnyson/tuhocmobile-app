import React, {Component} from "react";
import { TouchableOpacity, View} from 'react-native';

interface BsStyle {
    success?: boolean;
    primary?: boolean;
    danger?: boolean;
    warning?: boolean;
    info?: boolean;
    light?: boolean;
    yellow?: boolean;
}

interface  Size {
    width?: Number,
    height?: Number
}

class RoundIcon extends Component<BsStyle, Size>{
    constructor(props){
        super(props);
        this._onPress = (()=>{
            this.props.onPress && this.props.onPress();
        }).bind(this);

        this.state = {
            containerStyle: {}
        };
    }

    componentWillMount() {
        var color = "red";
        if (this.props.success) {
            color = "#4DAD4A";
        } else if (this.props.primary) {
            color = "#529FF3";
        } else if (this.props.light) {
            color = "#C1C1C1";
        } else if (this.props.warning) {
            color = "#EB9E3E";
        }

        this.setState({
            containerStyle: {
                backgroundColor: color
            }
        });
    }

    render(){
        return(
            <View style={[s.container, this.state.containerStyle, 
                { 
                    width: (this.props.width != null ? this.props.width : 50),
                    height: (this.props.height != null ? this.props.height : 50),
                    borderRadius: (this.props.width != null ? this.props.width/2 : 50/2),
                }, this.props.style]}>
                <TouchableOpacity onPress={this._onPress}>
                    {this.props.children}
                </TouchableOpacity>
            </View>
        );
    }
}

const s ={
    container: {
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: "center"
    }
};

export default RoundIcon;