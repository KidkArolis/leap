define(function (require) {

  // TODO temporary
  // require these Backbone Plugins to ensure correct order. If things get
  // loaded out of order, the plugins augment Backbone only after LeapView
  // extends Backbone.View
  require("backbone.stickit");

  var _              = require("underscore");
  var $              = require("jquery");
  var Backbone       = require("backbone");
  var mediator       = require("./mediator");
  var addEventBinder = require("./add_event_binder");

  var dashify = function (str) {
    return str.replace(/([A-Z])/g, function ($1) {
      return "-" + $1.toLowerCase();
    });
  };

  return Backbone.View.extend({

    constructor: function () {
      this.subviews = {};
      addEventBinder(this);

      Backbone.View.prototype.constructor.apply(this, arguments);

      this.bindEvents();

      // some place to keep track of which subviews have been rendered
      this._subviewsRendered = {};
      // and what selectors for each subview's container were used
      this._subviewContainerSelectors = {};
    },



    // Default render implementation
    // -----------------------------

    /**
      Renders the template with template data, renders subviews, binds ui hash
      to elements. This can be overriden, but it's advisable to use afterRender
      to extend the default render behaviour.
    */
    render: function () {
      if (this.destroyed) {
        return this;
      }
      this.beforeRender();
      var html = "";
      if (this.template) {
        if (!_.isFunction(this.template)) {
          throw new Error("template should be a function");
        }
        html = this.template(_.extend({}, this.defaultTemplateData(), this.templateData()));
      } else {
        html = "";
      }

      // detach the subviews first not to lose events
      // as well as to keep their rendered DOM state
      // the views should be responsible for rerendering themselves
      // after model changes, etc.
      eachNested(this._subviewsRendered, function (subview, subviewName) {
        // only detach subviews that we know how to reattach - example
        // don't detach modal dialogs rendered outside of the view's $el
        // however, the subviews that have been rendered into $el without
        // using the `renderSubviews` or `createSubviews` methods will
        // be deattached and not reattached - avoid rendering ad hoc subviews
        // yourself or reattach them in afterRender
        if (this._subviewContainerSelectors[subviewName]) {
          subview.$el.detach();
        }
      }, this);

      this.$el.html(html);

      // before we render the subviews - bind the UI elements
      this.bindUIElements();

      // ensure all required subviews are created using their factory
      // from subviewCreators hash
      _.each(this.subviewCreators, function (factory, subviewName) {
        this._ensureSubviewCreated(subviewName);
      }, this);

      // render this.subviews that haven't been rendered before
      _.each(this.subviews, function (subview, subviewName) {
        if (!this._subviewsRendered[subviewName] || this._subviewsRendered[subviewName] !== subview) {
          this.renderSubviews(subviewName);
        } else {
          // if the view has been rendered, it means we detached it
          // and so we need to reattach, but only if it's not been
          // destroyed already
          var destroyed = true;
          eachNested([subview], function (s) {
            destroyed = destroyed && s.destroyed;
          });
          // also, only reattach if we have a selector for this view,
          // so for example if a modal subview has been rendered into the body
          // we didn't detach it - so no need to reattach.
          var selector = this._subviewContainerSelectors[subviewName];
          if (!destroyed && selector) {
            this._renderSubview(selector, subviewName, {
              skipRender: true
            });
          }
        }
      }, this);

      // TODO: remove dependency on stickit
      if (this.bindings) {
        this.stickit();
      }

      this.afterRender();
      
      return this;
    },

    beforeRender: function () {
      return this;
    },

    afterRender: function () {
      return this;
    },

    defaultTemplateData: function () {
      return {
        model: this.model,
        collection: this.collection,
        cid: this.cid,
        linkTo: _.bind(this.linkTo, this),
        subview: _.bind(this._subviewHelper, this)
      };
    },

    /**
      a hook for passing more data to the template
    */
    templateData: function () {},

    /**
      This method binds the elements specified in the "ui" hash inside the
      view's code with the associated jQuery selectors.
    */
    bindUIElements: function () {
      if (!this.ui) { return; }

      var that = this;

      if (!this.uiBindings) {
        // We want to store the ui hash in uiBindings, since afterwards the
        // values in the ui hash will be overridden with jQuery selectors.
        this.uiBindings = this.ui;
      }

      // refreshing the associated selectors since they should point to the
      // newly rendered elements.
      this.ui = {};
      _.each(_.keys(this.uiBindings), function (key) {
        var selector = that.uiBindings[key];
        that.ui[key] = that.$(selector);
      });
    },



    // Model and Collection events
    // ---------------------------

    bindEvents: function () {
      this._modelEvents = this.bindBackboneEntityTo(this.model, this.modelEvents);
      this._collectionEvents = this.bindBackboneEntityTo(this.collection, this.collectionEvents);
    },

    unbindEvents: function () {
      var view = this;
      _.each([this._modelEvents, this._collectionEvents], function (bindings) {
        _.each(bindings, function (b) {
          view.unbindFrom(b);
        });
      });
    },

    // This method is used to bind a backbone "entity" (collection/model) to
    // methods on the view.
    bindBackboneEntityTo: function (entity, bindings) {
      if (!entity || !bindings) { return; }

      var view = this;
      return _.map(bindings, function (methodName, evt) {

        var method = view[methodName];
        if (!method) {
          throw new Error("View method '" + methodName +
            "' was configured as an event handler, but does not exist.");
        }

        return view.bindTo(entity, evt, method, view);
      });
    },



    // Subviews
    // --------

    // subview constructors that will be consumed by render
    // when it's time to render in subviews
    subviewCreators: null,

    /**
      (re)renders a subview or many subviews into their containers
      e.g.
      render("someSubview");
      render("subview1", "subview2");
      render(["subview1", "subview2"]);
      render({
        ".custom-container-class": "subview1"
      });
    */
    renderSubviews: function () {
      var subviewNames = _.flatten(_.toArray(arguments));
      _.each(subviewNames, function (subviewName) {
        if (_.isObject(subviewName)) {
          // this is a hash with selectors -> subview names
          _.each(subviewName, function (subviewName, selector) {
            this._renderSubview(selector, subviewName);
          }, this);
        } else {
          // this is a subview name
          this._renderSubview(this._subviewNameToSelector(subviewName), subviewName);
        }
      }, this);
    },

    /**
      Creates a new subview or replaces an existing one with a new instance,
      but first makes sure the old instance is destroyed. It automatically renders
      the new subview if container exists in the $el. Pass render: false to not
      render.

      Useful for subviews that are created and destroyed several times throughout
      the lifecycle of some view (e.g. modal dialogs, dropdowns)

      Example, usage:

      var settings = new SettingsModal({
        model: this.model
      });
      this.createSubview("settings", settings);

      var modal = new Modal();
      this.createSubview("modal", modal, { render: false });
      $("body").append(modal.render().el);

      // this actually destroys the subview, and because no new subview
      // is passed in - it stays destroyed
      this.createSubview("search");
    */
    createSubview: function (subviewName, newSubviewInstance, options) {
      // if options passed as a second argument
      if (arguments.length === 2 && $.isPlainObject(newSubviewInstance)) {
        options = newSubviewInstance;
        newSubviewInstance = null;
      }

      options = _.extend({
        render: true
      }, options);

      this.destroySubview(subviewName);

      // if subview wasn't passed in, try to find it in subview creators
      if (!newSubviewInstance) {
        if (this.subviewCreators[subviewName]) {
          newSubviewInstance = this.subviewCreators[subviewName].apply(this);
        }
      }

      // if we have a new subview instance, attach it to this.subviews
      // and render if needed
      if (newSubviewInstance) {
        this.subviews[subviewName] = newSubviewInstance;
        if (options.render) {
          var container, injector;
          _.find(["into", "prependTo", "appendTo"], function (i) {
            if (options[i]) {
              container = options[i];
              injector = i;
              return true;
            }
          });
          if (container) {
            // render into a specified container
            this._renderSubview(container, subviewName, {
              injector: injector
            });
          } else {
            // render using the renderSubview helper that will
            // try to find the container based on the subview name
            this.renderSubview(subviewName);
          }
        }
      }

      return newSubviewInstance;
    },

    destroySubview: function (subviewName) {
      // destroy the old subview
      if (this.subviews[subviewName]) {
        this.subviews[subviewName].destroy();
        delete this.subviews[subviewName];
      }
    },


    
    // Cherrytree router helpers
    // -------------------------


    // a way to generate links, delegates to router.generate
    linkTo: function () {
      if (mediator.router) {
        return mediator.router.generate.apply(mediator.router, arguments);
      }
    },

    // a way for views to transition to other routes
    transitionTo: function () {
      if (mediator.router) {
        return mediator.router.transitionTo.apply(mediator.router, arguments);
      }
    },

    // just like transitionTo, but replaces the current URL in browser history
    replaceWith: function () {
      if (mediator.router) {
        return mediator.router.replaceWith.apply(mediator.router, arguments);
      }
    },



    // Disposal
    // --------

    destroyed: false,

    destroy: function () {
      if (this.destroyed) {
        return;
      }

      // TODO, 13/06/2013, Karolis
      // should we keep another flag here called destroyCalled, to make sure
      // destroy can only always be called once?

      // if custom destroying logic is required, put it in the beforeDestroy
      this.beforeDestroy.apply(this, arguments);

      // TODO, 13/06/2013, Karolis
      // should we first unbindAll() and off() the events? so that if
      // destroying subviews triggers events, we've stopped listening and
      // can't go into some loop (e.g. subview triggers something in beforeDestroy
      // that causes the view to call destroy() on that subview, which goes into
      // a loop)

      // Destroy subviews. Handle arrays and individual views
      eachNested(this.subviews, function (subview) {
        if (subview) {
          subview.destroy();
        }
      });

      // unbind all events bound via bindTo
      this.unbindAll();

      // Remove all event handlers on this module
      this.off();

      // Remove the topmost element from DOM. This also removes all event
      // handlers from the element and all its children.
      this.$el.remove();

      // Remove element references, options,
      // model/collection references and subview lists
      var properties = [
        "el", "$el",
        "options", "model", "collection",
        "subviews"
      ];
      _.each(properties, function (prop) {
        delete this[prop];
      });

      // Finished
      this.destroyed = true;

      // You’re frozen when your heart’s not open
      if (_.has(Object, "freeze")) {
        Object.freeze(this);
      }
    },

    // a hook for custom destroy code to be executed in addition
    // to all of the default destroy functionality. Good place for unbinding
    // events or destroying non leap views (e.g. jquery plugins), etc.
    beforeDestroy: function () {},

    
    // private methods

    // can be used in templates for generating container divs
    _subviewHelper: function (subviewName) {
      return "<div class='" + this._subviewNameToClass(subviewName) + "'></div>";
    },

    _renderSubview: function (selector, view, options) {
      options = _.extend({
        skipRender: false,
        injector: "into"
      }, options);

      var jQueryInjectors = {
        "into": "html",
        "appendTo": "append",
        "prependTo": "prepend"
      };
      options.injector = jQueryInjectors[options.injector];

      var $container = selector.jquery ? selector : this.$(selector);
      // don't render if there is no container for this view
      // in $el's dom
      if (!$container.length) {
        return;
      }

      var viewName;
      if (_.isString(view)) {
        viewName = view;
        view = this.subviews[viewName];
      }
      if (!view) {
        throw new Error("Subview '" + viewName + "' doesn't exist");
      }

      // in case of array or object of views clear the container first
      // if injector is html
      if (_.isArray(view) || $.isPlainObject(view)) {
        if (options.injector === "html") {
          $container.empty();
        }
      }
      // now that we have a view instance, or array/object of view instances
      // render and inject them all into their container
      eachNested([view], function (v, key, inner) {
        if (!options.skipRender) {
          // redelegate events using setElement in case they were lost
          // but I think this is not needed anymore
          v.setElement(v.$el).render();
        }
        // detach the view first not to blow off the events, etc.
        v.$el.detach();
        // reattach
        var injector = inner && options.injector === "html" ? "append" : options.injector;
        $container[injector](v.el);
      });

      // keep the record of which views we've rendered - to avoid rerendering
      this._subviewsRendered[viewName] = view;
      // and into what containers we've rendered them - for reattaching
      this._subviewContainerSelectors[viewName] = selector;
    },

    // instantiates a subview if it hasn't been done before
    _ensureSubviewCreated: function (subviewName) {
      // only initialize the subview if it hasn't been already rendered or initialized
      // also only initialize if the container is available in the DOM
      if (!this.subviews[subviewName] && this._subviewContainer(subviewName).length) {
        if (this.subviewCreators[subviewName]) {
          this.subviews[subviewName] = this.subviewCreators[subviewName].apply(this);
        } else {
          throw new Error("LeapView: subview creator for", subviewName, "doesn't exist");
        }
      }
    },

    _subviewContainer: function (subviewName) {
      return this.$(this._subviewNameToSelector(subviewName));
    },

    _subviewNameToSelector: function (subviewName) {
      return "." + this._subviewNameToClass(subviewName);
    },

    _subviewNameToClass: function (subviewName) {
      return dashify(subviewName) + "-container";
    },
  });

  // loops over each key/value of an object, and if value is array/plainObject, loops
  // over those as well
  // callback args are:
  // the value, the outer object's key and an inner boolean flag
  // i.e. true if the callback is called from within the nested array/object
  function eachNested(obj, fn, context) {
    _.each(obj, function (val, key) {
      if (_.isArray(val) || $.isPlainObject(val)) {
        _.each(val, function (nestedVal) {
          fn.call(context, nestedVal, key, true);
        });
      } else {
        fn.call(context, val, key, false);
      }
    });
  }

});