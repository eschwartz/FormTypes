/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
import AbstractFormType = require('./AbstractFormType');
import FieldType = require('./FieldType');
import ChoiceTypeOptionsInterface = require('../Options/ChoiceTypeOptionsInterface');
declare class ChoiceType extends FieldType {
    render(): ChoiceType;
    protected appendChildType(childType: AbstractFormType): void;
    protected setDefaultOptions(options: ChoiceTypeOptionsInterface): ChoiceTypeOptionsInterface;
    getData(): string;
    setData(data: string): void;
}
export = ChoiceType;
