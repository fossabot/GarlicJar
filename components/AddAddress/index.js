import React, { Component } from "react";
import { Text, View, AsyncStorage, RefreshControl, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Button, FormInput, Icon } from "react-native-elements";

import coreStyles, { colours } from "../coreStyles";
import addAddressStyles from "./styles";

export default class ViewAddressList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {
                invalid: false,
                duplicate: false
            },
            dirty: {
                nickname: false,
                address: false
            },
            current: {
                nickname: "",
                address: ""
            },
            loading: false
        };
    }

    componentDidMount = async () => {
        // Check for a scanned value from AddAddressFromQr
        const { navigation: { state } } = this.props;
        if (state != null && state.params != null) this.setState({ address: state.params.scanned });
    };

    static navigationOptions = ({ navigate, navigation }) => ({
        title: "Add An Address",
        gesturesEnabled: false,
        headerTintColor: colours.dark,
        headerStyle: {
            backgroundColor: colours.primary
        },
        headerLeft: (
            <Icon
                name="arrow-left"
                style={addAddressStyles.leftButton}
                onPress={() => {
                    navigation.navigate("Home");
                }}
            />
        )
    });

    _submitAddress = async () => {
        // to-do: possibly reduce aS calls by pulling on didMount and comparing/pushing on that 
        const { current: { nickname, address } } = this.state;

        let res = await AsyncStorage.getItem("addresses");

        let addressList = (await JSON.parse(res)) || [];
        addressList.forEach(a => {
            if(a.public == address) {
                this.setState({
                    errors: {
                        duplicate: true
                    }
                });
                return; // to-do: make sure this breaks loop and ends function!
            }
        });

        addressList.push({
            nickname,
            public: address,
            balance: 0.0
        });

        await AsyncStorage.setItem("addresses", JSON.stringify(addressList));
    }

    render() {
        const { current, dirty, errors, loading } = this.state;
        // to-do: add QR button!!
        return (
            <View style={coreStyles.root}>
                <FormInput
                    autoCorrect={false}
                    inputStyle={addAddressStyles.formInput}
                    onBlur={() =>
                        this.setState({
                            dirty: {
                                ...this.state.dirty,
                                address: true
                            }
                        })
                    }
                    onChangeText={a =>
                        this.setState({
                            current: {
                                ...this.state.current,
                                address: a
                            }
                        })
                    }
                    value={current.address}
                    placeholder={"Address"}
                    underlineColorAndroid={colours.primary}
                />
                <FormInput
                    autoCorrect={false}
                    inputStyle={addAddressStyles.formInput}
                    onBlur={() =>
                        this.setState({
                            dirty: {
                                ...this.state.dirty,
                                nickname: true
                            }
                        })
                    }
                    onChangeText={n =>
                        this.setState({
                            current: {
                                ...this.state.current,
                                nickname: n
                            }
                        })
                    }
                    value={current.name}
                    placeholder={"Nickname"}
                    underlineColorAndroid={colours.primary}
                />
                <Button
                    disabled={
                        current.name.length < 1 || current.address.length < 1 || errors.invalid || errors.duplicate
                    }
                    containerViewStyle={{ marginTop: 30 }}
                    onPress={this._submitAddress}
                    raised
                    backgroundColor={colours.primary}
                    title={"Submit Address"}
                />
            </View>
        );
    }
}
