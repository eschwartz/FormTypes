///ts:ref=handlebars.d.ts
/// <reference path="../../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
import TemplateHelperInterface = require('./TemplateHelperInterface');
import FormContextInterface = require('../Context/FormContextInterface');
import Handlebars = require('handlebars');

var PartialWidgetFactory = function(Handlebars:HandlebarsStatic):TemplateHelperInterface {
  return function(form:FormContextInterface) {
    var partial = form.type + '_widget';
    var partialTemplate = Handlebars.partials[partial];

    if (!partialTemplate) {
      throw new Error('Unable to find partial for form of type ' + form.type);
    }

    return partialTemplate(form);
  };
};


export = PartialWidgetFactory;