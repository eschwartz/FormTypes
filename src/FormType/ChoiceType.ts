///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import FieldType = require('./FieldType');
import OptionType = require('./OptionType');
import ChoiceTypeOptionsInterface = require('../Options/ChoiceTypeOptionsInterface');
import _ = require('underscore');
import Handlebars = require('Handlebars');
import fs = require('fs');

class ChoiceType extends FieldType {

  public render():ChoiceType {
    super.render();

    this.getFormElement().
      addEventListener('change', () => {
        this.eventEmitter.emit('change');
      });

    return this;
  }

  protected appendChildType(childType:AbstractFormType) {
    this.getFormElement().appendChild(childType.el);
  }

  protected setDefaultOptions(options:ChoiceTypeOptionsInterface):ChoiceTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'select',
      type: 'choice',
      choices: {},
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/choice_widget.html.hbs', 'utf8')
      )
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

  public getData():string {
    var $select = <HTMLSelectElement>this.getFormElement();

    return $select ? $select.value : this.options.data;
  }

  public setData(data:string):void {
    var select = <HTMLSelectElement>this.getFormElement();
    var isSameData = data === this.getData();

    if (isSameData) {
      return;
    }

    if (!select) {
      this.options.data = data;
    }
    else {
      select.value = data;
    }

    this.eventEmitter.emit('change');
  }

}

export = ChoiceType;
