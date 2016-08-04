var express = require('express');
var router = express.Router();
var Firebase = require('firebase');
var database = new Firebase(process.env.FIREBASE_DB);

/* GET grids listing. */
router.get('/', function(req, res, next) {
    function getGame1() {
        return database.child('GameInProgress1').once('value').then(processGameAndReturn, returnError);
    }
    function processGameAndReturn(snapshot) {
        var game = snapshot.val();
        if (!game) {
            return returnError('Game does not exist');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ a: game }));
    }
    function returnError(reason) {
        var givenReason = reason || 'Mystery error';
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ "Error": reason }));
    }
    return database.authWithCustomToken(process.env.FIREBASE_KEY).then(getGame1, returnError);
});

module.exports = router;
