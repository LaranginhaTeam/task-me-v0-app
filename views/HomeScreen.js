'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  Dimensions,
  AsyncStorage,
  Alert,
  TouchableHighlight
} from 'react-native';

import SocketIOClient from 'socket.io-client';

import { TextField } from 'react-native-material-textfield';
import MapView from 'react-native-maps';
import axios from 'axios';
import { Button, Avatar, Badge } from 'react-native-elements'
import Load from '../components/Load/Load';
import ProgressBarAnimated from 'react-native-progress-bar-animated';

import { constants, colors, fonts } from '../assets/general';

export default class HomeScreen extends Component {

  static navigationOptions = ({ navigation }) => ({
    header: null,
  });


  constructor(props) {
    super(props);

    this.state = {

      //load
      load: false,
      loadText: "Aguarde",

      //map
      map_width: 150,
      map_height: 150,

      //task
      accept: false,
      status: false,
      timing: null,
      showImage: true,
      constante: 0,
      user: {
        name: null,
        depto: null,
        token: null,
      },
      task: false,
      screen: {
        width: Dimensions.get('window').width
      },

      //position
      myPos: {
        latitude: null,
        longitude: null,
      },
    }
    this.sendLocationForever();
  };

  componentDidMount() {

  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.socket.disconnect();
  }


  componentWillMount() {

    AsyncStorage.getItem('@taskme:user').then((value) => {

      const user = JSON.parse(value);

      this.setState({ user });
      console.log(user);

      if (!user) {
        this.props.navigation.navigate("Auth");
      }
    });

    AsyncStorage.getItem('@taskme:task').then((value) => {
      const task = JSON.parse(value);

      if (task != null) {
        this.setState({ task, accept: true });
      }
    });

  }

  async storeItem(key, item, callback) {
    try {
      await AsyncStorage.setItem(`@taskme:${key}`, JSON.stringify(item), callback);
    } catch (error) {
      console.log(error.message);
    }
  }

  refuse = () => {
    this.load();
    this.setState({loadText: "Recusando..."});
    axios.post(`${constants.base_url}api/task/refuse/${this.state.task._id}`, { access_token: this.state.user.token })
      .then((response) => {
        if (response.data.code == 200) {
          this.setState({ task: false, load: false });
        }
      })
      .catch((error) => {
        console.log(error);
      })
  }

  accept = () => {
    this.load();
    this.setState({loadText: "Aceitando..."});
    axios.post(`${constants.base_url}api/task/accept/${this.state.task._id}`, { access_token: this.state.user.token })
      .then((response) => {
        if (response.data.code == 200) {
          this.storeItem('task', this.state.task, () => {
            this.setState({ accept: true, load: false })
          });
        }
      })
      .catch((erro) => {
        console.log(erro);
      });
  }

  finalize = () => {
    this.load();
    this.setState({loadText: "Finalizando..."});
    axios.post(`${constants.base_url}api/task/finalize/${this.state.task._id}`, { access_token: this.state.user.token, commentary: this.state.comentario })
      .then((response) => {
        if (response.data.code === 200) {
          this.setState({ task: false });
          AsyncStorage.removeItem('@taskme:task', () => { this.setState({ task: false, accept: false, load: false }) });
        }
    });


  }

  timedown = () => {
    this.setState({ progress: 100 });

    this.interval = setInterval(() => {
      if (this.state.progress > 0) {
        this.setState({ timing: this.state.timing - 0.2, progress: this.state.progress - this.state.constante });
      } else {
        clearInterval(this.interval);
        this.setState({ task: false })
      }
    }, 200);
  }

  load = () => {
    if (this.state.load) {
      this.setState({ load: false });
    } else {
      this.setState({ load: true });
    }
  }

  _quit = () => {
    AsyncStorage.removeItem('@taskme:user', () => { this.props.navigation.navigate('Auth') });
  }

