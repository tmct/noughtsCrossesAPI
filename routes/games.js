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
    var player = req.body.player;
    if (!(_.includes([1,2], player))) {
        return returnError('Player number must be 1 or 2');
    }

    var xPos = req.body.position[0] - 1;
    var yPos = req.body.position[1] - 1;
    if (xPos > 2 || xPos < 0){
        return returnError('Invalid row index');
    }
    if (yPos > 2 || yPos < 0){
        return returnError('Invalid column index');
    }
    function getGame() {
        var gameId = parseInt(req.params.gameId);
        if (!gameId) {
            returnError('Invalid game ID');
        }
        var gameName = 'GameInProgress' + gameId;
        return database.child(gameName).once('value')
            .then(processGameAndDoMoreStuff)
            .catch(returnError);
    }
    function processGameAndDoMoreStuff(snapshot) {
        var game = snapshot.val();
        if (!game) {
            return returnError('Game does not exist');
        }
        var processedGame = processGame(game);

        if (player !== processedGame.player) {
            return returnError('It\'s not your turn');
        }

        var symbol = processedGame.grid[xPos][yPos];
        if (symbol !== '-') {
            return returnError('You can\'t go in that square!');
        }
        var newSymbol = player === 1 ? 'X' : '0';
        res.setHeader('Content-Type', 'application/json');
        var successMessage = "Would set square " + xPos + "," + yPos + " to " + newSymbol;
        res.send(JSON.stringify({"Success": successMessage}));
    }
    function returnError(reason) {
        var givenReason = reason || 'Mystery error';
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ "Error": reason }));
    }
    return database.authWithCustomToken(process.env.FIREBASE_KEY)
        .then(getGame)
        .catch(returnError)
});

router.post('/:gameId', function(req, res, next) {
    function createGame() {
        var gameId = parseInt(req.params.gameId);
        if (!gameId) {
            returnError('Invalid game ID');
        }
        var gameName = 'GameInProgress' + gameId;
        return database.child(gameName).once('value')
            .then(processGameAndDoMoreStuff)
            .catch(returnError);
    }
    function processGameAndDoMoreStuff(snapshot) {
        var game = snapshot.val();
        if (game) {
            return returnError('Game already exists!');
        }
        var newGrid = [
            ["-","-","-"],
            ["-","-","-"],
            ["-","-","-"]
        ];

        res.setHeader('Content-Type', 'application/json');
        var successMessage = "Would create grid: " + JSON.stringify(newGrid);
        res.send(JSON.stringify({"Success": successMessage}));
    }
    function returnError(reason) {
        var givenReason = reason || 'Mystery error';
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({ "Error": reason }));
    }
    return database.authWithCustomToken(process.env.FIREBASE_KEY)
        .then(createGame)
        .catch(returnError)
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
