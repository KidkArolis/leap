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
  
* bindTo, unbindFrom, unbindAll methods provided by backbone-eventbinder
  that enable automatic event unbinding in the destroy method

* destroy method inspired by Marionette and Chaplin that destroys subviews,
  unbinds events that were bound to via bindTo, and performs other sorts of
  cleanup. If you want to run some custom destroy code, you can implement
  `beforeDestroy` method in your view.

* subview convention of storing all subviews in this.subviews hash. If the
  convention is followed, then `assign` method can be used for rendering
  the subviews and destroy methods will destroy all of the subviews.
  
  ```
  // store views
  this.subviews.toolbar = new ToolbarView();
  // or arrays of views
  this.subviews.items = _.map([1,2,3], function (id) {
    return new ItemView({ id: id});
  });
  ```

* assign method for rendering subviews into the view. If an array of views
  is passed, it loops over them and inserts them all
  (Inspired by
    http://ianstormtaylor.com/assigning-backbone-subviews-made-even-cleaner/)
  
  ```
  this.assign({
    '.subview'             : "toolbar", // will grab this.subviews.toolbar
    '.list-of-items'       : "items",   // an array of views
    '.yet-another-subview' : this.subviews.yetanother // pass by reference
  });
  ```


* `bindUIElements` method can be used to bind a `ui` hash for easy access of
   DOM elements in the view.
  
  ```
  LeapView.extend({
    ui: {
      checkbox: "input[type=checkbox]"
    },
    onRender: function() {
      if (this.model.get("selected")) {
        this.ui.checkbox.addClass('checked');
      }
    }
  });
  ```

## Changelog

### 0.4.0

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
  * view: createSubview (previously "replaceSubview"), that destroys the old instance, replaces it with the new. A {render: false} to avoid rendering it right away.
  * view: this.renderSubviews("foo", "bar"), this.renderSubviews(["foo", "bar"]), this.renderSubviews("grid"), this.renderSubviews({".custom-container": "foo"}), etc.
  * view: consistently support views and arrays of views in subviewCreators/createSubview/renderSubviews.
