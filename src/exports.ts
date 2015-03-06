///ts:ref=node.d.ts
/// <reference path="../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import FormType = require('./FormType/FormType');
import FieldType = require('./FormType/FieldType');
import TextType = require('./FormType/TextType');
import ChoiceType = require('./FormType/ChoiceType');
import OptionType = require('./FormType/OptionType');

global.window.FormTypes = {
  FormType: FormType,
  FieldType: FieldType,
  TextType: TextType,
  ChoiceType: ChoiceType,
  OptionType: OptionType
};