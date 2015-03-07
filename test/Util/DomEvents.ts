class DomEvents {

  public static dispatchInputEvent(el:HTMLInputElement, value) {
    var event:Event = <Event>document.createEvent('Event');
    event.initEvent('input', true, true);

    el.value = value;
    el.dispatchEvent(event);
  }

  public static dispatchChangeEvent(el:any, value) {
    var event:Event = <Event>document.createEvent('Event');
    event.initEvent('change', true, true);

    el.value = value;
    el.dispatchEvent(event);
  }
}

export = DomEvents;