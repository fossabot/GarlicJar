import React, {Component} from 'react';
import { ScrollView, RefreshControl, Clipboard, Text, View, StyleSheet, Alert, Image, AsyncStorage, ActivityIndicator, Keyboard } from 'react-native';
import { FormLabel, FormInput, Button, Card, List, ListItem, Icon } from 'react-native-elements';
import ActionButton from 'react-native-action-button';
import GlobalConstants from '../globals.new';
import Numbers from '../utils/numbers';

export default class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            totalBalance: 0.00000000,
            valueInDollars: 0.00,
            allBalances: [],
            loaded: false,
            refreshing: false,
            empty: false,
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
                 this.setState({db: this.globals.bareDb})
                 this.setState({loaded: true, refreshing: false});
             } else {
                 this.setState({db: JSON.parse(value)});
                 if (this.state.db.balanceInfo.addresses.length > 0) {
                     this.setState({empty: false});
                     Promise.all(this.state.db.balanceInfo.addresses.map(o =>
                         fetch(`https://explorer.grlc-bakery.fun/ext/getaddress/${o.inputAddress}`).then(resp => resp.json()) // TODO: replace with global getBlockchainApi
                     )).then(json => {
                         if (!Array.isArray(json) || json[0].balance == null) {
                             console.log(`Unexpected result from Explorer API.`);
                             this.setState({apiError: `Unexpected result from Explorer API.`});
                         }

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
                             return agg + parseFloat(elem.balance);
                         }, 0);
                         let allBalances = json.map(a => {
                             return {
                                 nickname: this.state.db.balanceInfo.addresses.filter(b => b.address == a.address)[0].name,
                                 address: a.address,
                                 balance: a.balance
                             };
                         });
                         this.setState({totalBalance: ret, allBalances});
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
                     this.setState({loaded: true, refreshing: false, empty: true});
                 }
             }
         }).done();
     }

    _onRefresh() {
        this.setState({refreshing: true});
    }

    static navigationOptions = ({navigate, navigation}) => ({
        title: "Garlicoin Balance",
        headerLeft: null,
        headerTintColor: "#0e0e0e",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        headerRight: <Icon name="more-vert" style={styles.rightButton} onPress={() => {
            navigation.navigate('Settings');
        }}/>,
        gesturesEnabled: false
    })

    render() {
        const {navigate} = this.props.navigation;
        const { empty } = this.state;

        let addressCards = null;
        if(!this.state.loaded) {
            addressCards = <ActivityIndicator style={styles.loadingSpinnerIndicator} size="large" color="#FFC107" />;
        }

        return (
            <View style={{flex: 1, backgroundColor: "#ffffff"}}>
                {empty &&
                <Card containerStyle={styles.getStartedCtaCardContainer} wrapperStyle={styles.getStartedCtaCardWrapper}>
                    <Image style={styles.getStartedCtaIcon} source={require("../assets/images/empty_garlicoin_symbol.png")} />
                    <Text style={styles.getStartedCtaText}>It looks like you haven't added any addresses yet. To add one, press the floating yellow 'add' button below.</Text>
                </Card>}
                {!empty &&
                <ScrollView refreshControl={<RefreshControl enabled refreshing={this.state.refreshing} onRefresh={() => this.initView()} />}>
                    <List containerStyle={styles.addressListContainer}>
                        {addressCards || this.state.allBalances.map(a => {
                            return <ListItem key={`address-${a.address}`} title={a.nickname} subtitle={`${Numbers.formatBalance(a.balance, 'US')} GRLC`} wrapperStyle={{paddingTop: 2, paddingBottom: 2}} onPress={() => navigate('ViewAddress', {addressId: a.address})} />;
                        })}
                    </List>
                </ScrollView>}
                <ActionButton onPress={() => navigate('AddAddress')} buttonColor={"#FFC107"} buttonTextStyle={{color: "#0e0e0e"}} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    error: {
        marginTop: 28,
        marginBottom: 28,
        color: '#DC143C',
    },
    rightButton: {
        paddingLeft: "-5"
    },
    loadingSpinnerIndicator: {
        marginTop: 28,
        marginBottom: 28
    },
    getStartedCtaCardContainer: {
        elevation: 0,
        shadowColor: 'rgba(0,0,0,0)',
        backgroundColor: "transparent",
        borderColor: "transparent"
    },
    getStartedCtaCardWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    getStartedCtaIcon: {
        width: 100,
        height: 100,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    getStartedCtaText: {
        textAlign: "center",
        fontSize: 16
    },
    addressListContainer: {
        marginTop: 0,
        borderBottomColor: "#dddddd"
    }
});