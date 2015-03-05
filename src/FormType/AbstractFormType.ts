///<reference path="../../typings/underscore/underscore.d.ts" />
///<reference path="../../typings/handlebars/handlebars.ext.d.ts" />
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface')
import TemplateInterface = require('../View/Template/TemplateInterface');
import FormTemplateCollectionInterface = require('../View/Template/FormTemplateCollectionInterface');
import _ = require('underscore');
import Handlebars = require('handlebars');

class AbstractFormType {
  public el:HTMLElement;

  protected options:FormTypeOptionsInterface;
  protected el:HTMLElement;
  protected templates:FormTemplateCollectionInterface;
  protected Handlebars:HandlebarsStatic;

  constructor(options:FormTypeOptionsInterface = {}) {
    this.Handlebars = Handlebars.create();
    this.options = this.setDefaultOptions(_.clone(options));
    this.el = this.createElementFromString('<div></div>');

    this.registerTemplatePartials();
  }

  public render() {
    var context = this.createTemplateContext;
    var html:string = this.templates.form(context);

    this.el = this.createElementFromString(html);

    return this;
  }

  protected createTemplateContext():_.Dictionary<any> {
    return this.options;
  }

  /**
   * Apply defaults to the options object.
   *
   * The returned object is set to this.options.
   */
  protected setDefaultOptions(options:FormTypeOptionsInterface):FormTypeOptionsInterface {
    options = _.clone(options);
    _.defaults(options, {
      tagName: 'form',
      type: 'form',
      attrs: {},
      children: [],
      data: null,
      templates: {}
    });

    _.defaults(options.attrs, {
      name: options.name
    });

    return options;
  }

  protected registerTemplatePartials():void {
    _.each(this.templates, (template:TemplateInterface, name:string) => {
      this.Handlebars.registerPartial(name, template);
    });
  }

  createElementFromString(htmlString:string):HTMLElement {
    var container = document.createElement('div');
    container.innerHTML = htmlString;

    return container.firstChild;
  }
}

export = AbstractFormType;