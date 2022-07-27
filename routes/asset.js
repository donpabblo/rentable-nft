const express = require('express');
const router = express.Router();
require('dotenv').config();
const { NETWORK_ID, NETWORK, CONTRACT, INFURA_KEY } = process.env;
const { ethers } = require("ethers");
const RentableNFT = require('../artifacts/contracts/RentableNFT.sol/RentableNFT.json');

router.get('/:category/:id/:command', async function (req, res) {
    try {
        let result = {
            command: req.params.command,
            token: generate_token(32),
            network: NETWORK,
            chainid: NETWORK_ID,
            contract: CONTRACT,
            nft: req.params.id
        }
        res.json(result);
    } catch (err) {
        res.json({ error: err }).status(500);
    }
});

router.post('/:category/:id/:command', async function (req, res) {
    try {
        let message = req.body.message;
        let signature = req.body.signature;
        let verify = await ethers.utils.verifyMessage(JSON.stringify(message), signature);

        let vToken = verifyTokenExpiration(message.token);
        let vCommand = verifyCommand(message.command);
        let vTokenId = req.params.id == message.nft;

        if (vToken && vCommand && vTokenId) {
            let provider;
            if (NETWORK == 'localhost') {
                provider = ethers.getDefaultProvider('http://localhost:8545');
            } else {
                provider = new ethers.providers.InfuraProvider(NETWORK, INFURA_KEY);
            }
            let contract = new ethers.Contract(CONTRACT, RentableNFT.abi, provider);
            const checkUser = await contract.userOf(req.params.id);
            const owner = await contract.ownerOf(req.params.id);
            if (checkUser == verify || owner == verify) {
                res.json({ result: req.params.category + '_' + req.params.command });
            } else {
                res.json({ error: 'You are not allowed to send commands' }).status(403);
            }
        }
    } catch (err) {
        res.json({ error: err }).status(500);
    }
});

function generate_token(length) {
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

function verifyTokenExpiration(token) {
    //TODO Verify one-time token is not expired
    return true;
}

function verifyCommand(command) {
    //TODO verify command is possible for the asset (allowed commands are in NFT metadata)
    return command == 'lock' || command == 'unlock';
}

module.exports = router;
