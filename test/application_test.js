define(function (require) {

  var Application = require("application");
  var State = require("state");

  describe("Application", function () {

    var application, spies = {};

    beforeEach(function () {
      routes = function () {
        this.route("hello");
        this.route("world");
        this.states({
          "application": State.extend({
            createOutlet: function () {
              this.outlet = $(document.body);
            }
          }),
          "hello": State.extend({
            activate: function () {
              spies.activatedHome = true;
            },
            destroy: function () {
              spies.destroyedHome = true;
            }
          }),
          "world": State.extend({
            activate: function () {
              spies.activatedWorld = true;
            }
          })
        });
      };
      application = new Application({
        routes: routes
      }).start();
    });

    it("should be possible to navigate between states", function (done) {
      spies.should.deep.equal({});
      application.router.transitionTo("hello").then(function () {
        spies.activatedHome.should.be.true;
        return application.router.transitionTo("world");
      }).then(function () {
        spies.destroyedHome.should.be.true;
        spies.activatedWorld.should.be.true;
      }).then(done, done);
    });

  });

});