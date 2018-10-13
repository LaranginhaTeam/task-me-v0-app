import {StyleSheet} from 'react-native';
import {fonts} from '../../assets/general';

export default StyleSheet.create({
    footerContainer: {
        bottom: 0,
        alignContent: 'stretch',
        alignSelf: 'center',
        alignItems: 'center',
        height: 30,
    },
    text: {
        color: 'white',
        fontSize: fonts.footer,
    }
});