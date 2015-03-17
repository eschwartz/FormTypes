///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import GroupType = require('./GroupType');
import _ = require('underscore');
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import Handlebars = require('Handlebars');
import fs = require('fs');
import AbstractFormType = require('./AbstractFormType');

class FormType extends GroupType {

  public render() {
    super.render();

    this.HtmlEvents.
      addEventListener(this.getFormElement(), 'submit', () => this.emit('submit'));

    return this;
  }

  protected setDefaultOptions(options:FormTypeOptionsInterface):FormTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'form',
      type: 'form',
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/form_widget.html.hbs', 'utf8')
      )
    });

    return options;
  }

}

export = FormType;