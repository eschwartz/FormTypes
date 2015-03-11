///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldTypeOptionsInterface = require('./FieldTypeOptionsInterface');

interface OptionTypeOptionsInterface extends FieldTypeOptionsInterface {
  /** Set to true to mark the option as selected */
  selected?:boolean;

  disabled?:boolean;
}

export = OptionTypeOptionsInterface;