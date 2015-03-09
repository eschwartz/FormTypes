/// <reference path="../../typings/generated/node/node.d.ts" />
/// <reference path="../../typings/generated/underscore/underscore.d.ts" />
/// <reference path="../../typings/handlebars/handlebars.ext.d.ts" />
import FormTypeOptionsInterface = require('../Options/FormTypeOptionsInterface');
import FormTemplateCollectionInterface = require('../View/Template/FormTemplateCollectionInterface');
import _ = require('underscore');
import FormContextInterface = require('../View/Context/FormContextInterface');
declare class AbstractFormType {
    el: HTMLElement;
    protected options: FormTypeOptionsInterface;
    protected templates: FormTemplateCollectionInterface;
    protected children: AbstractFormType[];
    protected Handlebars: HandlebarsStatic;
    protected eventEmitter: NodeJS.EventEmitter;
    protected isRenderedFlag: boolean;
    protected listeners: _.Dictionary<any>;
    protected listenerId: string;
    constructor(options?: FormTypeOptionsInterface);
    addChild(child: AbstractFormType): void;
    removeChild(name: string): void;
    getChild(name: string): AbstractFormType;
    render(): AbstractFormType;
    protected appendChildType(childType: AbstractFormType): void;
    /**
     * Remove a childType from the form's element
     * @param childType
     */
    protected removeChildType(childType: AbstractFormType): void;
    setTemplates(templates: FormTemplateCollectionInterface): void;
    protected setDefaultTemplates(templates?: FormTemplateCollectionInterface): void;
    protected createTemplateContext(): FormContextInterface;
    /**
     * Apply defaults to the options object.
     *
     * The returned object is set to this.options.
     */
    protected setDefaultOptions(options: FormTypeOptionsInterface): FormTypeOptionsInterface;
    protected createElementFromString(htmlString: string): HTMLElement;
    getName(): string;
    /**
     * Returns the element which is bound to the form.
     * For example, for a TextType, this would be the <input type="text" />
     * element.
     */
    getFormElement(): HTMLElement;
    isRendered(): boolean;
    getData(): any;
    setData(data: any): void;
    on(event: string, listener: Function, listenerId?: string): void;
    once(event: string, listener: Function, listenerId?: string): void;
    removeListener(event: string, listener: Function): void;
    removeAllListeners(event?: string): void;
    /**
     * When you bind to an event, you may optionally
     * specify a listenerId. This method removes all
     * listeners for that listenerId.
     *
     * @param listenerId
     */
    removeAllListenersById(listenerId: any): void;
}
export = AbstractFormType;
