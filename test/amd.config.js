require.config({
  baseUrl: "base/",
  paths: {
    "jquery": "bower_components/jquery/jquery",
    "underscore": "bower_components/underscore/underscore",
    "backbone": "bower_components/backbone/backbone",
    "chai": "bower_components/chai/chai",
    "cherrytree": "bower_components/cherrytree",
    "router": "bower_components/router.js/dist/router.amd",
    "route-recognizer": "bower_components/route-recognizer/dist/route-recognizer.amd",
    "rsvp": "bower_components/rsvp.js/browser/rsvp"
  },
  shim: {
    "underscore": {
      exports: "_"
    },
    "backbone": {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    "rsvp": {
      exports: "RSVP"
    }
  }
});