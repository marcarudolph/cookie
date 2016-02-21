module.exports = function(grunt) {
    grunt.config.merge({
        run_grunt: {
            'ui-build': {
                options: {
                    task: ['release']
                },
                src: ['../grunt/Gruntfile.js']
            }
        },          
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
                  cwd: '../grunt/build',
                  src: [
                    '**',
                    '!node_modules/**'
                  ],
                  dest: 'server/build/grunt/build'
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
        shell: {
            "server-build": {
                command: 'docker build -t cookieserver .',
                options: {
                  execOptions: {
                    cwd: 'server/build',
                    maxBuffer: 1024*1024
                  }
                }
            },
            "server-tag": {
                command: 'docker tag -f cookieserver registry.eztwo.com:5042/cookieserver'
            },
            "server-push": {
                command: 'docker push registry.eztwo.com:5042/cookieserver'
            }
        }
    });
    grunt.registerTask('server', [
        'run_grunt:ui-build',
        'sync:server-server', 'sync:server-ui', 'sync:server-config', 'sync:server-docker',
        'shell:server-build', 'shell:server-tag'//, 'shell:server-push'
    ]);
}
