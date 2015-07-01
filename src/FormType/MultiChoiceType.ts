///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import FieldType = require('./FieldType');
import _ = require('underscore');
import MultiChoiceTypeOptions = require('../Options/MultiChoiceTypeOptionsInterface');
import CheckboxType = require('./CheckboxType');
import whenIn = require('../Util/whenIn');

class MultiChoiceType extends FieldType {
  protected children:CheckboxType[];
  protected options:MultiChoiceTypeOptions;

  protected setDefaultOptions(options:MultiChoiceTypeOptions):MultiChoiceTypeOptions {
    _.defaults(options, {
      tagName: 'div',
      type: 'multi_choice',
      choices: {},
      data: []
    });

    // Create child Checkbox types from choices
    options.children = _.map(options.choices, (label, name) => new CheckboxType({
        name: name,
        label: label
      }));

    return super.setDefaultOptions(options);
  }

  public getData():string[] {
    return this.children.
      filter((child:CheckboxType) => child.isChecked()).
      map((child:CheckboxType) => child.getName());
  }

  public setData(data:string[]):void {
    var isSameData = _.isEqual(data, this.getData());

    if (isSameData) {
      return;
    }

    // Update child checkboxes fro mdata
    this.children.forEach((child:CheckboxType) => {
      if (_.contains(data, child.getName())) {
        child.check();
      }
      else {
        child.unCheck();
      }
    });

    this.emit('change');
  }

  protected addChildElement(childType:AbstractFormType) {
    this.getFormElement().appendChild(childType.el);
  }

}
export = MultiChoiceType;