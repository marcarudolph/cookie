module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-este-watch');
	grunt.loadNpmTasks('grunt-sync');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-connect-proxy');	
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-filerev');
	grunt.loadNpmTasks('grunt-htmlclean');

	grunt.initConfig({
		clean: {			
			options: { force: true },
			pathes: ['./build/ui']
		},

		sync: {
			'ui-dev': {
				cwd: '../ui',
				src: '**',
				dest: './build/ui'
			},
			'ui-release': {
				cwd: '../ui',
				src: ['**', '!js/**', '!css/**/*.css', '!lib/**/*.js'],
				dest: './build/ui'
			}
		},

		esteWatch: {
			options: {
				dirs: ['../ui/**/'],
				livereload: false
			},
			'*': function(filepath) {				
				var ignore = /(\.DS_Store$)/;
				if (filepath.match(ignore)) {
					return null;
				}
				return ['update-output:dev']
			}			
		},		
		filerev: {
			options: {
				encoding: 'utf8',
				algorithm: 'md5',
				length: 8
			},
			source: {
				files: [{
					src: [
						'./build/ui/**/*.{js,css,png,jpg,jpeg,gif,webp,svg}',						
					]
				}]
			}
		},
		useminPrepare: {
			html: ['../ui/**/*.html'],
			options: {
				flow: {
					steps: {
						'js': ['concat', 'uglifyjs'],
						'css': ['concat', 'cssmin']
					},
					post: {}
				},
				dest: './build/ui'
			}
		},
		usemin: {
			html: ['./build/ui/**/*.html'],
			css: ['./build/ui/css/*.css'],
			options: {
				assetsDirs: ['./build/ui/']
			}
		},
		connect: {
			app: {
				options: {
					port: 8089,
					protocol: 'http',
					base: './build/ui/',
					hostname: '*',
					middleware: [require('grunt-connect-proxy/lib/utils').proxyRequest]
				},
				proxies: [{
					context: '/',
					host: 'localhost',
					port: 8088,
					https: false,
					changeOrigin: false,
					xforward: true
				}]
			}
		}				
	});


	grunt.registerTask('update-output:dev', [ 'sync:ui-dev' ]);

	grunt.registerTask('live', [ 'clean', 'update-output:dev', 'configureProxies:app', 'connect:app', 'esteWatch' ]);

	grunt.registerTask('usemin-build', ['useminPrepare', 'concat:generated', 'uglify:generated', 'cssmin:generated', 'filerev', 'usemin']);
	grunt.registerTask('release', [ 'clean', 'sync:ui-release', 'usemin-build' ]);
};