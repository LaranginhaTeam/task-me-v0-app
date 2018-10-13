import {Dimensions, Platform} from 'react-native';

const {width, height} = Dimensions.get('window');

export default metrics = {
    small: 5,
    medium: 10,
    large: 20,
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
    topBarHeight: (Platform.OS === 'ios') ? 64 : 54,
    inputPaddingHorizontal: 40,
    inputPaddingVertical: 10,
    inputHeight: 50,
    inputSpacing: 10,
    buttonHeight: 60,
}