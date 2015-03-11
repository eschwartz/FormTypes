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

  public getFormElement():HTMLOptionElement {
    return <HTMLOptionElement>super.getFormElement();
  }

  public getData():string {
    var formEl = <HTMLOptionElement>this.getFormElement();

    return formEl ? formEl.value : this.options.data;
  }

  public setData(data:string):void {
    var formEl = <HTMLOptionElement>this.getFormElement();
    var isSame = data === this.getData();

    if (!formEl) {
      this.options.data = data;
    }
    else {
      formEl.value = data;
    }

    if (!isSame) {
      this.eventEmitter.emit('change');
    }
  }

  public select() {
    if (this.getFormElement()) {
      this.getFormElement().selected = true;
    }

    this.options.attrs['selected'] = true;
  }

  public deselect() {
    if (this.getFormElement()) {
      this.getFormElement().removeAttribute('disabled');
    }

    delete this.options.attrs['selected'];
  }

  public enable() {
    if (this.getFormElement()) {
      this.getFormElement().removeAttribute('disabled');
    }

    delete this.options.attrs['disabled'];
  }

  public disable() {
    if (this.getFormElement()) {
      this.getFormElement().disabled = true;
    }

    this.options.attrs['disabled'] = true;
  }

  public isSelected():boolean {
    return this.getFormElement() ?
      this.getFormElement().selected : !!this.options.attrs['selected'];
  }
}

export = OptionType;
