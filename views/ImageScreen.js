'use strict';
import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
  ScrollView,
  BackHandler,
  AsyncStorage,
} from 'react-native';

import axios from 'axios';

import MapView from 'react-native-maps';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import { HeaderBackButton } from 'react-navigation';

import CameraScreen from './CameraScreen';
import CameraRollScreen from './CameraRollScreen';
import Load from '../components/Load/Load';
import RoundedButton from '../components/RoundedButton/RoundedButton';
import { constants, colors } from '../assets/general';

export default class ImageScreen extends Component {

  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Nova tarefa',
    headerMode: 'screen',
    headerStyle: { backgroundColor: colors.header_primary },
    headerTitleStyle: { color: 'white' },
    headerLeft: <HeaderBackButton tintColor='white' onPress={() => navigation.navigate('Home')}
    />
  });

  constructor(props) {
    super(props);
    let img = require('../assets/images/sem-foto.jpeg');

    this.state = {
      modalCameraVisible: false,
      modalGalleryVisible: false,

      descricao: null,
      image: img,
      user: null,
      departamentos: [
        {
          value: 1,
          label: "Jardinagem",
        },
        {
          value: 2,
          label: "Restaurante",
        },
        {
          value: 3,
          label: "Segurança",
        },
        {
          value: 4,
          label: "Limpeza",
        },
        {
          value: 5,
          label: "TI",
        },
      ],

      prioridades: [
        {
          value: 0,
          label: "Muito Baixa",
        },
        {
          value: 1,
          label: "Baixa",
        },
        {
          value: 2,
          label: "Média",
        },
        {
          value: 3,
          label: "Alta",
        },
        {
          value: 4,
          label: "Emergencial",
        },
      ],

      marker: {
        latitude: 0,
        longitude: 0
      },

      screen: {
        width: Dimensions.get('window').width
      },
    }

    Dimensions.addEventListener('change', () => {
      let screen = {
        width: Dimensions.get('window').width
      };

      this.setState({
        screen: screen
      });
    });

    this.saveImage = this.saveImage.bind(this);
    this.setModalCameraVisible = this.setModalCameraVisible.bind(this);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  };

  componentWillMount() {
    this.load();

    this.setState({ user: this.props.navigation.getParam('user', null) });

    if (this.state.user == null) {
      AsyncStorage.getItem('@taskme:user').then((value) => {
        const user = JSON.parse(value);
        this.setState({ user });
        console.log(this.state.user);
      });
    }


    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);

        let marker = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        this.setState({ marker });

        this.load();
        let { latitude, longitude } = marker;
        this.mapView.animateToCoordinate({
          latitude, longitude
        }, 500);
      },
      (error) => {
        this.setState({ loadText: error.message });
        console.log(error);

        setTimeout(() => this.load(), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Home');
    return true;
  }

  setModalCameraVisible = (visible) => {
    this.setState({ modalCameraVisible: visible });
  }

  setModalGalleryVisible = (visible) => {
    this.setState({ modalGalleryVisible: visible });
  }


  saveImage = (image) => {
    this.setState({
      modalCameraVisible: false,
      modalGalleryVisible: false,
      image: image
    });
  }

  openModalGallery = () => {
    this.setState({
      modalCameraVisible: false,
      modalGalleryVisible: true
    });
  }

  load = () => {
    if (this.state.load) {
      this.setState({ load: false });
    } else {
      this.setState({ load: true });
    }
  }

  changeMarker = (event) => {
    this.mapView.animateToCoordinate(event.nativeEvent.coordinate, 500);
    let local = {
      latitude: event.nativeEvent.coordinate.latitude,
      longitude: event.nativeEvent.coordinate.longitude
    };
    this.setState({ marker: local });
  }

  mapReady = () => {
    let { latitude, longitude } = this.state.marker
    this.mapView.animateToCoordinate({
      latitude, longitude
    }, 500);
  }

  _send = async () => {
    this.load();
    this.setState({ loadText: "Enviando tarefa..." });

    let data =
    {
      lat: this.state.marker.latitude,
      long: this.state.marker.longitude,
      description: this.state.descricao,
      department: this.state.departamento.value(),
      priority: this.state.prioridade.value(),
      image: 'data:image/png;base64,' + this.state.image.base64,
      access_token: this.state.user.token
    }


    axios.post(constants.base_url + 'api/task', data)
      .then(async (response) => {
        console.log(response);

        if (response.data.code == 200) {
          this.setState({loadText: "Inserido!"})
          setTimeout(() => {
            this.props.navigation.navigate('Home');
          }, 3000)
        } else {
          alert("Ops... algo deu errado");
          this.load();
        }

      }).catch(function (error) {
        console.log(error);
      });

  }

  render() {

    console.log(this.state.image);

    this.state.fotoTitle = "Tirar uma foto";
    if (this.state.image.base64) {
      this.state.fotoTitle = "Alterar Foto";
    }

    return (
      <View style={styles.container}>
        <Load
          text={this.state.loadText}
          show={this.state.load}
        />
        <ScrollView style={{}} >

          <MapView
            ref={map => this.mapView = map}
            initialRegion={{
              latitude: this.state.marker.latitude,
              longitude: this.state.marker.longitude,
              latitudeDelta: 0.0022,
              longitudeDelta: 0.0021,
            }}
            style={[styles.mapView, { width: this.state.screen.width }]}
            rotateEnabled={false}
            cacheEnabled={true}
            //scrollEnabled={false}
            zoomEnabled={true}
            onPress={this.changeMarker}
            showsPointsOfInterest={false}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showBuildings={false}
            onMapReady={this.mapReady}
            showsIndoors={false}
            mapType="satellite"
          >

            <MapView.Marker
              key={1}
              coordinate={this.state.marker}
              onDrag={() => this.changeMarker}
              draggable
            />

          </MapView>

          <TextField
            label='Descreva a tarefa'
            multiline={true}
            onChangeText={(descricao) => this.setState({ descricao })}
          />

          <Dropdown
            ref={departamento_ref => this.state.departamento = departamento_ref}
            label='Departamento'
            data={this.state.departamentos}
          />

          <Dropdown
            ref={prioridade_ref => this.state.prioridade = prioridade_ref}
            label='Prioridade'
            data={this.state.prioridades}
          />

          {/* <View style={styles.sideButtons}> */}

          <RoundedButton
            title={this.state.fotoTitle}
            onPress={() => {
              this.setModalCameraVisible(!this.state.modalCameraVisible);
            }}
          />

          <RoundedButton
            title="Minhas Fotos"
            onPress={() => {
              this.setModalGalleryVisible(!this.state.modalGalleryVisible);
            }}
          />

          {/* </View> */}

          <View style={styles.centerview}>

            {
              (this.state.image.base64) ?
                <Image
                  style={styles.image}
                  source={{ uri: `data:image/jpg;base64,${this.state.image.base64}` }}
                />
                :
                <Image
                  style={styles.image}
                  source={this.state.image}
                />
            }
          </View>


          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalGalleryVisible}
            onRequestClose={() => {
              this.setModalGalleryVisible(!this.state.modalGalleryVisible);
            }}>
            <CameraRollScreen
              saveImage={this.saveImage}
              setModalCameraVisible={this.setModalCameraVisible}
            />
          </Modal>

          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalCameraVisible}
            onRequestClose={() => {
              this.setModalCameraVisible(!this.state.modalCameraVisible);
            }}>
            <CameraScreen
              saveImage={this.saveImage}
              setModalCameraVisible={this.setModalCameraVisible}
            />
          </Modal>

          <TouchableOpacity
            style={styles.enviar}
            onPress={() => {
              this._send();
            }}
          >
            <Text style={styles.textEnviar}>Enviar</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    );
  }

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDD',
  },
  image: {
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width,
    marginTop: 20,
    // transform: [{ rotateZ: '90deg' }]
  },
  centerview: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    margin: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  mapView: {
    height: 300
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

  ImageContainer: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').width,
    alignItems: 'center',
    backgroundColor: '#03A9F4',
  },

  enviar: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: colors.primary,
    margin: 30,
  },

  textEnviar: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sideButtons: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 10
  }

});
