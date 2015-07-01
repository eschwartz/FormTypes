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
import whenIn = require('../Util/whenIn');

class OptionType extends FieldType {
  protected options:OptionTypeOptionsInterface;

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

  public update(state) {
    super.update(state);
    whenIn(state, {
      selected: isSelected => isSelected ?
        this.getFormElement().selected = true :
        this.getFormElement().removeAttribute('selected'),
      disabled: isDisabled => isDisabled ?
        this.getFormElement().disabled = true :
        this.getFormElement().removeAttribute('disabled'),
      value: value => this.getFormElement().value = value
    });
  }

  public getFormElement():HTMLOptionElement {
    return <HTMLOptionElement>super.getFormElement();
  }

  public getData():string {
    return this.state.value;
  }

  public setData(data:string):void {
    var isSame = data === this.getData();

    if (!isSame) {
      this.setState({
        value: data
      });
      this.emit('change');
    }
  }

  public select() {
    this.setState({
      selected: true
    });
  }

  public deselect() {
    this.setState({
      selected: false
    });
  }

  public enable() {
    this.setState({
      disabled: false
    });
  }

  public disable() {
    this.setState({
      disabled: true
    });
  }

  public isSelected():boolean {
    return !!this.state.selected;
  }
}

export = OptionType;
