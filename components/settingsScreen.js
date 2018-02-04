import React, {Component} from 'react';
import { ScrollView, View, StyleSheet, Text, Keyboard, Modal, Picker } from 'react-native';
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
            showPicker: null,
            possibleSettings: []
        }

        this.globals = new GlobalConstants();
    }

    componentDidMount() {
        this.fillSettings();
        Keyboard.dismiss();
     }

    fillSettings = () => {
         this.setState({ settings: this.globals.getUserSettings() })
     }
    
    setPickerValue = (key, selectedValue) => {
        this.globals.setUserSetting(key, selectedValue);
        this.setState({settings: {
            ...this.state.settings,
            [key]: {
                ...this.state.settings[key],
                selected: selectedValue
            }
        }});
    }
        

    static navigationOptions = ({navigate, navigation}) => ({
        title: "Settings",
        headerTintColor: "#0e0e0e",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        gesturesEnabled: false
    })

    settingsToList = () => {
        const { settings } = this.state;
        
        let listOfSettings = [];

        
        for (let key in settings) {
            if (!settings.hasOwnProperty(key)) continue;

            let currentSetting = settings[key];
            listOfSettings.push(<Text key={`label-${Math.floor(Math.random() * 200)}`}>{key}</Text>);
            listOfSettings.push(
            <Picker
            key={`setting-${key}`}
            selectedValue={currentSetting.selected}
            onValueChange={(value, i) => this.setPickerValue(key, value)}
            prompt={key}>
                {currentSetting.options.map(o => {
                    return <Picker.Item key={`setting-item-${Math.floor(Math.random() * 200)}`} label={o} value={o} />
                })}
            </Picker>);
        }
        return <View>{listOfSettings}</View>;
    }

    

    render() {
        const { navigate } = this.props.navigation;
        const { settings, showPicker } = this.state;

        return (
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff", paddingLeft: 1, paddingTop: 3}}>
                {this.settingsToList()}
                
                <Text style={{paddingTop: 55}}>version: {this.globals.getAppVersion()}</Text>
                
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