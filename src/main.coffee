Q             = require('q')

GetUrlData 		= require('./getUrlData')
Unzip 				= require('./unzip')
Csv2pgsql			= require('./csv2pgsql')


data = [
  {
    name: "navigazione"
    url: "http://transitfeeds.com/link?u=http://actv.avmspa.it/sites/default/files/attachments/opendata/navigazione/actv_nav.zip"
  },
  {
    name: "data.cabq.gov"
    url: "http://transitfeeds.com/link?u=http://data.cabq.gov/transit/gtfs/google_transit.zip"
  }

]
getUrlData = new GetUrlData()
getUrlData.getData(data).then (downloadedFiles) ->
  unzip = new Unzip()
  unzip.decompressFiles(downloadedFiles)
  .then (decompressedFiles)->
    csv2pgsql = new Csv2pgsql()
    csv2pgsql.process(decompressedFiles)
    .then (res)->
    	console.log "Inserted: "+res
    .fail (err)->
    	console.log "ERROR: "+err
  .fail (err)->
    console.log "ERROR Unzip: "+err

.fail (err)->
  console.log "ERROR getUrlData: "+err



