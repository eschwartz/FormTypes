//ts:ref=node.d.ts
import AbstractFormType = require('./FormType/AbstractFormType');
import GroupType = require('./FormType/GroupType');
import FormType = require('./FormType/FormType');
import FieldType = require('./FormType/FieldType');
import TextType = require('./FormType/TextType');
import ChoiceType = require('./FormType/ChoiceType');
import OptionType = require('./FormType/OptionType');
import LabelType = require('./FormType/LabelType');
import ListType = require('./FormType/ListType');
import SubmitType = require('./FormType/SubmitType');
import MultiChoiceType = require('./FormType/MultiChoiceType');
import CheckboxType = require('./FormType/CheckboxType');

var FormTypeExports = {
  AbstractFormType: AbstractFormType,
  GroupType: GroupType,
  FormType: FormType,
  FieldType: FieldType,
  TextType: TextType,
  ChoiceType: ChoiceType,
  OptionType: OptionType,
  MultiChoiceType: MultiChoiceType,
  CheckboxType: CheckboxType,
  LabelType: LabelType,
  ListType: ListType,
  SubmitType: SubmitType
};
global.FormTypes = FormTypeExports;
export = FormTypeExports;