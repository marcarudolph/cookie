module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "loadbalancer": {
                files: [{
                  cwd: 'loadbalancer',
                  src: [
                    '**',
                    '!grunt.js',
                    '!build/**'
                  ],
                  dest: 'loadbalancer/build'
                }],
                verbose: true,
                updateAndDelete: true
            },
            "loadbalancer-frontend-dev": {
                files: [{
                  cwd: '../frontend/grunt/output',
                  src: [
                    '**'
                  ],
                  dest: 'loadbalancer/build/frontends/current'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "loadbalancer-build": {
                cwd: 'loadbalancer/build',
                cmd: 'docker build -t loadbalancer .'
            },
            "loadbalancer-tag": {
                cmd: 'docker tag -f loadbalancer registry.eztwo.com:5042/loadbalancer'
            },
            "loadbalancer-push": {
                cmd: 'docker push registry.eztwo.com:5042/loadbalancer'
            }
        }
    });
    grunt.registerTask('loadbalancer', [
        'sync:loadbalancer', 'sync:loadbalancer-frontend-dev',
        'exec:loadbalancer-build', 'exec:loadbalancer-tag', 'exec:loadbalancer-push'
    ]);
}
