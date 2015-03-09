import AbstractFormType = require('./FormType/AbstractFormType');
import FormType = require('./FormType/FormType');
import FieldType = require('./FormType/FieldType');
import TextType = require('./FormType/TextType');
import ChoiceType = require('./FormType/ChoiceType');
import OptionType = require('./FormType/OptionType');
declare var FormTypeExports: {
    AbstractFormType: typeof AbstractFormType;
    FormType: typeof FormType;
    FieldType: typeof FieldType;
    TextType: typeof TextType;
    ChoiceType: typeof ChoiceType;
    OptionType: typeof OptionType;
};
export = FormTypeExports;
