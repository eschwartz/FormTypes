///ts:ref=handlebars.d.ts
/// <reference path="../../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
import TemplateHelperInterface = require('./TemplateHelperInterface');
import FormContextInterface = require('../Context/FormContextInterface');
import Handlebars = require('handlebars');

var PartialWidgetFactory = function(partials:any) {
  return function(form:FormContextInterface) {
    var partial = form.type + '_widget';
    var partialTemplate = partials[partial];

    if (!partialTemplate) {
      throw new Error('Unable to find partial for form of type ' + form.type + '.' +
        '(Looking for a partial named ' + partial + ')'
      );
    }

    var compiled:string = partialTemplate({
      form: form
    }, {
      partials: partials
    });
    return new Handlebars.SafeString(compiled);
  };
};


export = PartialWidgetFactory;