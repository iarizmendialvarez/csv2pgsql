module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    coffee:
      coffee_to_js:
        options:
          bare: true
        expand: true,
        flatten: false,
        cwd: 'src/',
        src: ['**/*.coffee'],
        dest: 'dist/',
        ext: '.js'
    coffeelint:
      lib: ['src/**/*.coffee']
    jshint:
      files: [
        'dist/**/*.js'
        'test/**/*.js'
      ]
    watch:
      files: ['src/**/*.coffee', 'test/**/*.coffee']
      tasks: [
        'coffee'
        'jshint'
        'simplemocha'
      ]
    simplemocha:
      options:
        fullTrace: true
        timeout: 30000
      all:
        src: ['test/**/*.js', '**/*.spec.js']
    clean: ['dist']

  #Load Tasks
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-simple-mocha'

  grunt.registerTask 'default', ['clean', 'coffee', 'jshint', 'simplemocha']
