define(function (require) {

  var Backbone = require("backbone");
  var when     = require("when");

  return {

    _fetchRequest: null,

    isFetching: function () {
      return this._fetchRequest !== null;
    },

    getFetchRequest: function () {
      return this._fetchRequest;
    },

    fetch: function () {
      var Base;
      if (this instanceof Backbone.Model) {
        Base = Backbone.Model;
      } else {
        Base = Backbone.Collection;
      }
      var self = this;
      var request = Base.prototype.fetch.apply(this, arguments);
      when(request).ensure(function () {
        self._fetchRequest = null;
      });
      this._fetchRequest = request;
      return request;
    }

  };

});