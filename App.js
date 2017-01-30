var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var redis = require("redis");
var fs = require('fs');
var async = require('async');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();
var client = redis.createClient();
var AppFunctions = require('./AppFunctions');

router.get('/', function (req, res, next) {

    // Prepare query
    var query = AppFunctions.validateQuery(req.query);
    var queryKeys;
    try {
        queryKeys = Object.keys(query);
    } catch (e) {

    }
    if (!query || !queryKeys) {
        console.log("No query to save: " + query + ", " + queryKeys);
        return;
    }

    // Prepare JSON file
    var fileName = './JSONfile.json';
    var file = require(fileName);
    var JSONresult;

    // For each key get value and save to Redis and JSON file
    async.each(queryKeys, function (key, callback) {

        async.waterfall([
            function (cb) {
                AppFunctions.getValueforKey(query, key, cb);
            },
            function (value, cb) {
                async.parallel([
                    function (callb) {
                        AppFunctions.saveToRedis(key, value, callb);
                    },
                    function (callb) {
                        AppFunctions.saveToJSON(fileName, key, value, callb);
                    }],
                        function (err, results) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null, results);
                            }
                        });
            }
        ], function (err, result) {
            if (err) {
                callback(err);
            } else {
                callback(null, result);
            }
        });
    },
            function (err) {
                if (err) {
                    console.log('\nKind of error ' + err.kind + ' on path ' + err.path + ' with value: ' + err.value + '\nMessage: ' + err.message);
                    next(err);
                } else {
                    JSONresult = JSON.stringify(file);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(JSONresult);
                }
            });
});

app.use('/track', router);

app.listen(port);
console.log('App connection on port ' + port);