var http = require("http"),
    url = require("url"),
    bl = require("bl"),
    backoff = require("backoff");

var METADATA_URL = "http://metadata.google.internal/computeMetadata/v1";

function _metadataRequest (path, callback) {
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

function metadataRequest (path, callback) {
    var call = backoff.call(_metadataRequest, path, callback);

    // DNS errors shouldn't be retried because the program probably
    // isn't running in the google cloud environment
    call.retryIf(function(err) { return err.code != "ENOTFOUND"; });
    call.setStrategy(new backoff.ExponentialStrategy());
    call.failAfter(10);
    call.start();
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
    metadataRequestRecursive("/instance", function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        metadataRequest("/instance/id", function (err, id) {
            if (err) {
                callback(err);
                return;
            }

            data.id = id || data.id;
            callback(null, data);
        });
    });
};

exports.project = function (callback) {
    metadataRequestRecursive("/project", callback);
};
