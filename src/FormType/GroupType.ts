///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import _ = require('underscore');
import Handlebars = require('Handlebars');
import fs = require('fs');


class GroupType extends AbstractFormType {

  protected setDefaultOptions(options:FormTypeOptionsInterface):FormTypeOptionsInterface {
    _.defaults(options, {
      type: 'group',
      tagName: 'div',
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/field_widget.html.hbs', 'utf8')
      )
    });

    return options;
  }

  public getData():_.Dictionary<any> {
    var data:_.Dictionary<any> = {};

    this.children.forEach((formType:AbstractFormType) => {
      if (formType.hasData()) {
        data[formType.getName()] = formType.getData();
      }
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

export = GroupType;