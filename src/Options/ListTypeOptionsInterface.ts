import FieldTypeOptionsInterface = require('./FieldTypeOptionsInterface');
import AbstractFormType = require('../FormType/AbstractFormType');
import TemplateInterface = require('../View/Template/TemplateInterface');

interface ListTypeOptionsInterface extends FieldTypeOptionsInterface {
  ItemType?:typeof AbstractFormType;
  data?:any[];
  itemTypeOptions?:any;

  /**
   * A template for the item type
   */
  itemTemplate?:TemplateInterface;

  /**
   * A CSS Selector for the item type container.
   *
   * For example, if your itemTemplate looks like this:
   *
   * <li>
   *   <label>Here comes another item</label>
   *   <div class="item-container">
   *      // I want my form item to go here
   *   </div>
   * </li>
   *
   * You're itemContainerSelector would be 'div.item-container'
   */
  itemContainerSelector?:string;
}

export = ListTypeOptionsInterface;