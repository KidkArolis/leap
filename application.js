define(function (require) {

  var $          = require("jquery");
  var _          = require("underscore");
  var mediator   = require("./mediator");
  var Router     = require("cherrytree/router");
  var State      = require("./state");
  var LeapObject = require("./object");

  return LeapObject.extend({

    options: {
      location: "none",
      logging: false,
      routes: function  () {},
      user: null
    },

    constructor: function (options) {
      this.options = _.extend({}, this.options, options);
    },

    start: function () {
      // not sure this is the best thing to do, but this is legacy for now
      mediator.user = this.options.user;
      var router = this.router = mediator.router = new Router({
        location: this.options.location,
        logging: this.options.logging
      });
      router.urlChanged = function (url) {
        mediator.publish("transitioned", url);
      };
      // add default impl of an application state
      // in case a custom one is not provided
      router.state("application", State.extend({
        createOutlet: function () {
          this.outlet = $(document.body);
        }
      }));
      router.map(this.options.routes);
      router.startRouting();

      // we want to intercept all link clicks in case we're using push state
      // we want all link clicks to be handled via the router instead of
      // browser reloading the page
      if (router && router.location && router.location.usesPushState &&
          router.location.usesPushState()) {
        this.interceptLinks();
      }

      return this;
    },

    interceptLinks: function () {
      var router = this.router;
      $(document).on("click", "a:not([data-bypass])", function (evt) {
        var href = $(this).attr("href");
        if (href && href.length > 0 && href[0] !== "#" && href.indexOf("javascript:") !== 0) {
          var protocol = this.protocol + "//";
          if (href && href.slice(protocol.length) !== protocol) {
            evt.preventDefault();
            // handle the URL manually
            // TODO explore wether router.transitionTo(href) is the right thing to do here
            router.handleURL(href).then(function () {
              // and update the url in the address bar if the transition
              // was successful
              router.location.setURL(href);
            });
          }
        }
      });

    }
  });

  /**

    TODO
    * for all leaf states, make sure there's a State class provided
    * throw if application state is not defined? or better fallback to a default
      one that injects things into body!
    * don't attach router to the mediator
      (views should use the router from the state or smth, e.g. like linkTo helper
      does, there should be a transitionTo and replaceWith on the view).
      For convenience, expose window.__app.router or smth

  */


});