var Constants, Csv2pgsql, Q, _, async, fs, pg, readline,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Q = require('q');

_ = require('underscore');

fs = require('fs');

readline = require('readline');

pg = require('pg');

async = require('async');

Constants = require('./lib/constants');

Csv2pgsql = (function() {
  function Csv2pgsql() {
    this.toPgsql = bind(this.toPgsql, this);
    this.insert = bind(this.insert, this);
  }

  Csv2pgsql.prototype.process = function(filenames) {
    var complete, conString, deferred, drop_create_schema, insertFiles;
    deferred = Q.defer();
    conString = "postgres://" + Constants.db.user + ":" + Constants.db.pass + "@" + Constants.db.host + ":" + Constants.db.port + "/" + Constants.db.name;
    this.client = new pg.Client(conString);
    this.client.connect();
    insertFiles = (function(_this) {
      return function(filename, callback) {
        return _this.insert(filename).then(function(res) {
          return callback();
        })["catch"](function(err) {
          return callback(err);
        });
      };
    })(this);
    complete = (function(_this) {
      return function(err) {
        _this.client.end();
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(true);
        }
      };
    })(this);
    drop_create_schema = "drop schema public cascade; create schema public;";
    this.client.query(drop_create_schema, (function(_this) {
      return function(err, result) {
        if (err) {
          console.error('error running query', err);
          deferred.reject(false);
        } else {
          return async.eachSeries(filenames, insertFiles, complete);
        }
      };
    })(this));
    return deferred.promise;
  };

  Csv2pgsql.prototype.insert = function(filename) {
    var complete, deferred, insertPgsql, path;
    deferred = Q.defer();
    console.log(filename);
    path = __dirname + Constants.path + ("/" + filename + "/decompress/");
    insertPgsql = (function(_this) {
      return function(filename, callback) {
        return _this.toPgsql(path, filename).then(function(res) {
          return callback();
        })["catch"](function(err) {
          return callback(err);
        });
      };
    })(this);
    complete = (function(_this) {
      return function(err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(true);
        }
      };
    })(this);
    async.eachSeries(fs.readdirSync(path), insertPgsql, complete);
    return deferred.promise;
  };

  Csv2pgsql.prototype.getHeaders = function(path, filename) {
    var deferred, headers, rl;
    deferred = Q.defer();
    headers = '';
    rl = readline.createInterface({
      input: fs.createReadStream(path + filename),
      output: null,
      terminal: false
    });
    rl.on('line', function(line) {
      headers = line;
      rl.close();
    });
    rl.on('close', function() {
      deferred.resolve(headers);
    });
    return deferred.promise;
  };

  Csv2pgsql.prototype.toPgsql = function(path, filename) {
    var deferred;
    deferred = Q.defer();
    this.getHeaders(path, filename).then((function(_this) {
      return function(headers) {
        var copy, create_table, headers_columns, headers_columns_string, last_header_column, name;
        name = filename.substring(0, filename.length - 4);
        headers_columns = _.map(headers.split(','), function(val) {
          return val + " text,";
        });
        last_header_column = headers_columns[headers_columns.length - 1];
        headers_columns[headers_columns.length - 1] = last_header_column.substring(0, last_header_column.length - 1);
        headers_columns_string = headers_columns.join("");
        create_table = "CREATE TABLE IF NOT EXISTS " + name + "( " + headers_columns_string + " )	WITH (OIDS=FALSE);ALTER TABLE " + name + " OWNER TO postgres;";
        copy = "COPY " + name + " FROM '" + (path + filename) + "' DELIMITER ',' HEADER CSV;";
        return _this.client.query(create_table, function(err, result) {
          if (err) {
            console.error('error running query', err);
            return deferred.reject(false);
          } else {
            return _this.client.query(copy, function(err, result) {
              if (err) {
                console.log(path);
                console.log(filename);
                console.error('error running query', err);
                return deferred.reject(false);
              } else {
                return deferred.resolve(true);
              }
            });
          }
        });
      };
    })(this));
    return deferred.promise;
  };

  return Csv2pgsql;

})();

module.exports = Csv2pgsql;
