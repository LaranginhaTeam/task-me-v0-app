'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  AsyncStorage,
  Alert,
  TouchableHighlight
} from 'react-native';

import SocketIOClient from 'socket.io-client';

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
      accepted: false,
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

      myLastPos: {
        latitude: null,
        longitude: null,
      }


    }

    this.sendLocationForever();

  };

  componentDidMount() {

  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  componentWillMount() {

    AsyncStorage.getItem('@taskme:user').then((value) => {

      const user = JSON.parse(value);

      this.setState({ user });

      if (!user) {
        this.props.navigation.navigate("Auth");
      }
    });

    AsyncStorage.getItem('@taskme:task').then((value) => {
      const task = JSON.parse(value);

      console.log(task);

      if (task != undefined) {
        this.setState({ task, accept: true });
      }
    });

  }

  async storeItem(key, item, callback) {
    try {
      var jsonOfItem = await AsyncStorage.setItem(`@taskme:${key}`, JSON.stringify(item), callback);
    } catch (error) {
      console.log(error.message);
    }
  }

  refuse = () => {
    axios.post(`${constants.base_url}/api/task/refuse/${this.state.task._id}`, { access_token: user.token })
      .then((response) => {
        if (response.code === 200) {
          this.setState({ task: false });
        }
      });
  }

  accept = () => {
    this.load();
    // axios.post(`${constants.base_url}/api/task/accept/${this.state.task._id}`, { access_token: this.state.user.token })
    //   .then((response) => {
    //     if (response.code === 200) {

    //     }
    //   });

    this.storeItem('task', this.state.task, () => { this.setState({ task: false }); this.load(); });
  }

  finalize = () => {
    axios.put(`${constants.base_url}/api/task/${this.state.task._id}`, { access_token: user.token })
      .then((response) => {
        if (response.code === 200) {
          this.setState({ task: false });
        }
      });
  }




  timedown = () => {
    this.setState({ progress: 100 });

    this.interval = setInterval(() => {
      console.log(this.state.progress);
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

  }

  sendLocationForever = () => {
    this.interval = setInterval(() => {

      navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position);
        let myPos = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.setState({ myLastPos: this.state.myPos, myPos });


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
      let TEMPO = 20000;

      console.log(response);
      // let timing = (TEMPO - new Date().getTime()) / 1000;
      let timing = 20000;
      let constante = 20 / 5;
      let task = response;

      this.setState({ constante, timing, task });

      this.timedown();

      // axios.get(`${constants.base_url}api/task/${id}?access_token=${this.state.user.token}`)
      //   .then((response) => {
      //     // console.log(response.data);

      //     let task = response.data.task;

      //     this.setState({ task });
      //     this.timedown();
      //   });
    });

  }



  render() {
    let statusColor = (this.state.status) ? "green" : "#CCC";
    let statusText = (this.state.status) ? "Online" : "Offline";

    const barWidth = Dimensions.get('screen').width;

    const progressCustomStyles = {
      backgroundColor: (this.state.progress > 30) ? colors.primary : 'red',
      borderRadius: 0,
      borderBottomRadius: 10,
      barAnimationDuration: 0,
      borderColor: "white",
    };


    return (
      <View style={styles.container}>
        <Load
          text={this.state.loadText}
          show={this.state.load}
        />
        <View style={{ backgroundColor: colors.header_primary, padding: 20, flexDirection: 'row', borderBottomRightRadius: 50 }}>

          <Avatar
            large
            rounded
            source={{ uri: "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg" }}
            onPress={() => {
              Alert.alert(
                'Sair?',
                'Você realmente deseja sair?!',
                [
                  { text: 'Sim', onPress: () => this.props.navigation.navigate('Auth') },
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
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{statusText}</Text>
            </Badge>
          </View>
        </View>



        {/* {CARD */}



        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>

          {(this.state.task) ?
            <View>
              <View style={{ backgroundColor: '#fff', width: '100%', padding: 10 }}>

                <View style={{ flexDirection: 'row' }}>

                  <View>
                    <Text style={{ color: colors.primary, fontSize: fonts.xlarge }}>TAREFA RECEBIDA</Text>
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
                    <View style={{ flex: 1, paddingLeft: 5 }}>
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
                  <Button
                    medium
                    // buttonStyle={{ width: '100%', height: 80 }}
                    backgroundColor="green"
                    icon={{ name: 'check', type: 'font-awesome' }}
                    title="Finalizar"
                    rounded
                    textStyle={{ textAlign: 'center' }}
                    onPress={() => { this.finalize() }}
                  />
                  :

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
                      onPress={() => alert("Rejeitou")}
                    />
                  </View>
                }

              </View>
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
        <Button
          large
          icon={{ name: 'plus', type: 'font-awesome' }}
          rounded
          title="Nova Tarefa"
          color="white"
          backgroundColor={colors.header_primary}
          buttonStyle={{ marginBottom: 5 }}
          onPress={() => {
            this.props.navigation.navigate('Image', { user: this.state.user });
          }}
        />
      </View >
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

  fotoText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center',
    marginTop: 50,
  },

  preview: {
    flex: 1,
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },

  capture: {
    flex: 0,
    backgroundColor: 'rgba(255,255,255,.8)',
    height: 80,
    width: 80,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  buttonAux: {
    backgroundColor: 'rgba(255,255,255,.8)',
    height: 40,
    width: 40,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 5,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  take_photo: {
    width: 50,
    height: 50,
    alignSelf: 'center'
  },

  button: {
    width: 50,
    height: 50,
    alignSelf: 'center'
  },

  button2: {
    width: 30,
    height: 30,
    alignSelf: 'center'
  },


});
