///ts:ref=node.d.ts
/// <reference path="../../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
import FormTemplateCollectionInterface = require('./FormTemplateCollectionInterface');
import TemplateInterface = require('./TemplateInterface');
import Handlebars = require('handlebars');
import fs = require('fs');
import PartialWidgetHelper = require('../TemplateHelper/PartialWidgetHelper');


/**
 * Default form templates.
 */
class FormTemplateCollection implements FormTemplateCollectionInterface {
  [index:string]:any;
  protected templateCache:TemplateInterface[];

  protected Handlebars:HandlebarsStatic;

  constructor(HandlebarsEnv:HandlebarsStatic = Handlebars) {
    this.Handlebars = HandlebarsEnv;
    this.templateCache = [];

    this.registerDefaultHelpers();
  }

  get form():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/form.html.hbs', 'utf8');
    return this.getTemplate('form', templateString);
  }

  get form_widget():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/form_widget.html.hbs', 'utf8');
    return this.getTemplate('form_widget', templateString);
  }

  get form_start():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/form_start.html.hbs', 'utf8');
    return this.getTemplate('form_start', templateString);
  }

  get form_end():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/form_end.html.hbs', 'utf8');
    return this.getTemplate('form_end', templateString);
  }

  get form_rows():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/form_rows.html.hbs', 'utf8');
    return this.getTemplate('form_rows', templateString);
  }

  get html_attrs():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/html_attrs.html.hbs', 'utf8');
    return this.getTemplate('html_attrs', templateString);
  }

  get field_widget():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/field_widget.html.hbs', 'utf8');
    return this.getTemplate('field_widget', templateString);
  }

  get text_widget():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/text_widget.html.hbs', 'utf8');
    return this.getTemplate('text_widget', templateString);
  }

  get option_widget():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/option_widget.html.hbs', 'utf8');
    return this.getTemplate('option_widget', templateString);
  }

  get select_widget():TemplateInterface {
    var templateString:string = fs.readFileSync(__dirname + '/../form/select_widget.html.hbs', 'utf8');
    return this.getTemplate('select_widget', templateString);
  }

  protected getTemplate(name:string, templateString:string) {
    if (this.templateCache[name]) {
      return this.templateCache[name];
    }

    return this.templateCache[name] = this.Handlebars.compile(templateString);
  }

  protected registerDefaultHelpers() {
     PartialWidgetHelper.register(this.Handlebars);
  }


  public setHandlebars(HandleBars:HandlebarsStatic) {
    this.Handlebars = HandleBars;
  }
}

export = FormTemplateCollection;