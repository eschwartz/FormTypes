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
  protected children:OptionType[];

  public render():ChoiceType {
    super.render();

    this.getFormElement().
      addEventListener('change', () => {
        this.eventEmitter.emit('change');
      });

    return this;
  }

  public getFormElement():HTMLSelectElement {
    return <HTMLSelectElement>super.getFormElement();
  }

  protected addChildElement(childType:AbstractFormType) {
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
    var selectedChild = _.find(this.children, (child:OptionType) => child.isSelected());

    return selectedChild ? selectedChild.getData() : this.options.data;
  }

  public setData(data:string):void {
    var isSameData = data === this.getData();

    this.children.forEach((child:OptionType) => {
      if (child.getData() === data.toString()) {
        child.select();
      }
      else {
        child.deselect();
      }
    });

    this.options.data = data;

    if (!isSameData) {
      this.eventEmitter.emit('change');
    }
  }

  public disableOption(optionValue:string) {
    var option = this.getOptionElement(optionValue);

    if (!option) {
      throw new Error('Unable to disable option ' + optionValue +
      ': the option does not exist');
    }

    option.disabled = true;

    if (option.selected) {
      option.selected = false;
      this.getFormElement().selectedIndex = -1;
    }
  }

  public enableOption(optionValue:string) {
    var option = this.getOptionElement(optionValue);

    if (!option) {
      throw new Error('Unable to enable option ' + optionValue +
      ': the option does not exist');
    }

    option.disabled = false;
  }

  protected getOptionElement(value:string):HTMLOptionElement {
    var selectEl = this.getFormElement();
    var filterOpts = Array.prototype.filter.bind(selectEl.childNodes);

    var matchingOptions = filterOpts((option:HTMLOptionElement) => {
      return option.value === value;
    });

    return matchingOptions.length ? matchingOptions[0] : null;
  }

}

export = ChoiceType;
