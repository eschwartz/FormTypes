///ts:ref=jquery.d.ts
/// <reference path="../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:import=HtmlEventsInterface
import HtmlEventsInterface = require('../../src/Util/HtmlEventsInterface'); ///ts:import:generated
import $ = require('jquery');

var JQueryHtmlEvents:HtmlEventsInterface = {
  addEventListener: function(element:HTMLElement, type:string, listener:(evt:Event) => any, useCapture?:boolean):void {
    $(element).on(type, listener);
  }
};

export = JQueryHtmlEvents;