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
import FormContextInterface = require('../View/Context/FormContextInterface');

class AbstractFormType {
  public el:Node;

  protected options:FormTypeOptionsInterface;
  protected templates:FormTemplateCollectionInterface;
  protected Handlebars:HandlebarsStatic;
  protected children:AbstractFormType[];

  constructor(options:FormTypeOptionsInterface = {}) {
    this.options = this.setDefaultOptions(_.clone(options));
    this.el = this.createElementFromString('<div></div>');
    this.children = [];

    this.setTemplates(new FormTemplateCollection());
  }

  public render() {
    var context = this.createTemplateContext();
    var html:string = this.templates.form({
      form: context
    }, {
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
      data: null
    };
    var sanitizedOptions = _.pick(options, Object.keys(defaults));

    options = _.defaults(sanitizedOptions, defaults);

    this.children = options.children || [];

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