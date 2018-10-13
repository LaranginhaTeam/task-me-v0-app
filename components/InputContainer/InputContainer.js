import React, { Component } from 'react';

import { 
  View, 
  Text ,
  TextInput,
} from 'react-native';

import styles from './styles.js';

export default class InputContainer extends Component{

  render (){
    return(
      <View style={styles.inputContainer}>
            <Text style={styles.boxTitle}>{this.props.label}</Text>
            <TextInput
              style={styles.boxInput}
              underlineColorAndroid="rgba(70,70,70,.0)"
              placeholder={this.props.placeholder}
              value={this.props.value}
              autoCapitalize={this.props.autoCapitalize}
              onChangeText={text => this.props.onChangeText(text)}
              multiline={this.props.multiline}
              numberOfLines={this.props.lines}
              secureTextEntry={this.props.password}
            />
      </View>
      );
  }
}






