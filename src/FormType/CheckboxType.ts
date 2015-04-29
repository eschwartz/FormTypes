///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import CheckboxTypeOptions = require('../Options/CheckboxTypeOptionsInterface');
import StringUtil = require('../Util/StringUtil');
import fs = require('fs');
import _ = require('underscore');

class CheckboxType extends FieldType {
  options:CheckboxTypeOptions;

  protected setDefaultOptions(options:CheckboxTypeOptions) {
    _.defaults(options, {
      tagName: 'input',
      type: 'checkbox',
      data: '',
      label: StringUtil.camelCaseToWords(options.data || ''),
      template: this.Handlebars.compile(
       fs.readFileSync(__dirname + '/../View/form/checkbox_widget.html.hbs', 'utf8')
      )
    });

    options = super.setDefaultOptions(options);

    options.attrs['type'] = 'checkbox';
    options.attrs['value'] = options.data;
    if (options.checked) {
      options.attrs['checked'] = true;
    }

    return options;
  }

  public render():CheckboxType {
    super.render();

    this.getFormElement().
      addEventListener('change', () => {
        this.emit('change');
      });

    return this;
  }

  public getFormElement():HTMLInputElement {
    return <HTMLInputElement>super.getFormElement();
  }

  public getData():string {
    var formElement = this.getFormElement();

    return formElement ? formElement.value : this.options.data;
  }

  public setData(data:string):void {
    var isSameData = data = this.getData();

    if (this.getFormElement()) {
      this.getFormElement().value = data;
    }

    this.options.data = data;

    if (!isSameData) {
      this.emit('change');
    }
  }

  public check() {
    if (this.getFormElement()) {
      this.getFormElement().checked = true;
    }

    this.options.attrs['checked'] = true;
  }

  public unCheck() {
    if (this.getFormElement()) {
      this.getFormElement().checked = false;
    }

    delete this.options.attrs['checked'];
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

  public isChecked():boolean {
    return this.getFormElement() ?
      this.getFormElement().checked : !!this.options.attrs['checked'];
  }
}
export = CheckboxType;
