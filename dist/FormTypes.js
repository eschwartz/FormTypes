(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FormTypes = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
(function (global){
var FormTemplateCollection = require('../View/Template/FormTemplateCollection');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var Handlebars = (typeof window !== "undefined" ? window.Handlebars : typeof global !== "undefined" ? global.Handlebars : null);
var Events = require('events');
var AbstractFormType = (function () {
    function AbstractFormType(options) {
        if (options === void 0) { options = {}; }
        this.isRenderedFlag = false;
        this.Handlebars = Handlebars.create();
        this.eventEmitter = new Events.EventEmitter();
        this.listeners = {};
        this.listenerId = _.uniqueId('form_type_');
        this.el = this.createElementFromString('<div></div>');
        this.options = this.setDefaultOptions(_.clone(options));
        this.children = [];
        if (this.options.children) {
            this.options.children.forEach(this.addChild, this);
        }
        this.el = this.createElementFromString('<div></div>');
        this.setDefaultTemplates(options.templates);
    }
    AbstractFormType.prototype.addChild = function (child) {
        var _this = this;
        this.children.push(child);
        child.on('change', function () {
            _this.eventEmitter.emit('change');
            _this.eventEmitter.emit('change:' + child.getName());
        }, this.listenerId);
        if (this.isRendered()) {
            // Render child, if necessary
            if (!child.isRendered()) {
                child.render();
            }
            this.appendChildType(child);
        }
    };
    AbstractFormType.prototype.removeChild = function (name) {
        var child = this.getChild(name);
        if (!child) {
            return void 0;
        }
        this.removeChildType(child);
        child.removeAllListenersById(this.listenerId);
        this.children = _.without(this.children, child);
    };
    AbstractFormType.prototype.getChild = function (name) {
        return _.find(this.children, function (child) {
            return child.getName() === name;
        });
    };
    AbstractFormType.prototype.render = function () {
        var _this = this;
        var context = this.createTemplateContext();
        var html = this.templates.form({
            form: context
        });
        this.el = this.createElementFromString(html);
        this.children.forEach(function (formType) {
            formType.render();
            if (!formType.isRendered()) {
                formType.render();
            }
            _this.appendChildType(formType);
        });
        this.isRenderedFlag = true;
        return this;
    };
    AbstractFormType.prototype.appendChildType = function (childType) {
        this.el.appendChild(childType.el);
    };
    /**
     * Remove a childType from the form's element
     * @param childType
     */
    AbstractFormType.prototype.removeChildType = function (childType) {
        this.el.removeChild(childType.el);
    };
    AbstractFormType.prototype.setTemplates = function (templates) {
        var _this = this;
        _.each(templates, function (template, name) {
            _this.Handlebars.registerPartial(name, template);
        });
        this.templates = templates;
    };
    AbstractFormType.prototype.setDefaultTemplates = function (templates) {
        var defaultTemplates = new FormTemplateCollection(this.Handlebars);
        templates = _.defaults({}, templates || {}, {
            form: defaultTemplates.form,
            form_widget: defaultTemplates.form_widget,
            form_start: defaultTemplates.form_start,
            form_end: defaultTemplates.form_end,
            form_rows: defaultTemplates.form_rows,
            html_attrs: defaultTemplates.html_attrs,
            field_widget: defaultTemplates.field_widget,
            text_widget: defaultTemplates.text_widget,
            choice_widget: defaultTemplates.choice_widget,
            option_widget: defaultTemplates.option_widget
        });
        this.setTemplates(templates);
    };
    AbstractFormType.prototype.createTemplateContext = function () {
        var formContext = _.extend({}, this.options, {
            children: this.children.map(function (childForm) {
                var childContext = childForm.createTemplateContext();
                return childContext;
            })
        });
        return formContext;
    };
    /**
     * Apply defaults to the options object.
     *
     * The returned object is set to this.options.
     */
    AbstractFormType.prototype.setDefaultOptions = function (options) {
        var defaults = {
            tagName: 'form',
            type: 'form',
            name: _.uniqueId('form_'),
            attrs: {},
            data: null,
            children: []
        };
        _.defaults(options, defaults);
        _.defaults(options.attrs, {
            name: options.name
        });
        return options;
    };
    AbstractFormType.prototype.createElementFromString = function (htmlString) {
        var container = document.createElement('div');
        container.innerHTML = htmlString.trim();
        return container.childNodes.length === 1 ? container.firstChild : container;
    };
    AbstractFormType.prototype.getName = function () {
        return this.options.name;
    };
    /**
     * Returns the element which is bound to the form.
     * For example, for a TextType, this would be the <input type="text" />
     * element.
     */
    AbstractFormType.prototype.getFormElement = function () {
        var tagName = this.options.tagName;
        var isInputTopLevelElement = this.el.tagName.toLowerCase() === tagName;
        return (isInputTopLevelElement ? this.el : this.el.getElementsByTagName(tagName).item(0));
    };
    AbstractFormType.prototype.isRendered = function () {
        return this.isRenderedFlag;
    };
    AbstractFormType.prototype.getData = function () {
        throw new Error('Form of type "' + this.options.type + '" must implement a getData() method.');
    };
    AbstractFormType.prototype.setData = function (data) {
        throw new Error('Form of type "' + this.options.type + '" must implement a setData() method.');
    };
    AbstractFormType.prototype.on = function (event, listener, listenerId) {
        this.eventEmitter.on(event, listener);
        // Remember this listener, so we can remove it later
        if (listenerId) {
            this.listeners[listenerId] || (this.listeners[listenerId] = []);
            this.listeners[listenerId].push({
                event: event,
                listener: listener
            });
        }
    };
    AbstractFormType.prototype.once = function (event, listener, listenerId) {
        this.eventEmitter.once(event, listener);
        // Remember this listener, so we can remove it later
        if (listenerId) {
            this.listeners[listenerId] || (this.listeners[listenerId] = []);
            this.listeners[listenerId].push({
                event: event,
                listener: listener
            });
        }
    };
    AbstractFormType.prototype.removeListener = function (event, listener) {
        this.eventEmitter.removeListener(event, listener);
    };
    AbstractFormType.prototype.removeAllListeners = function (event) {
        this.eventEmitter.removeAllListeners(event);
    };
    /**
     * When you bind to an event, you may optionally
     * specify a listenerId. This method removes all
     * listeners for that listenerId.
     *
     * @param listenerId
     */
    AbstractFormType.prototype.removeAllListenersById = function (listenerId) {
        var _this = this;
        this.listeners[listenerId].forEach(function (listener) {
            _this.removeListener(listener.event, listener.listener);
        });
    };
    return AbstractFormType;
})();
module.exports = AbstractFormType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../View/Template/FormTemplateCollection":9,"events":1}],3:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FieldType = require('./FieldType');
var OptionType = require('./OptionType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var ChoiceType = (function (_super) {
    __extends(ChoiceType, _super);
    function ChoiceType() {
        _super.apply(this, arguments);
    }
    ChoiceType.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.getFormElement().addEventListener('change', function () {
            _this.eventEmitter.emit('change');
        });
        return this;
    };
    ChoiceType.prototype.appendChildType = function (childType) {
        this.getFormElement().appendChild(childType.el);
    };
    ChoiceType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'select',
            type: 'choice',
            choices: {}
        });
        options.children = [];
        _.each(options.choices, function (value, key) {
            var optionType = new OptionType({
                data: key,
                label: value,
                selected: options.data === key
            });
            options.children.push(optionType);
        });
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    ChoiceType.prototype.getData = function () {
        var $select = this.getFormElement();
        return $select ? $select.value : this.options.data;
    };
    ChoiceType.prototype.setData = function (data) {
        var select = this.getFormElement();
        var isSameData = data === this.getData();
        if (isSameData) {
            return;
        }
        if (!select) {
            this.options.data = data;
        }
        else {
            select.value = data;
        }
        this.eventEmitter.emit('change');
    };
    return ChoiceType;
})(FieldType);
module.exports = ChoiceType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./FieldType":4,"./OptionType":6}],4:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var AbstractFormType = require('./AbstractFormType');
var StringUtil = require('../Util/StringUtil');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
/**
 * Base class for all form fields
 */
