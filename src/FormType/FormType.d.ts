/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
import AbstractFormType = require('./AbstractFormType');
import _ = require('underscore');
declare class FormType extends AbstractFormType {
    getData(): _.Dictionary<any>;
    setData(data: _.Dictionary<any>): void;
}
export = FormType;
