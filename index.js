var http = require("http"),
    url = require("url"),
    bl = require("bl");

var METADATA_URL = "http://metadata.google.internal/computeMetadata/v1";

function metadataRequest (path, callback) {
    var completURL = METADATA_URL + path + "/?recursive=true",
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

            try {
                json = JSON.parse(data.toString());
            } catch (err) {
                callback(err);
                return;
            }
            callback(null, json);
        }));
    }).on("error", function (err) {
        callback(err);
    });
}

exports.instance = function (callback) {
    metadataRequest("/instance", callback);
};

exports.project = function (callback) {
    metadataRequest("/project", callback);
};
