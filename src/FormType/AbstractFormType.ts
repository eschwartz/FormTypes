///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.ext.d.ts
/// <reference path="../../typings/handlebars/handlebars.ext.d.ts"/> ///ts:ref:generated
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import _ = require('underscore');
import fs = require('fs');
import Handlebars = require('Handlebars');
import FormContextInterface = require('../View/Context/FormContextInterface');
import TemplateInterface = require('../View/Template/TemplateInterface');
import PartialWidgetHelper = require('../View/TemplateHelper/PartialWidgetHelper');
import HtmlEvents = require('../Util/HtmlEvents');
import HtmlEventsInterface = require('../Util/HtmlEventsInterface');
import Events = require('events');

class AbstractFormType {
  public el:HTMLElement;

  protected options:FormTypeOptionsInterface;
  protected template:TemplateInterface;
  protected children:AbstractFormType[];
  protected Handlebars:HandlebarsStatic;
  protected eventEmitter:NodeJS.EventEmitter;
  protected isRenderedFlag:boolean = false;
  protected listeners:_.Dictionary<any>;
  protected listenerId:string;
  protected HtmlEvents:HtmlEventsInterface;

  constructor(options:FormTypeOptionsInterface = {}) {
    this.HtmlEvents = HtmlEvents;
    this.Handlebars = Handlebars.create();
    this.eventEmitter = new Events.EventEmitter();
    this.listeners = {};
    this.listenerId = _.uniqueId('form_type_');

    this.options = this.setDefaultOptions(_.clone(options));
    this.children = [];
    if (this.options.children) {
      this.options.children.forEach(this.addChild, this);
    }
    if ('data' in this.options) {
      this.setData(this.options.data);
    }

    this.template = this.options.template;
    this.prepareTemplateEnvironment();
    this.el = null;
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
      children: []
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

    this.children.forEach((formType:AbstractFormType) => {
      formType.render();

      if (!formType.isRendered()) {
        formType.render();
      }

      this.addChildElement(formType);
    });

    this.isRenderedFlag = true;

    return this;
  }

  public close() {
    this.children.forEach((child:AbstractFormType) => child.close());

    this.el.parentElement.removeChild(this.el);

    this.removeAllListenersById(this.listenerId);

    this.isRenderedFlag = false;
    this.el = null;

    this.eventEmitter.emit('close', this);
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
    var blacklist = [
      'template'
    ];
    var cleanOptions = _.omit(this.options, blacklist);
    var formContext:FormContextInterface = _.extend({},
      cleanOptions, {
        children: this.children.
          map((childForm:AbstractFormType) => {
            var childContext = childForm.createTemplateContext();
            return childContext;
          })
      });

    return formContext;
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
      this.eventEmitter.emit('change');
      this.eventEmitter.emit('change:' + child.getName());
    }, this.listenerId);

    child.on('close', () => this.removeChild(child));

    if (this.isRendered()) {
      // Render child, if necessary
      if (!child.isRendered()) {
        child.render();
      }
      this.addChildElement(child);
    }
  }

  public removeChild(child:AbstractFormType) {
    this.removeChildElement(child);

    child.removeAllListenersById(this.listenerId);

    this.children = _.without(this.children, child);
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

  /**
   * Remove a childType's element from parent form's element
   */
  protected removeChildElement(child:AbstractFormType) {
    if (child.el) {
      child.el.parentElement.removeChild(child.el);
    }
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

    if (!this.el) {
      return null;
    }
    isInputTopLevelElement = this.el.tagName.toLowerCase() === this.options.tagName;

    return <HTMLElement>(
      isInputTopLevelElement ?
        this.el : this.el.getElementsByTagName(this.options.tagName).item(0)
    );
  }

  public isRendered():boolean {
    return this.isRenderedFlag;
  }

  public getData():any {
    throw new Error(
      'Form of type "' + this.options.type + '" must implement a getData() method.'
    );
  }

  public setData(data:any):void {
    throw new Error(
      'Form of type "' + this.options.type + '" must implement a setData() method.'
    );
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

  public setHtmlEvents(HtmlEvents:HtmlEventsInterface) {
    this.HtmlEvents = HtmlEvents;
  }
}

export = AbstractFormType;