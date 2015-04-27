///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldTypeOptionsInterface = require('./FieldTypeOptionsInterface');

interface CheckboxTypeOptionsInterface extends FieldTypeOptionsInterface {
  checked?:boolean;
  disabled?:boolean;
}
export = CheckboxTypeOptionsInterface;