import TemplateCollectionInterface = require('./TemplateCollectionInterface');
import TemplateInterface = require('./TemplateInterface');

interface FormTemplateCollectionInterface extends TemplateCollectionInterface {
  /**
   * The main form template.
   * Serves as an entry point for all other templates.
   */
  form:TemplateInterface;
  form_start:TemplateInterface;
  form_rows:TemplateInterface;
  form_end:TemplateInterface;

  html_attrs:TemplateInterface;
  /** Generic form field template */
  field_widget:TemplateInterface;
  /** Template for an `option` type form */
  option_widget:TemplateInterface;
}

export = FormTemplateCollectionInterface;