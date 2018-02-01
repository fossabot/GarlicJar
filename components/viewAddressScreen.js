import React, {Component} from 'react';
import { ScrollView, View, StyleSheet, Text, Keyboard, Modal } from 'react-native';
import { FormLabel, FormInput, Button, Card, List, ListItem } from 'react-native-elements';
import GlobalConstants from '../globals';
import Numbers from '../utils/numbers';

/**
 * ViewAddress shows details and txns related to the address being watched.
 */
export default class ViewAddressScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.globals = new GlobalConstants();
    }

    componentDidMount() {
        // this.initView();
        Keyboard.dismiss();
     }

    static navigationOptions = ({navigate, navigation}) => ({
        title: "Address Nickname Here",
        headerTintColor: "#0e0e0e",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        gesturesEnabled: false
    })

    

    render() {
        const {navigate} = this.props.navigation;
        const { settings, showModal, possibleSettings } = this.state;
        const { params } = this.props.navigation.state;

        return (
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
                <View>
                    <Text>Address: {params.addressId}</Text>
                    <Text>QR code in header?</Text>
                    <Text>Txns for address</Text>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    error: {
        marginTop: 28,
        marginBottom: 28,
        color: '#DC143C',
    },
    settingsListContainer: {
        marginTop: 0,
        borderBottomColor: "#dddddd"
    }
});