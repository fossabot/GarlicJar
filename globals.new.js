'use strict'
import { AsyncStorage } from 'react-native';

class GlobalConstants {

    constructor() {
        this.bitcoin = require('bitcoinjs-lib');

        ////////////////////////////////////////
        // Constants

        this.COLOURS = {
            PRIMARY: "#ffc107",
            TEXT: "#0e0e0e"
        };

        this.coin = {
            "name": "Garlicoin",
            "ticker": "GRLC",
            "symbol": require("./assets/images/garlicoin_symbol.png"),
        };
        
        ////////////////////////////////////////
        // APIs
        
        // Grab pricing data from these APIs
        this.marketApi = {
            "CoinMarketCap": {
                "url": "https://api.coinmarketcap.com/v1/ticker/garlicoin/",
            }
        };

        // Grab address and txn information from these APIs
        this.blockchainApi = {
            "GRLC Bakery Explorer": {
                "url": "https://explorer.grlc-bakery.fun/ext/getaddress/",
            },
            "Official API": {
                "url": "https://explorer.garlicoin.io/ext/getaddress/",
            }
        };

        ////////////////////////////////////////
        // Local database

        this.bareDb = {
            "balanceInfo": {
                "name": "Garlicoin",
                "date": "1318464000",
                "totalBalance": "0.00000000",
                "addresses": []
            },
            "exchange": {
                "price": 0.00,
                "date": "1318464000",
                "name": "CoinMarketCap",
            }
        };

        this.settings = {
            "Theme": {
                "selected": "light",
                "options": [
                    "light",
                    "dark",
                    "black"
                ]
            },
            "Language": {
                "selected": "English (United Kingdom)",
                "options": [
                    "English (United Kingdom)"
                ]
            }
        };
    }

    ////////////////////////////////////////
    // Public functions
    
    static getAppName() {
        return `${this.coin.name} Balance`;
    }

    getCoinName() {
        return this.coin.name;
    }

    getCoinTicker() {
        return this.coin.ticker;
    }

    getMarketApi() {
        let successfulApi;
        let exampleAddress = "GU2NtcNotWFiZjTp2Vdgf5CjeMfgsWYCua";
        let successful = false;
        while(!successful) {
            for(let api in this.marketApi) {
                // skip loop if the property is from prototype
                // source: https://stackoverflow.com/a/921808
                if (!this.marketApi.hasOwnProperty(api)) continue;
    
                var currentApi = this.marketApi[api];
    
                // get first API that returns 200 OK
                fetch(`${currentApi.url}${exampleAddress}`).then(res => res.json()).catch(e => false).then(res => {
                    successfulApi = currentApi;
                    successful = true;
                });
            }
        }
        
        return successfulApi;
    }

    getBlockchainApi() {
        return this.blockchainApi;
    }

    getAssets() {
        return this.assets[this.coin];
    }

    getSettings() {
        return this.settings;
    }
}

export default GlobalConstants;