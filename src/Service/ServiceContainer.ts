import HtmlEventsInterface = require('../Util/HtmlEventsInterface');
import HtmlEvents = require('../Util/HtmlEvents');
class ServiceContainer {
  public static HtmlEvents:HtmlEventsInterface = HtmlEvents;
}
export = ServiceContainer;