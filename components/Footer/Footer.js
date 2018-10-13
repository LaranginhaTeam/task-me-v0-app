import React, { Component } from 'react';
import {View, Text, Dimensions } from 'react-native';

import styles from './styles.js';

export default class Footer extends Component {

  render() {
    return (
      <View style={styles.footerContainer}>
      <Text style={styles.text}>Poukas $olutions</Text>

      </View>
      );
  }
}
