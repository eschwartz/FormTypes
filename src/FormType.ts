///<reference path="../typings/ref.d.ts" />

class FormType {
  public el:HTMLElement;

  public render():FormType {
    this.el = document.createElement('form');
    return this;
  }
}

export = FormType;