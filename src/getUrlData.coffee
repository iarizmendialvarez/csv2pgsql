request 			= require 'request'
_ 					= require 'underscore'
Q 					= require 'q'
fs 					= require 'fs'
async				= require 'async'

Constants 			= require './lib/constants'

class GetUrlData

	#@data: JSON object
	getData: (data)->
		deferred = Q.defer()

		downloadedFiles = []
		getFiles = (file, callback)=>
			@getZip(file.name, file.url)
			.then (res)->
				downloadedFiles.push res
				callback()
			.catch (err)->
				callback err

		complete = (err)->
			if err
				deferred.reject err
			else
				deferred.resolve downloadedFiles

		async.each data, getFiles, complete

		return deferred.promise


	getZip: (name, url)->
		deferred = Q.defer()
		path = __dirname + Constants.path
		if not fs.existsSync(path)
		    fs.mkdirSync path

		temp_path = path+'/'+name
		if not fs.existsSync(temp_path)
		    fs.mkdirSync temp_path

		fileUrl = url
		output = temp_path+"/#{name}.zip"
		console.log "Start downloading #{url}"
		request {
		  url: fileUrl
		  encoding: null
		}, (err, resp, body) ->
		  if err
		    throw err
		  fs.writeFile output, body, (err) ->
		  	if err
		    	deferred.reject err
		    	return
		    console.log 'file written!'
		    deferred.resolve name

		return deferred.promise


# export the class
module.exports = GetUrlData
