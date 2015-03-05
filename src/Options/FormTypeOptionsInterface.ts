///<reference path="../../typings/underscore/underscore.d.ts" />
import AbstractFormType = require('../FormType/AbstractFormType');
interface FormTypeOptionsInterface extends _.Dictionary<any> {
  /**
   * A unique name for the form type instance.
   * This may also serve as the form elements `name` attribute,
   * where applicable.
   */
  name?:string;

  /**
   * HTML tag name for the form element.
   */
  tagName?:string;

  /**
   * Attributes to apply to the HTML element
   */
  attrs?:_.Dictionary<string>;

  /**
   * Child form elements.
   */
  children?:AbstractFormType[];
}

export = FormTypeOptionsInterface;