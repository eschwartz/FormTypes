import FormTemplateCollectionInterface = require('./FormTemplateCollectionInterface');
import TemplateInterface = require('./TemplateInterface');

var form:TemplateInterface = require('../form/form.html.hbs');
var form_start:TemplateInterface = require('../form/form_start.html.hbs');
var form_rows:TemplateInterface = require('../form/form_rows.html.hbs');
var form_end:TemplateInterface = require('../form/form_end.html.hbs');
var html_attrs:TemplateInterface = require('../form/html_attrs.html.hbs');
var field_widget:TemplateInterface = require('../form/field_widget.html.hbs');
var option_widget:TemplateInterface = require('../form/option_widget.html.hbs');

/**
 * Default form templates.
 */
class FormTemplateCollection implements FormTemplateCollectionInterface {
  form:TemplateInterface;
  form_start:TemplateInterface;
  form_rows:TemplateInterface;
  form_end:TemplateInterface;
  html_attrs:TemplateInterface;
  field_widget:TemplateInterface;
  option_widget:TemplateInterface;

  constructor() {
    this.form = form;
    this.form_start = form_start;
    this.form_rows = form_rows;
    this.form_end = form_end;
    this.html_attrs = html_attrs;
    this.field_widget = field_widget;
    this.option_widget = option_widget;
  }
}

export = FormTemplateCollection;