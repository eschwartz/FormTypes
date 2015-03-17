///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import _ = require('underscore');
import fs = require('fs');

class LabelType extends AbstractFormType {

  protected setDefaultOptions(options:FormTypeOptionsInterface):FormTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'label',
      type: 'label',
      data: '',
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/label_widget.html.hbs', 'utf8')
      )
    });

    return super.setDefaultOptions(options);
  }

  public getData() {
    var label = this.getFormElement();

    return label ? label.textContent : this.options.data;
  }

  public setData(data:string):void {
    var label = this.getFormElement();
    var isSameData = data === this.getData();

    if (isSameData) {
      return;
    }

    if (!label) {
      this.options.data = data;
    }
    else {
      label.textContent = data;
    }

    this.emit('change');
  }

}

export = LabelType;