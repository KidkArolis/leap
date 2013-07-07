// get the list of tests
var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return !(/\/base\/bower_components/).test(file) && (/_test\.js$/).test(file);
});

require([
  "jquery",
  "underscore",
  "chai"
], function ($, _, chai) {
  chai.should();
  window.expect = chai.expect;
  // now that environment is all configured, load the tests and start karma!
  require(tests, window.__karma__.start);
});
