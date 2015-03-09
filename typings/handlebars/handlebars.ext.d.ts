///ts:ref=handlebars.d.ts
/// <reference path="../generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../generated/underscore/underscore.d.ts"/> ///ts:ref:generated
interface HandlebarsStatic extends HandlebarsCommon {
  parse(input: string): hbs.AST.ProgramNode;
  compile(input: any, options?: any): HandlebarsTemplateDelegate;
  create():HandlebarsStatic;
  partials:_.Dictionary<HandlebarsTemplateDelegate>;
}

declare module 'Handlebars' {
  export = Handlebars;
}