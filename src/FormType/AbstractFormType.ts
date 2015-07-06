///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.ext.d.ts
/// <reference path="../../typings/handlebars/handlebars.ext.d.ts"/> ///ts:ref:generated
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import FormErrorsInterface = require('./FormErrorsInterface');
import _ = require('underscore');
import fs = require('fs');
import Handlebars = require('Handlebars');
import FormContextInterface = require('../View/Context/FormContextInterface');
import TemplateInterface = require('../View/Template/TemplateInterface');
import PartialWidgetHelper = require('../View/TemplateHelper/PartialWidgetHelper');
import HtmlEvents = require('../Util/HtmlEvents');
import HtmlEventsInterface = require('../Util/HtmlEventsInterface');
import AllEvent = require('../Event/AllEvent');
import Events = require('events');

class AbstractFormType {
  public el:HTMLElement;

  protected options:FormTypeOptionsInterface;
  protected template:TemplateInterface;
  protected children:AbstractFormType[];
  protected Handlebars:HandlebarsStatic;
  protected eventEmitter:NodeJS.EventEmitter;
  protected listeners:_.Dictionary<any>;
  protected listenerId:string;
  protected state: any;

  constructor(options:FormTypeOptionsInterface = {}) {
    this.Handlebars = Handlebars.create();
    this.eventEmitter = new Events.EventEmitter();
    this.listeners = {};
    this.listenerId = _.uniqueId('form_type_');

    this.state = {};
    this.prepareTemplateEnvironment();
    this.options = this.setDefaultOptions(_.clone(options));
    this.children = [];

    this.template = this.options.template;
    delete this.options.template;

    this.el = null;

    this.render();

    this.options.children.forEach(child => this.addChild(child));
    this.setErrors(this.options.errors);

    if ('data' in this.options) {
      this.setData(this.options.data);
    }
  }

  /**
   * Apply defaults to the options object.
   *
   * The returned object is set to this.options.
   */
  protected setDefaultOptions(options:FormTypeOptionsInterface):FormTypeOptionsInterface {
    var defaults = {
      tagName: 'div',
      type: 'form_type',
      name: _.uniqueId('form_'),
      attrs: {},
      children: [],
      errors: {}
    };

    _.defaults(options, defaults);

    _.defaults(options.attrs, {
      name: options.name
    });

    return options;
  }

  public render():AbstractFormType {
    var context = this.createTemplateContext();
    var html:string = this.template({
      form: context
    });

    this.el = this.createElementFromString(html);

    this.children.forEach(child => this.addChildElement(child));
    this.update(this.state);

    return this;
  }

  /**
   * Update the view, in response
   * to changes in the state.
   *
   * @param changedState
   */
  protected update(changedState) {
    if ('errors' in changedState) {
      this.renderErrors(changedState.errors);
    }
  }

  /** Render a list of errors into the form view. */
  protected renderErrors(errors:string[]) {
    var errorsListView = <HTMLElement>this.el.getElementsByClassName('errors').item(0);
    var errorTemplate = Handlebars.compile('<li>{{this}}</li>');

    if (!errorsListView) {
      return;
    }

    errorsListView.innerHTML = '';

    if (!errors.length) {
      errorsListView.style.display = 'none';
      return;
    }


    errors.
      map(err => this.createElementFromString(errorTemplate(err))).
      forEach(errView => errorsListView.appendChild(errView));

    errorsListView.style.display = '';
  }

  public close() {
    this.children.forEach((child:AbstractFormType) => child.close());

    if (this.el && this.el.parentElement) {
      this.el.parentElement.removeChild(this.el);
    }

    this.el = null;

    this.emit('close', this);

    this.removeAllListeners();
  }

  public setTemplate(template:TemplateInterface) {
    this.template = template;
  }

  protected prepareTemplateEnvironment():void {
    var partials:_.Dictionary<string> = {
      html_attrs: fs.readFileSync(__dirname + '/../View/form/html_attrs.html.hbs', 'utf8'),
      field_widget: fs.readFileSync(__dirname + '/../View/form/field_widget.html.hbs', 'utf8'),
      simple_widget: fs.readFileSync(__dirname + '/../View/form/simple_widget.html.hbs', 'utf8')
    };

    _.each(partials, (partial:string, name:string) => {
      this.Handlebars.registerPartial(name, partial);
    });

    PartialWidgetHelper.register(this.Handlebars);
  }

  protected createTemplateContext():FormContextInterface {
    return _.clone(this.options);
  }

  protected createElementFromString(htmlString:string):HTMLElement {
    var container:HTMLElement = document.createElement('div');
    container.innerHTML = htmlString.trim();

    return container.childNodes.length === 1 ?
      <HTMLElement>container.firstChild : container;
  }

