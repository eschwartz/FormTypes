///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import OptionType = require('./OptionType');
import ChoiceTypeOptionsInterface = require('../Options/ChoiceTypeOptionsInterface');
import _ = require('underscore');

class ChoiceType extends FieldType {

  protected setDefaultOptions(options:ChoiceTypeOptionsInterface) {
    _.defaults(options, {
      tagName: 'select',
      type: 'choice',
      choices: {}
    });

    options.children = [];
    _.each(options.choices, (value:string, key:string) => {
      var optionType = new OptionType({
        data: key,
        label: value,
        selected: options.data === key
      });

      options.children.push(optionType);
    });

    return super.setDefaultOptions(options);
  }

}

export = ChoiceType;
