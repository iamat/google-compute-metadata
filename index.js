var http = require("http"),
    url = require("url"),
    bl = require("bl");

var METADATA_URL = "http://metadata.google.internal/computeMetadata/v1";

function metadataRequest (path, callback) {
    var completURL = METADATA_URL + path,
        options = url.parse(completURL);

    options.headers = {
        "Metadata-Flavor": "Google"
    };

    http.get(options, function (res) {
        var json = {};
        if (res.statusCode >= 400) {
            callback(new Error("HTTP Error: " + res.statusCode));
            return;
        }

        res.pipe(bl(function (err, data) {
            var json;
            if (err) {
                callback(err);
                return;
            }

            callback(null, data.toString());
        }));
    }).on("error", function (err) {
        callback(err);
    });
}

function metadataRequestRecursive (path, callback) {
    path += "/?recursive=true";
    metadataRequest(path, function (err, body) {
        var json = {};
        if (err) {
            callback(err);
            return;
        }

        try {
            json = JSON.parse(body);
        } catch (err) {
            callback(err);
            return;
        }
        callback(null, json);
      });
}

exports.instance = function (callback) {
    metadataRequestRecursive("/instance", callback);
};

exports.project = function (callback) {
    metadataRequestRecursive("/project", callback);
};
