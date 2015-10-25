module.exports = function(grunt) {

grunt.initConfig({
      pkg: grunt.file.readJSON('package.json')
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-run-grunt');

    require("./server/grunt.js")(grunt);
    require("./backup/grunt.js")(grunt);

    grunt.registerTask('all', ['server', 'backup']);
};
