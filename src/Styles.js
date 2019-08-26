import Colors from "./Colors";
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const heightHalf = {
    height: (height/2) - 50
};

export const sectionTitle = {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.statusBarColor,
    fontSize: 25
}

export const note = {
    color: "red"
}

export const playerHeight = 200;
export const playerConatinerHeight = 300;

export const playList = {
    color: Colors.navbarBackgroundColor,
    fontSize: 32,
    marginTop: 10
}

export const required = {
    color: "red"
}

export const displayNone = {
    display: "none"
}

export const Button = {
    backgroundColor: "#373F46",
    color: "#FFFFFF"
};

export const ButtonText = {
    color: "#FFFFFF"
};

export const Label = {
    fontFamily: 'Roboto',
    color: "#BCBCBC"
};

export const NavbarLeft = {
    left: {
        flex:1,
        flexDirection: 'row'
    },
    text: {
        color: "#FFFFFF",
        fontSize: 18
    },
    icon: {
        width: 18, 
        height: 18
    }
};

export const NavbarRight = {
    right: {
        flex:1
    },
    text: {
        color: "#FFFFFF"
    }
};

export const fontName = "Roboto";

export const headerText = {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingRight: 10
};

export const iconHeaderLeft = {
    fontSize: 32,
    color: Colors.buttonColor
};

export const chan = {
    backgroundColor: "#f2f2f2"
};

export const  le = {
    backgroundColor: "#f9ddc7"
};

export const cbx = {
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    marginLeft: 2,
    paddingLeft: 0
};

export const dropbox = {
    borderBottomColor: Colors.borderGray,
    borderBottomWidth: 1
}

export const textbox = {
    borderBottomColor: Colors.borderGray,
    borderBottomWidth: 1
}

export const online = {
    color: "green"
}

export const offline = {
    color: "red"
}

export const actionText = {
    textDecorationLine: 'underline', 
    color: Colors.statusBarColor
}

export const actionTextBlue = {
    textDecorationLine: 'underline', 
    color: "blue"
}

export const rowCenter = {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
}

export const cbxPaddingLeft30 = {
    width: 30
}

export const cbxPaddingLeft35 = {
    width: 35
}

export const columnCenter = {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
}

export const alignCenter = {
    justifyContent: "center",
    alignItems: "center"
}

export const border = {
    borderWidth: 1,
    borderColor: Colors.statusBarColor
}

export const borderTop = {
    borderTopWidth: 1,
    borderTopColor: Colors.statusBarColor
}

export const borderBottom = {
    borderBottomWidth: 1,
    borderBottomColor: Colors.statusBarColor
}

export const footerTab = {
    container: {
        backgroundColor: "#f9ddc7",
        borderTopWidth: 1,
        borderTopColor: Colors.statusBarColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "stretch"
    },
    buttonTab: {
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: "transparent",
        padding: 5,
        width: "33%"
    },
    text: {
        fontSize: 16,
        textAlign: "center"
    },
    inactiveColor: {
        color: '#757575'
    },
    activeColor: {
        color: Colors.statusBarColor
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.statusBarColor
    },
    borderRight: {
        borderRightWidth: 1,
        borderRightColor: Colors.statusBarColor
    }
}

