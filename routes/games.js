var express = require('express');
var router = express.Router();
var Firebase = require('firebase');
var database = new Firebase(process.env.FIREBASE_DB);
var _ = require('lodash');

router.get('/:gameId', function(req, res, next) {
    function getGame() {
        var gameId = parseInt(req.params.gameId);
        if (!gameId) {
            returnError('Invalid game ID');
        }
        var gameName = 'GameInProgress' + gameId;
        return database.child(gameName).once('value')
            .then(processGameAndReturn)
            .catch(returnError);
    }
    function processGameAndReturn(snapshot) {
        var game = snapshot.val();
        if (!game) {
            return returnError('Game does not exist');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(processGame(game)));
    }
    function returnError(reason) {
        var givenReason = reason || 'Mystery error';
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ "Error": reason }));
    }
    return database.authWithCustomToken(process.env.FIREBASE_KEY)
        .then(getGame)
        .catch(returnError);
});

router.post('/:gameId/move', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).send(JSON.stringify({ "Error": "Here's what you posted:", "body": req.body }));
});

function processGame(game) {
    var rows = [game.row1, game.row2, game.row3];
    return {
        player: parseInt(game.player),
        grid: _.map(rows, readRow)
    };
}

function readRow(row) {
    return row.split(',');
}

module.exports = router;
