const fs = require('fs');
function changeEndpoint() {
    for (var i = 1; i <= 30; i++) {
        let rawdata = fs.readFileSync('metadata/' + i);
        let json = JSON.parse(rawdata);
        json.external_url = 'https://rentable-nft.vercel.app/#/asset/car/' + i + '/';
        json.endpoint = 'https://rentable-nft.vercel.app/asset/car/' + i + '/';
        let jsonString = JSON.stringify(json);
        fs.writeFileSync('metadata2/' + i, jsonString);
    }
}

function flat() {
    let result = {};
    for (var i = 1; i <= 30; i++) {
        let rawdata = fs.readFileSync('metadata2/' + i);
        let json = JSON.parse(rawdata);
        result[i] = json;
    }
    let jsonString = JSON.stringify(result);
    fs.writeFileSync('metadata.json', jsonString);
}

function unflat(env) {
    let rawdata = fs.readFileSync('metadata_/metadata_' + env + '.json');
    let json = JSON.parse(rawdata);
    for (var i = 1; i <= 30; i++) {
        let jsonString = JSON.stringify(json[i]);
        fs.writeFileSync('metadata/' + i, jsonString);
    }
}

function env(contract) {
    let result = "";
    let rawdata = fs.readFileSync('.env').toString();
    let rows = rawdata.split('\r\n');
    for (var row of rows) {
        let split = row.split("=");
        if (split[0] == "CONTRACT") {
            result += split[0] + '=' + '"' + contract + '"' + '\r\n';
        } else {
            result += split[0] + '=' + split[1] + '\r\n';
        }
    }
    fs.writeFileSync('.env2', result);
}

unflat('goerli');
