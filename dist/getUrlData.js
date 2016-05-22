var Constants, GetUrlData, Q, _, async, fs, request;

request = require('request');

_ = require('underscore');

Q = require('q');

fs = require('fs');

async = require('async');

Constants = require('./lib/constants');

GetUrlData = (function() {
  function GetUrlData() {}

  GetUrlData.prototype.getData = function(data) {
    var complete, deferred, downloadedFiles, getFiles;
    deferred = Q.defer();
    downloadedFiles = [];
    getFiles = (function(_this) {
      return function(file, callback) {
        return _this.getZip(file.name, file.url).then(function(res) {
          downloadedFiles.push(res);
          return callback();
        })["catch"](function(err) {
          return callback(err);
        });
      };
    })(this);
    complete = function(err) {
      if (err) {
        return deferred.reject(err);
      } else {
        return deferred.resolve(downloadedFiles);
      }
    };
    async.each(data, getFiles, complete);
    return deferred.promise;
  };

  GetUrlData.prototype.getZip = function(name, url) {
    var deferred, fileUrl, output, path, temp_path;
    deferred = Q.defer();
    path = __dirname + Constants.path;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    temp_path = path + '/' + name;
    if (!fs.existsSync(temp_path)) {
      fs.mkdirSync(temp_path);
    }
    fileUrl = url;
    output = temp_path + ("/" + name + ".zip");
    console.log("Start downloading " + url);
    request({
      url: fileUrl,
      encoding: null
    }, function(err, resp, body) {
      if (err) {
        throw err;
      }
      return fs.writeFile(output, body, function(err) {
        if (err) {
          deferred.reject(err);
          return;
        }
        console.log('file written!');
        return deferred.resolve(name);
      });
    });
    return deferred.promise;
  };

  return GetUrlData;

})();

module.exports = GetUrlData;
