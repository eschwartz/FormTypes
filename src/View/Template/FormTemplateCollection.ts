///ts:ref=node.d.ts
/// <reference path="../../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import FormTemplateCollectionInterface = require('./FormTemplateCollectionInterface');
import TemplateInterface = require('./TemplateInterface');
require('handlebars');


/**
 * Default form templates.
 */
class FormTemplateCollection implements FormTemplateCollectionInterface {
[index:string]:TemplateInterface;
  form:TemplateInterface;
  form_widget:TemplateInterface;
  form_start:TemplateInterface;
  form_rows:TemplateInterface;
  form_end:TemplateInterface;
  html_attrs:TemplateInterface;
  field_widget:TemplateInterface;
  text_widget:TemplateInterface;
  option_widget:TemplateInterface;

  constructor() {
    this.form = require('../form/form.html.hbs');
    this.form_widget = require('../form/form_widget.html.hbs');
    this.form_start = require('../form/form_start.html.hbs');
    this.form_rows = require('../form/form_rows.html.hbs');
    this.form_end = require('../form/form_end.html.hbs');
    this.html_attrs = require('../form/html_attrs.html.hbs');
    this.field_widget = require('../form/field_widget.html.hbs');
    this.text_widget = require('../form/text_widget.html.hbs');
    this.option_widget = require('../form/option_widget.html.hbs');
  }
}

export = FormTemplateCollection;