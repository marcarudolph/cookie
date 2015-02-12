module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "basenode": {
                files: [{
                  cwd: 'basenode',
                  src: [
                    'Dockerfile'
                  ],
                  dest: 'basenode/build'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "basenode-build": {
                cwd: 'basenode/build',
                cmd: 'docker build -t basenode .'
            },
            "basenode-tag": {
                cmd: 'docker tag -f basenode registry.eztwo.com:5042/basenode'
            },
            "basenode-push": {
                cmd: 'docker push registry.eztwo.com:5042/basenode'
            }
        }
    });
    grunt.registerTask('basenode', ['sync:basenode', 'exec:basenode-build', 'exec:basenode-tag', 'exec:basenode-push']);
}
