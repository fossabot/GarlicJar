/**
 * Address Validator for Garlicoin
 * @version 1.1.0
 * @author Roman Shtylman <shtylman@gmail.com>
 * @author Sean Lavine <freewil@users.noreply.github.com>
 * @author Dylan Myers <f2895c31@opayq.com>
 */

var crypto = require("crypto");
var base58 = require("./base58");

/**
 * Check if an address is valid
 * @returns {bool} true if valid, otherwise false
 */
function validate(address) {
    try {
        var decoded_hex = base58.decode(address);
    } catch (e) {
        return false;
    }

    // make a usable buffer from the decoded data
    var decoded = new Buffer(decoded_hex, "hex");

    // should be 25 bytes per grlc address spec
    if (decoded.length != 25) {
        return false;
    }

    var length = decoded.length;
    var cksum = decoded.slice(length - 4, length).toString("binary");
    var body = decoded.slice(0, length - 4);

    var good_cksum = sha256_digest(sha256_digest(body)).substr(0, 4);

    if (cksum !== good_cksum) {
        return false;
    }

    var type = decoded_hex.slice(0, 2);
    if (type !== "26") { // 26 is the hex representation of G in base58
        return false;
    }

    return true;
}

module.exports.validate = validate;

/// private methods

// helper to perform sha256 digest
function sha256_digest(payload) {
    return crypto
        .createHash("sha256")
        .update(payload)
        .digest("binary");
}
