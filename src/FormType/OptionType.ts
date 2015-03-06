///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import OptionTypeOptionsInterface = require('../Options/OptionTypeOptionsInterface');
import StringUtil = require('../Util/StringUtil');
import _ = require('underscore');

class OptionType extends FieldType {
  protected setDefaultOptions(options:OptionTypeOptionsInterface) {
    _.defaults(options, {
      tagName: 'option',
      type: 'option',
      data: ''
    });

    if (!options.label) {
      options.label = StringUtil.camelCaseToWords(options.data);
    }

    options = super.setDefaultOptions(options);

    if (options.selected) {
      _.defaults(options.attrs, {
        selected: true
      });
    }

    return options;
  }
}

export = OptionType;
