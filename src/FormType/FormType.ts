import AbstractFormType = require('./AbstractFormType');

class FormType extends AbstractFormType{

  public render():FormType {
    this.el = document.createElement('form');
    return this;
  }
}

export = FormType;