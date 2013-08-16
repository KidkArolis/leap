# Leap
Leap is a mini application framework based on Backbone.

The main features are a more powerful View class and integration to a hierarchical stateful router called Cherrytree. 
  
Leap View features:

  * subview support
  * default renderer
  * destroy method for cleanup

Leap is AMD and is a bower component.

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

### 0.4.0

* improved support for subviews
  * `subviewCreators` hash can house subview constructors - when rendering they will be lazily instantiated if a container for them exists in the elements DOM
  * `renderSubviews` helper can be used to rerender subviews
  * `createSubview` helper cab be used to create new subviews or replace an existing subview's instance and immediately rerender it
* replaced `assign` with `renderSubviews` and `replaceSubview` with `createSubview`
* renamed `getTemplateData` to `templateData`
* removed `leap/model` and `leap/collection`
* a default `application` state is provided that renders content into `document.body`

## TODO

  * tests
  * docs
  * look into restructuring the dirs
  * remove dependency on stickit - it can easily be mixed in into views that require it
  * view: pass a helper function to the template <%= subview("grid") %>
  * view: add subviewCreators hash - functions that will be called to create subviews as their containers are found in the DOM after render, it also doesn't rerender the subviews every time, instead it detaches them and reattaches.
  * view: consistently support views, arrays of views and plain objects with views as values in subviewCreators/createSubview/renderSubviews.
  * remove bindTo in favor of Backbone's native listenTo (shim it for older versions of Backbone)
  * add listenToDOM for doing listenTos on DOM elements
