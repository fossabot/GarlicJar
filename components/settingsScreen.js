import React, {Component} from 'react';
import { ScrollView, View, StyleSheet, Text, Keyboard, Modal } from 'react-native';
import { FormLabel, FormInput, Button, Card, List, ListItem } from 'react-native-elements';
import GlobalConstants from '../globals';
import Numbers from '../utils/numbers';

/**
 * SettingsScreen provides a set/fetch interface for globals.userSettings.
 */
export default class SettingsScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: [],
            showModal: false,
            possibleSettings: []
        }

        this.globals = new GlobalConstants();
    }

    componentDidMount() {
        this.fillSettings();
        Keyboard.dismiss();
     }

    fillSettings = () => {
         this.setState({ settings: this.globals.getUserSettings(), possibleSettings: this.globals.getPossibleUserSettings() })
     }

    openModal = () =>
        this.setState({showModal: true});
    
    closeModal = () =>
        this.setState({showModal: false});

    static navigationOptions = ({navigate, navigation}) => ({
        title: "Settings",
        headerTintColor: "#0e0e0e",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        gesturesEnabled: false
    })

    

    render() {
        const {navigate} = this.props.navigation;
        const { settings, showModal, possibleSettings } = this.state;

        return (
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
                <List containerStyle={styles.settingsListContainer}>
                    {settings.map(s => {
                        return <ListItem 
                        key={`setting-${Object.keys(s)[0]}`}
                        title={Object.keys(s)[0]}
                        rightTitle={Object.values(s)[0]}
                        wrapperStyle={{paddingTop: 2, paddingBottom: 2}}
                        hideChevron
                        onPress={() => this.openModal()}
                        />;
                    })}
                </List>
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