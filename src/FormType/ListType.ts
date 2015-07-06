///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=web-api.ext.d.ts
/// <reference path="../../typings/web-api/web-api.ext.d.ts"/> ///ts:ref:generated
import FieldType = require('./FieldType');
import TextType = require('./TextType');
import AbstractFormType = require('./AbstractFormType');
import ListTypeOptionsInterface = require('../Options/ListTypeOptionsInterface');
import FormContextInterface = require('../View/Context/FormContextInterface');
import TemplateInterface = require('../View/Template/TemplateInterface');
import fs = require('fs');
import _ = require('underscore');


class ListType extends FieldType {
  protected options:ListTypeOptionsInterface;
  protected ItemType:typeof AbstractFormType;
  protected itemTypeOptions:any;
  protected itemTemplate:TemplateInterface;
  protected itemContainerSelector:string;

  public constructor(options?:ListTypeOptionsInterface) {
    super(options);
  }

  public setDefaultOptions(options:ListTypeOptionsInterface):ListTypeOptionsInterface {
    var internalOptions:string[];
    _.defaults(options, {
      ItemType: TextType,
      itemTypeOptions: {},
      tagName: 'ul',
      data: [],
      label: null,
      template: this.Handlebars.compile('\
        {{#if form.label}}\
          <label {{>html_attrs form.labelAttrs}}>{{label}}</label>\
        {{/if}}\
        <{{form.tagName}} {{>html_attrs form.attrs}}></{{form.tagName}}>\
      '),
      itemTemplate: this.Handlebars.compile('<li></li>'),
      itemContainerSelector: 'li'
    });

    internalOptions = [
      'itemTemplate',
      'itemContainerSelector',
      'ItemType',
      'itemTypeOptions'
    ];
    _.extend(this, _.pick(options, internalOptions));
    options = _.omit(options, internalOptions);

    return super.setDefaultOptions(options);
  }

  /**
   * Note that this will remove any existing child form items.
   * Use `addData()` if you want to to keep existing form items.
   */
  public setData(data:any[]) {
    var oldData = this.getData();
    var isSameData = data.length === oldData.length &&
        data.every((item, index) => _.isEqual(item, oldData[index]));

    if (isSameData) {
      return;
    }

    // We're actually resetting the data, so we'll
    // remove what we've got, first.
    this.children.forEach(child => this.removeChild(child));

    data.
      map(item => this.createItemType(item)).
      forEach(child => this.addChild(child));

    this.emit('change');
  }

  public addData(dataItem:any) {
    this.addChild(this.createItemType(dataItem));

    this.emit('change');
  }

  public removeData(dataItem:any) {
    var child = this.children.filter(child => _.isEqual(child.getData(), dataItem))[0];

    if (!child) {
      return;
    }

    this.removeChild(child);

    this.emit('change');
  }

  protected createItemType(data?:any):AbstractFormType {
    var hasDataArg = data === void 0;
    var itemTypeOptions = _.extend({}, this.itemTypeOptions);

    if (!hasDataArg) {
      _.extend(itemTypeOptions, { data: data });
    }

    return new this.ItemType(itemTypeOptions);
  }

  public getData():any[] {
    return this.children.map((child:AbstractFormType) => {
      return child.getData();
    });
  }

  protected addChildElement(childType:AbstractFormType) {
    var itemEl = this.renderItem(childType);

    this.getFormElement().
      appendChild(itemEl);

    // Remove the item element when the child closes
    childType.on('close', () => {
      this.getFormElement().removeChild(itemEl);
    }, this.listenerId);
  }

  protected removeChildElement(child:AbstractFormType) {
    var childIndex = this.children.indexOf(child);

    var containerEl = this.getFormElement().
      querySelectorAll(this.itemContainerSelector).
      item(childIndex);

    containerEl.parentNode.removeChild(containerEl);
  }

  protected renderItem(childType:AbstractFormType):HTMLElement {
    var itemContainerHtml = this.itemTemplate({
      form: this.createTemplateContext()
    });
    var itemEl = this.createElementFromString(itemContainerHtml);
    var itemContainer = this.findItemContainer(itemEl);


    itemContainer.appendChild(childType.el);

    return itemContainer;
  }

  private findItemContainer(itemEl:HTMLElement):HTMLElement {
    var matchingContainers:NodeListOf<HTMLElement>;
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Browser_compatibility
    var itemElMatches = (
    itemEl.matches ||
    itemEl.msMatchesSelector ||
    itemEl.mozMatchesSelector ||
    itemEl.webkitMatchesSelector
    ).bind(itemEl);

    if (itemElMatches(this.itemContainerSelector)) {
      return itemEl;
    }

    matchingContainers = <NodeListOf<HTMLElement>>itemEl.querySelectorAll(this.itemContainerSelector);

    if (!matchingContainers.length) {
      throw new Error('Unable to find item container matching selector ' + this.itemContainerSelector);
    }

    return matchingContainers.item(0);
  }

  public getChildren():AbstractFormType[] {
    return this.children;
  }


}

export = ListType;