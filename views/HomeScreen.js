'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  AsyncStorage,
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
      load: false,
      loadText: "Aguarde",
      map_width: 150,
      map_height: 150,
      status: false,
      timing: 100,
      showImage: true,
      user: {
        name: null,
        depto: null,
        token: null,
      },
      task: {
        description: "Recolher cacos de vidro",
        image: "https://static.vix.com/pt/sites/default/files/styles/l/public/bdm/field/image/vidro-quebrado_0.jpg?itok=a3HWD9E4",
        department: "Jardinagem",
        priority: "Alta",
        created_at: "13:20 01/11/2018",
        marker: {
          latitude: -22.1336038,
          longitude: -51.44793917
        },
      },
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
    // clearInterval(this.interval);
  }


  componentWillMount() {
    let marker = {
      latitude: -22,
      longitude: -51,
    }
    this.setState({ task: { ...this.state.task, marker } });

    AsyncStorage.getItem('@taskme:user').then((value) => {
      const user = JSON.parse(value);

      this.setState({ user });

      if (user) {
        this.socket = SocketIOClient(constants.socket_base_url, { query: `access_token=${this.state.user.token}` });

        this.socket.on('new_task', (data) => {

        });
      } else {
        alert("ERRO!");
      }
    });

    this.timedown();
  }



  timedown = () => {
    let interval = setInterval(() => {
      if (this.state.timing > 0) {
        this.setState({ timing: this.state.timing - 0.2 });
      } else {
        clearInterval(interval);
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

      // console.log("Enviou pedido para receber a localização");

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
    }, 5000)
  }



  render() {
    let statusColor = (this.state.status) ? "green" : "#CCC";
    let statusText = (this.state.status) ? "Online" : "Offline";

    const barWidth = Dimensions.get('screen').width;
    const progressCustomStyles = {
      backgroundColor: colors.primary,
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
            onPress={() => console.log("Works!")}
            activeOpacity={0.7}
          />
          <View style={{ flexDirection: "column", marginLeft: 20 }}>
            <Text style={{ color: 'white', fontSize: fonts.large }}>{this.state.user.name}</Text>
            <Text style={{ color: 'white', fontSize: fonts.medium }}>{this.state.user.depto}</Text>
            <Badge
              containerStyle={{ backgroundColor: statusColor, borderWidth: 0, marginTop: 10 }}
              onPress={() => {
                this.setState({ status: !this.state.status }, () => this.socket.emit("location_status", this.state.status));

              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{statusText}</Text>
            </Badge>
          </View>
        </View>


        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', marginTop: 10 }}>

          <View style={{ backgroundColor: '#fff', width: '100%', padding: 10 }}>

            <View style={{ flexDirection: 'row' }}>

              <View>
                <Text style={{ color: colors.primary, fontSize: fonts.xlarge }}>TAREFA RECEBIDA</Text>
                <Text style={{ color: 'gray', fontSize: fonts.medium }}>{this.state.task.created_at}</Text>
              </View>
              <View>
                <Badge containerStyle={{ backgroundColor: 'red', borderWidth: 0, marginTop: 5, marginLeft: 5 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 8 }}>Prioridade {this.state.task.priority}</Text>
                </Badge>
              </View>

            </View>

            <View style={{ flexDirection: 'row' }}>



              <View style={{ flex: 1, paddingLeft: 5 }}>
                <Image
                  source={{ uri: this.state.task.image }}
                  style={{ alignSelf: 'center', width: '100%', height: 150 }}
                />
              </View>

              <MapView
                ref={map => this.mapView = map}
                initialRegion={{
                  latitude: this.state.task.marker.latitude,
                  longitude: this.state.task.marker.longitude,
                  latitudeDelta: 0.0012,
                  longitudeDelta: 0.0011,
                }}
                style={{
                  width: this.state.screen.width,
                  height: 200
                }}
                rotateEnabled={false}
                cacheEnabled={true}
                //scrollEnabled={false}
                zoomEnabled={true}
                showsPointsOfInterest={false}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showBuildings={false}
                showsIndoors={true}
                mapType="satellite"
              >

                <MapView.Marker
                  title={"Localizacao"}
                  description={"Localização da evidência"}
                  key={1}
                  coordinate={this.state.task.marker}
                />

              </MapView>

            </View>
            <Text style={{ color: colors.primary, alignSelf: 'center' }}>{this.state.task.description}</Text>
            <View style={styles.horizontal}>
              <Button
                buttonStyle={{ width: 150, height: 50 }}
                backgroundColor="green"
                icon={{ name: 'check', type: 'font-awesome' }}
                title="Aceitar tarefa"
                rounded
                textStyle={{ textAlign: 'center' }}
                onPress={() => { this.socket.emit('jabison', 'HELLOW JABINHO, MANDA TASK') }}
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

          </View>
          <ProgressBarAnimated
            {...progressCustomStyles}
            width={barWidth}
            value={this.state.timing}
            backgroundColorOnComplete="#6CC644"
          />
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
