import HtmlEventsInterface = require('./HtmlEventsInterface');

var HtmlEvents:HtmlEventsInterface = {
  addEventListener: function(element:HTMLElement, type:string, listener:(evt:Event) => any, useCapture?:boolean):void {
    element.addEventListener(type, listener, useCapture);
  }
};

export = HtmlEvents;