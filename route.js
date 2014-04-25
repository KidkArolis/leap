define(function (require) {

  var Route = require("cherrytree/route");

  return Route.extend({

    initialize: function () {
      this.viewOptions = {};
    },

    beforeActivate: function () {},

    activate: function () {
      this.beforeActivate.apply(this, arguments);
      // the view might have been created
      // in a different hook already
      if (!this.view) {
        this.view = this.createView.apply(this, arguments);
      }
      if (this.view) {
        this.injectView(this.renderView());
      }
      this.createOutlet();
      this.afterActivate.apply(this, arguments);
    },

    afterActivate: function () {},

    createView: function () {
      if (this.viewClass) {
        var ViewClass = this.viewClass;
        return new ViewClass(this.viewOptions);
      }
    },

    beforeDeactivate: function () {},

    deactivate: function () {
      this.beforeDeactivate();
      if (this.view) {
        this.view.destroy();
        delete this.view;
      }
    },

    renderView: function () {
      return this.view.render();
    },

    injectView: function (view) {
      if (this.parent && this.parent.outlet) {
        this.parent.outlet.html(view.el);
      }
    },

    createOutlet: function () {
      if (this.view) {
        this.outlet = this.view.$(".outlet");
      } else {
        this.outlet = this.parent.outlet;
      }
    }

  });

});