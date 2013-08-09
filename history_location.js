define(function (require) {

  var _        = require("underscore");
  var Backbone = require("backbone");

  // save the current scroll position at all times
  // for use when back/forward buttons are used
  var $ = require("jquery");
  var currentScroll;
  $(window).scroll(function () {
    currentScroll = window.scrollY;
  });

  var BackboneHistoryLocation = function (options) {
    this.options = _.extend({
      pushState: true,
      root: "/"
    }, options);
    this.initialize(this.options);
  };
  BackboneHistoryLocation.prototype = {
    path: "",
    
    initialize: function (options) {
      var self = this;
      var BackboneRouter = Backbone.Router.extend({
        routes: { "*all": "all" },
        all: function (path) {

          // experimental feature: preserving scroll upon
          // navigation
          window.scrollTo(0, currentScroll);
          _.defer(function () {
            window.scrollTo(0, currentScroll);
          });
          _.delay(function () {
            window.scrollTo(0, currentScroll);
          }, 1);

          var query = path.split("?")[1];
          path = path.split("?")[0];
          self.handleURL("/" + path);

          // for now, we publish the url:params via mediator
          // we should get some better inspiration from ember-query
          // about how we could pass these in via the router into the
          // states
          var mediator = require("leap/mediator");
          mediator.publish("url:params", query);
        }
      });
      this.backboneRouter = new BackboneRouter();
      Backbone.history.start(_.extend(options));
    },

    usesPushState: function () {
      return this.options.pushState;
    },

    getURL: function () {
      return this.path;
    },

    navigate: function (url) {
      this.backboneRouter.navigate(url, {trigger: true});
    },

    setURL: function (path) {
      if (this.path !== path) {
        this.path = path;
        this.backboneRouter.navigate(path, {trigger: false});
        if (this.changeCallback) {
          this.changeCallback(this.path);
        }
      }
    },

    replaceURL: function (path) {
      if (this.path !== path) {
        this.path = path;
        this.backboneRouter.navigate(path, {trigger: false, replace: true});
        if (this.changeCallback) {
          this.changeCallback(this.path);
        }
      }
    },

    // when the url
    onChangeURL: function (callback) {
      this.changeCallback = callback;
    },

    // callback for what to do when backbone router handlers a URL
    // change
    onUpdateURL: function (callback) {
      this.updateCallback = callback;
    },

    handleURL: function (url) {
      this.path = url;
      // initially, the updateCallback won't be defined yet, but that's good
      // because we dont' want to kick off routing right away, the router
      // does that later by manually calling this handleURL method with the
      // url it reads of the location. But it's important this is called
      // first by Backbone, because we wanna set a correct this.path value
      if (this.updateCallback) {
        this.updateCallback(url);
      }
    },

    formatURL: function (url) {
      if (Backbone.history._hasPushState) {
        var rootURL = this.options.root;

        if (url !== "") {
          rootURL = rootURL.replace(/\/$/, '');
        }

        return rootURL + url;
      } else {
        if (url[0] === "/") {
          url = url.substr(1);
        }
        return "#" + url;
      }
    }
  };

  return BackboneHistoryLocation;
});