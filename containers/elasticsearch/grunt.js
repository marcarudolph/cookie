module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "elasticsearch": {
                files: [{
                  cwd: 'elasticsearch',
                  src: [
                    '**',
                    '!grunt.js',
                    '!build/**'
                  ],
                  dest: 'elasticsearch/build'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "elasticsearch-build": {
                cwd: 'elasticsearch/build',
                cmd: 'docker build -t elasticsearch .'
            },
            "elasticsearch-tag": {
                cmd: 'docker tag -f elasticsearch registry.eztwo.com:5042/elasticsearch'
            },
            "elasticsearch-push": {
                cmd: 'docker push registry.eztwo.com:5042/elasticsearch'
            }
        }
    });
    grunt.registerTask('elasticsearch', ['sync:elasticsearch', 'exec:elasticsearch-build', 'exec:elasticsearch-tag', 'exec:elasticsearch-push']);
}
