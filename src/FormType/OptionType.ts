///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import OptionTypeOptionsInterface = require('../Options/OptionTypeOptionsInterface');
import StringUtil = require('../Util/StringUtil');
import _ = require('underscore');
import Handlebars = require('Handlebars');
import fs = require('fs');

class OptionType extends FieldType {
  protected setDefaultOptions(options:OptionTypeOptionsInterface) {
    _.defaults(options, {
      tagName: 'option',
      type: 'option',
      data: '',
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/option_widget.html.hbs', 'utf8')
      )
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
