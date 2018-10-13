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
    BackHandler
} from 'react-native';


import axios from 'axios';
import SQLite from 'react-native-sqlite-storage'
import CameraScreen from './CameraScreen';
import { Button, Icon } from 'react-native-elements';
import { TextField } from 'react-native-material-textfield';
import { Dropdown } from 'react-native-material-dropdown';
import { HeaderBackButton } from 'react-navigation';
import { constants } from '../assets/general';
import Load from '../components/Load/Load';

export default class EvidenciaScreen extends Component {


    static navigationOptions = ({ navigation }) => ({
        headerTitle: 'Ver Evidência',
        headerMode: 'screen',
        headerStyle: { backgroundColor: 'black' },
        headerTitleStyle: { color: 'white' },
        headerLeft: <HeaderBackButton tintColor='white' onPress={() => navigation.goBack()}
        />
    });

    constructor(props) {
        super(props);

        this.state = {
            modalCameraVisible: false,
            load: false,
            loadText: null,
            textCamera: "Adicionar foto",
            ordem: {
                descricao: "Carregando",
                foto: constants.no_image,
            },
            db: null,
            situacoes: [],
            situacao: null,
            image: constants.no_image,
            screen: {
                width: Dimensions.get('window').width
            },
            error: null,

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
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentDidMount() {
        this._bootstrapAsync();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.goBack();
        return true;
    }

    setModalCameraVisible = (visible) => {
        this.setState({ modalCameraVisible: visible });
    }

    _bootstrapAsync = async () => {
        this.load();
        this.setState({ loadText: "Baixando informações da evidência." });
        var auth = false;
        var db = SQLite.openDatabase({ name: "evidencia", location: 'default' });

        this.setState({ db });

        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM `situacoes`', [], (tx, results) => {
                let situacoes = [];
                for (var i = 0; i < results.rows.length; i++) {
                    let row = results.rows.item(i);
                    row.label = row.situacao_nome;
                    row.value = row.situacao_pk;
                    if (row.status != 0) {
                        situacoes.push(row);
                    }
                }
                this.setState({ situacoes });
            });
        });

        var id = this.props.navigation.getParam('id');

        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM `user`', [], (tx, results) => {
                axios.get(constants.base_url + 'Ordem_ServicoWS?id=' + id, { headers: { 'token': results.rows.item(0).user_token } }, {
                    timeout: 10000,
                }).then(async (response) => {
                    if (response.data.code == 200) {
                        console.log(response.data.data.ordem);
                        db.transaction((tx) => {
                            tx.executeSql('REPLACE INTO user(id_user,user_token) VALUES(null,?)', [response.data.data.token], (tx, results) => {
                                setTimeout(() => { }, 2000);
                            });
                        });
                        let ordem = response.data.data.ordem;


                        ordem.foto = constants.base_url + response.data.data.ordem.historico[0].foto;

                        this.setState({ ordem });
                        this.load();
                    }
                });
            });
        });
    }

    saveImage = (imagem) => {
        this.setState({
            modalCameraVisible: false,
            image: `data:image/jpg;base64,${imagem.base64}`,
            textCamera: "Alterar foto",
        });
    }

    _servicoFilter = () => {
        // this.setState({servico: "Oioioi"});
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
            <View style={styles.container} >
                <Load
                    text={this.state.loadText}
                    show={this.state.load}
                />
                <ScrollView style={{ marginHorizontal: 5 }} >
                    <Image
                        style={styles.image}
                        source={{ uri: this.state.ordem.foto }}
                    />

                    <Text><Text style={styles.bold}>Descrição da evidência:</Text> {this.state.ordem.descricao} </Text>
                    <Text><Text style={styles.bold}>Prioridade:</Text> {this.state.ordem.prioridade} </Text>
                    <Text><Text style={styles.bold}>Serviço:</Text> {this.state.ordem.servico} </Text>


                    <Dropdown
                        ref={situacao_ref => this.state.situacao = situacao_ref}
                        label='Nova Situação'
                        data={this.state.situacoes}
                    />


                    <TextField
                        label='Adicionar comentário'
                        multiline={true}
                        onChangeText={(comentario) => this.setState({ comentario })}
                    />

                    <View style={styles.sideButtons}>
                        <Button
                            large
                            backgroundColor="black"
                            containerViewStyle={{ flex: 1 }}
                            icon={{ name: 'camera' }}
                            title={this.state.textCamera}
                            onPress={() => {
                                this.setModalCameraVisible(!this.state.modalCameraVisible);
                            }}
                        />
                    </View>

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
                            openModalAddress={this.openModalAddress}
                        />
                    </Modal>

                    <Image
                        style={styles.image}
                        source={{ uri: this.state.image }}
                    />

                    <TouchableOpacity
                        style={styles.enviar}
                        onPress={() => {
                            this._send();
                        }}
                    >
                        <Text style={styles.textEnviar}>Enviar alteração</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        );
    }

    _send = async () => {
        this.load();
        this.setState({ loadText: "Enviando evidência..." });
        let data =
        {
            ordem_servico_fk: this.props.navigation.getParam('id'),
            situacao_fk: this.state.situacao.value(),
            comentario: this.state.comentario,
            foto: this.state.image,
        }

        // console.log(data);

        this.state.db.transaction((tx) => {
            tx.executeSql('SELECT * FROM `user`', [], (tx, results) => {
                axios.put(constants.base_url + 'Ordem_ServicoWS', data, {
                    headers: {
                        'token': results.rows.item(0).user_token
                    }
                }).then(async (response) => {
                    // console.log(response);
                    if (response.data.code == 200) {
                        this.setState({ loadText: "Tudo certo! Você será direcionado para o inicio!" });
                        setTimeout(() => { this.props.navigation.goBack() }, 3000);
                    } else {
                        alert("Ops... algo deu errado, tente novamente");
                        this.load();
                    }
                }).catch(function (error) {
                    alert("Ops... falha na conexão.");
                    this.load();
                });

            });
        });



    };

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DDD'
    },
    image: {
        height: Dimensions.get('window').width,
        width: Dimensions.get('window').width,
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
        backgroundColor: 'black',
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
    },

    bold: {
        fontWeight: 'bold',
    }



});
