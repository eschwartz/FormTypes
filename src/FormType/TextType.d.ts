/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
import FieldType = require('./FieldType');
import FieldTypeOptionsInterface = require('../Options/FieldTypeOptionsInterface');
declare class TextType extends FieldType {
    render(): TextType;
    protected setDefaultOptions(options: FieldTypeOptionsInterface): FieldTypeOptionsInterface;
    getData(): string;
    setData(data: string): void;
}
export = TextType;
