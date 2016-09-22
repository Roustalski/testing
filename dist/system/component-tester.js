'use strict';

System.register(['aurelia-templating', 'aurelia-framework'], function (_export, _context) {
  "use strict";

  var View, Aurelia, StageComponent, ComponentTester;

  

  return {
    setters: [function (_aureliaTemplating) {
      View = _aureliaTemplating.View;
    }, function (_aureliaFramework) {
      Aurelia = _aureliaFramework.Aurelia;
    }],
    execute: function () {
      _export('StageComponent', StageComponent = function () {
        function StageComponent() {
          
        }

        StageComponent.withResources = function withResources(resources) {
          return new ComponentTester().withResources(resources);
        };

        return StageComponent;
      }());

      _export('StageComponent', StageComponent);

      ;

      _export('ComponentTester', ComponentTester = function () {
        function ComponentTester() {
          

          this.configureFn = function (aurelia) {
            return aurelia.use.standardConfiguration();
          };

          this._resources = [];
        }

        ComponentTester.prototype.configure = function configure(fn) {
          this.configureFn = fn;
          return this;
        };

        ComponentTester.prototype.withResources = function withResources(resources) {
          this._resources = resources;
          return this;
        };

        ComponentTester.prototype.inView = function inView(html) {
          this._html = html;
          return this;
        };

        ComponentTester.prototype.beforeEach = function beforeEach(done, bootstrap) {
          var _this = this;

          return new Promise(function (resolve) {
            _this.manuallyHandleLifecycle().create(bootstrap).then(function () {
              if (_this._bindingContext) {
                return _this.bind(_this._bindingContext);
              }
              return _this.bind();
            }).then(function () {
              return _this.attached();
            }).then(function () {
              return resolve(_this);
            }).then(done);
          });
        };

        ComponentTester.prototype.boundTo = function boundTo(bindingContext) {
          this._bindingContext = bindingContext;
          return this;
        };

        ComponentTester.prototype.manuallyHandleLifecycle = function manuallyHandleLifecycle() {
          this._prepareLifecycle();
          return this;
        };

        ComponentTester.prototype.create = function create(bootstrap) {
          var _this2 = this;

          return bootstrap(function (aurelia) {
            return Promise.resolve(_this2.configureFn(aurelia)).then(function () {
              if (_this2._resources) {
                aurelia.use.globalResources(_this2._resources);
              }

              return aurelia.start().then(function (a) {
                _this2.host = document.createElement('div');
                _this2.host.innerHTML = _this2._html;

                document.body.appendChild(_this2.host);

                return aurelia.enhance(_this2._bindingContext, _this2.host).then(function () {
                  _this2._rootView = aurelia.root;
                  _this2.element = _this2.host.firstElementChild;

                  if (aurelia.root.controllers.length) {
                    _this2.viewModel = aurelia.root.controllers[0].viewModel;
                  }

                  return new Promise(function (resolve) {
                    return setTimeout(function () {
                      return resolve(_this2);
                    }, 0);
                  });
                });
              });
            });
          });
        };

        ComponentTester.prototype.dispose = function dispose() {
          if (this.host === undefined || this._rootView === undefined) {
            throw new Error('Cannot call ComponentTester.dispose() before ComponentTester.create()');
          }

          this._rootView.detached();
          this._rootView.unbind();

          return this.host.parentNode.removeChild(this.host);
        };

        ComponentTester.prototype._prepareLifecycle = function _prepareLifecycle() {
          var _this3 = this;

          var bindPrototype = View.prototype.bind;
          View.prototype.bind = function () {};
          this.bind = function (bindingContext) {
            return new Promise(function (resolve) {
              View.prototype.bind = bindPrototype;
              if (bindingContext !== undefined) {
                _this3._bindingContext = bindingContext;
              }
              _this3._rootView.bind(_this3._bindingContext);
              setTimeout(function () {
                return resolve();
              }, 0);
            });
          };

          var attachedPrototype = View.prototype.attached;
          View.prototype.attached = function () {};
          this.attached = function () {
            return new Promise(function (resolve) {
              View.prototype.attached = attachedPrototype;
              _this3._rootView.attached();
              setTimeout(function () {
                return resolve();
              }, 0);
            });
          };

          this.detached = function () {
            return new Promise(function (resolve) {
              _this3._rootView.detached();
              setTimeout(function () {
                return resolve();
              }, 0);
            });
          };

          this.unbind = function () {
            return new Promise(function (resolve) {
              _this3._rootView.unbind();
              setTimeout(function () {
                return resolve();
              }, 0);
            });
          };
        };

        return ComponentTester;
      }());

      _export('ComponentTester', ComponentTester);
    }
  };
});