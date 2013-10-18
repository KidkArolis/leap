define(function (require) {

  var State = require("cherrytree/state");

  return State.extend({

    // constructor: function () {
    //   console.log("constructing");
    // },

    initialize: function () {
      this.viewOptions = {};
    },

    beforeActivate: function () {},

    activate: function () {
      this.beforeActivate();
      // the view might have been created
      // in a different hook already
      if (!this.view) {
        this.view = this.createView();
      }
      if (this.view) {
        this.injectView(this.renderView());
      }
      this.createOutlet();
      this.afterActivate();
    },

    afterActivate: function () {},

    createView: function () {
      if (this.viewClass) {
        var ViewClass = this.viewClass;
        return new ViewClass(this.viewOptions);
      }
    },

    beforeDestroy: function () {},

    destroy: function () {
      if (this.destroyed) {
        return;
      }

      this.destroyed = true;

      this.beforeDestroy();
      if (this.view) {
        this.view.destroy();
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