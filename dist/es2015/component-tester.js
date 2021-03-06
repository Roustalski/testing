import { View } from 'aurelia-templating';
import { Aurelia } from 'aurelia-framework';

export let StageComponent = class StageComponent {
  static withResources(resources) {
    return new ComponentTester().withResources(resources);
  }
};;

export let ComponentTester = class ComponentTester {
  constructor() {
    this.configureFn = aurelia => aurelia.use.standardConfiguration();

    this._resources = [];
  }

  configure(fn) {
    this.configureFn = fn;
    return this;
  }

  withResources(resources) {
    this._resources = resources;
    return this;
  }

  inView(html) {
    this._html = html;
    return this;
  }

  beforeEach(done, bootstrap) {

    return new Promise(resolve => {
      this.manuallyHandleLifecycle().create(bootstrap).then(() => {
        if (this._bindingContext) {
          return this.bind(this._bindingContext);
        }
        return this.bind();
      }).then(() => this.attached()).then(() => resolve(this)).then(done);
    });
  }

  boundTo(bindingContext) {
    this._bindingContext = bindingContext;
    return this;
  }

  manuallyHandleLifecycle() {
    this._prepareLifecycle();
    return this;
  }

  create(bootstrap) {
    return bootstrap(aurelia => {
      return Promise.resolve(this.configureFn(aurelia)).then(() => {
        if (this._resources) {
          aurelia.use.globalResources(this._resources);
        }

        return aurelia.start().then(a => {
          this.host = document.createElement('div');
          this.host.innerHTML = this._html;

          document.body.appendChild(this.host);

          return aurelia.enhance(this._bindingContext, this.host).then(() => {
            this._rootView = aurelia.root;
            this.element = this.host.firstElementChild;

            if (aurelia.root.controllers.length) {
              this.viewModel = aurelia.root.controllers[0].viewModel;
            }

            return new Promise(resolve => setTimeout(() => resolve(this), 0));
          });
        });
      });
    });
  }

  dispose() {
    if (this.host === undefined || this._rootView === undefined) {
      throw new Error('Cannot call ComponentTester.dispose() before ComponentTester.create()');
    }

    this._rootView.detached();
    this._rootView.unbind();

    return this.host.parentNode.removeChild(this.host);
  }

  _prepareLifecycle() {
    const bindPrototype = View.prototype.bind;
    View.prototype.bind = () => {};
    this.bind = bindingContext => new Promise(resolve => {
      View.prototype.bind = bindPrototype;
      if (bindingContext !== undefined) {
        this._bindingContext = bindingContext;
      }
      this._rootView.bind(this._bindingContext);
      setTimeout(() => resolve(), 0);
    });

    const attachedPrototype = View.prototype.attached;
    View.prototype.attached = () => {};
    this.attached = () => new Promise(resolve => {
      View.prototype.attached = attachedPrototype;
      this._rootView.attached();
      setTimeout(() => resolve(), 0);
    });

    this.detached = () => new Promise(resolve => {
      this._rootView.detached();
      setTimeout(() => resolve(), 0);
    });

    this.unbind = () => new Promise(resolve => {
      this._rootView.unbind();
      setTimeout(() => resolve(), 0);
    });
  }
};