import AsyncStorage from '@react-native-community/async-storage';
const Storage = {
    getItem: async function (key) {
        let item = await AsyncStorage.getItem(key);
        if (typeof item == 'undefined' || item == null)
        {
            return null;
        }

        return JSON.parse(item);
    },
    setItemAsync: async function (key, value) {
        if(typeof value == "undefined" || value == null){
            return false;
        }
        return await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    setItem: function (key, value) {
        if(typeof value == "undefined" || value == null){
            return false;
        }
        return AsyncStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: async function (key) {
        return await AsyncStorage.removeItem(key);
    },
    Keys: {
        LOGIN_INFO: "LOGIN_INFO",
        USERS: "USERS",
        INCOMES: "INCOMES",
        SPENDS: "SPENDS"
    }
};

export default Storage;