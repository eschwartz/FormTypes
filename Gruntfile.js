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

    exec: {
      'browserify/dist': {
        command: './node_modules/.bin/browserify src/exports.js \
        --standalone FormTypes \
        -x Handlebars \
        -x underscore \
        -o dist/FormTypes.js'
      },
      'browserify/vendor': {
        command: './node_modules/.bin/browserify \
          -r underscore \
          -r Handlebars \
          -o dist/vendor.js'
      },
      'tests': {
        command: './node_modules/.bin/mocha test/spec/**/*Test.js'
      }
    },

    // Browserify compiler

    // NOTE:
    // The grunt-browserify task does not work with
    // the browserify-shim transform. For this reason,
    // DO NOT USE this for distribution builds.
    // (ok for tests)
    browserify: {
      // Vendor bundle for tests
      'vendor/tests': {
        options: {
          require: [
            'jquery',
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
          external: ['jquery', 'underscore', 'Handlebars', 'jsdom', 'mocha-jsdom', 'sinon']
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
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('build', ['build/dist']);

  // Creates a distribution build
  grunt.registerTask('build/dist', [
    isQuick ? 'noop' : 'tsd:dist',
    'ts:dist',
    'exec:browserify/dist'
  ]);

  // Creates an HTML test file for browser-environment testing
  grunt.registerTask('test/browser', [
    isQuick ? 'noop' : 'tsd:dist',
    isQuick ? 'noop' : 'browserify:vendor/tests',
    'ts:tests',
    'browserify:tests'
  ]);

  // Runs test specs using mocha in a node environment
  grunt.registerTask('test', [
    isQuick ? 'noop' : 'tslint',
    'ts:tests',
    'exec:tests'
  ]);

  grunt.registerTask('noop', []);
};
module.exports = Gruntfile;
