Q 							= require 'q'
fs 							= require 'fs'
DecompressZip 	= require 'decompress-zip'
async						= require 'async'

Constants 			= require './lib/constants'

class Unzip

	decompressFiles: (files)->
		deferred = Q.defer()

		decompressedFiles = []
		getFiles = (filename, callback)=>
			@decompress(filename)
			.then (res)->
				decompressedFiles.push res
				callback()
			.catch (err)->
				callback err

		complete = (err)->
			if err
				deferred.reject err
			else
				deferred.resolve decompressedFiles

		async.each files, getFiles, complete

		return deferred.promise

	decompress: (filename)->
		deferred = Q.defer()
		in_path = __dirname + Constants.path + "/#{filename}/#{filename}.zip"
		output_path = __dirname + Constants.path + "/#{filename}/decompress/"

		unzipper = new DecompressZip in_path
		unzipper.on 'error', (err) ->
			console.log 'Caught an error: '+err
			deferred.reject err
			return
		unzipper.on 'extract', (log) ->
			console.log 'Finished extracting'
			deferred.resolve filename
			return
		unzipper.on 'progress', (fileIndex, fileCount) ->
		  #console.log 'Extracted file ' + fileIndex + 1 + ' of ' + fileCount
		  return
		unzipper.extract
		  path: output_path
		  filter: (file) ->
		    file.type != 'SymbolicLink'
		return deferred.promise

# export the class
module.exports = Unzip
