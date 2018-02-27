import React, { Component } from "react";
import {
    Text,
    View,
    ScrollView,
    AsyncStorage,
    RefreshControl,
    StyleSheet,
    Image,
    ActivityIndicator
} from "react-native";
import { Button, Card, List, ListItem, Icon } from "react-native-elements";

import coreStyles, { colours } from "../coreStyles";
import addressListStyles from "./styles";

export default class ViewAddressList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addresses: [],
            loading: false
        };
    }

    componentDidMount = async () => {
        this.setState({ loading: true });
        await this._updateAddressBalances();
        await this._getAddresses();
        this.setState({ loading: false });
    };

    static navigationOptions = ({ navigate, navigation }) => ({
        title: "Garlicoin Balance",
        headerLeft: null,
        headerTintColor: colours.dark,
        headerStyle: {
            backgroundColor: colours.primary
        },
        headerRight: (
            <Icon
                name="more-vert"
                onPress={() => {
                    navigation.navigate("Settings");
                }}
            />
        ),
        gesturesEnabled: false
    });

    _updateAddressBalances = async () => {
        let getAddresses = await AsyncStorage.getItem("addresses");
        let addressList = (await JSON.parse(getAddresses)) || null;

        let getExplorerUrl = await AsyncStorage.getItem("explorer");
        let explorerUrl = getExplorerUrl;

        if (!addressList || !explorerUrl) return; // to-do: replace with error handling

        // retrieve the current balance for every address, and update
        addressList.forEach(a => {
            const address = a.public;

            fetch(`${explorerUrl}${address}`)
                .then(rawRes => rawRes.json())
                .then(res => {
                    if (!balance) return; // to-do: replace with error handling

                    a.balance = res.balance;
                })
                .catch(err => {
                    return; // to-do: replace with error handling
                });
        });

        await AsyncStorage.setItem("addresses", JSON.stringify(addressList));
    };

    _getAddresses = async () => {
        let res = await AsyncStorage.getItem("addresses");
        let addressList = (await JSON.parse(res)) || [];

        this.setState({
            addresses: addressList
        });
    };

    refreshAddresses = async () => {
        this.setState({ loading: true });
        await this._updateAddressBalances();
        await this._getAddresses();
        this.setState({ loading: false });
    };

    render() {
        const { addresses, loading } = this.state;

        if (loading) {
            return (
                <View style={coreStyles.root}>
                    <ActivityIndicator
                        style={coreStyles.loadingSpinnerIndicator}
                        size="large"
                        color={colours.primary}
                    />
                </View>
            );
        }

        if (addresses.length < 1) {
            // To-do: handle this with InitiateDatabase (onboardUser) in the future 
            // navigation.navigate("Onboarding");
            // to-do: add refresh scroller
            return (
                <View style={coreStyles.root}>
                    <Card>
                        <Image
                            style={addressListStyles.getStartedCtaIcon}
                            source={require("../assets/images/empty_garlicoin_symbol.png")}
                        />
                        <Text style={addressListStyles.getStartedCtaText}>
                            It looks like you haven't added any addresses yet. To add one, press the floating yellow
                            'add' button below.
                        </Text>
                    </Card>
                </View>
            );
        }

        return (
            <View style={coreStyles.root}>
                <ScrollView>
                    <List>
                        {addresses.map(a => {
                            return (
                                <ListItem
                                    key={`address-${a.address}`}
                                    title={a.nickname}
                                    subtitle={`${Numbers.formatBalance(a.balance, "US")} GRLC`}
                                    wrapperStyle={addressListStyles.addressListItem}
                                    onPress={() => navigate("ViewAddress", { addressId: a.address })}
                                />
                            );
                        })}
                    </List>
                </ScrollView>
            </View>
        );
    }
}
