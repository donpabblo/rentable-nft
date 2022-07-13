const express = require('express');
const router = express.Router();
require('dotenv').config();
const { NETWORK_ID, NETWORK, CONTRACT } = process.env;

router.get('/network', async function (req, res) {
    try {
        res.json({ network: NETWORK, network_id: NETWORK_ID });
    } catch (err) {
        res.json({ error: err }).status(500);
    }
});

router.get('/contract', async function (req, res) {
    try {
        res.json({ contract: CONTRACT });
    } catch (err) {
        res.json({ error: err }).status(500);
    }
});

module.exports = router;
