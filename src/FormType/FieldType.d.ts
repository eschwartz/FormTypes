/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
import AbstractFormType = require('./AbstractFormType');
import FieldTypeOptionsInterface = require('../Options/FieldTypeOptionsInterface');
/**
 * Base class for all form fields
 */
declare class FieldType extends AbstractFormType {
    protected setDefaultOptions(options: FieldTypeOptionsInterface): FieldTypeOptionsInterface;
}
export = FieldType;
