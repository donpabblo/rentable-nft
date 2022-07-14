const fs = require('fs');

function writeConfig(address) {
    let result = "";
    let rawdata = fs.readFileSync('.env').toString();
    let rows = rawdata.split('\r\n');
    for (var row of rows) {
        let split = row.split("=");
        if (split[0] == "CONTRACT") {
            result += split[0] + '=' + '"' + address + '"' + '\r\n';
        } else {
            result += split[0] + '=' + split[1] + '\r\n';
        }
    }
    fs.writeFileSync('.env', result);;
}


/*
function signJWT(payload, priv_key) {
    var pk = priv_key;
    if (priv_key.startsWith('0x')) {
        pk = priv_key.substr(2);
    }
    return new TokenSigner('ES256K', pk).sign(payload);
}

function verifyJWT(jwt, pub_key) {
    var pk = pub_key;
    if (pub_key.startsWith('0x')) {
        pk = pub_key.substr(2);
    }
    return new TokenVerifier('ES256K', pk).verify(jwt);
}

function decodeJWT(jwt) {
    return decodeToken(jwt).payload;
}
*/

module.exports = {
    writeConfig
}