///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import ServiceContainer = require('../Service/ServiceContainer');
import FieldType = require('./FieldType');
import OptionType = require('./OptionType');
import ChoiceTypeOptionsInterface = require('../Options/ChoiceTypeOptionsInterface');
import _ = require('underscore');
import Handlebars = require('Handlebars');
import fs = require('fs');

class ChoiceType extends FieldType {
  protected children:OptionType[];
  protected options:ChoiceTypeOptionsInterface;

  public render():ChoiceType {
    super.render();

    ServiceContainer.HtmlEvents.
      addEventListener(this.getFormElement(), 'change', () => {
        this.setData(this.getFormElement().value);
      });


    return this;
  }

  public update(state) {
    super.update(state);

    if ('selected' in state) {
      if (state.selected === null) {
        this.getFormElement().selectedIndex = -1;
      }
      else {
        this.getFormElement().value = state.selected;
      }
    }
    if ('disabled' in state) {
      this.children.forEach(child => {
        if (_.contains(state.disabled, child.getData())) {
          child.disable();
        }
        else {
          child.enable();
        }
      });

      // Deselected disabled option
      if (_.contains(state.disabled, this.getData())) {
        this.getFormElement().selectedIndex = -1;
      }
    }
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
      data: null,
      choices: {},
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/choice_widget.html.hbs', 'utf8')
      )
    });

    options.children = _.map(options.choices, (label, key) => new OptionType({
      data: key,
      label: label
    }));

    return super.setDefaultOptions(options);
  }

  public getData():string {
    return this.state.selected;
  }

  public setData(data:string):void {
    var isSameData = data === this.getData();

    data = data ? data.toString() : data;

    if (!isSameData) {
      this.setState({
        selected: data
      });
      this.emit('change');
    }
  }

  public disableOption(optionValue:string) {
    this.setState({
      disabled: (this.state.disabled || []).concat(optionValue)
    });
  }

  public enableOption(optionValue:string) {
    this.setState({
      disabled: _.without(this.state.disabled || [], optionValue)
    });
  }

  protected getOption(value:string):OptionType {
    var matchingOptions = this.children.
      filter((child:OptionType) => child.getData() === value);

    return matchingOptions.length ? matchingOptions[0] : null;
  }

}

export = ChoiceType;
