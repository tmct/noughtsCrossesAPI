var express = require('express');
var router = express.Router();
var Firebase = require('firebase');
var database = new Firebase(process.env.FIREBASE_DB);

/* GET grids listing. */
router.get('/', function(req, res, next) {
    function doStuff() {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ a: 1 }));
    }
    function stuffIsBroken() {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ a: 'OH NO' }));
    }
    return database.authWithCustomToken(process.env.FIREBASE_KEY).then(doStuff, stuffIsBroken);
});

module.exports = router;
