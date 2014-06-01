module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],

    files: [
      'test/**/*_test.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*_test.js': ['webpack']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    webpack: {
      amd: { jQuery: true },
      resolve: {
        modulesDirectories: ["bower_components", "node_modules"],
        alias: {
          "jquery": "jquery/dist/jquery",
          "backbone.eventbinder": "backbone.eventbinder/lib/amd/backbone.eventbinder"
        }
      }
    },
    webpackServer: {
      noInfo: true
    }
  });
};
