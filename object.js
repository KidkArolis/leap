define(function (require) {

  // leap extends backbone, and backbone has a neat
  // inheritance/class helper, let's us that for all custom
  // objects in leap or apps

  var _        = require("underscore");
  var Backbone = require("backbone");

  var Object = function () {};
  Object.extend = Backbone.Model.extend;

  // See more at: http://blog.rjzaworski.com/2012/02/backbone-js-inheritance/#sthash.WWyCR8sS.dpuf
  Object.prototype._super = function (funcName) {
    return this.constructor.__super__[funcName].apply(this, _.rest(arguments));
  };

  return Object;
});