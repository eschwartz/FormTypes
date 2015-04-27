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

class MultiChoiceType extends FieldType {
  protected children:CheckboxType[];
  protected options:MultiChoiceTypeOptions;

  public constructor(options?:MultiChoiceTypeOptions) {
    super(options);

    this.setChoices(this.options.choices);
  }

  protected setDefaultOptions(options:MultiChoiceTypeOptions):MultiChoiceTypeOptions {
    _.defaults(options, {
      tagName: 'div',
      type: 'multi_choice',
      choices: {}
    });

    return super.setDefaultOptions(options);
  }

  public setChoices(choices:_.Dictionary<string>):void {
    var data = this.getData();

    // Remove all children
    this.children.forEach((child:AbstractFormType) => this.removeChild(child));

    // Add new children
    _.each(choices, (value:string, key:string) => {
      this.addChild(new CheckboxType({
        data: key,
        label: value,
        checked: _.contains(data, key)
      }));
    });
  }

  public getData():string[] {
    if (!this.getFormElement()) {
      return this.options.data;
    }

    return this.children.
      filter((child:CheckboxType) => child.isChecked()).
      map((child:CheckboxType) => child.getData());
  }

  public setData(data:string[]):void {
    var isSameData = _.isEqual(data, this.getData());

    if (isSameData) {
      return;
    }

    // Update child checkboxes fro mdata
    this.children.forEach((child:CheckboxType) => {
      if (_.contains(data, child.getData())) {
        child.check();
      }
      else {
        child.unCheck();
      }
    });

    this.options.data = data;

    this.emit('change');
  }

  protected addChildElement(childType:AbstractFormType) {
    this.getFormElement().appendChild(childType.el);
  }

}
export = MultiChoiceType;