const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');

const DB_PATH = './db/database.db';

router.get('/', async function (req, res, next) {
    try {
        var db = new sqlite3.Database(DB_PATH);
        db.all('SELECT * FROM counter', (err, rows) => {
            if (err) {
                res.status(500).send({ error: err.message });
            } else {
                res.json(rows);
            }
        });
        db.close();
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(err.statusCode || 500).json({ 'message': err.message });
    }
});

router.post('/:type', async function (req, res, next) {
    try {
        let type = req.params.type;
        if (type) {
            var db = new sqlite3.Database(DB_PATH);
            db.all('UPDATE counter SET ' + type + ' = ' + type + ' + 1', (err, rows) => {
                if (err) {
                    Logger.error(err);
                    res.status(500).send({ error: err.message });
                } else {
                    res.json({ result: "OK" });
                }
            });
            db.close();
        }
    } catch (err) {
        console.error(`Error `, err.message);
        res.status(err.statusCode || 500).json({ 'message': err.message });
    }
});

module.exports = router;