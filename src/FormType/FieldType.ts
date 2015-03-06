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
    var uniqueId:string;

    _.defaults(options, {
      tagName: 'input',
      type: 'field',
      label: null,   // to be defaulted below, after we have name option
      labelAttrs: {}
    });

    options = super.setDefaultOptions(options);

    options.label || (options.label = StringUtil.camelCaseToWords(options.name));

    // Set the `for`/`id` matching attributes
    uniqueId = _.uniqueId(options.name + '_');
    _.defaults(options.attrs, {
      id: uniqueId
    });
    _.defaults(options.labelAttrs, {
      'for': uniqueId
    });

    return options;
  }

}

export = FieldType;