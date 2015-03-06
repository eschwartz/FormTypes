///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.ext.d.ts
/// <reference path="../../typings/handlebars/handlebars.ext.d.ts"/> ///ts:ref:generated
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import TemplateInterface = require('../View/Template/TemplateInterface');
import FormTemplateCollectionInterface = require('../View/Template/FormTemplateCollectionInterface');
import FormTemplateCollection = require('../View/Template/FormTemplateCollection');
import _ = require('underscore');
import Handlebars = require('handlebars');
import PartialWidgetHelperFactory = require('../View/TemplateHelper/PartialWidgetHelperFactory');

class AbstractFormType {
  public el:Node;

  protected options:FormTypeOptionsInterface;
  protected templates:FormTemplateCollectionInterface;
  protected Handlebars:HandlebarsStatic;

  constructor(options:FormTypeOptionsInterface = {}) {
    this.options = this.setDefaultOptions(_.clone(options));
    this.el = this.createElementFromString('<div></div>');
    this.Handlebars = Handlebars.create();

    this.setTemplates(new FormTemplateCollection());
  }

  public render() {
    var context = this.createTemplateContext();
    var html:string = this.templates.form(context, {
      partials: this.templates,
      helpers: {
        partial_widget: PartialWidgetHelperFactory(this.templates)
      }
    });

    this.el = this.createElementFromString(html);

    return this;
  }

  public setTemplates(templates:FormTemplateCollectionInterface) {
    this.templates = templates;
    //this.registerTemplatePartials();
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
    var defaults = {
      tagName: 'form',
      type: 'form',
      attrs: {},
      children: [],
      data: null
    };
    var optionKeys = Object.keys(defaults);

    options = _.defaults(_.pick(options, optionKeys), defaults);

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

  protected createElementFromString(htmlString:string):Node {
    var container:HTMLElement = document.createElement('div');
    container.innerHTML = htmlString;

    return container.firstChild;
  }
}

export = AbstractFormType;