module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "server-server": {
                files: [{
                  cwd: '../server',
                  src: [
                    '**',
                    '!node_modules/**'
                  ],
                  dest: 'server/build/server'
                }],
                verbose: true,
                updateAndDelete: true
            },
            "server-ui": {
                files: [{
                  cwd: '../ui',
                  src: [
                    '**',
                    '!node_modules/**'
                  ],
                  dest: 'server/build/ui'
                }],
                verbose: true,
                updateAndDelete: true
            },
            "server-config": {
                files: [{
                  cwd: '../config',
                  src: [
                    '**',
                    '!node_modules/**'
                  ],
                  dest: 'server/build/config'
                }],
                verbose: true,
                updateAndDelete: true
            },
            "server-docker": {
                files: [{
                  cwd: 'server',
                  src: [
                    '**',
                    '!grunt.js',
                    '!build/**'
                  ],
                  dest: 'server/build'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "server-build": {
                cwd: 'server/build',
                cmd: 'docker build -t server .'
            },
            "server-tag": {
                cmd: 'docker tag -f server registry.eztwo.com:5042/server'
            },
            "server-push": {
                cmd: 'docker push registry.eztwo.com:5042/server'
            }
        }
    });
    grunt.registerTask('server', [
        'sync:server-server', 'sync:server-ui', 'sync:server-config', 'sync:server-docker',
        'exec:server-build', 'exec:server-tag', 'exec:server-push'
    ]);
}
