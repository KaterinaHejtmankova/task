var chai = require('chai');
var async = require('async');
var redis = require("redis");
var fs = require('fs');
var assert = chai.assert;
var AppFunctions = require('./AppFunctions');


/******************************************************************************
 * Tests for functions: 
 * getValueforKey, validateQuery, saveToRedis, saveToJSON 
 * 
 */

describe('getValueforKey', function () {
    it('should return value for a given key', function (done) {
        var query = {count: 1, color: "blue"};
        var key = "color";

        AppFunctions.getValueforKey(query, key, function (err, result) {
            if (err) {
                return done(err);
            } else {
                assert.equal(result, query[key], 'Function didn´t return a proper value');
                done();
            }
        });
    });
    it('controls if key is count and return number value', function (done) {
        var query = {count: 1, color: "blue"};
        var key = "count";

        AppFunctions.getValueforKey(query, key, function (err, result) {
            if (err) {
                return done(err);
            } else {
                if (isNaN(result)) {
                    done("Error: Result is not a number!");
                }
                done();
            }
        });
    });
    it('adds count value from redis databse', function (done) {
        var query = {count: 2, color: "blue"};
        var key = "count";

        redis.createClient().get(key, function (err, numberFromDB) {
            if (err) {
                done(err);
            } else {
                AppFunctions.getValueforKey(query, key, function (err, result) {
                    if (err) {
                        return done(err);
                    } else {
                        assert.equal(result, 2 + Number(numberFromDB), 'Function didn´t return a proper number value');
                        done();
                    }
                });
            }
        });

    });
});
describe('validateQuery', function () {
    it('should return validated query', function () {
        var query = {"count": "1", "color": "blue"};

        var validatedQuery = AppFunctions.validateQuery(query);

        assert.equal(validatedQuery, query, 'Function validateQuery didn´t return a proper value');
    });
    it('shouldn´t return some strange query', function () {
        var query = function () {
            return "bla";
        };

        var validatedQuery = AppFunctions.validateQuery(query);

        assert.equal(validatedQuery, null, 'Function validateQuery didn´t return a proper value');
    });
});
describe('saveToRedis', function () {
    it('should save key value to redis database and return OK', function (done) {
        var key = "category";
        var value = "sport";

        AppFunctions.saveToRedis(key, value, function (err, result) {
            if (err) {
                return done(err);
            } else {
                assert.equal(result, "OK", 'Function didn´t return a proper value');
                done();
            }
        });
    });
    it('controls if key value pair is saved in database', function (done) {
        var key = "transport";
        var value = "bus";

        AppFunctions.saveToRedis(key, value, function (err, result) {
            if (err) {
                return done(err);
            } else {
                redis.createClient().get(key, function (err, valueFromDB) {
                    if (err) {
                        done(err);
                    } else {
                        assert.equal(valueFromDB, value, 'Function didn´t return a proper value');
                        done();
                    }
                });
            }
        });
    });
});
describe('saveToJSON', function () {
    it('should save key value to JSON file and returns content', function (done) {
        var key = "language";
        var value = "cz";
        var filename = './JSONfile.json';

        AppFunctions.saveToJSON(filename, key, value, function (err, result) {
            if (err) {
                return done(err);
            } else {
                fs.readFile(filename, function (err, readFile) {
                    if (err) {
                        return done(err);
                    } else {
                        assert.equal(result, readFile, 'Function didn´t return a proper value');
                        done();
                    }
                });

            }
        });
    });
});


