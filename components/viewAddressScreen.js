import React, {Component} from 'react';
import { ScrollView, View, StyleSheet, Keyboard, Modal, Alert, ActivityIndicator } from 'react-native';
import { FormLabel, FormInput, Button, Card, List, ListItem, Text, Icon } from 'react-native-elements';
import Dialog, { DialogButton } from 'react-native-md-dialog';
import QRCode from 'react-native-qrcode';
import GlobalConstants from '../globals';
import Numbers from '../utils/numbers';

/**
 * ViewAddress shows details and txns related to the address being watched.
 */
export default class ViewAddressScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            txns: [],
            balance: 0.00000000,
            loading: true,
        }

        this.globals = new GlobalConstants();

        this.openQrDialog = this.openQrDialog.bind(this);
    }

    componentDidMount() {
        this.initView();
        Keyboard.dismiss();
     }

     initView = () => {
        const { params } = this.props.navigation.state;

        fetch(`https://explorer.grlc-bakery.fun/ext/getaddress/${params.addressId}`)
        .then(resp => resp.json())
        .then(json => {
            this.setState({loading: false, balance: json.balance, txns: json.last_txs.map(txn => {
                return {
                    id: txn.txid,
                    timestamp: txn.timestamp,
                    amountIn: txn.vout[params.addressId] || 0.00,
                    amountOut: txn.vin[params.addressId] || 0.00
                }
            })})
        })
        .catch(e => {
            this.setState({
                apiError: `Error connecting to the Explorer API: ${e}`
            });
            console.error(`Error connecting to the Explorer API: ${e}`);
        });
    }

    openQrDialog = () => {
        this.refs.dialog1.open();
    }


    // source: https://gist.github.com/kmaida/6045266
    convertTimestamp = (timestamp) => {
        var d = new Date(timestamp * 1000),
              yyyy = d.getFullYear(),
              mm = ('0' + (d.getMonth() + 1)).slice(-2),
              dd = ('0' + d.getDate()).slice(-2),
              hh = d.getHours(),
              h = hh,
              min = ('0' + d.getMinutes()).slice(-2),
              ampm = 'AM',
              time;
                  
          if (hh > 12) {
              h = hh - 12;
              ampm = 'PM';
          } else if (hh === 12) {
              h = 12;
              ampm = 'PM';
          } else if (hh == 0) {
              h = 12;
          }
          
          // ie: 2018-02-18, 8:35 AM	
          time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
              
          return time;
      }

    static navigationOptions = ({navigate, navigation}) => ({
        title: navigation.state.params.nickname,
        headerTintColor: "#0e0e0e",
        headerStyle: {
            backgroundColor: "#FFC107",
        },
        headerRight: <Icon name="share" onPress={() => this.openQrDialog}/>,
        gesturesEnabled: false
    })

    

    render() {
        const { navigate } = this.props.navigation;
        const { balance, txns, loading } = this.state;
        const { params } = this.props.navigation.state;

        let txnsLoading;
        if(loading) {
            txnsLoading = <ActivityIndicator size="large" color="#FFC107" />;
        }
        
        return (
            <ScrollView style={{flex: 1, backgroundColor: "#ffffff"}}>
                <View>
                    <Text style={{fontSize: 20, fontWeight: "bold", textAlign: "center"}}>{params.addressId}</Text>
                    <Text style={{fontSize: 25, fontWeight: "bold", textAlign: "center"}}>{balance} GRLC</Text>
                    <ScrollView>
                        <List>
                            {txnsLoading || txns.map(txn => {
                            return <ListItem
                            key={txn.id}
                            title={txn.id}
                            subtitle={this.convertTimestamp(txn.timestamp)}
                            titleNumberOfLines={10}
                            rightTitle={`${txn.amountIn || txn.amountOut}`}
                            hideChevron
                            titleNumberOfLines={1}
                            />;})}
                        </List>
                    </ScrollView>
                </View>
                <Dialog actions={[<DialogButton text='CLOSE' onPress={() => this.refs.dialog1.close()} position='right'/>]} ref='dialog1'>
                    <View>
                        <QRCode value={params.addressId} size={200} bgColor={'white'} fgColor={'black'} />
                    </View>
                </Dialog>
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