// var chai = require("chai");
var LeapView = require("../view");

describe("Leap View", function () {
  it("passes templateData into the template", function () {
    var templateData = {a: "b"};
    var View = LeapView.extend({
      templateData: function () {
        return templateData;
      }
    });
    var view = new View();
    sinon.stub(view, "template", function (data) {
      console.log("HERE");
    });
    view.render();
    expect(template).to.be.calledWith(templateData);
  });
});