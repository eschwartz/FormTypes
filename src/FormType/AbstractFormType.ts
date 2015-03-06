///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.ext.d.ts
/// <reference path="../../typings/handlebars/handlebars.ext.d.ts"/> ///ts:ref:generated
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import TemplateInterface = require('../View/Template/TemplateInterface');
import FormTemplateCollectionInterface = require('../View/Template/FormTemplateCollectionInterface');
import TemplateCollectionInterface = require('../View/Template/TemplateCollectionInterface');
import FormTemplateCollection = require('../View/Template/FormTemplateCollection');
import _ = require('underscore');
import PartialWidgetHelperFactory = require('../View/TemplateHelper/PartialWidgetHelper');
import FormContextInterface = require('../View/Context/FormContextInterface');
import Handlebars = require('handlebars');

class AbstractFormType {
  public el:Node;

  protected options:FormTypeOptionsInterface;
  protected templates:FormTemplateCollectionInterface;
  protected children:AbstractFormType[];
  protected Handlebars:HandlebarsStatic;

  constructor(options:FormTypeOptionsInterface = {}) {
    this.Handlebars = Handlebars.create();
    this.options = this.setDefaultOptions(_.clone(options));
    this.children = this.options.children || [];

    this.el = this.createElementFromString('<div></div>');

    this.setDefaultTemplates(options.templates);
  }

  public render() {
    var context = this.createTemplateContext();
    var html:string = this.templates.form({
      form: context
    });

    this.el = this.createElementFromString(html);

    return this;
  }

  public setTemplates(templates:FormTemplateCollectionInterface) {
    _.each(templates, (template:TemplateInterface, name:string) => {
      this.Handlebars.registerPartial(name, template);
    });

    this.templates = templates;
  }

  protected setDefaultTemplates(templates?:FormTemplateCollectionInterface) {
    var defaultTemplates = new FormTemplateCollection(this.Handlebars);

    templates = _.defaults({}, templates || {}, {
      form: defaultTemplates.form,
      form_widget: defaultTemplates.form_widget,
      form_start: defaultTemplates.form_start,
      form_end: defaultTemplates.form_end,
      form_rows: defaultTemplates.form_rows,
      html_attrs: defaultTemplates.html_attrs,
      field_widget: defaultTemplates.field_widget,
      text_widget: defaultTemplates.text_widget,
      choice_widget: defaultTemplates.choice_widget,
      option_widget: defaultTemplates.option_widget
    });

    this.setTemplates(templates);
  }

  protected createTemplateContext():FormContextInterface {
    var formContext:FormContextInterface = _.extend({},
      this.options, {
        children: this.children.
          map((childForm:AbstractFormType) => {
            var childContext = childForm.createTemplateContext();
            return childContext;
          })
      });

    return formContext;
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
      name: _.uniqueId('form_'),
      attrs: {},
      data: null,
      children: []
    };

    _.defaults(options, defaults);

    _.defaults(options.attrs, {
      name: options.name
    });

    return options;
  }

  protected createElementFromString(htmlString:string):Node {
    var container:HTMLElement = document.createElement('div');
    container.innerHTML = htmlString.trim();

    return container.childNodes.length === 1 ?
      container.firstChild : container;
  }
}

export = AbstractFormType;