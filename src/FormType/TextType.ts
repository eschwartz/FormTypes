///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import FieldTypeOptionsInterface = require('../Options/FieldTypeOptionsInterface');
import _ = require('underscore');

class TextType extends FieldType {

  protected setDefaultOptions(options:FieldTypeOptionsInterface):FieldTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'input',
      type: 'text',
      data: ''
    });


    options = super.setDefaultOptions(options);

    _.defaults(options.attrs, {
      value: options.data
    });

    return options;
  }

}

export = TextType;