import { StyleSheet } from "react-native";

export default StyleSheet.Create({
    loadingSpinnerIndicator: {
        marginTop: 28,
        marginBottom: 28
    },
    root: {
        flex: 1,
        backgroundColour: colours.white
    },
    rightButton: {
        marginRight: 16,
        fontSize: 26,
        color: '#ffffff',
    },
});

export let colours = {
    primary: "#ffc107",
    dark: "#0e0e0e",
    black: "#000000",
    white: "#ffffff"
}