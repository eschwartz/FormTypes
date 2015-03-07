import AbstractFormType = require('./AbstractFormType');

class FormType extends AbstractFormType {
  public getData():_.Dictionary<any> {
    var data:_.Dictionary<any> = {};

    this.children.forEach((formType:AbstractFormType) => {
      data[formType.getName()] = formType.getData();
    });

    return data;
  }
}

export = FormType;