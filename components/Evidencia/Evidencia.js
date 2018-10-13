import React, { Component } from 'react';

import { TextInput, View, Text, Image, TouchableHighlight } from 'react-native';

import { Button, Icon } from 'react-native-elements';

export default class Evidencia extends Component {

    constructor(props) {
        super(props);

        this.state = {

        }
    }


    render() {
        return (
            <View style={{ flexDirection: 'row', backgroundColor: 'white', padding: 5, margin: 5 }}>
                <TouchableHighlight
                    onPress={() => { alert(this.props.codigo) }}
                >
                    <Image
                        style={{ width: 80, height: 80 }}
                        source={{ uri:this.props.imagem}}
                    />
                </TouchableHighlight>

                <View style={{ flexDirection: 'column', marginLeft: 5 }}>
                    <Text style={{ fontFamily: 'avenir-black', color: 'black' }}>
                        Código:
                        <Text style={{ color: 'gray', fontSize: 14 }}>{this.props.codigo}</Text>
                    </Text>

                    <Text style={{ fontFamily: 'avenir-black', color: 'gray', fontSize: 12 }}> {this.props.endereco}</Text>
                    <Text style={{ fontFamily: 'avenir-black', color: 'gray', fontSize: 10 }}> {this.props.tipo_servico}</Text>
                    <Text style={{ fontFamily: 'avenir-black', color: 'gray', fontSize: 10 }}> {this.props.servico}</Text>
                </View>
            </View >
        );
    }

}