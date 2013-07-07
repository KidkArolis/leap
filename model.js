define(function (require) {

  /**
  
  Leap/Model
  
  is a base model that provides the following features for your Backbone Models

  
  * isFetching function that returns the request object if the model is
    currently being fetched and false otherwise

  */


  var _         = require("underscore");
  var Backbone  = require("backbone");

  var isFetching = require("./is_fetching");

  return Backbone.Model.extend({

    constructor: function () {
      _.extend(this, isFetching);
      Backbone.Model.prototype.constructor.apply(this, arguments);
    }

  });

});