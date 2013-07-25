define(function (require) {

  var _           = require("underscore");
  var EventBinder = require("backbone.eventbinder");

  return function addEventBinder(target) {
    var eventBinder = new EventBinder();
    target.eventBinder = eventBinder;
    target.bindTo = _.bind(eventBinder.bindTo, eventBinder);
    target.unbindFrom = _.bind(eventBinder.unbindFrom, eventBinder);
    target.unbindAll = _.bind(eventBinder.unbindAll, eventBinder);
  };

});