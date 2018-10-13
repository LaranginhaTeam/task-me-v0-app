import { StyleSheet, Dimensions } from 'react-native';

import {fonts,colors, metrics} from '../../assets/general';

const {width} = Dimensions.get('window');

export default StyleSheet.create({
    buttonContainer: {
        paddingHorizontal: 40,
        paddingVertical: 5,
        width,
    },
    texto: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: fonts.input,
        alignSelf: 'center',
    },

    button: {
        height: metrics.buttonHeight,
        alignSelf: 'stretch',
        marginVertical: 20,
        backgroundColor: colors.primary,
        borderRadius: 10,
        borderBottomRightRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
});