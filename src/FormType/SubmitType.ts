///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import AbstractFormType = require('./AbstractFormType');
import SubmitTypeOptionsInterface = require('../Options/SubmitTypeOptionInterface');
import _ = require('underscore');
import fs = require('fs');

class SubmitType extends AbstractFormType {

  public constructor(options?:SubmitTypeOptionsInterface) {
    super(options);
  }

  public render():SubmitType {
    super.render();

    this.getFormElement().
      addEventListener('click', (evt:MouseEvent) => {
        this.emit('submit');
        evt.preventDefault();
      });

    return this;
  }

  public hasData():boolean {
    // Prevents parent Types from attempting
    // to parse SubmitType data
    return false;
  }

  public getFormElement():HTMLInputElement {
    return <HTMLInputElement>super.getFormElement();
  }

  protected setDefaultOptions(options:SubmitTypeOptionsInterface):SubmitTypeOptionsInterface {
    _.defaults(options, {
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/simple_widget.html.hbs', 'utf8')
      ),
      tagName: 'input',
      attrs: {},
      label: 'Submit'
    });
    _.defaults(options.attrs, {
      value: options.label,
      type: 'submit'
    });

    return <SubmitTypeOptionsInterface>super.setDefaultOptions(options);
  }

}

export = SubmitType;