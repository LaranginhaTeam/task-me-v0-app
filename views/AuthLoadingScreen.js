import React, { Component } from 'react';

import {
  View,
  ImageBackground,
  StyleSheet,
  AsyncStorage
} from 'react-native';

import Load from '../components/Load/Load';

export default class AuthLoadingScreen extends React.Component {

  constructor(props) {
    super(props);
  }


  componentDidMount() {
 
    AsyncStorage.getItem('@taskme:user').then((value) => {
      console.log(JSON.parse(value));
      if (value != null) {
        console.log("Navegando para home");
        this.props.navigation.navigate('App');
      } else {
        console.log("Navegando para login");
        this.props.navigation.navigate('Auth');
      }
    })
  }


  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          style={styles.background}
          source={require('../assets/images/bg-login.jpg')}
        />
        <Load show={true} text={"Aguarde"} />
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignContent: 'center',
  },

  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});