var Csv2pgsql, GetUrlData, Q, Unzip, data, getUrlData;

Q = require('q');

GetUrlData = require('./getUrlData');

Unzip = require('./unzip');

Csv2pgsql = require('./csv2pgsql');

data = [
  {
    name: "navigazione",
    url: "http://transitfeeds.com/link?u=http://actv.avmspa.it/sites/default/files/attachments/opendata/navigazione/actv_nav.zip"
  }, {
    name: "data.cabq.gov",
    url: "http://transitfeeds.com/link?u=http://data.cabq.gov/transit/gtfs/google_transit.zip"
  }
];

getUrlData = new GetUrlData();

getUrlData.getData(data).then(function(downloadedFiles) {
  var unzip;
  unzip = new Unzip();
  return unzip.decompressFiles(downloadedFiles).then(function(decompressedFiles) {
    var csv2pgsql;
    csv2pgsql = new Csv2pgsql();
    return csv2pgsql.process(decompressedFiles).then(function(res) {
      return console.log("Inserted: " + res);
    }).fail(function(err) {
      return console.log("ERROR: " + err);
    });
  }).fail(function(err) {
    return console.log("ERROR Unzip: " + err);
  });
}).fail(function(err) {
  return console.log("ERROR getUrlData: " + err);
});
