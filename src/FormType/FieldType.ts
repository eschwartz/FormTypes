import AbstractFormType = require('./AbstractFormType');
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import StringUtil = require('../Util/StringUtil');


/**
 * Base class for all form fields
 */
class FieldType extends AbstractFormType {

  protected setDefaultOptions(options:FormTypeOptionsInterface):FormTypeOptionsInterface {
    var options = super.setDefaultOptions(options);

    return _.defaults(options, {
      type: 'field',
      label: StringUtil.camelCaseToWords(options.name),
      labelAttrs: {}
    });
  }

}

export = FieldType;