  sendLocationForever = () => {
    this.interval = setInterval(() => {

      navigator.geolocation.getCurrentPosition((position) => {
        let myPos = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.setState({ myPos });

        if (this.state.status) {
          this.socket.emit("my_location", myPos);
        }

      },
        (error) => { console.log(error) },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }, 10000)
  }

  getTask = () => {

    this.socket.on('new_task', (response) => {
      let id = response.id,
        timing = (response.timestamp - new Date().getTime()) / 1000,
        constante = 0.2 * 100 / timing;

      this.timedown();

      this.setState({ constante, timing });

      axios.get(`${constants.base_url}api/task/${id}?access_token=${this.state.user.token}`)
        .then((response) => {
          let task = response.data.task;

          this.setState({ task });
        });
    });

  }



  render() {
    let statusColor = (this.state.status) ? "green" : "#CCC",
      statusText = (this.state.status) ? "Online" : "Offline",
      titleText = (this.state.accept) ? "MINHA TAREFA" : "TAREFA RECEBIDA";

    const barWidth = Dimensions.get('screen').width,
      progressCustomStyles = {
        backgroundColor: (this.state.progress > 30) ? colors.primary : 'red',
        borderRadius: 0,
        borderBottomRadius: 10,
        barAnimationDuration: 0,
        borderColor: "white",
      };


    return (
      <ScrollView style={styles.container}>
        <Load
          text={this.state.loadText}
          show={this.state.load}
        />

        {/* HEADER */}


        <View style={{ backgroundColor: colors.header_primary, padding: 20, flexDirection: 'row' }}>

          <Avatar
            large
            rounded
            source={{ uri: "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg" }}
            onPress={() => {
              Alert.alert(
                'Sair?',
                'Você realmente deseja sair?!',
                [
                  { text: 'Sim', onPress: () => this._quit() },
                  { text: 'Não', onPress: () => { } },
                ],
                { cancelable: false }
              );
            }}
            activeOpacity={0.7}
          />
          <View style={{ flexDirection: "column", marginLeft: 20 }}>
            <Text style={{ color: 'white', fontSize: fonts.large }}>{this.state.user.name}</Text>
            <Text style={{ color: 'white', fontSize: fonts.medium }}>{this.state.user.depto}</Text>
            <Badge
              containerStyle={{ backgroundColor: statusColor, borderWidth: 0, marginTop: 10 }}
              onPress={() => {
                this.setState({ status: !this.state.status }, () => {

                  if (this.state.status) {
                    this.socket = SocketIOClient(constants.socket_base_url, { query: `access_token=${this.state.user.token}` });
                    this.getTask();

                  } else {
                    this.socket.disconnect();
                  }
                });
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{statusText}</Text>
            </Badge>
          </View>
        </View>
        <View style={styles.horizontal}>

          <Button
            small
            icon={{ name: 'plus', type: 'font-awesome' }}
            rounded
            title="Nova Tarefa"
            color="white"
            backgroundColor={colors.header_primary}
            buttonStyle={{ marginVertical: 5, width: 150 }}
            onPress={() => {
              this.props.navigation.navigate('Image', { user: this.state.user });
            }}
          />

          <Button
            small
            icon={{ name: 'comment', type: 'font-awesome' }}
            rounded
            title="Chat"
            color="white"
            backgroundColor={colors.primary}
            buttonStyle={{ marginVertical: 5, width: 150 }}
            onPress={() => {
              this.props.navigation.navigate('Chat', { user: this.state.user });
            }}
          />
        </View>


        {/* {CARD */}



        <View style={{ flex: 1, flexDirection: 'column', width: '100%', alignItems: 'center', marginTop: 10 }}>

          {(this.state.task) ?
            <View>
              <View style={{ backgroundColor: '#fff', width: '100%', padding: 10 }}>

                <View style={{ flexDirection: 'row' }}>

                  <View>
                    <Text style={{ color: colors.primary, fontSize: fonts.xlarge }}>{titleText}</Text>
                    <Text style={{ color: 'gray', fontSize: fonts.medium }}>{this.state.task.created_at}</Text>
                  </View>
                  <View>
                    <Badge containerStyle={{ backgroundColor: 'red', borderWidth: 0, marginTop: 5, marginLeft: 5 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>Prioridade {this.state.task.priority}</Text>
                    </Badge>
                  </View>

                </View>

                <View style={{ flexDirection: 'row' }}>


                  {(!this.state.showImage) ?
                    <View style={{ width: '100%' }}>
                      <TouchableHighlight
                        onPress={() => {
                          this.setState({ showImage: !this.state.showImage })
                        }}
                      >
                        <Image
                          source={{ uri: this.state.task.image }}
                          style={{ alignSelf: 'center', width: '100%', height: 200 }}

                        />
                      </TouchableHighlight>
                    </View>
                    :
                    <MapView
                      ref={map => this.mapView = map}
                      initialRegion={{
                        latitude: this.state.task.location.lat,
                        longitude: this.state.task.location.long,
                        latitudeDelta: 0.0012,
                        longitudeDelta: 0.0011,
                      }}
                      style={{
                        width: '100%',
                        height: 200
                      }}
                      rotateEnabled={false}
                      cacheEnabled={true}
                      onPress={() => {
                        this.setState({ showImage: !this.state.showImage })
                      }}
                      zoomEnabled={true}
                      showsPointsOfInterest={false}
                      showsUserLocation={true}
                      showsMyLocationButton={false}
                      showBuildings={false}
                      showsIndoors={true}
                      mapType="satellite"
                    >

                      <MapView.Marker
                        title={"Localizacao"}
                        description={"Localização da evidência"}
                        key={1}
                        coordinate={{ latitude: this.state.task.location.lat, longitude: this.state.task.location.long }}
                      />

                    </MapView>
                  }

                </View>
                <Text style={{ color: colors.primary, alignSelf: 'center' }}>{this.state.task.description}</Text>

                {(this.state.accept)
                  ?
                  <View>
                    <TextField
                      label='Inserir comentário (opcional)'
                      multiline={true}
                      onChangeText={(comentario) => this.setState({ comentario })}
                    />

                    <View style={styles.horizontal}>
                      <Button
                        buttonStyle={{ width: 150, height: 50 }}
                        backgroundColor="green"
                        icon={{ name: 'check', type: 'font-awesome' }}
                        title="Finalizar"
                        rounded
                        textStyle={{ textAlign: 'center' }}
                        onPress={() => { this.finalize() }}
                      />

                    </View>
                  </View>

                  :

                  // BOTÕES PARA ACEITAR/RECUSAR
                  <View style={styles.horizontal}>
                    <Button
                      buttonStyle={{ width: 150, height: 50 }}
                      backgroundColor="green"
                      icon={{ name: 'check', type: 'font-awesome' }}
                      title="Aceitar tarefa"
                      rounded
                      textStyle={{ textAlign: 'center' }}
                      onPress={() => { this.accept() }}
                    />

                    <Button
                      buttonStyle={{ width: 150, height: 50 }}
                      backgroundColor="red"
                      icon={{ name: 'times', type: 'font-awesome' }}
                      title="Estou ocupado"
                      rounded
                      textStyle={{ textAlign: 'center' }}
                      onPress={() => this.refuse()}
                    />
                  </View>
                }

              </View>

              {/* PROGRESSBAR */}
              {(!this.state.accept)
                ?
                <ProgressBarAnimated
                  {...progressCustomStyles}
                  width={barWidth}
                  value={this.state.progress}
                />
                :
                null
              }
            </View>
            :
            null
          }
        </View>

      </ScrollView >
    );
  }

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },

});
