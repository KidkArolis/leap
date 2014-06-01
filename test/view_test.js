var _ = require("underscore");
var Backbone = require("backbone");
var LeapView = require("../view");

var View, view;
describe("Leap View", function () {
  beforeEach(function () {
    View = LeapView.extend();
    view = new View();
  });

  it("passes templateData into the template", function () {
    var templateData = {a: "b"};
    view.templateData = function () {
      return templateData;
    };
    view.template = sinon.spy(function (data) {
      expect(_.pick(data, _.keys(templateData))).to.deep.equal(templateData);
    });
    view.render();
    expect(view.template).to.be.called;
  });
  describe("#destroy", function () {
    it("is an alias for remove", function () {
      sinon.stub(view, "remove");
      view.destroy();
      view.remove.should.have.been.called;
    });
  });
  describe("#remove", function () {
    it("calls Backbone's native remove method", function () {
      sinon.stub(Backbone.View.prototype, "remove");
      view.remove();
      Backbone.View.prototype.remove.should.have.been.called;
    });
  });
});