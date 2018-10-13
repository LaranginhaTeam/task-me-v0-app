import React, { Component } from 'react';

import { 
	View, 
	Text ,
	TouchableOpacity,
} from 'react-native';

import styles from './styles.js';

export default class RoundedButton extends Component{

	render (){
		return(
			<View style={styles.buttonContainer}>
				<TouchableOpacity
				style={styles.button}
				onPress={this.props.onPress}
				>
					<Text style={styles.texto}>{this.props.title}</Text>
				</TouchableOpacity>
			</View>
			);
	}
}









