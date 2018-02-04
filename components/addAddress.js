import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet, Alert, AsyncStorage } from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button, Card } from 'react-native-elements'
import GlobalConstants from '../globals';
import renderIf from '../utils/renderIf.js';
// import WAValidator from 'wallet-address-validator';  TODO: wait for WAV to implement grlc PR
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

require('../shim');
let bitcoin = require('bitcoinjs-lib');

export default class AddAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            address: '',
            ltcPrice: '',
            db: {
                "balanceInfo": {
                    "name": "Coinhark API",
                    "date": "1318464000",
                    "totalBalance": "0.00000000",
                    "addresses": []
                },
                "exchange": {
                    "price": 0.00,
                    "date": "1318464000",
                    "name": "CoinMarketCap API"
                }
            },
            text: 'useless',
            nameDirty: false,
            addressDirty: false,
            invalidAddress: false,
            addressExists: false
        };
        this.bitcoin = bitcoin;
        this.globals = new GlobalConstants();
    }

    componentWillMount() {
        AsyncStorage.getItem("db").then((value) => {
            this.setState({"db": JSON.parse(value)});
        }).done();

        if (this.props.navigation.state != null && this.props.navigation.state.params != null) {
            this.setState({"address": this.props.navigation.state.params.scanned});
        }
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: "Add An Address",
        gesturesEnabled: false,
        headerTintColor: "#0e0e0e",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        headerLeft: <Icon name="arrow-left" style={styles.leftButton} onPress={() => {
            navigation.navigate('Home');
        }}/>,
    })

    _checkDisabled = () => {
        return disabled = this.state.address === '' || this.state.name === '';
    }

    _submitAddress = () => {
        let address = {
            "address": this.state.address,
            "inputAddress": this.state.address,
            "name": this.state.name
        }
        if (this.state.db.balanceInfo.addresses.find(o => o.address === this.state.address)) {
            this.setState({addressExists: true});
        } else {
            // let valid = WAValidator.validate(this.state.address, "garlicoin"); TODO: wait for WAV to implement grlc PR
            let valid = true;
            if (valid) {
                let tmpDb = this.state.db;
                tmpDb.balanceInfo.addresses.push(address);
                this.setState({db: tmpDb});
                AsyncStorage.setItem("db", JSON.stringify(this.state.db));
                this.props.navigation.navigate('Home');
            } else {
                this.setState({invalidAddress: true});
            }
        }
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <View style={{flex: 1, backgroundColor: "#ffffff"}}>
                <Card>
                    <View style={{flexDirection: "row"}}>
                        <View style={{flex: 1, justifyContent: 'center'}}>
                            <FormInput
                                autoCorrect={false}
                                inputStyle={{ fontSize: 16, color: "#0e0e0e" }}
                                onBlur={() => this.setState({addressDirty: true})}
                                onChangeText={(address) => this.setState({address})}
                                value={this.state.address}
                                placeholder={"Address"}
                                underlineColorAndroid={"#FFC107"}
                            />
                        </View>
                        <Button
                            onPress={() => { navigate('Scanner');} }
                            icon={{name: 'qrcode', type: 'material-community', color: 'black'}}
                            style={{justifyContent: 'center'}}
                            transparent
                        />
                    </View>
                    
                    
                    {renderIf(this.state.address === '' && this.state.addressDirty, <FormValidationMessage style>
                        {'This field is required'}
                    </FormValidationMessage>)}
                    {renderIf(this.state.invalidAddress && this.state.address !== '', <FormValidationMessage style>
                        {'Invalid Garlicoin Address'}
                    </FormValidationMessage>)}
                    {renderIf(this.state.addressExists && this.state.address !== '', <FormValidationMessage style>
                        {'This address already exists'}
                    </FormValidationMessage>)}

                    <FormInput
                        autoCorrect={false}
                        inputStyle={{ fontSize: 16, color: "#0e0e0e" }}
                        onBlur={() => this.setState({nameDirty: true})}
                        onChangeText={(name) => this.setState({name})}
                        value={this.state.name}
                        placeholder={"Nickname"}
                        underlineColorAndroid={"#FFC107"}
                    />
                    {renderIf(this.state.name === '' && this.state.nameDirty, <FormValidationMessage style>
                        {'This field is required'}
                    </FormValidationMessage>)}
                    <Button
                        disabled={this._checkDisabled()}
                        containerViewStyle={styles.buttonStyle}
                        onPress={this._submitAddress}
                        raised
                        backgroundColor={'#ffc107'}
                        title='Submit Address'
                    />
                </Card>
            </View>
        );
    }
}

const styles = {
    buttonStyle: {
        marginTop: 30,
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#ffffff',
    },
    leftButton: {
        marginLeft: 16,
        fontSize: 26,
        color: '#0e0e0e',
    },
}