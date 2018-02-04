'use strict'
import WAValidator from 'wallet-address-validator';
import { AsyncStorage } from 'react-native';

class GlobalConstants {

    constructor() {
        this.bitcoin = require('bitcoinjs-lib');

        // Edit this for cointype (Ex: ltc, etc)
        this.coin = 'GRLC';

        this.donate = 'LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj';

        this.appVersion = "0.2.0-alpha";

        this.coinInfo = {
            "GRLC": {
                "name": "Garlicoin",
                "ticker": "GRLC"
            }
        };

        this.marketApi = {
            "ltc": {
                "name": "CoinMarketCap-LTC",
                "url": 'https://api.getPriceByCoinTicker.example/'
            }
        };

        this.blockchainApi = {
            "ltc": {
                "name": "Coinhark-LTC",
                "url": 'https://apt.getLTCAddressBalance.example/address/'
            }
        };

        this.bareDb = {
            "balanceInfo": {
                "name": "Coinhark API",
                "date": "1318464000",
                "totalBalance": "0.00000000",
                "addresses": []
            },
            "exchange": {
                "price": 0.00,
                "date": "1318464000",
                "name": "CoinMarketCap API",
            }
        }

        // Until require can handle non-literal strings, we do this. =/
        this.assets = {
          "GRLC": {
            "symbol": require("./assets/images/garlicoin_symbol.png")
          }
        };

        this.settings = {
            "Theme": {
                "selected": "Light",
                "options": [
                    "Light",
                    "Dark",
                    "Black"
                ]
            },
            "Language": {
                "selected": "English (United Kingdom)",
                "options": [
                    "English (United Kingdom)"
                ]
            }
        };

        /*
        Example db:
        {
            "balanceInfo": {
                "name": "chain.so/api",
                "date": "1513701489945",
                "totalBalance": "345.33420002",
                "addresses": [
                    {
                      "address":"LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj",
                      "inputAddress":"LVwutf6xmtKGXtS9KsgCUMHEmoEix7TvQj",
                      "name":"Donations",
                      "totalBalance":"0.05769462",
                      "valueInDollars":"10.43"
                    },
                    {
                      "address":"LZM4ztEMzk9MY9ikC8jE52nTeBHhcL9viW",
                      "inputAddress":"LZM4ztEMzk9MY9ikC8jE52nTeBHhcL9viW",
                      "name":"Random Address",
                      "totalBalance":"5.9",
                      "valueInDollars":"1,067.02"
                    },
                    {
                      "address":"3CuMqrgosjygLtVA4oF7RTzRiUNKvRznkF",
                      "inputAddress":"MK7W9k6mprq79Pm4AgETF7Eq3AxmwahBCT",
                      "name":"Segwit Address Convert",
                      "totalBalance":0,
                      "valueInDollars":"0.00"
                    }
                ]
            },
            "exchange": {
                "price":"354.402",
                "name":"CoinMarketCap",
                "date":"1513701489945"
            }
        }
        */
    }

    // Edit this for cointype (Ex: Litecoin Balance, Bitcoin Balance, etc)
    static getAppName() {
        return "Garlicoin Balance";
    }

    getAppVersion() {
        return this.appVersion;
    }

    getCoinName() {
        return this.coinInfo[this.coin].name;
    }

    getCoinTicker() {
        return this.coinInfo[this.coin].ticker;
    }

    getMarketApi() {
        return this.marketApi[this.coin];
    }

    getBlockchainApi() {
        return this.blockchainApi[this.coin];
    }

    formatMarketApiResponse(json) {
      if(this.coin == 'GRLC') {
        return json;
      } else {
        console.log("error: unknown coin: " + this.coin);
        return {};
      }
    }

    formatBlockchainApiResponse(json) {
      if(this.coin == 'GLRC') {
        return json;
      } else {
        console.log("error: unknown coin: " + this.coin);
        return {};
      }
    }

    getAssets() {
        return this.assets[this.coin];
    }

    getUserSettings() {
        return this.settings;
    }

    setUserSetting(key, selectedValue) {
        this.settings[key]["selected"] = selectedValue;
    }

    validateAddress(address, component) {
      if(this.coin == 'GRLC') {
        let validationAddress = component.state.address;
        if (validationAddress.startsWith('3')) {
            const decoded = this.bitcoin.address.fromBase58Check(validationAddress);
            let version = decoded.version;
            if (version === 5) {
                version = 50;
            }
            address.inputAddress = this.bitcoin.address.toBase58Check(decoded['hash'], version);
        }
        if (validationAddress.startsWith('M')) {
            const decoded = this.bitcoin.address.fromBase58Check(validationAddress);
            let version = decoded.version;
            if (version === 50) {
                version = 5;
            }
            validationAddress = this.bitcoin.address.toBase58Check(decoded['hash'], version);
        }
        let valid = WAValidator.validate(validationAddress, this.getCoinName().toLowerCase());
        if (valid) {
            let tmpDb = component.state.db;
            tmpDb.balanceInfo.addresses.push(address);
            component.setState({db: tmpDb});
            AsyncStorage.setItem("db", JSON.stringify(component.state.db));
            component.props.navigation.navigate('ManageAddresses');
        } else {
            component.setState({invalidAddress: true});
        }
    } else {
      console.log("error: unknown coin: " + this.coin);
    }
  }
}

export default GlobalConstants;