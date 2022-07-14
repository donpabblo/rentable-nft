const express = require('express');
const router = express.Router();

var counter = {
    views: 0,
    commands: 0,
    rented: 0
}

router.get('/', async function (req, res) {
    res.json(counter);
});

router.post('/:type', async function (req, res) {
    counter[req.params.type] = counter[req.params.type] + 1;
    res.json({update: "Ok"});
});

module.exports = router;
