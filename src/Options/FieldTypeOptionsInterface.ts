///<reference path="../../typings/generated/underscore/underscore.d.ts"/>
import FormTypeOptionsInterface = require('./FormTypeOptionsInterface');
import _ = require('underscore');

interface FieldTypeOptionsInterface extends FormTypeOptionsInterface {
  label?:string;
  labelAttrs?:_.Dictionary<string>;
}

export = FieldTypeOptionsInterface;