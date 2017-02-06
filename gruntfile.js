module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      sass: {
        files: 'assets/sass/*.scss',
        tasks: ['sass:dev', 'notify:successCss'],
      },
      js: {
        files: [
          'assets/js/src/plugins.js',
          'assets/js/src/main.js',
          'Gruntfile.js'
        ],
        tasks: ['jshint','babel','concat','uglify:scripts','notify:successJs']
      }
    },
    sass: {
        options: {
            sourceMap: false
        },
        dev: {
            files: {
              //We fake the minified version here, which is produced properly by prod chain
              'assets/css/style-min.css': 'assets/sass/style.scss'
            }
        },
        dist: {
            files: {
              'assets/css/style.css': 'assets/sass/style.scss'
            }
        }
    },
    autoprefixer: {
      dist: {
        options: {
          browsers: ['last 1 version', '> 1%', 'ie 8']
        },
        files: {
          'assets/css/style-prefixed.css': ['assets/css/style.css']
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'assets/css/style-min.css': ['assets/css/style-prefixed.css']
        },
      },
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['Gruntfile.js', 'assets/js/src/main.js']
    },
    babel: {
        options: {
            presets: ['es2015']
        },
        dist: {
            files: {
                'assets/js/src/main-babel.js': 'assets/js/src/main.js'
            }
        }
    },
    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      stageone: {
        src: ['assets/js/src/sources.js','assets/js/src/main-babel.js'],
        dest: 'assets/js/scripts-concat.js',
      }
    },
    uglify: {
      scripts: {
        files: {
          'assets/js/scripts-min.js': ['assets/js/scripts-concat.js']
        },
      },
    },
    browserSync: {
      files: {
        src : [
          'assets/css/*.css',
          'assets/img/*',
          'assets/js/*.js',
          '**/*.html'
        ],
      },
      options: {
        watchTask: true,
        server: true
      }
    },
    notify: {
      options: {
        enabled: true,
        max_jshint_notifications: 5,
        success: true,
        duration: 3
      },
      successCss: {
          options:{
              title: "Grunt successful",
              message: "All CSS tasks complete"
          }
      },
      successJs: {
          options:{
              title: "Grunt successful",
              message: "All JS tasks complete"
          }
      },
      successProduction: {
          options:{
              title: "Grunt successful",
              message: "Project prepared for production"
          }
      }
    }
  });

  // Load the Grunt plugins.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-babel');
  // Register the default tasks.
  grunt.registerTask('default', ['browserSync', 'watch', 'notify']);
  grunt.registerTask('prod', ['sass:dist', 'autoprefixer', 'cssmin', 'jshint','babel','concat','uglify:scripts', 'notify:successProduction']);
};
