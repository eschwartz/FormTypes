interface HtmlEventsInterface {
  addEventListener(element:HTMLElement, type:string, listener:(evt:Event) => any, useCapture?:boolean):void;
}

export = HtmlEventsInterface;