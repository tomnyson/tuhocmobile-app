import React, {Component} from "react";
import Text from "./Text";
import { TouchableOpacity, View} from 'react-native';
import Colors from "../Colors";

interface BsStyle {
    success?: boolean;
    primary?: boolean;
    danger?: boolean;
    warning?: boolean;
    info?: boolean;
    light?: boolean;
}

interface  Size {
    width?: Number,
    height?: Number
}

class RoundText extends Component<BsStyle, Size>{
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
            color = Colors.navbarBackgroundColor;
        } else if (this.props.primary) {
            color = "#0A60FF";
        } else if (this.props.light) {
            color = "#F1F1F1";
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
                    <Text style={s.text}>
                        {this.props.text}
                    </Text>
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
    },
    text:{
        fontSize: 16,
        textAlign: "center",
        color: "#ffffff",
        fontWeight: "bold"
    }
};

export default RoundText;