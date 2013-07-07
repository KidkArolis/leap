define(function (require) {

  // The mediator is the objects all others modules use to
  // communicate with each other.
  // It implements the Publish/Subscribe pattern.

  var Backbone = require("backbone");

  var mediator = {};

  // Current user
  mediator.user = null;

  // Create Publish/Subscribe aliases
  mediator.subscribe   = mediator.on      = Backbone.Events.on;
  mediator.unsubscribe = mediator.off     = Backbone.Events.off;
  mediator.publish     = mediator.trigger = Backbone.Events.trigger;

  return mediator;
});