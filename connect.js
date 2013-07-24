define(function (require) {

  var _ = require("underscore");

  // TODO 07/03/2013
  // look into replacing this with the new version of stickit

  // setup 2 way binding between a model and a view
  return function (options) {

    options = _.defaults(options || {}, {
      // transform value after getting from the model
      onGet: _.identity,
      // transform value before setting on the model
      onSet: _.identity,
      // model to observe
      model: null,
      // attribute to observe
      observe: null,
      // view to connect to
      view: null
    });

    var updateView = function () {
      options.view.val(options.onGet.apply(this, arguments));
    };

    // initialize the view with a value right after it's rendered
    var onRender = function () {
      updateView(options.model.get(options.observe));
      options.view.off("afterRender", onRender);
    };
    options.view.on("afterRender", onRender);

    var bindKey = _.uniqueId();
    options.view.on("change", function () {
      options.model.set(options.observe, options.onSet.apply(this, arguments), {
        bindKey: bindKey
      });
    });
    options.view.bindTo(options.model, "change:" + options.observe, function (model, value, opt) {
      if ((opt || {}).bindKey !== bindKey) {
        updateView(value);
      }
    });
  };

});