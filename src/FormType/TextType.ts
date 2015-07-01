///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import ServiceContainer = require('../Service/ServiceContainer');
import FieldTypeOptionsInterface = require('../Options/FieldTypeOptionsInterface');
import _ = require('underscore');
import fs = require('fs');

class TextType extends FieldType {

  public render():TextType {
    super.render();

    // Trigger change on 'input' events.
    ServiceContainer.HtmlEvents.
      addEventListener(this.getFormElement(), 'input', () => {
        this.setData(this.getFormElement().value);
        this.emit('change');
      });

    return this;
  }

  public getFormElement():HTMLInputElement {
    return <HTMLInputElement>super.getFormElement();
  }

  protected update(changedState) {
    if ('value' in changedState) {
      this.getFormElement().value = changedState.value;
    }
  }

  protected setDefaultOptions(options:FieldTypeOptionsInterface):FieldTypeOptionsInterface {
    _.defaults(options, {
      tagName: 'input',
      data: '',
      template: this.Handlebars.compile('{{>field_widget}}')
    });


    options = super.setDefaultOptions(options);

    _.defaults(options.attrs, {
      type: 'text'
    });

    return options;
  }

  protected createTemplateContext() {
    var context = super.createTemplateContext();
    context.attrs['value'] = this.getData();

    return context;
  }


  public getData():string {
    return this.state.value;
  }

  public setData(data:string):void {
    var isSame = data === this.getData();

    if (isSame) {
      return;
    }

    this.setState({
      value: data
    });

    this.emit('change');
  }

}

export = TextType;