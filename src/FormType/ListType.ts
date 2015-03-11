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
  protected itemElements:HTMLElement[] = [];

  public constructor(options?:ListTypeOptionsInterface) {
    super(options);
    this.itemElements = [];
  }

  public setDefaultOptions(options:ListTypeOptionsInterface):ListTypeOptionsInterface {
    var internalOptions:string[];
    _.defaults(options, {
      ItemType: TextType,
      itemTypeOptions: {},
      tagName: 'ul',
      data: [],
      template: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/list_widget.html.hbs', 'utf8')
      ),
      itemTemplate: this.Handlebars.compile(
        fs.readFileSync(__dirname + '/../View/form/list_item_widget.html.hbs', 'utf8')
      ),
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

    return options;
  }

  /**
   * Note that this will remove any existing child form items.
   * Use `addData()` if you want to to keep existing form items.
   */
  public setData(data:any[]) {
    // We're actually resetting the data, so we'll
    // remove what we've got, first.
    this.children.forEach(this.removeChild, this);

    data.forEach(this.addData, this);
  }

  public addData(data:any) {
    var childType = this.createItemType(data);
    this.addChild(childType);
  }

  protected createItemType(data?:string):AbstractFormType {
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

    this.itemElements.push(itemEl);

    this.getFormElement().
      appendChild(itemEl);
  }

  protected removeChildElement(childType:AbstractFormType) {
    // find the matching item element
    var childIndex = this.children.indexOf(childType);
    var itemEl = this.itemElements[childIndex];

    this.el.removeChild(itemEl);

    this.itemElements.splice(childIndex, 1);
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