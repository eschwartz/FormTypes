var Gruntfile = function(grunt) {
  grunt.initConfig({
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
      build: {
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
    browserify: {
      options: {
        transform: ['brfs']
      },
      dist: {
        options: {
          external: ['jquery', 'underscore', 'handlebars']
        },
        files: {
          'build/FormTypes.js': ['src/exports.js']
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
          'build/vendor.js': []
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
          'build/vendor-tests.js': []
        }
      },
      tests: {
        options: {
          external: ['jquery', 'underscore', 'handlebars', 'jsdom', 'mocha-jsdom', 'sinon']
        },
        files: {
          'build/tests.js': ['test/spec/**/*Test.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-tslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('build', [
    'tslint',
    'ts:build',
    'browserify:dist'
  ]);
  grunt.registerTask('build-tests', [
    'ts:tests',
    'browserify:tests'
  ]);
  grunt.registerTask('build-vendor', [
    'browserify:vendor',
    'browserify:vendor-tests'
  ]);
};
module.exports = Gruntfile;
