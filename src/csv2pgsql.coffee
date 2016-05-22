Q 					= require 'q'
_ 					= require 'underscore'
fs 					= require 'fs'
readline 		= require 'readline'
pg					= require 'pg'
async				= require 'async'

Constants 	= require './lib/constants'

class Csv2pgsql

	process: (filenames)->
		deferred = Q.defer()
		conString = "postgres://#{Constants.db.user}:#{Constants.db.pass}@#{Constants.db.host}:#{Constants.db.port}/#{Constants.db.name}";
		@client = new pg.Client(conString);
		@client.connect()

		insertFiles = (filename, callback)=>
			@insert(filename)
			.then (res)->
				callback()
			.catch (err)->
				callback err

		complete = (err)=>
			@client.end()
			if err
				deferred.reject err		
			else
				deferred.resolve true
			return

		drop_create_schema = "drop schema public cascade; create schema public;"
		
		@client.query drop_create_schema, (err, result) =>
			if err
				console.error 'error running query', err
				deferred.reject false
				return
			else
				async.eachSeries filenames, insertFiles, complete
		
		return deferred.promise

	insert: (filename)=>
		deferred = Q.defer()
		console.log filename
		path = __dirname + Constants.path + "/#{filename}/decompress/"

		insertPgsql = (filename, callback)=>
			@toPgsql(path, filename)
			.then (res)->
				callback()
			.catch (err)->
				callback err

		complete = (err)=>
			if err
				deferred.reject err		
			else
				deferred.resolve true
			return

		async.eachSeries fs.readdirSync(path), insertPgsql, complete

		return deferred.promise

	getHeaders: (path, filename)->
		deferred = Q.defer()
		headers = ''
		rl = readline.createInterface(
			input: fs.createReadStream(path+filename)
			output: null
			terminal: false)
		rl.on 'line', (line) ->
			#console.log 'Got line: ' + line
			headers = line
			rl.close()
			return
		rl.on 'close', ->
			#console.log 'All data processed.'
			deferred.resolve(headers)
			return

		return deferred.promise

	toPgsql: (path, filename)=>
		deferred = Q.defer()
		@getHeaders(path, filename)
		.then (headers)=>
			name =  filename.substring(0,filename.length-4)
			headers_columns = _.map headers.split(','), (val)->
								return val+" text,"
			last_header_column = headers_columns[headers_columns.length-1]
			headers_columns[headers_columns.length-1] = last_header_column.substring(0,last_header_column.length-1)

			headers_columns_string = headers_columns.join("")

			create_table = "CREATE TABLE IF NOT EXISTS #{name}(
							  #{headers_columns_string}
							  )	WITH (OIDS=FALSE);ALTER TABLE #{name} OWNER TO postgres;"
			copy = "COPY #{name} FROM '#{path+filename}' DELIMITER ',' HEADER CSV;"

			@client.query create_table, (err, result) =>
				if err
					console.error 'error running query', err
					deferred.reject false
				else
					@client.query copy, (err, result) ->
						if err
							console.log path
							console.log filename
							console.error 'error running query', err
							deferred.reject false
						else
							deferred.resolve true

		return deferred.promise

# export the class
module.exports = Csv2pgsql

