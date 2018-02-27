import React, { Component } from "react";
import {
    Text,
    View,
    ScrollView,
    AsyncStorage,
    RefreshControl,
    ActivityIndicator
} from "react-native";
import { Button, Card, List, ListItem, Icon } from "react-native-elements";

import coreStyles, { colours } from "../coreStyles";
import addressViewStyles from "./styles";

export default class ViewAddress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: 0.0,
            txns: [],
            loading: false
        };
    }

    componentDidMount = async () => {
        this.setState({ loading: true });
        await this._getAddressData();
        this.setState({ loading: false });
    };

    static navigationOptions = ({ navigate, navigation }) => ({
        title: `Balance for ${navigation.state.params.nickname}`,
        headerLeft: null,
        headerTintColor: colours.dark,
        headerStyle: {
            backgroundColor: colours.primary
        },
        headerRight: null,
        gesturesEnabled: false
    });

    /**
     * Fetch explorer data for the passed address
     * @private
     */
    _getAddressData = async () => {
        const { params } = this.props.navigation.state;

        const explorerUrl = await AsyncStorage.getItem("explorer");

        if (!explorerUrl || !params.addressId) return; // to-do: replace with error handling

        fetch(`${explorerUrl}${params.addressId}`)
            .then(rawRes => rawRes.json())
            .then(res => {
                this.setState({
                    balance: res.balance,
                    txns: res.last_txs.map(txn => {
                        return {
                            id: txn.txid,
                            timestamp: this._convertTimestamp(txn.timestamp),
                            amountIn: txn.vout[params.addressId] || -1.0,
                            amountOut: txn.vin[params.addressId] || -1.0
                        };
                    })
                });
            })
            .catch(err => {
                return; // to-do: replace with error handling
            });
    };

    /**
     * Convert a unix timestamp to full date format.
     * @author Kim Maida <kim@kmaida.io>
     * @tutorial https://gist.github.com/kmaida/6045266
     * @private
     * @param {string} timestamp - A unix timestamp
     */
    _convertTimestamp = timestamp => {
        var d = new Date(timestamp * 1000),
            yyyy = d.getFullYear(),
            mm = ("0" + (d.getMonth() + 1)).slice(-2),
            dd = ("0" + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ("0" + d.getMinutes()).slice(-2),
            ampm = "AM",
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = "PM";
        } else if (hh === 12) {
            h = 12;
            ampm = "PM";
        } else if (hh == 0) {
            h = 12;
        }

        // ie: 2018-02-18, 8:35 AM
        time = `${yyyy}-${mm}-${dd}, ${h}:${min} ${ampm}`;

        return time;
    };

    refreshAddress = async () => {
        this.setState({ loading: true });
        await this._getAddressData();
        this.setState({ loading: false });
    };

    render() {
        const { balance, txns, loading } = this.state;
        const { navigate, state: { params } } = this.props.navigation;

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

        // do we need a scrollview around this view? like old style. in that case you'd move rootstyle to parent
        // to-do: fix txn amountIn/amountOut
        // to-do: add QR display
        return (
            <View style={coreStyles.root}>
                <Text style={addressViewStyles.addressHeading}>{params.addressId}</Text>
                <Text style={addressViewStyles.balanceHeading}>{balance} GRLC</Text>
                <ScrollView>
                    <List>
                        {txns.map(txn => {
                            return (
                                <ListItem
                                    key={txn.id}
                                    title={txn.id}
                                    subtitle={txn.timestamp}
                                    titleNumberOfLines={10}
                                    rightTitle={`${txn.amountIn || txn.amountOut}`}
                                    hideChevron
                                    titleNumberOfLines={1}
                                />
                            );
                        })}
                    </List>
                </ScrollView>
            </View>
        );
    }
}
