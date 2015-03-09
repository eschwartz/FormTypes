import AbstractFormType = require('./FormType/AbstractFormType');
import FormType = require('./FormType/FormType');
import FieldType = require('./FormType/FieldType');
import TextType = require('./FormType/TextType');
import ChoiceType = require('./FormType/ChoiceType');
import OptionType = require('./FormType/OptionType');

var FormTypeExports = {
  AbstractFormType: AbstractFormType,
  FormType: FormType,
  FieldType: FieldType,
  TextType: TextType,
  ChoiceType: ChoiceType,
  OptionType: OptionType
};
export = FormTypeExports;