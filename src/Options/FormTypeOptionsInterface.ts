///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('../FormType/AbstractFormType');
import FormTemplateCollectionInterface = require('../View/Template/FormTemplateCollectionInterface')
interface FormTypeOptionsInterface extends _.Dictionary<any> {
  type?:string;

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
  attrs?:_.Dictionary<any>;

  /**
   * Child form elements.
   */
  children?:AbstractFormType[];

  data?:any;

  templates?:FormTemplateCollectionInterface;
}

export = FormTypeOptionsInterface;