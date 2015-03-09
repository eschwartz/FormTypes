/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
import FieldType = require('./FieldType');
import OptionTypeOptionsInterface = require('../Options/OptionTypeOptionsInterface');
declare class OptionType extends FieldType {
    protected setDefaultOptions(options: OptionTypeOptionsInterface): OptionTypeOptionsInterface;
}
export = OptionType;
