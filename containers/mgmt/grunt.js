module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "mgmt": {
                files: [{
                  cwd: 'mgmt',
                  src: [
                    '**',
                    '!grunt.js',
                    '!build/**'
                  ],
                  dest: 'mgmt/build'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "mgmt-build": {
                cwd: 'mgmt/build',
                cmd: 'docker build -t mgmt .'
            },
            "mgmt-tag": {
                cmd: 'docker tag -f mgmt registry.eztwo.com:5042/mgmt'
            },
            "mgmt-push": {
                cmd: 'docker push registry.eztwo.com:5042/mgmt'
            }
        }
    });
    grunt.registerTask('mgmt', [
        'sync:mgmt',
        'exec:mgmt-build', 'exec:mgmt-tag', 'exec:mgmt-push'
    ]);
}
