var Gruntfile = function(grunt) {
  grunt.initConfig({
    ts: {
      options: {
        target: 'es5',
        comments: true,
        module: 'commonjs',
        compiler: './node_modules/.bin/tsc'
      },
      build: {
        src: [
          'src/**/*.ts',
          'typings/**/*.d.ts'
        ],
        reference: 'typings/generated/ref.d.ts'
      },
      test: {
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
        transform: ['hbsfy']
      },
      dist: {
        files: {
          'build/FormTypes.js': ['src/exports.js']
        }
      },
      test: {
        files: {
          'test/tests.js': ['test/**/*Test.js']
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
    'ts:test',
    'browserify:test'
  ]);
};
module.exports = Gruntfile;
