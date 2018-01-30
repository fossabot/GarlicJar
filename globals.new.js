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
        this.marketApi = [
            {
                "name": "CoinMarketCap",
                "url": "https://api.coinmarketcap.com/v1/ticker/garlicoin/",
            }
        ];

        // Grab address and txn information from these APIs
        this.blockchainApi = [
            {
                "name": "GRLC Bakery Explorer",
                "url": "https://explorer.grlc-bakery.fun/ext/getaddress/",
            },
            {
                "name": "Official API",
                "url": "https://explorer.garlicoin.io/ext/getaddress/",
            }
        ];

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
        }
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
        return this.marketApi;
    }

    getBlockchainApi() {
        return this.blockchainApi;
    }

    getAssets() {
        return this.assets[this.coin];
    }
}

export default GlobalConstants;