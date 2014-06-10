# Leap

[ ![Codeship Status for KidkArolis/leap](https://codeship.io/projects/eaf60910-0147-0131-111c-7a4299a05af4/status?branch=master)](https://codeship.io/projects/7060)

Leap is a nestable base view for Backbone.

Leap View features:

  * subview support
  * default renderer
  * templateData for declaring what should go into the template
  * bindTo method similar to listenTo, but also supports DOM events
  * ui hash for caching DOM elements by selectors
  * beforeRender, afterRender, beforeRemove hooks
  * modelEvents, collectionEvents and stateEvents hashes for declaratively binding to model events

Leap current supports AMD and bower.

## Docs

### Leap/View

Leap View is a base view that provides the following features for your Backbone Views

#### bindTo, unbindFrom, unbindAll

These methods are proxies to backbone-eventbinder that enable automatic event unbinding in the destroy method.


#### subviews

Subviews can be created in several ways. Via `subviewCreatpors` hash, by using `createSubview` method or by manually putting things on the `this.subviews` object. LeapView will take care of rendering subviews into their containers using a convention `subviewName` -> `.subview-name-container`. When destroyed, LeapView will also destroy all subviews in `this.subviews`. A subview can be another LeapView, an array of LeapViews or an object whose values are LeapViews.


```js
LeapView.extend({
  template: require("./templates/search_page.html");
  subviewCreators: function () {
    "searchInput": function () {
      return new SearchInput();
    },
    "searchResults": function () {
      return this.resultCollection.map(function (m) {
        return new SearchResult({
          model: m
        });
      });
    },
    "categories": function () {
      return {
        27: new Category({id: 27}),
        45: new Category({id: 45})
      }
    }
  }
});
```

And here's an example template where all of the above would get rendered in:

```js
<div class="search-input-container"></div>
<div class="sidebar">
  <div class="categories-container"></div>
</div>
<div class="content">
  <div class="search-results-container"></div>
</div>
```

Inspired by http://ianstormtaylor.com/assigning-backbone-subviews-made-even-cleaner/ and https://github.com/rotundasoftware/backbone.subviews


#### renderSubviews

(re)rendering subviews into their containers. If an array of views is passed, it loops over them and inserts them all

```js
render("someSubview");
render("subview1", "subview2");
render(["subview1", "subview2"]);
render({
  ".custom-container-class": "subview1
});
```


#### destroy

destroy method inspired by Marionette and Chaplin that destroys subviews,
unbinds events that were bound to via bindTo, and performs other sorts of
cleanup. If you want to run some custom destroy code, you can implement
`beforeDestroy` method in your view.


#### ui hash

a `ui` hash can be defined for easy access of DOM elements in the view.

```js
LeapView.extend({
  ui: {
    checkbox: "input[type=checkbox]"
  },
  afterRender: function() {
    if (this.model.get("selected")) {
      this.ui.checkbox.addClass('checked');
    }
  }
});
```

## Changelog

### 0.7.0

* remove dependency on Backbone.Stickit. Leap no longer cares about what dom bindings library is used if any
* rename destroy to remove to be compatible with Backbone, but alias remove as destroy for backwards compatibility. `LeapView.destroy` is now **deprecated**
* remove no longer used modules: `assert`, `object` and `history_location`
* bundle in the event_binder module instead of pulling it in as a dependency for less setup
* remove the `route` module, it's been moved to it's own project at [backbone-route](https://github.com/QubitProducts/backbone-route). Leap is now only concerned with being a backbone view.

### 0.6.0

* `beforeRender/afterRender` are now called with the arguments that `render` was called with

### 0.5.0

* `stateEvents` hash for a special `state` model of the view. Use state model to represent the state of the view as opposed to the regular model representing data. Read more about state vs props here http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html#what-should-go-in-state.

### 0.4.0

* improve support for subviews
  * `subviewCreators` hash can house subview constructors - when rendering they will be lazily   instantiated if a container for them exists in the elements DOM
  * `renderSubviews` helper can be used to rerender subviews
  * `createSubview` helper can be used to create new subviews or replace an existing subview's    instance and immediately rerender it. Subview instance can be created using subviewCreators, e.g. `createSubview('someModal', {appendTo: $("body")})` will lookup someModal in subviewCreators, create it and render it into body.
  * `destroySubview` helper can destroy subviews by name
* replace `assign` with `renderSubviews` and `replaceSubview` with `createSubview`
* add `unbindEvents` method which does the opposite of `bindEvents`
* rename `getTemplateData` to `templateData`
* remove `leap/model` and `leap/collection`
* remove "afterRender" event
* a default `application` state is provided that renders content into `document.body`

## TODO

  * view: consistently support views, arrays of views and plain objects with views as values in subviewCreators/createSubview/renderSubviews.
  * consider adding removeSubviews or destroySubviews - the use case is that sometimes views need to recreate a single/list of subviews, and each time, we have to manually call renderSubviews, because after it's been rendered once, it's now cached in this._subviewsRendered - the view thinks these views have already been rendered. Perhaps we could check by reference, not just by name.
  * connect hash for connecting subviews to model values - follow stickit API - can this be done with stickit directly? via leap
  * remove the mediator class
  * remove the router bits from the leap/view, leap/view shouldn't assume anything about the routing.