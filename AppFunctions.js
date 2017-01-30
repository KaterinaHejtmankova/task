var fs = require('fs');
var redis = require("redis");
var client = redis.createClient();

module.exports = {
        /*******************************************************************************
     * Gets value from query with given key. 
     * If key equals to "count" it gets value from Redis database and icreases given 
     * value by the base from Redis database.
     * 
     * @param {Object} query - object of parameters from URL
     * @param {String} key - key parameter from query
     * @param {function} callback
     */
    getValueforKey: function (query, key, callback) {
        var value = query[key];


        if (key === "count") {
            if (isNaN(value)) {
                value = 0;
            }
            value = Number(value);
            client.get(key, function (err, result) {
                if (err) {
                    callback(err);
                }
                value = value + Number(result);
                callback(null, value);
            });
        } else {

            callback(null, value);
        }
    },
    /*******************************************************************************
     * Validates query from URL.
     * 
     * @param {Object} query - object of parameters from URL
     * @returns {Object} valid object of parameters from URL
     */
    validateQuery: function (query) {
        var validatedQuery = null;
        for (var index in query) {
            try {
                validatedQuery = query;
                validatedQuery[index] = JSON.parse(validatedQuery[index]);
            } catch (e) {
                console.log("Error in validation for query " + query + ": " + e);
            }
        }
        return validatedQuery;
    },
    /*******************************************************************************
     * Saves key and value to Redis database.
     * 
     * @param {String} key - key to save
     * @param {String} value - value to save
     * @param {function} callback
     */
    saveToRedis: function (key, value, callback) {
        client.set(key, value, function (err, doc) {
            if (err) {
                callback(err);
            } else {
                callback(null, doc);
            }
        });
    },
    /*******************************************************************************
     * Saves key and value to JSON file.
     * 
     * @param {String} fileName - name of file for saving key value pair in JSON
     * @param {String} key - key to save
     * @param {String} value - value to save
     * @param {function} callback
     */
    saveToJSON: function (fileName, key, value, callback) {
        var file = require(fileName);
        file[key] = value;
        fs.writeFile(fileName, JSON.stringify(file), function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, JSON.stringify(file));
            }
        });
    }
};

