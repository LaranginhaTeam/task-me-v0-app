import {StyleSheet} from 'react-native';

import {fonts,colors, metrics} from '../../assets/general';

export default StyleSheet.create({
  inputContainer: {
    paddingHorizontal: metrics.inputPaddingHorizontal,
    paddingVertical: metrics.inputPaddingVertical,
    alignItems: 'center',
    width: metrics.screenWidth,
  },
  boxTitle: {
    color:'white',
    fontWeight: 'bold',
    fontSize: fonts.input,
    marginLeft: metrics.inputPaddingVertical,
    alignSelf: 'flex-start',
  },
  boxInput: {
    height: metrics.inputHeight,
    alignSelf: 'stretch',
    marginTop: metrics.inputSpacing,
    paddingBottom: metrics.medium,
    paddingHorizontal: metrics.large,
    color: 'black',
    backgroundColor: colors.white_opacity,
    borderRadius: 30,
  },
});

