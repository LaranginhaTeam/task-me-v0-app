import React, { Component } from 'react';
import {View, Image, Text} from 'react-native';

import styles from './styles.js';

export default class Logo extends Component {

  render() {
    return (
      <View style={styles.container}>
      <Image
      // resizeMode="contain"
      style={{width: 150, height: 150}}
      source={require('../../assets/images/logo.png')}
      />
      {/* <Text style={{fontSize: 48, fontFamily: 'Helvetica'}}>Task.me</Text> */}

      </View>
      );
  }
}
