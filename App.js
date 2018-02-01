import React from 'react';
import { StyleSheet, Text, View, Image, Clipboard, Platform, StatusBar } from 'react-native';
import BarcodeScanner from './components/barcodeScanner.js';
import AddAddress from './components/addAddress.js';
import WelcomeScreen from './components/welcomeScreen.js';
import SettingsScreen from './components/settingsScreen.js';
import ViewAddressScreen from './components/viewAddressScreen.js';
import { StackNavigator } from 'react-navigation';

export const Coinhark = StackNavigator({
    Home: { screen: WelcomeScreen },
    AddAddress: { screen: AddAddress },
    Scanner: { screen: BarcodeScanner },
    Settings: { screen: SettingsScreen },
    ViewAddress: { screen: ViewAddressScreen }
});

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
        <View style={{flex: 1}}>
            <StatusBar backgroundColor={"#FFC107"} barStyle="dark-content"/>
            <Coinhark />
        </View>
        );
    }
}