  public addChild(child:AbstractFormType) {
    this.children.push(child);

    child.on('change', () => {
      this.emit('change');
      this.emit('change:' + child.getName());
    }, this.listenerId);

    child.on('all', (evt:AllEvent) => {
      var isChildEvent = evt.type.indexOf('child:') === 0;
      var proxyEventType = isChildEvent ? evt.type : 'child:' + evt.type;

      this.emit(proxyEventType, evt);
    }, this.listenerId);


    this.addChildElement(child);
  }

  public removeChild(child:AbstractFormType) {
    this.removeChildElement(child);
    this.children = _.without(this.children, child);
  }

  protected removeChildElement(child:AbstractFormType) {
    if (child.el && child.el.parentElement) {
      child.el.parentElement.removeChild(child.el);
    }
  }

  public removeChildByName(name:string):void {
    var child:AbstractFormType = this.getChild(name);

    if (!child) {
      return void 0;
    }

    this.removeChild(child);
  }

  public getChild(name:string):AbstractFormType {
    return _.find(this.children, (child:AbstractFormType) => {
      return child.getName() === name;
    });
  }

  protected addChildElement(childType:AbstractFormType) {
    this.el.appendChild(childType.el);
  }

  public getName():string {
    return this.options.name;
  }

  /**
   * Returns the element which is bound to the form.
   * For example, for a TextType, this would be the <input type="text" />
   * element.
   */
  public getFormElement():HTMLElement {
    var isInputTopLevelElement:boolean;

    isInputTopLevelElement = this.el.tagName.toLowerCase() === this.options.tagName;

    return <HTMLElement>(
      isInputTopLevelElement ?
        this.el : this.el.getElementsByTagName(this.options.tagName).item(0)
    );
  }

  /** abstract */public getData():any {
    // Implementations should use this method to
    // retrieve state attributes of the FormType
    throw new Error(
      'Form of type "' + this.options.type + '" must implement a getData() method.'
    );
  }

  /** abstract */public setData(data:any):void {
    // Implementations should use this method to
    // update the state of the FormType
    // In this way, a FormType's data acts kind of like
    // a facade around it's state.
    // Should trigger a 'change' event,
    // if the data is different
    throw new Error(
      'Form of type "' + this.options.type + '" must implement a setData() method.'
    );
  }

  protected setState(state) {
    _.extend(this.state, state);
    this.update(state);
  }

  /**
   * Does the form type contain data.
   *
   * A FormType is considered to have data even
   * if the value of the data is falsely.
   * On the other hand, a LabelType or SubmitType
   * may not have any data associated with it at all.
   *
   * This returns true by default, but can be
   * overridden in FormType implementations.
   */
  public hasData():boolean {
    return true;
  }

  public setErrors(errors:FormErrorsInterface) {
    _.defaults(errors, {
      form: [],
      fields: {}
    });
    this.setState({
      errors: errors.form
    });

    this.children.forEach(child => {
      var errorsForChild = errors.fields[child.getName()] || {};
      child.setErrors(errorsForChild);
    });
  }

  public clearErrors() {
    this.setErrors({});
  }

  public getErrors():FormErrorsInterface {
    return {
      form: _.clone(this.state.errors),
      fields: <_.Dictionary<FormErrorsInterface>>this.children.reduce((fieldErrors, child) => {
        fieldErrors[child.getName()] = child.getErrors();
        return fieldErrors;
      }, {})
    };
  }

  public hasErrors():boolean {
    return this.state.errors.length > 0 ||
        this.children.some(child => child.hasErrors());
  }

  public on(event:string, listener:Function, listenerId?:string) {
    this.eventEmitter.on(event, listener);

    // Remember this listener, so we can remove it later
    if (listenerId) {
      this.listeners[listenerId] || (this.listeners[listenerId] = []);

      this.listeners[listenerId].push({
        event: event,
        listener: listener
      });
    }
  }

  public once(event:string, listener:Function, listenerId?:string) {
    this.eventEmitter.once(event, listener);

    // Remember this listener, so we can remove it later
    if (listenerId) {
      this.listeners[listenerId] || (this.listeners[listenerId] = []);

      this.listeners[listenerId].push({
        event: event,
        listener: listener
      });
    }
  }

  public removeListener(event:string, listener:Function) {
    this.eventEmitter.removeListener(event, listener);
  }

  public removeAllListeners(event?:string) {
    this.eventEmitter.removeAllListeners(event);
  }

  /**
   * When you bind to an event, you may optionally
   * specify a listenerId. This method removes all
   * listeners for that listenerId.
   *
   * @param listenerId
   */
  public removeAllListenersById(listenerId) {
    var listeners = this.listeners[listenerId];

    if (!listeners) {
      return;
    }

    this.listeners[listenerId].forEach((listener:any) => {
      this.removeListener(listener.event, listener.listener);
    });
  }

  protected emit(eventType:string, arg?:any) {
    var allEvent:AllEvent;

    this.eventEmitter.emit(eventType, arg);
    this.eventEmitter.emit('all', allEvent = {
      type: eventType,
      args: arg === void 0 ? [] : [arg]
    });
  }
}

export = AbstractFormType;