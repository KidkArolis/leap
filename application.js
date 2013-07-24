define(function (require) {

  var $          = require("jquery");
  var _          = require("underscore");
  var mediator   = require("./mediator");
  var Router     = require("cherrytree/router");
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
      router.map(this.options.routes);
      router.startRouting();

      this.interceptLinks();

      return this;
    },

    interceptLinks: function () {
      var router = this.router;
      $(document).on("click", "a:not([data-bypass])", function (evt) {
        var href = $(this).attr("href");
        if (href.length > 0 && href[0] !== "#") {
          var protocol = this.protocol + "//";
          if (href && href.slice(protocol.length) !== protocol) {
            evt.preventDefault();
            // handle the URL manually
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

    TODO:
    * for all leaf states, make sure there's a State class provided
    * throw if application state is not defined? or better fallback to a default
      one that injects things into body!
    * make sure the latest modifications to aborting transitions don't affect us
      in unexepcted way - something about reusing models, might not be desired?

  */


});