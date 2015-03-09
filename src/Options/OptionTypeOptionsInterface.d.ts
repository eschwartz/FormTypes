/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
import FieldTypeOptionsInterface = require('./FieldTypeOptionsInterface');
interface OptionTypeOptionsInterface extends FieldTypeOptionsInterface {
    /** Set to true to mark the option as selected */
    selected?: boolean;
}
export = OptionTypeOptionsInterface;
