import React, { Component } from 'react';

import {
  View,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';

import axios from 'axios';

import Logo from '../components/Logo/Logo';
import Footer from '../components/Footer/Footer';
import InputContainer from '../components/InputContainer/InputContainer';
import Load from '../components/Load/Load';
import RoundedButton from '../components/RoundedButton/RoundedButton';
import { constants, colors } from '../assets/general';

export default class PasswordScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: 'pietrobschiavinato@outlook.com',
      load: false,
      loadText: null,
    }
  };

  static navigationOptions = {
    title: 'Recuperar senha',
    headerStyle: { backgroundColor: colors.primary },
    headerTitleStyle: { color: 'white' },
  };

  changeEmail = (email) => {
    this.setState({
      email,
    });
  };

  load = () => {
    if (this.state.load) {
      this.setState({ load: false });
    } else {
      this.setState({ load: true });
    }
  }

  send = async () => {
    this.load();
    this.setState({ loadText: 'Enviando e-mail para ' + this.state.email })
    axios.post(constants.base_url + 'restore_password', {
      email: this.state.email,
    })
      .then(async (response) => {
        console.log(response);
        if (response.data.code == 200) {
          Alert.alert(
            'Tudo pronto!',
            'Foi enviado para o email: ' + this.state.email + ' as informações para alteração de senha.',
            [
              { text: 'OK', onPress: () => { } },
            ],
            { cancelable: false }
          );
        } else {
          alert("E-mail inválido");
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    this.load();
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          style={styles.background}
          source={require('../assets/images/bg-login.jpg')}
        >
          <Logo />
          <Load
            text={this.state.loadText}
            show={this.state.load}
          />

          <View style={styles.formContainer}>
            <InputContainer
              label={"E-mail de recuperação"}
              state={"email"}
              value={this.state.email}
              onChangeText={this.changeEmail}
              placeholder={"foo@domain.com"}
              multiline={false}
              lines={1}
              autoCapitalize={'none'}
              password={false}
            />
            <RoundedButton
              onPress={this.send}
              title={"ENVIAR"}
            />
            <Footer />
          </View>
        </ImageBackground>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  link: {
    color: '#8dbdf3',
    fontSize: 16,
    textDecorationLine: 'underline',
  }

});