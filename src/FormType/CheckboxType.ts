///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import ServiceContainer = require('../Service/ServiceContainer');
import CheckboxTypeOptions = require('../Options/CheckboxTypeOptionsInterface');
import StringUtil = require('../Util/StringUtil');
import whenIn = require('../Util/whenIn');
import fs = require('fs');
import _ = require('underscore');

class CheckboxType extends FieldType {
  options:CheckboxTypeOptions;

  protected setDefaultOptions(options:CheckboxTypeOptions) {
    _.defaults(options, {
      tagName: 'input',
      type: 'checkbox',
      data: false,
      label: StringUtil.camelCaseToWords(options.name || ''),
      template: this.Handlebars.compile('\
        {{#if form.label}}\
          <label {{>html_attrs form.labelAttrs}}>\
            {{>simple_widget this}} {{form.label}}\
          </label>\
        {{else}}\
          {{>simple_widget this}}\
        {{/if}}\
      ')
    });

    options = super.setDefaultOptions(options);

    options.attrs['type'] = 'checkbox';
    options.attrs['value'] = options.name;

    return options;
  }

  public render():CheckboxType {
    super.render();

    ServiceContainer.HtmlEvents.
      addEventListener(this.getFormElement(), 'change', () => {
        this.setData(!!this.getFormElement().checked);
      });

    return this;
  }

  public update(state) {
    super.update(state);
    whenIn(state, {
      checked: isChecked => this.getFormElement().checked = !!isChecked,
      disabled: isDisabled => this.getFormElement().disabled = !!isDisabled
    });
  }

  public getFormElement():HTMLInputElement {
    return <HTMLInputElement>super.getFormElement();
  }

  /** Returns true if the checkbox is checked */
  public getData():boolean {
    return this.isChecked();
  }

  public setData(data:boolean):void {
    var isSameData = data === this.getData();

    if (!isSameData) {
      this.setState({
        checked: data
      });
      this.emit('change');
    }
  }

  public check() {
    this.setState({
      checked: true
    });
  }

  public unCheck() {
    this.setState({
      checked: false
    });
  }

  public isChecked() {
    return !!this.state.checked;
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
}
export = CheckboxType;