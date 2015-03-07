///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import FieldTypeOptionsInterface = require('../Options/FieldTypeOptionsInterface');
import _ = require('underscore');

class TextType extends FieldType {

  public render():TextType {
    super.render();

    // Trigger change on 'input' events.
    this.getFormElement()
      .addEventListener('input', () => {
        this.eventEmitter.emit('change');
      });

    return this;
  }

  protected setDefaultOptions(options:FieldTypeOptionsInterface):FieldTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'input',
      type: 'text',
      data: ''
    });


    options = super.setDefaultOptions(options);

    _.defaults(options.attrs, {
      value: options.data
    });

    return options;
  }


  public getData():string {
    var input = <HTMLInputElement>this.getFormElement();

    return input ? input.value : this.options.data;
  }

}

export = TextType;