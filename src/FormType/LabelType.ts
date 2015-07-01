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
      template: this.Handlebars.compile('\
        <{{form.tagName}} {{>html_attrs form.attrs}}></{{form.tagName}}>\
      ')
    });

    return super.setDefaultOptions(options);
  }

  public update(state) {
    if ('label' in state) {
      this.getFormElement().textContent = state.label;
    }
  }

  public getData():string {
    return this.state.label;
  }

  public setData(data:string):void {
    var isSameData = data === this.getData();

    if (isSameData) {
      return;
    }

    this.setState({
      label: data
    });

    this.emit('change');
  }

}

export = LabelType;