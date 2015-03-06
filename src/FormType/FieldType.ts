///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import FieldTypeOptionsInterface = require('../Options/FieldTypeOptionsInterface');
import StringUtil = require('../Util/StringUtil');
import _ = require('underscore');


/**
 * Base class for all form fields
 */
class FieldType extends AbstractFormType {

  protected setDefaultOptions(options:FieldTypeOptionsInterface):FieldTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'input',
      type: 'field',
      label: null,   // to be defaulted below, after we have name option
      labelAttrs: {}
    });

    options = super.setDefaultOptions(options);

    options.label || (options.label = StringUtil.camelCaseToWords(options.name));

    return options;
  }

}

export = FieldType;