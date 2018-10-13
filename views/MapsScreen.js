import React, { Component } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions, BackHandler } from 'react-native';
import { HeaderBackButton } from 'react-navigation';

import MapView from 'react-native-maps';
import axios from 'axios';
import SQLite from 'react-native-sqlite-storage'
import Load from '../components/Load/Load';

export default class MapsScreen extends Component {


  static navigationOptions = ({ navigation }) => ({
    headerTitle: 'Revisão Por Área',
    headerMode: 'screen',
    headerStyle: { backgroundColor: 'black' },
    headerTitleStyle: { color: 'white' },
    headerLeft: <HeaderBackButton tintColor='white' onPress={() => navigation.navigate('Home')} />
  });


  state = {
    db: null,
    load: true,
    loadText: null,
    _scrollView: null,
    places: [

    ]
  };

  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  };

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.navigate('Home');
    return true;
  }
  _mapReady = () => {
    this._bootstrapAsync();
  };

  _bootstrapAsync = async () => {
    var auth = false;
    var db = SQLite.openDatabase({ name: "evidencia", location: 'default' });
    this.setState({ db });

    this.setState({loadText: "Conectando"});
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM `user`', [], (tx, results) => {

        axios.get(constants.base_url + 'Ordem_ServicoWS', { headers: { 'token': results.rows.item(0).user_token } }, {
          timeout: 10000,
        })
          .then(async (response) => {
            this.setState({loadText: "Baixando evidências"});
            console.log(response.data);
            if (response.data.code == 200) {
              db.transaction((tx) => {
                tx.executeSql('REPLACE INTO user(id_user,user_token) VALUES(null,?)', [response.data.data.token], (tx, results) => {
                  setTimeout(() => { }, 2000);
                });
              });

              let preencheMapa = () => {
                const latitude = parseFloat(this.state.places[0].latitude);
                const longitude = parseFloat(this.state.places[0].longitude);
                
                this.load();
                this.mapView.animateToCoordinate({
                  latitude, longitude
                }, 500);
                this.state.places[0].mark.showCallout();
              }


              if (response.data.data.ordens.length > 0) {
                this.setState({ places: response.data.data.ordens },preencheMapa);
              } else {
                alert("Nenhuma ordem para ser vista.");
                this.load();
              }

            } else {
              this.setState({loadText: "Algo deu errado, você será redirecionado para tela inicial"});
              setTimeout( () => {this.props.navigation.navigate('Home')}, 3000);
            }
          })
          .catch(async (error) => {
            console.log(error);
            this.setState({loadText: "Algo deu errado, você será redirecionado para tela inicial"});
            setTimeout( () => {this.props.navigation.navigate('Home')}, 3000);
          });

      });
    });
  }

  load = () => {
    if (this.state.load) {
      this.setState({ load: false });
    } else {
      this.setState({ load: true });
    }
  }



  render() {
    return (
      <View style={styles.container}>
        <Load
          text={this.state.loadText}
          show={this.state.load}
        />
        <MapView
          ref={map => this.mapView = map}
          initialRegion={{
            latitude: -22.1276,
            longitude: -51.3856,
            latitudeDelta: 0.0142,
            longitudeDelta: 0.0231,
          }}
          style={styles.mapView}
          rotateEnabled={false}
          showsPointsOfInterest={true}
          showBuildings={true}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onMapReady={this._mapReady}
        >
          {this.state.places.map( (place, index) => (
            <MapView.Marker
              ref={mark => place.mark = mark}
              title={place.logradouro_nome}
              description={place.descricao}
              key={place.id}
              coordinate={{
                latitude: parseFloat(place.latitude),
                longitude: parseFloat(place.longitude),
              }}
              onPress={() =>  {
                this._scrollView.scrollTo({x: index * Dimensions.get('window').width, y: 0, animated: true});
              }}
            />
          ))}
        </MapView>
        <ScrollView
          ref={_ref => this._scrollView = _ref}
          style={styles.placesContainer}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const place = (e.nativeEvent.contentOffset.x > 0)
              ? e.nativeEvent.contentOffset.x / Dimensions.get('window').width
              : 0;

            const { mark } = this.state.places[place];
            const latitude = parseFloat(this.state.places[place].latitude);
            const longitude = parseFloat(this.state.places[place].longitude);

            this.mapView.animateToCoordinate({
              latitude,
              longitude
            }, 0);

            setTimeout(() => {
              mark.showCallout();
            }, 0)
          }}
        >
          {this.state.places.map(place => (
            
            <View key={place.id} style={styles.place}>
              <Text style={styles.title}>{place.logradouro_nome}</Text>
              <Text style={styles.description}>{place.descricao}</Text>

              <TouchableOpacity
                style={styles.ver}
                onPress={() => {
                  const id = place.id;
                  this.props.navigation.navigate('EvidenciaScreen',{ id })
                  }
                }
              >
                <Text style={styles.textVer}>Ver</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },

  mapView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

  placesContainer: {
    width: '100%',
    maxHeight: 200,
  },

  place: {
    width: width - 40,
    maxHeight: 200,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
  },

  title: {
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
  },

  description: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },

  ver: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: 'black',
    margin: 30,
  },

  textVer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});