var FieldType = (function (_super) {
    __extends(FieldType, _super);
    function FieldType() {
        _super.apply(this, arguments);
    }
    FieldType.prototype.setDefaultOptions = function (options) {
        var uniqueId;
        _.defaults(options, {
            tagName: 'input',
            type: 'field',
            label: null,
            labelAttrs: {}
        });
        options = _super.prototype.setDefaultOptions.call(this, options);
        options.label || (options.label = StringUtil.camelCaseToWords(options.name));
        // Set the `for`/`id` matching attributes
        uniqueId = _.uniqueId(options.name + '_');
        _.defaults(options.attrs, {
            id: uniqueId
        });
        _.defaults(options.labelAttrs, {
            'for': uniqueId
        });
        return options;
    };
    return FieldType;
})(AbstractFormType);
module.exports = FieldType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Util/StringUtil":8,"./AbstractFormType":2}],5:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var AbstractFormType = require('./AbstractFormType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var FormType = (function (_super) {
    __extends(FormType, _super);
    function FormType() {
        _super.apply(this, arguments);
    }
    FormType.prototype.getData = function () {
        var data = {};
        this.children.forEach(function (formType) {
            data[formType.getName()] = formType.getData();
        });
        return data;
    };
    FormType.prototype.setData = function (data) {
        var _this = this;
        _.each(data, function (val, key) {
            var child = _this.getChild(key);
            if (!child) {
                return;
            }
            child.setData(data[key]);
        });
    };
    return FormType;
})(AbstractFormType);
module.exports = FormType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AbstractFormType":2}],6:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var StringUtil = require('../Util/StringUtil');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var OptionType = (function (_super) {
    __extends(OptionType, _super);
    function OptionType() {
        _super.apply(this, arguments);
    }
    OptionType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'option',
            type: 'option',
            data: ''
        });
        if (!options.label) {
            options.label = StringUtil.camelCaseToWords(options.data);
        }
        options = _super.prototype.setDefaultOptions.call(this, options);
        if (options.selected) {
            _.defaults(options.attrs, {
                selected: true
            });
        }
        return options;
    };
    return OptionType;
})(FieldType);
module.exports = OptionType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Util/StringUtil":8,"./FieldType":4}],7:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var TextType = (function (_super) {
    __extends(TextType, _super);
    function TextType() {
        _super.apply(this, arguments);
    }
    TextType.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        // Trigger change on 'input' events.
        this.getFormElement().addEventListener('input', function () {
            _this.eventEmitter.emit('change');
        });
        return this;
    };
    TextType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'input',
            type: 'text',
            data: ''
        });
        options = _super.prototype.setDefaultOptions.call(this, options);
        _.defaults(options.attrs, {
            value: options.data
        });
        return options;
    };
    TextType.prototype.getData = function () {
        var input = this.getFormElement();
        return input ? input.value : this.options.data;
    };
    TextType.prototype.setData = function (data) {
        var input = this.getFormElement();
        var isSame = data === this.getData();
        if (isSame) {
            return;
        }
        if (!input) {
            this.options.data = data;
        }
        else {
            input.value = data;
        }
        this.eventEmitter.emit('change');
    };
    return TextType;
})(FieldType);
module.exports = TextType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./FieldType":4}],8:[function(require,module,exports){
var StringUtil = (function () {
    function StringUtil() {
    }
    StringUtil.camelCaseToWords = function (str) {
        // Thank you, StackOverflow
        // http://stackoverflow.com/a/4149393/830030
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
            return str.toUpperCase();
        });
    };
    return StringUtil;
})();
module.exports = StringUtil;

},{}],9:[function(require,module,exports){
(function (global){
var Handlebars = (typeof window !== "undefined" ? window.Handlebars : typeof global !== "undefined" ? global.Handlebars : null);

var PartialWidgetHelper = require('../TemplateHelper/PartialWidgetHelper');
/**
 * Default form templates.
 */
var FormTemplateCollection = (function () {
    function FormTemplateCollection(HandlebarsEnv) {
        if (HandlebarsEnv === void 0) { HandlebarsEnv = Handlebars; }
        this.Handlebars = HandlebarsEnv;
        this.templateCache = [];
        this.registerDefaultHelpers();
    }
    Object.defineProperty(FormTemplateCollection.prototype, "form", {
        get: function () {
            var templateString = "{{partial_widget form}}";
            return this.getTemplate('form', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "form_widget", {
        get: function () {
            var templateString = "<form {{>html_attrs form.attrs}}></form>";
            return this.getTemplate('form_widget', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "form_start", {
        get: function () {
            var templateString = "<form {{>html_attrs form.attrs}}>";
            return this.getTemplate('form_start', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "form_end", {
        get: function () {
            var templateString = "</form>";
            return this.getTemplate('form_end', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "form_rows", {
        get: function () {
            var templateString = "{{#each form.children }}\n  {{partial_widget this}}\n{{/each}}";
            return this.getTemplate('form_rows', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "html_attrs", {
        get: function () {
            var templateString = "{{#each this}}\n  {{@key}}=\"{{this}}\"\n{{/each}}";
            return this.getTemplate('html_attrs', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "field_widget", {
        get: function () {
            var templateString = "{{#if form.label}}\n  <label {{>html_attrs form.labelAttrs}}>\n    {{form.label}}\n  </label>\n{{/if}}\n\n<{{form.tagName}} {{>html_attrs form.attrs}} />\n";
            return this.getTemplate('field_widget', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "text_widget", {
        get: function () {
            var templateString = "{{>field_widget}}";
            return this.getTemplate('text_widget', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "option_widget", {
        get: function () {
            var templateString = "<option value=\"{{form.data}}\"\n  {{#if form.selected}}selected{{/if}}>\n    {{form.label}}\n</option>";
            return this.getTemplate('option_widget', templateString);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FormTemplateCollection.prototype, "choice_widget", {
        get: function () {
            var templateString = "{{#if form.label}}\n  <label {{>html_attrs form.labelAttrs}}>\n    {{form.label}}\n  </label>\n{{/if}}\n\n<select {{>html_attrs form.attrs}}></select>\n";
            return this.getTemplate('choice_widget', templateString);
        },
        enumerable: true,
        configurable: true
    });
    FormTemplateCollection.prototype.getTemplate = function (name, templateString) {
        if (this.templateCache[name]) {
            return this.templateCache[name];
        }
        return this.templateCache[name] = this.Handlebars.compile(templateString);
    };
    FormTemplateCollection.prototype.registerDefaultHelpers = function () {
        PartialWidgetHelper.register(this.Handlebars);
    };
    FormTemplateCollection.prototype.setHandlebars = function (HandleBars) {
        this.Handlebars = HandleBars;
    };
    return FormTemplateCollection;
})();
module.exports = FormTemplateCollection;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../TemplateHelper/PartialWidgetHelper":10}],10:[function(require,module,exports){
(function (global){
var Handlebars = (typeof window !== "undefined" ? window.Handlebars : typeof global !== "undefined" ? global.Handlebars : null);
var PartialWidgetHelper = (function () {
    function PartialWidgetHelper() {
    }
    PartialWidgetHelper.register = function (HandlebarsEnv) {
        if (HandlebarsEnv === void 0) { HandlebarsEnv = Handlebars; }
        HandlebarsEnv.registerHelper('partial_widget', function (form, options) {
            var partial = form.type + '_widget';
            var template = HandlebarsEnv.partials[partial];
            if (!template) {
                throw new Error("Unable to find partial widget template " + partial);
            }
            var html = template({
                form: form
            });
            return new HandlebarsEnv.SafeString(html);
        });
    };
    return PartialWidgetHelper;
})();
module.exports = PartialWidgetHelper;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function (global){
//ts:ref=node.d.ts
var AbstractFormType = require('./FormType/AbstractFormType');
var FormType = require('./FormType/FormType');
var FieldType = require('./FormType/FieldType');
var TextType = require('./FormType/TextType');
var ChoiceType = require('./FormType/ChoiceType');
var OptionType = require('./FormType/OptionType');
var FormTypeExports = {
    AbstractFormType: AbstractFormType,
    FormType: FormType,
    FieldType: FieldType,
    TextType: TextType,
    ChoiceType: ChoiceType,
    OptionType: OptionType
};
global.FormTypes = FormTypeExports;
module.exports = FormTypeExports;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./FormType/AbstractFormType":2,"./FormType/ChoiceType":3,"./FormType/FieldType":4,"./FormType/FormType":5,"./FormType/OptionType":6,"./FormType/TextType":7}]},{},[11])(11)
});