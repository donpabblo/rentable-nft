const express = require('express');
const router = express.Router();
const Redis = require("ioredis");
require('dotenv').config();
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

router.get('/:type', async function (req, res, next) {
    try {
        let type = req.params.type;
        if (type) {
            let client = new Redis("redis://:" + REDIS_PASSWORD + "@" + REDIS_HOST + ":" + REDIS_PORT);
            const x = await client.get(type);
            const count = x ? parseInt(x) : 0;
            res.json({ result: count });
        }
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(err.statusCode || 500).json({ 'message': err.message });
    }
});

router.post('/:type', async function (req, res, next) {
    try {
        let type = req.params.type;
        if (type && (type == 'views' || type == 'rents' || type == 'actions')) {
            let client = new Redis("redis://:" + REDIS_PASSWORD + "@" + REDIS_HOST + ":" + REDIS_PORT);
            const x = await client.get(type);
            const count = x ? parseInt(x) + 1 : 1;
            await client.set(type, count);
        }
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(err.statusCode || 500).json({ 'message': err.message });
    }
});

module.exports = router;