var Gruntfile = function(grunt) {
  var isQuick = grunt.option('quick');

  grunt.initConfig({
    // Typescript compiler
    ts: {
      options: {
        target: 'es5',
        comments: true,
        module: 'commonjs',
        compiler: './node_modules/.bin/tsc',
        // Source maps don't work so well,
        // because browserify creates source maps, too
        sourceMap: false
      },
      dist: {
        src: [
          'src/**/*.ts',
          'typings/**/*.d.ts'
        ],
        reference: 'typings/generated/ref.d.ts'
      },
      tests: {
        src: [
          'src/**/*.ts',
          'typings/**/*.d.ts',
          'test/**/*.ts'
        ],
        reference: 'typings/generated/ref.d.ts'
      },
      watch: {
        src: ['src/**/*.ts', 'typings/**/*.d.ts'],
        watch: 'src/',
        reference: 'typings/generated/ref.d.ts'
      },
      'watch-test': {
        src: ['src/**/*.ts', 'typings/**/*.d.ts', 'test/**/*.ts'],
        watch: 'test/',
        reference: 'typings/generated/ref.d.ts'
      },
      'transforms-watch': {
        src: [
          'src/**/*.ts',
          'test/**/*.ts',
          'typings/**/*.d.ts'
        ],
        watch: './',
        compile: false,
        reference: 'typings/generated/ref.d.ts'
      },
      'transforms': {
        src: [
          'src/**/*.ts',
          'test/**/*.ts',
          'typings/**/*.d.ts'
        ],
        compile: false,
        reference: 'typings/generated/ref.d.ts'
      }
    },
    // Typescript definition file manager (Definitely Typed)
    tsd: {
      dist: {
        options: {
          command: 'reinstall',
          config: './tsd.json'
        }
      }
    },
    // Generate FormTypes.d.ts
    // with AMD compatible module names
    'lib-typings': {
      'form-types': {
        files: {
          'typings/FormTypes/FormTypes.d.ts': ['src/**/*.ts']
        },
        options: {
          paths: {
            'FormTypes': 'src'
          }
        }
      }
    },
    // Typescript Linter
    tslint: {
      src: {
        options: {
          configuration: grunt.file.readJSON('./tslint.json')
        },
        files: {
          src: ['src/**/*.ts']
        }
      }
    },
    // Browserify compiler
    browserify: {
      options: {
        transform: ['brfs']
      },
      dist: {
        options: {
          external: ['jquery', 'underscore', 'handlebars'],
          browserifyOptions: {
            standalone: 'FormTypes'
          }
        },
        files: {
          'dist/FormTypes.js': ['src/exports.js']
        }
      },
      vendor: {
        options: {
          require: [
            'jquery',
            'underscore',
            'handlebars'
          ]
        },
        files: {
          'dist/vendor.js': []
        }
      },
      // Vendor bundle for tests
      'vendor-tests': {
        options: {
          require: [
            'jquery',
            'underscore',
            'handlebars',
            'jsdom',
            'mocha-jsdom',
            'sinon'
          ]
        },
        files: {
          'dist/vendor-tests.js': []
        }
      },
      tests: {
        options: {
          external: ['jquery', 'underscore', 'handlebars', 'jsdom', 'mocha-jsdom', 'sinon']
        },
        files: {
          'dist/tests.js': ['test/spec/**/*Test.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-tsd');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['build/dist']);

  grunt.registerTask('build/dist', [
    isQuick ? 'noop' : 'tsd:dist',
    isQuick ? 'noop' : 'tslint',
    'ts:dist',
    'browserify:dist'
  ]);
  grunt.registerTask('build/tests', [
    isQuick ? 'noop' : 'tsd:dist',
    'ts:tests',
    'browserify:tests'
  ]);
  grunt.registerTask('build/vendor', [
    'browserify:vendor',
    'browserify:vendor-tests'
  ]);

  grunt.loadTasks('./tasks');

  grunt.registerTask('noop', []);
};
module.exports = Gruntfile;
