const fs = require('fs');
const { getContractAt } = require("@nomiclabs/hardhat-ethers/internal/helpers");
//const { TokenSigner, TokenVerifier, decodeToken } = require("jsontokens");

function writeConfig(address) {
    rawdata = fs.readFileSync('config.json');
    scriptConfig = JSON.parse(rawdata);
    scriptConfig.contract_address = address;
    scriptData = JSON.stringify(scriptConfig);
    fs.writeFileSync('config.json', scriptData);
}

async function getContract(hre, contractName) {
    rawdata = fs.readFileSync('config.json');
    scriptConfig = JSON.parse(rawdata);
    return await getContractAt(hre, contractName, scriptConfig.contract_address);
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
    writeConfig,
    getContract
}