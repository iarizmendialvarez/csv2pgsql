var Constants, DecompressZip, Q, Unzip, async, fs;

Q = require('q');

fs = require('fs');

DecompressZip = require('decompress-zip');

async = require('async');

Constants = require('./lib/constants');

Unzip = (function() {
  function Unzip() {}

  Unzip.prototype.decompressFiles = function(files) {
    var complete, decompressedFiles, deferred, getFiles;
    deferred = Q.defer();
    decompressedFiles = [];
    getFiles = (function(_this) {
      return function(filename, callback) {
        return _this.decompress(filename).then(function(res) {
          decompressedFiles.push(res);
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
        return deferred.resolve(decompressedFiles);
      }
    };
    async.each(files, getFiles, complete);
    return deferred.promise;
  };

  Unzip.prototype.decompress = function(filename) {
    var deferred, in_path, output_path, unzipper;
    deferred = Q.defer();
    in_path = __dirname + Constants.path + ("/" + filename + "/" + filename + ".zip");
    output_path = __dirname + Constants.path + ("/" + filename + "/decompress/");
    unzipper = new DecompressZip(in_path);
    unzipper.on('error', function(err) {
      console.log('Caught an error: ' + err);
      deferred.reject(err);
    });
    unzipper.on('extract', function(log) {
      console.log('Finished extracting');
      deferred.resolve(filename);
    });
    unzipper.on('progress', function(fileIndex, fileCount) {});
    unzipper.extract({
      path: output_path,
      filter: function(file) {
        return file.type !== 'SymbolicLink';
      }
    });
    return deferred.promise;
  };

  return Unzip;

})();

module.exports = Unzip;
