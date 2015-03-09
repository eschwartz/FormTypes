///ts:ref=handlebars.ext.d.ts
/// <reference path="../../../typings/handlebars/handlebars.ext.d.ts"/> ///ts:ref:generated
import FormContextInterface = require('../Context/FormContextInterface');
import Handlebars = require('Handlebars');

class PartialWidgetHelper {
  public static register(HandlebarsEnv:HandlebarsStatic = Handlebars) {
    HandlebarsEnv.registerHelper('partial_widget', (form:FormContextInterface, options:any) => {
      var partial = form.type + '_widget';
      var template = HandlebarsEnv.partials[partial];

      if (!template) {
        throw new Error("Unable to find partial widget template " + partial);
      }

      var html = template({
        form: form
      });

      return new HandlebarsEnv.SafeString(html);
    });
  }
}


export = PartialWidgetHelper;