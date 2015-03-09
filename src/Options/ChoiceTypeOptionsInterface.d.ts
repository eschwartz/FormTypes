/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
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
    /** The value of the selected choice */
    data?: string;
}
export = ChoiceTypeOptionsInterface;
