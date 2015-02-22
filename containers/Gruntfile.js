module.exports = function(grunt) {

grunt.initConfig({
      pkg: grunt.file.readJSON('package.json')
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-run-grunt');

    require("./baseimage/grunt.js")(grunt);
    require("./basenode/grunt.js")(grunt);
    require("./elasticsearch/grunt.js")(grunt);
    require("./loadbalancer/grunt.js")(grunt);
    require("./mgmt/grunt.js")(grunt);
    require("./server/grunt.js")(grunt);
    require("./backup/grunt.js")(grunt);

    grunt.registerTask('all', ['baseimage', 'basenode', 'elasticsearch', 'loadbalancer', 'mgmt', 'server', 'backup']);
};
