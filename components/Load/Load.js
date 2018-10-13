import React, { Component } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

import styles from './styles.js';

export default class Load extends Component {

    render() {
        if (this.props.show) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size={70} color="white" />
                    <Text style={styles.text}>{this.props.text}</Text>
                </View>
            );
        }
        else {
            return (
                <View></View>
            );
        }
    }
}
