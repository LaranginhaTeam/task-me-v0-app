import React, { Component } from 'react';

import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Alert,
  AsyncStorage
} from 'react-native';

import axios from 'axios';

import Logo from '../components/Logo/Logo';
import Footer from '../components/Footer/Footer';
import InputContainer from '../components/InputContainer/InputContainer';
import RoundedButton from '../components/RoundedButton/RoundedButton';
import Load from '../components/Load/Load';
import { constants } from '../assets/general';


export default class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      login: "vinijabes@gmail.com",
      password: "jabinho",
      error: null,
      email: null,
      load: false,
      loadText: null,
    }
  };

  async storeItem(key, item, callback) {
    try {
      var jsonOfItem = await AsyncStorage.setItem(`@taskme:${key}`, JSON.stringify(item),callback);
    } catch (error) {
      console.log(error.message);
    }
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
              label={"Login"}
              state={"login"}
              value={this.state.login}
              onChangeText={this.changeLogin}
              placeholder={"foo@company"}
              multiline={false}
              lines={1}
              autoCapitalize={'none'}
              password={false}
            />
            <InputContainer
              label={"Senha"}
              state={"password"}
              value={this.state.password}
              onChangeText={this.changePassword}
              placeholder={""}
              multiline={false}
              lines={1}
              password={true}
              autoCapitalize={'none'}
              onSubmitEditing={Keyboard.dismiss}
            />
            <RoundedButton
              onPress={this.sign}
              title={"ENTRAR"}
            />
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('PasswordRecover')}
            >
              <Text style={styles.link}> Esqueci minha senha</Text>
            </TouchableOpacity>
            <Footer />
          </View>
        </ImageBackground>
      </View>
    );
  }

  load = () => {
    if (this.state.load) {
      this.setState({ load: false });
    } else {
      this.setState({ load: true });
    }
  }


  sign = async () => {
    this.load();
    this.setState({ loadText: "Conectando" });

    axios.post(constants.base_url + 'login', {
      email: this.state.login,
      password: this.state.password
    })
      .then(async (response) => {
        console.log(response.data);

        if (response.data.code == 200) {
          let user = {
            token: response.data.token,
            name: response.data.user.name,
            depto: response.data.user.department,
          };

          this.storeItem('user', user, this.props.navigation.navigate('Home'));

        } else {

          this.setState({ loadText: "Ops..." });
          Alert.alert(
            'Login e/ou senha inválidos',
            'Ops... tente novamente ou clique em Esqueci minha senha para criar uma nova senha.',
            [
              { text: 'Esqueci minha senha', onPress: () => this.props.navigation.navigate('PasswordRecover') },
              { text: 'Tentar novamente', onPress: () => { } },
            ],
            { cancelable: false }
          );
          this.load();
        }

      })
      .catch(function (error) {
        console.log(error);
      });

    this.load();
  };


  changeLogin = (login) => {
    this.setState({
      login,
    });
  };

  changePassword = (password) => {
    this.setState({
      password,
    });
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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