///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldTypeOptionsInterface = require('./FieldTypeOptionsInterface');

interface ChoiceTypeOptionsInterface extends FieldTypeOptionsInterface {
  /**
   * A hash of choice values -> labels
   * eg.
   * {
   *  us: 'United States',
   *  ca: 'Canada'
   * }
   */
  choices?: _.Dictionary<string>;

  /**
   * The value of the selected choice.
   * Set to null to have no option selected.
   */
  data?:string;
}

export = ChoiceTypeOptionsInterface;