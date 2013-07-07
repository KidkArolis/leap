define(function (require) {

  /**
  
  Leap/Collection
  
  is a base collection that provides the following features for your Backbone
  Collections

  
  * isFetching function that returns the request object if the model is
    currently being fetched and false otherwise

  */


  var _         = require("underscore");
  var Backbone  = require("backbone");
  var when      = require("when");

  var isFetching = require("./is_fetching");

  return Backbone.Collection.extend({

    constructor: function () {
      _.extend(this, isFetching);
      Backbone.Collection.prototype.constructor.apply(this, arguments);
    }

  });

});