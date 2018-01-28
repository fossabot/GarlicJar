import React, {Component} from 'react';
import { ScrollView, RefreshControl, Clipboard, Text, View, StyleSheet, Alert, Image, AsyncStorage, ActivityIndicator, Keyboard } from 'react-native';
import { FormLabel, FormInput, Button, Card } from 'react-native-elements';
import ActionButton from 'react-native-action-button';
import GlobalConstants from '../globals';
import Numbers from '../utils/numbers';

export default class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalBalance: 0.00000000,
            valueInDollars: 0.00,
            loaded: false,
            refreshing: false,
            apiError: null,
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
            }
        }
        this.globals = new GlobalConstants();
    }

    componentDidMount() {
        // Hard reset of db for dev
        //AsyncStorage.removeItem("db");
        this.initView();
        Keyboard.dismiss();
     }

     initView = () => {
         this.setState({loaded: false, refresh: true});
         AsyncStorage.getItem("db").then((value) => {
             if (value == null) {
                 // init db
                 AsyncStorage.setItem("db", JSON.stringify(this.globals.bareDb));
                 console.log("Creating new db of: " + JSON.stringify(this.state.db));
                 this.setState({db: this.globals.bareDb})
                 console.log("db state is now bare: " + JSON.stringify(this.state.db));
                 this.setState({loaded: true, refreshing: false});
             } else {
                 this.setState({db: JSON.parse(value)});
                 console.log("db state is now: " + JSON.stringify(this.state.db));
                 if (this.state.db.balanceInfo.addresses.length > 0) {
                     Promise.all(this.state.db.balanceInfo.addresses.map(o =>
                         fetch(`https://explorer.grlc-bakery.fun/ext/getaddress/${o.inputAddress}`).then(resp => resp.json()) // TODO: replace with global getBlockchainApi
                     )).then(json => {
                         if (!Array.isArray(json) || json[0].balance == null) {
                             console.log(`Unexpected result from Explorer API.`);
                             this.setState({apiError: `Unexpected result from Explorer API.`});
                         }
                         // TODO: change this to return a total and an array of addresses and balances.
                         // totalBalance: ret
                         // balances: [{address: string, balance: 0.0m}, etc]
                         // then we can do a foreach on the cards
                         let ret = json.reduce((agg, elem) => {
                             var tmpDb = this.state.db;
                             tmpDb.balanceInfo.addresses.forEach((a) => {
                                 if (a.inputAddress == elem.addrStr) {
                                     a.totalBalance = elem.balance;
                                 }
                             });
                             tmpDb.balanceInfo.name = "Explorer";
                             tmpDb.balanceInfo.date = new Date().getTime().toString();
                             this.setState({db: tmpDb});
                             AsyncStorage.setItem("db", JSON.stringify(tmpDb));
                             console.log("db state is now: " + JSON.stringify(this.state.db));
                             return agg + parseFloat(elem.balance);
                         }, 0);
                         this.setState({totalBalance: ret});
                     }).then(bal => {
                         fetch("https://api.coinmarketcap.com/v1/ticker/garlicoin/") // TODO: replace with global getMarketApi
                             .then(response => response.json())
                             .then(responseJson => {
                                 if (!Array.isArray(responseJson) || responseJson[0].price_usd == null) {
                                     console.log(`Unexpected result from CoinMarketCap API.`);
                                     this.setState({apiError: `Unexpected result from CoinMarketCap API.`});
                                 }
                                 let exchange = {
                                     "price": responseJson[0].price_usd,
                                     "name": "CoinMarketCap",
                                     "date": new Date().getTime().toString()
                                 }
                                 let value = Numbers.formatPrice(this.state.totalBalance * exchange.price, 'US');
                                 let tmpDb = this.state.db;
                                 tmpDb.exchange = exchange;
                                 this.setState({valueInDollars: value, loaded: true, refreshing: false, db: tmpDb});
                                 AsyncStorage.setItem("db", JSON.stringify(this.state.db));
                                 console.log("db state after exchange is now: " + JSON.stringify(this.state.db));
                             })
                             .catch(error => {
                                 this.setState({apiError: `Error connecting to the CoinMarketCap API.`});
                                 console.log(`Error connecting to the CoinMarketCap API`);
                             });
                     }).catch(error => {
                         this.setState({apiError: `Error connecting to the Explorer API.`});
                         console.log(`Error connecting to the Explorer API.`);
                     });
                 } else {
                     this.setState({loaded: true, refreshing: false});
                 }
             }
         }).done();
     }

    _onRefresh() {
        this.setState({refreshing: true});
        console.log('refreshing');
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: "Garlicoin Balance",
        headerLeft: null,
        headerTintColor: "#FFFFFF",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        gesturesEnabled: false
    })

    render() {
        const {navigate} = this.props.navigation;

        let addressCards = null;
        if(this.state.loaded) {
            addressCards = (
                <Card wrapperStyle={styles.card}>
                    <Text style={styles.viewTitle}>{Numbers.formatBalance(this.state.totalBalance, 'US')} GRLC</Text>
                    <Text wrapperStyle={styles.card} style={styles.viewTitleSM}>${this.state.valueInDollars} USD</Text>
                </Card>
            );
        } else {
            addressCards = (
                <Card wrapperStyle={styles.card}>
                    <ActivityIndicator style={styles.viewTitleSpinner} size="small" color="#2196f3" />
                </Card>
            );
        }

        return (
            <View style={{flex: 1}}
                        refreshControl={
                            <RefreshControl
                                enabled={true}
                                refreshing={this.state.refreshing}
                                onRefresh={() => this.initView()}
                            />
                        }>
                
                {addressCards}
                    <ActionButton onPress={() => navigate('AddAddress')} buttonColor={"#FFC107"} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0
    },
    error: {
        marginTop: 28,
        marginBottom: 28,
        color: '#DC143C',
    },
    viewTitleSpinner: {
        marginTop: 28,
        marginBottom: 28
    },
    viewTitleL: {
        marginTop: 35,
        marginBottom: 5,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#34495e',
    },
    viewTitle: {
        margin: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#34495e',
    },
    viewTitleSM: {
        marginBottom: 24,
        fontSize: 14,
        textAlign: 'left',
        color: '#34495e',
    },
    donateContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 36,
    },
    donateTitle: {
        margin: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495e',
        marginBottom: 4
    },
    donateAddress: {
        margin: 5,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495e',
        marginBottom: 8,
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#555555',
    },
    symbol: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    }
});