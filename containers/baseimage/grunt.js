module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "baseimage": {
                files: [{
                  cwd: 'baseimage',
                  src: [
                    'Dockerfile'
                  ],
                  dest: 'baseimage/build'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "baseimage-build": {
                cwd: 'baseimage/build',
                cmd: 'docker build -t baseimage .'
            },
            "baseimage-tag": {
                cmd: 'docker tag -f baseimage registry.eztwo.com:5042/baseimage'
            },
            "baseimage-push": {
                cmd: 'docker push registry.eztwo.com:5042/baseimage'
            }
        }
    });
    grunt.registerTask('baseimage', ['sync:baseimage', 'exec:baseimage-build', 'exec:baseimage-tag', 'exec:baseimage-push']);
}
