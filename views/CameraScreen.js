'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  CameraRoll,
} from 'react-native';

import { RNCamera } from 'react-native-camera';
import { colors } from '../assets/general';
import { Icon } from 'react-native-elements'

import Load from '../components/Load/Load';

export default class CameraScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      load: false,
      loadText: 'Capturando imagem...',
      latitude: '0',
      longitude: '0',
      error: '',
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Load
          show={this.state.load}
          text={this.state.loadText}
        />
        <RNCamera
          ref={ref => { this.camera = ref; }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          permissionDialogTitle={'Permissão para usar a camera'}
          permissionDialogMessage={'Nós precisamos de permissão para acessar a camera do seu aparelho.'}
        >
          <View style={styles.container}>
            <Text style={styles.fotoText}>Tire uma foto</Text>
            <View style={styles.buttonContainer}>


              <TouchableOpacity
                onPress={() => this.props.setModalCameraVisible(false)}
                style={styles.buttonAux}
              >
                <Icon
                  name="back"
                  type="entypo"
                />
                {/* <Image style={styles.button2} source={require('../assets/images/list.png')} /> */}
              </TouchableOpacity>


              <TouchableOpacity
                onPress={this.takePicture}
                style={styles.capture}
              >
                <Image style={styles.take_photo} source={require('../assets/images/take_photo.png')} />
              </TouchableOpacity>


              <TouchableOpacity
                // onPress={() => CameraRoll.getPhotos()}
                style={styles.buttonAux}
              >
                <Icon
                  name="photo"
                  type="font-awesome"
                />
              </TouchableOpacity>

            </View>
          </View>
        </RNCamera>
      </View>
    );
  }

  takePicture = async () => {
    if (this.camera) {
      this.setState({ load: true });

      const options = { base64: true, fixOrientation: true, autoFocus: false, quality: 0.1, exif: true };

      const data = await this.camera.takePictureAsync(options);

      this.props.saveImage(data);

    } else {
      alert("Nenhuma camera foi detectada.");
    }

  };

  removePicture = () => {
    this.setState({ image_uri: null });
  };

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
    backgroundColor: colors.primary,
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
