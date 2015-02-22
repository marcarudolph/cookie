module.exports = function(grunt) {
    grunt.config.merge({
        sync: {
            "backup": {
                files: [{
                  cwd: 'backup',
                  src: [
                    'Dockerfile'
                  ],
                  dest: 'backup/build'
                }],
                verbose: true,
                updateAndDelete: true
            }
        },
        exec: {
            "backup-build": {
                cwd: 'backup/build',
                cmd: 'docker build -t cookiebackup .'
            },
            "backup-tag": {
                cmd: 'docker tag -f cookiebackup registry.eztwo.com:5042/cookiebackup'
            },
            "backup-push": {
                cmd: 'docker push registry.eztwo.com:5042/cookiebackup'
            }
        }
    });
    grunt.registerTask('backup', ['sync:backup', 'exec:backup-build', 'exec:backup-tag', 'exec:backup-push']);
}
