///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import _ = require('underscore');

class FormType extends AbstractFormType {
  public getData():_.Dictionary<any> {
    var data:_.Dictionary<any> = {};

    this.children.forEach((formType:AbstractFormType) => {
      data[formType.getName()] = formType.getData();
    });

    return data;
  }

  public setData(data:_.Dictionary<any>):void {
    _.each(data, (val, key) => {
      var child = this.getChild(key);

      if (!child) {
        return;
      }

      child.setData(data[key]);
    });
  }
}

export = FormType;