'use strict';
import React, { Component } from 'react';
import {
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    View,
    Image,
    CameraRoll,
} from 'react-native';


import { Button, Icon } from 'react-native-elements'

import Load from '../components/Load/Load';

export default class CameraRollScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            load: false,
            loadText: 'Carregando imagens...',
            error: '',
            photos: [],
            imagemSelecionada: null,
        }

        this._handleButtonPress();
    };



    _handleButtonPress = async () => {

        try {
            await CameraRoll.getPhotos({
                first: 20,
                assetType: 'Photos',
            })
                .then(r => {
                    this.setState({ photos: r.edges });
                    this.setState({ imagemSelecionada: this.state.photos[0].node.image.uri })
                })
                .catch((err) => {
                    //Error Loading Images
                });
        } catch (err) {
            this.setState({ photos: [] });
        }
    };


    render() {
        return (

            <View style={styles.container}>
                <Load
                    show={this.state.load}
                    text={this.state.loadText}
                />

                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ backgroundColor: 'gray' }}
                    >
                        {(this.state.photos.length != 0)
                            ?
                            this.state.photos.map((p, i) => {
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => {
                                            this.setState({ imagemSelecionada: p.node.image.uri })
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: 100,
                                                height: 100,
                                                borderWidth: 2,
                                                borderColor: 'black'
                                            }}
                                            source={{ uri: p.node.image.uri }}
                                        />
                                    </TouchableOpacity>
                                );
                            })
                            :
                            null
                        }
                    </ScrollView>
                </View>

                <Image
                    style={{ flex: 1, height: undefined, width: undefined, alignSelf: 'stretch', }}
                    resizeMode="contain"
                    source={{ uri: this.state.imagemSelecionada }}
                />

                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>

                    <Button
                        large
                        backgroundColor="rgba(0,0,0,.8)"
                        // containerViewStyle={{ width: '100%' }}
                        title="Selecionar"
                        onPress={() => {
                            this.save();
                        }}
                    />
                </View>
            </View >
        );
    }

    save = () => {
        this.props.saveImage({ uri: this.state.imagemSelecionada });
    };

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },

});
