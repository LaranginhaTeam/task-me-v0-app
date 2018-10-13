import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    container: {
        position: "absolute",
        justifyContent: 'center',
        zIndex: 9999,
        bottom: 0, top: 0, left: 0, right: 0,
        backgroundColor: "rgba(0,0,0,.8)",
        alignItems: "center"
    },

    text: {
        color: "white"
    }
});