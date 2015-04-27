///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldTypeOptionsInterface = require('./FieldTypeOptionsInterface');

interface MultiChoiceTypeOptionsInterface extends FieldTypeOptionsInterface {
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
   * The values of the selected choices.
   * Set to null to have no option selected.
   */
  data?:string[];
}

export = MultiChoiceTypeOptionsInterface;