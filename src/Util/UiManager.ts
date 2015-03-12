///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
import _ = require('underscore');
interface EventListener {
  (evt:any):any;
}

class UiManager {
  /** Hash of named UI elements to CSS selectors */
  protected uiHash:_.Dictionary<string>;
  protected scopeEl:HTMLElement;

  protected listeners:_.Dictionary<EventListener>;

  constructor(scopeEl:HTMLElement, uiHash?:_.Dictionary<string>) {
    this.scopeEl = scopeEl;
    this.uiHash = uiHash;
    this.listeners = {};
  }

  public set(uiHash:_.Dictionary<string>) {
    this.uiHash = uiHash;
  }

  public get(uiName:string):HTMLElement {
    if (!this.uiHash[uiName]) {
      return undefined;
    }

    return <HTMLElement>this.scopeEl.
      querySelector(this.getUiSelector(uiName));
  }

  public delegateEvents(events:_.Dictionary<EventListener>) {
    _.each(events, (listener:EventListener, eventStr:string) => {
      var delegateListener:EventListener;
      var eventParts = this.parseEventString(eventStr);
      var eventType = eventParts[0];
      var targetUiName = eventParts[1];

      // No target ui: use scope element
      if (!targetUiName) {
        this.scopeEl.addEventListener(eventType, listener);

        // Save the listener, so we can remove it later
        this.listeners[eventStr] = listener;
      }
      // Has target ui: delegate event to target
      else {
        targetUiName = eventParts[1];
        this.scopeEl.addEventListener(eventType, delegateListener = (evt:any) => {
          var target = this.get(targetUiName);
          if (evt.target.isEqualNode(target)) {
            listener(evt);
          }
        });

        this.listeners[eventStr] = delegateListener;
      }
    });
  }

  /**
   * Return eg: ['click', 'myNamedUi'], or ['click', null] (for scopeEl)
   */
  private parseEventString(eventString:string):string[] {
    var eventType:string, targetUiName:string;
    var eventParts = eventString.split(' ');

    eventType = eventParts[0];
    targetUiName = eventParts[1] ? eventParts[1] : null;

    return [eventType, targetUiName];
  }

  public undelegateEvent(eventStr:string) {
    var listener:EventListener = this.listeners[eventStr];
    var eventType = this.parseEventString(eventStr)[0];

    if (!listener) {
      return;
    }

    this.scopeEl.removeEventListener(eventType, listener);

    delete listener[eventStr];
  }

  public undelegateAllEvents() {
    var eventStrings = Object.keys(this.listeners);
    eventStrings.forEach((evtStr:string) => this.undelegateEvent(evtStr));
  }

  protected getUiSelector(uiName:string) {
    if (!this.uiHash[uiName]) {
      throw new Error('UiManager: unable to find ui element ' + uiName +
      '. Available ui: ' + Object.keys(this.uiHash).join(', ') + '.');
    }

    return this.uiHash[uiName];
  }
}

export = UiManager;