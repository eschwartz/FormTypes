/// <reference path="../../../typings/generated/node/node.d.ts" />
/// <reference path="../../../typings/generated/handlebars/handlebars.d.ts" />
import FormTemplateCollectionInterface = require('./FormTemplateCollectionInterface');
import TemplateInterface = require('./TemplateInterface');
/**
 * Default form templates.
 */
declare class FormTemplateCollection implements FormTemplateCollectionInterface {
    [index: string]: any;
    protected templateCache: TemplateInterface[];
    protected Handlebars: HandlebarsStatic;
    constructor(HandlebarsEnv?: HandlebarsStatic);
    form: TemplateInterface;
    form_widget: TemplateInterface;
    form_start: TemplateInterface;
    form_end: TemplateInterface;
    form_rows: TemplateInterface;
    html_attrs: TemplateInterface;
    field_widget: TemplateInterface;
    text_widget: TemplateInterface;
    option_widget: TemplateInterface;
    choice_widget: TemplateInterface;
    protected getTemplate(name: string, templateString: string): any;
    protected registerDefaultHelpers(): void;
    setHandlebars(HandleBars: HandlebarsStatic): void;
}
export = FormTemplateCollection;
