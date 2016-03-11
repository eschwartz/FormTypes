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
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var Handlebars = (typeof window !== "undefined" ? window.Handlebars : typeof global !== "undefined" ? global.Handlebars : null);
var PartialWidgetHelper = require('../View/TemplateHelper/PartialWidgetHelper');
var Events = require('events');
var AbstractFormType = (function () {
    function AbstractFormType(options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.Handlebars = Handlebars.create();
        this.eventEmitter = new Events.EventEmitter();
        this.listeners = {};
        this.listenerId = _.uniqueId('form_type_');
        this.state = {};
        this.prepareTemplateEnvironment();
        this.options = this.setDefaultOptions(_.clone(options));
        this.children = [];
        this.template = this.options.template;
        delete this.options.template;
        this.el = null;
        this.render();
        this.options.children.forEach(function (child) { return _this.addChild(child); });
        this.setErrors(this.options.errors);
        if ('data' in this.options) {
            this.setData(this.options.data);
        }
    }
    /**
     * Apply defaults to the options object.
     *
     * The returned object is set to this.options.
     */
    AbstractFormType.prototype.setDefaultOptions = function (options) {
        var defaults = {
            tagName: 'div',
            type: 'form_type',
            name: _.uniqueId('form_'),
            attrs: {},
            children: [],
            errors: {}
        };
        _.defaults(options, defaults);
        _.defaults(options.attrs, {
            name: options.name
        });
        return options;
    };
    AbstractFormType.prototype.render = function () {
        var _this = this;
        var context = this.createTemplateContext();
        var html = this.template({
            form: context
        });
        this.el = this.createElementFromString(html);
        this.children.forEach(function (child) { return _this.addChildElement(child); });
        this.update(this.state);
        return this;
    };
    /**
     * Update the view, in response
     * to changes in the state.
     *
     * @param changedState
     */
    AbstractFormType.prototype.update = function (changedState) {
        if ('errors' in changedState) {
            this.renderErrors(changedState.errors);
        }
    };
    /** Render a list of errors into the form view. */
    AbstractFormType.prototype.renderErrors = function (errors) {
        var _this = this;
        var errorsListView = this.el.getElementsByClassName('errors').item(0);
        var errorTemplate = Handlebars.compile('<li>{{this}}</li>');
        if (!errorsListView) {
            return;
        }
        errorsListView.innerHTML = '';
        if (!errors.length) {
            errorsListView.style.display = 'none';
            return;
        }
        errors.map(function (err) { return _this.createElementFromString(errorTemplate(err)); }).forEach(function (errView) { return errorsListView.appendChild(errView); });
        errorsListView.style.display = '';
    };
    AbstractFormType.prototype.close = function () {
        this.children.forEach(function (child) { return child.close(); });
        if (this.el && this.el.parentElement) {
            this.el.parentElement.removeChild(this.el);
        }
        this.el = null;
        this.emit('close', this);
        this.removeAllListeners();
    };
    AbstractFormType.prototype.setTemplate = function (template) {
        this.template = template;
    };
    AbstractFormType.prototype.prepareTemplateEnvironment = function () {
        var _this = this;
        var partials = {
            html_attrs: "{{#each this}}\n  {{@key}}=\"{{this}}\"\n{{/each}}",
            field_widget: "{{#if form.label}}\n  <label {{>html_attrs form.labelAttrs}}>\n    {{form.label}}\n  </label>\n{{/if}}\n\n<ul class=\"errors\" style=\"display:none\"></ul>\n\n{{>simple_widget this}}\n",
            simple_widget: "<{{form.tagName}} {{>html_attrs form.attrs}} />"
        };
        _.each(partials, function (partial, name) {
            _this.Handlebars.registerPartial(name, partial);
        });
        PartialWidgetHelper.register(this.Handlebars);
    };
    AbstractFormType.prototype.createTemplateContext = function () {
        return _.clone(this.options);
    };
    AbstractFormType.prototype.createElementFromString = function (htmlString) {
        var container = document.createElement('div');
        container.innerHTML = htmlString.trim();
        return container.childNodes.length === 1 ? container.firstChild : container;
    };
    AbstractFormType.prototype.addChild = function (child) {
        var _this = this;
        this.children.push(child);
        child.on('change', function () {
            _this.emit('change');
            _this.emit('change:' + child.getName());
        }, this.listenerId);
        child.on('all', function (evt) {
            var isChildEvent = evt.type.indexOf('child:') === 0;
            var proxyEventType = isChildEvent ? evt.type : 'child:' + evt.type;
            _this.emit(proxyEventType, evt);
        }, this.listenerId);
        this.addChildElement(child);
    };
    AbstractFormType.prototype.removeChild = function (child) {
        this.removeChildElement(child);
        this.children = _.without(this.children, child);
        child.removeAllListenersById(this.listenerId);
    };
    AbstractFormType.prototype.removeChildElement = function (child) {
        if (child.el && child.el.parentElement) {
            child.el.parentElement.removeChild(child.el);
        }
    };
    AbstractFormType.prototype.removeChildByName = function (name) {
        var child = this.getChild(name);
        if (!child) {
            return void 0;
        }
        this.removeChild(child);
    };
    AbstractFormType.prototype.getChild = function (name) {
        return _.find(this.children, function (child) {
            return child.getName() === name;
        });
    };
    AbstractFormType.prototype.addChildElement = function (childType) {
        this.el.appendChild(childType.el);
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
        var isInputTopLevelElement;
        isInputTopLevelElement = this.el.tagName.toLowerCase() === this.options.tagName;
        return (isInputTopLevelElement ? this.el : this.el.getElementsByTagName(this.options.tagName).item(0));
    };
    /** abstract */ AbstractFormType.prototype.getData = function () {
        throw new Error('Form of type "' + this.options.type + '" must implement a getData() method.');
    };
    /** abstract */ AbstractFormType.prototype.setData = function (data) {
        throw new Error('Form of type "' + this.options.type + '" must implement a setData() method.');
    };
    AbstractFormType.prototype.setState = function (state) {
        _.extend(this.state, state);
        this.update(state);
    };
    /**
     * Does the form type contain data.
     *
     * A FormType is considered to have data even
     * if the value of the data is falsely.
     * On the other hand, a LabelType or SubmitType
     * may not have any data associated with it at all.
     *
     * This returns true by default, but can be
     * overridden in FormType implementations.
     */
    AbstractFormType.prototype.hasData = function () {
        return true;
    };
    AbstractFormType.prototype.setErrors = function (errors) {
        _.defaults(errors, {
            form: [],
            fields: {}
        });
        this.setState({
            errors: errors.form
        });
        this.children.forEach(function (child) {
            var errorsForChild = errors.fields[child.getName()] || {};
            child.setErrors(errorsForChild);
        });
    };
    AbstractFormType.prototype.clearErrors = function () {
        this.setErrors({});
    };
    AbstractFormType.prototype.getErrors = function () {
        return {
            form: _.clone(this.state.errors),
            fields: this.children.reduce(function (fieldErrors, child) {
                fieldErrors[child.getName()] = child.getErrors();
                return fieldErrors;
            }, {})
        };
    };
    AbstractFormType.prototype.hasErrors = function () {
        return this.state.errors.length > 0 || this.children.some(function (child) { return child.hasErrors(); });
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
        var listeners = this.listeners[listenerId];
        if (!listeners) {
            return;
        }
        this.listeners[listenerId].forEach(function (listener) {
            _this.removeListener(listener.event, listener.listener);
        });
    };
    AbstractFormType.prototype.emit = function (eventType, arg) {
        var allEvent;
        this.eventEmitter.emit(eventType, arg);
        this.eventEmitter.emit('all', allEvent = {
            type: eventType,
            args: arg === void 0 ? [] : [arg]
        });
    };
    return AbstractFormType;
})();
module.exports = AbstractFormType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../View/TemplateHelper/PartialWidgetHelper":18,"events":1}],3:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var ServiceContainer = require('../Service/ServiceContainer');
var StringUtil = require('../Util/StringUtil');
var whenIn = require('../Util/whenIn');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var CheckboxType = (function (_super) {
    __extends(CheckboxType, _super);
    function CheckboxType() {
        _super.apply(this, arguments);
    }
    CheckboxType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'input',
            type: 'checkbox',
            data: false,
            label: StringUtil.camelCaseToWords(options.name || ''),
            template: this.Handlebars.compile('\
        {{#if form.label}}\
          <label {{>html_attrs form.labelAttrs}}>\
            {{>simple_widget this}} {{form.label}}\
          </label>\
        {{else}}\
          {{>simple_widget this}}\
        {{/if}}\
      ')
        });
        options = _super.prototype.setDefaultOptions.call(this, options);
        options.attrs['type'] = 'checkbox';
        options.attrs['value'] = options.name;
        return options;
    };
    CheckboxType.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        ServiceContainer.HtmlEvents.addEventListener(this.getFormElement(), 'change', function () {
            _this.setData(!!_this.getFormElement().checked);
        });
        return this;
    };
    CheckboxType.prototype.update = function (state) {
        var _this = this;
        _super.prototype.update.call(this, state);
        whenIn(state, {
            checked: function (isChecked) { return _this.getFormElement().checked = !!isChecked; },
            disabled: function (isDisabled) { return _this.getFormElement().disabled = !!isDisabled; }
        });
    };
    CheckboxType.prototype.getFormElement = function () {
        return _super.prototype.getFormElement.call(this);
    };
    /** Returns true if the checkbox is checked */
    CheckboxType.prototype.getData = function () {
        return this.isChecked();
    };
    CheckboxType.prototype.setData = function (data) {
        var isSameData = data === this.getData();
        if (!isSameData) {
            this.setState({
                checked: data
            });
            this.emit('change');
        }
    };
    CheckboxType.prototype.check = function () {
        this.setState({
            checked: true
        });
    };
    CheckboxType.prototype.unCheck = function () {
        this.setState({
            checked: false
        });
    };
    CheckboxType.prototype.isChecked = function () {
        return !!this.state.checked;
    };
    CheckboxType.prototype.enable = function () {
        this.setState({
            disabled: false
        });
    };
    CheckboxType.prototype.disable = function () {
        this.setState({
            disabled: true
        });
    };
    return CheckboxType;
})(FieldType);
module.exports = CheckboxType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Service/ServiceContainer":14,"../Util/StringUtil":16,"../Util/whenIn":17,"./FieldType":5}],4:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ServiceContainer = require('../Service/ServiceContainer');
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
        ServiceContainer.HtmlEvents.addEventListener(this.getFormElement(), 'change', function () {
            _this.setData(_this.getFormElement().value);
        });
        return this;
    };
    ChoiceType.prototype.update = function (state) {
        _super.prototype.update.call(this, state);
        if ('selected' in state) {
            if (state.selected === null) {
                this.getFormElement().selectedIndex = -1;
            }
            else {
                this.getFormElement().value = state.selected;
            }
        }
        if ('disabled' in state) {
            this.children.forEach(function (child) {
                if (_.contains(state.disabled, child.getData())) {
                    child.disable();
                }
                else {
                    child.enable();
                }
            });
            // Deselected disabled option
            if (_.contains(state.disabled, this.getData())) {
                this.getFormElement().selectedIndex = -1;
            }
        }
    };
    ChoiceType.prototype.getFormElement = function () {
        return _super.prototype.getFormElement.call(this);
    };
    ChoiceType.prototype.addChildElement = function (childType) {
        this.getFormElement().appendChild(childType.el);
    };
    ChoiceType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'select',
            type: 'choice',
            choices: {},
            template: this.Handlebars.compile("{{#if form.label}}\n  <label {{>html_attrs form.labelAttrs}}>\n    {{form.label}}\n  </label>\n{{/if}}\n\n<select {{>html_attrs form.attrs}}></select>\n")
        });
        options.children = this.optionsFromChoices(options.choices);
        // set default data
        options.data = options.data || Object.keys(options.choices)[0];
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    ChoiceType.prototype.getData = function () {
        return this.state.selected;
    };
    ChoiceType.prototype.setData = function (data) {
        var isSameData = data === this.getData();
        data = data ? data.toString() : data;
        if (!isSameData) {
            this.setState({
                selected: data
            });
            this.emit('change');
        }
    };
    ChoiceType.prototype.setChoices = function (choices) {
        var _this = this;
        this.children.forEach(function (child) { return _this.removeChild(child); });
        this.optionsFromChoices(choices).forEach(function (option) { return _this.addChild(option); });
        // Update data with a default choice
        this.setData(Object.keys(choices)[0]);
    };
    ChoiceType.prototype.optionsFromChoices = function (choices) {
        return _.map(choices, function (label, key) { return new OptionType({
            data: key,
            label: label
        }); });
    };
    ChoiceType.prototype.disableOption = function (optionValue) {
        this.setState({
            disabled: (this.state.disabled || []).concat(optionValue)
        });
    };
    ChoiceType.prototype.enableOption = function (optionValue) {
        this.setState({
            disabled: _.without(this.state.disabled || [], optionValue)
        });
    };
    ChoiceType.prototype.getOption = function (value) {
        var matchingOptions = this.children.filter(function (child) { return child.getData() === value; });
        return matchingOptions.length ? matchingOptions[0] : null;
    };
    return ChoiceType;
})(FieldType);
module.exports = ChoiceType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Service/ServiceContainer":14,"./FieldType":5,"./OptionType":11}],5:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
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
            labelAttrs: {},
            template: this.Handlebars.compile('{{>field_widget}}')
        });
        options = _super.prototype.setDefaultOptions.call(this, options);
        // set default label
        if (!options.hasOwnProperty('label')) {
            options.label = StringUtil.camelCaseToWords(options.name);
        }
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
},{"../Util/StringUtil":16,"./AbstractFormType":2}],6:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var GroupType = require('./GroupType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var ServiceContainer = require('../Service/ServiceContainer');
var FormType = (function (_super) {
    __extends(FormType, _super);
    function FormType() {
        _super.apply(this, arguments);
    }
    FormType.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        ServiceContainer.HtmlEvents.addEventListener(this.getFormElement(), 'submit', function () { return _this.emit('submit'); });
        return this;
    };
    FormType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'form',
            type: 'form',
            template: this.Handlebars.compile("<form {{>html_attrs form.attrs}}></form>")
        });
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    return FormType;
})(GroupType);
module.exports = FormType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Service/ServiceContainer":14,"./GroupType":7}],7:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var AbstractFormType = require('./AbstractFormType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var GroupType = (function (_super) {
    __extends(GroupType, _super);
    function GroupType() {
        _super.apply(this, arguments);
    }
    GroupType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            type: 'group',
            tagName: 'div',
            template: this.Handlebars.compile('\
        <div>\
          {{#if form.label}}\
            <label {{>html_attrs form.labelAttrs}}>\
              {{form.label}}\
            </label>\
          {{/if}}\
          \
          <ul class="errors" style="display:none"></ul>\
        </div>\
      ')
        });
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    GroupType.prototype.getData = function () {
        var data = {};
        this.children.forEach(function (formType) {
            if (formType.hasData()) {
                data[formType.getName()] = formType.getData();
            }
        });
        return data;
    };
    GroupType.prototype.setData = function (data) {
        var _this = this;
        _.each(data, function (val, key) {
            var child = _this.getChild(key);
            if (!child) {
                return;
            }
            child.setData(data[key]);
        });
    };
    return GroupType;
})(AbstractFormType);
module.exports = GroupType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AbstractFormType":2}],8:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var AbstractFormType = require('./AbstractFormType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var LabelType = (function (_super) {
    __extends(LabelType, _super);
    function LabelType() {
        _super.apply(this, arguments);
    }
    LabelType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'label',
            type: 'label',
            data: '',
            template: this.Handlebars.compile('\
        <{{form.tagName}} {{>html_attrs form.attrs}}></{{form.tagName}}>\
      ')
        });
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    LabelType.prototype.update = function (state) {
        _super.prototype.update.call(this, state);
        if ('label' in state) {
            this.getFormElement().textContent = state.label;
        }
    };
    LabelType.prototype.getData = function () {
        return this.state.label;
    };
    LabelType.prototype.setData = function (data) {
        var isSameData = data === this.getData();
        if (isSameData) {
            return;
        }
        this.setState({
            label: data
        });
        this.emit('change');
    };
    return LabelType;
})(AbstractFormType);
module.exports = LabelType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AbstractFormType":2}],9:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=web-api.ext.d.ts
/// <reference path="../../typings/web-api/web-api.ext.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var TextType = require('./TextType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var ListType = (function (_super) {
    __extends(ListType, _super);
    function ListType(options) {
        _super.call(this, options);
    }
    ListType.prototype.setDefaultOptions = function (options) {
        var internalOptions;
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
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    /**
     * Note that this will remove any existing child form items.
     * Use `addData()` if you want to to keep existing form items.
     */
    ListType.prototype.setData = function (data) {
        var _this = this;
        var oldData = this.getData();
        var isSameData = data.length === oldData.length && data.every(function (item, index) { return _.isEqual(item, oldData[index]); });
        if (isSameData) {
            return;
        }
        // We're actually resetting the data, so we'll
        // remove what we've got, first.
        this.children.forEach(function (child) { return _this.removeChild(child); });
        data.map(function (item) { return _this.createItemType(item); }).forEach(function (child) { return _this.addChild(child); });
        this.emit('change');
    };
    ListType.prototype.addData = function (dataItem) {
        this.addChild(this.createItemType(dataItem));
        this.emit('change');
    };
    ListType.prototype.removeData = function (dataItem) {
        var child = this.children.filter(function (child) { return _.isEqual(child.getData(), dataItem); })[0];
        if (!child) {
            return;
        }
        this.removeChild(child);
        this.emit('change');
    };
    ListType.prototype.createItemType = function (data) {
        var hasDataArg = data === void 0;
        var itemTypeOptions = _.extend({}, this.itemTypeOptions);
        if (!hasDataArg) {
            _.extend(itemTypeOptions, { data: data });
        }
        return new this.ItemType(itemTypeOptions);
    };
    ListType.prototype.getData = function () {
        return this.children.map(function (child) {
            return child.getData();
        });
    };
    ListType.prototype.addChildElement = function (childType) {
        var _this = this;
        var itemEl = this.renderItem(childType);
        this.getFormElement().appendChild(itemEl);
        // Remove the item element when the child closes
        childType.on('close', function () {
            _this.getFormElement().removeChild(itemEl);
        }, this.listenerId);
    };
    ListType.prototype.removeChildElement = function (child) {
        var childIndex = this.children.indexOf(child);
        var containerEl = this.getFormElement().querySelectorAll(this.itemContainerSelector).item(childIndex);
        containerEl.parentNode.removeChild(containerEl);
    };
    ListType.prototype.renderItem = function (childType) {
        var itemContainerHtml = this.itemTemplate({
            form: this.createTemplateContext()
        });
        var itemEl = this.createElementFromString(itemContainerHtml);
        var itemContainer = this.findItemContainer(itemEl);
        itemContainer.appendChild(childType.el);
        return itemContainer;
    };
    ListType.prototype.findItemContainer = function (itemEl) {
        var matchingContainers;
        // https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Browser_compatibility
        var itemElMatches = (itemEl.matches || itemEl.msMatchesSelector || itemEl.mozMatchesSelector || itemEl.webkitMatchesSelector).bind(itemEl);
        if (itemElMatches(this.itemContainerSelector)) {
            return itemEl;
        }
        matchingContainers = itemEl.querySelectorAll(this.itemContainerSelector);
        if (!matchingContainers.length) {
            throw new Error('Unable to find item container matching selector ' + this.itemContainerSelector);
        }
        return matchingContainers.item(0);
    };
    ListType.prototype.getChildren = function () {
        return this.children;
    };
    return ListType;
})(FieldType);
module.exports = ListType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./FieldType":5,"./TextType":13}],10:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FieldType = require('./FieldType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var CheckboxType = require('./CheckboxType');
var MultiChoiceType = (function (_super) {
    __extends(MultiChoiceType, _super);
    function MultiChoiceType() {
        _super.apply(this, arguments);
    }
    MultiChoiceType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'div',
            type: 'multi_choice',
            choices: {},
            data: []
        });
        // Create child Checkbox types from choices
        options.children = _.map(options.choices, function (label, name) { return new CheckboxType({
            name: name,
            label: label
        }); });
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    MultiChoiceType.prototype.getData = function () {
        return this.children.filter(function (child) { return child.isChecked(); }).map(function (child) { return child.getName(); });
    };
    MultiChoiceType.prototype.setData = function (data) {
        var isSameData = _.isEqual(data, this.getData());
        if (isSameData) {
            return;
        }
        // Update child checkboxes fro mdata
        this.children.forEach(function (child) {
            if (_.contains(data, child.getName())) {
                child.check();
            }
            else {
                child.unCheck();
            }
        });
        this.emit('change');
    };
    MultiChoiceType.prototype.addChildElement = function (childType) {
        this.getFormElement().appendChild(childType.el);
    };
    return MultiChoiceType;
})(FieldType);
module.exports = MultiChoiceType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./CheckboxType":3,"./FieldType":5}],11:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=handlebars.d.ts
/// <reference path="../../typings/generated/handlebars/handlebars.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var StringUtil = require('../Util/StringUtil');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var whenIn = require('../Util/whenIn');
var OptionType = (function (_super) {
    __extends(OptionType, _super);
    function OptionType() {
        _super.apply(this, arguments);
    }
    OptionType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'option',
            type: 'option',
            data: '',
            template: this.Handlebars.compile("<option value=\"{{form.data}}\"\n        {{>html_attrs form.attrs}}>\n    {{form.label}}\n</option>")
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
    OptionType.prototype.update = function (state) {
        var _this = this;
        _super.prototype.update.call(this, state);
        whenIn(state, {
            selected: function (isSelected) { return isSelected ? _this.getFormElement().selected = true : _this.getFormElement().removeAttribute('selected'); },
            disabled: function (isDisabled) { return isDisabled ? _this.getFormElement().disabled = true : _this.getFormElement().removeAttribute('disabled'); },
            value: function (value) { return _this.getFormElement().value = value; }
        });
    };
    OptionType.prototype.getFormElement = function () {
        return _super.prototype.getFormElement.call(this);
    };
    OptionType.prototype.getData = function () {
        return this.state.value;
    };
    OptionType.prototype.setData = function (data) {
        var isSame = data === this.getData();
        if (!isSame) {
            this.setState({
                value: data
            });
            this.emit('change');
        }
    };
    OptionType.prototype.select = function () {
        this.setState({
            selected: true
        });
    };
    OptionType.prototype.deselect = function () {
        this.setState({
            selected: false
        });
    };
    OptionType.prototype.enable = function () {
        this.setState({
            disabled: false
        });
    };
    OptionType.prototype.disable = function () {
        this.setState({
            disabled: true
        });
    };
    OptionType.prototype.isSelected = function () {
        return !!this.state.selected;
    };
    return OptionType;
})(FieldType);
module.exports = OptionType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Util/StringUtil":16,"../Util/whenIn":17,"./FieldType":5}],12:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var AbstractFormType = require('./AbstractFormType');
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

var SubmitType = (function (_super) {
    __extends(SubmitType, _super);
    function SubmitType(options) {
        _super.call(this, options);
    }
    SubmitType.prototype.hasData = function () {
        // Prevents parent Types from attempting
        // to parse SubmitType data
        return false;
    };
    SubmitType.prototype.getFormElement = function () {
        return _super.prototype.getFormElement.call(this);
    };
    SubmitType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            template: this.Handlebars.compile("<{{form.tagName}} {{>html_attrs form.attrs}} />"),
            tagName: 'input',
            attrs: {},
            label: 'Submit'
        });
        _.defaults(options.attrs, {
            value: options.label,
            type: 'submit'
        });
        return _super.prototype.setDefaultOptions.call(this, options);
    };
    return SubmitType;
})(AbstractFormType);
module.exports = SubmitType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AbstractFormType":2}],13:[function(require,module,exports){
(function (global){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var ServiceContainer = require('../Service/ServiceContainer');
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
        ServiceContainer.HtmlEvents.addEventListener(this.getFormElement(), 'input', function () {
            _this.setData(_this.getFormElement().value);
        });
        return this;
    };
    TextType.prototype.getFormElement = function () {
        return _super.prototype.getFormElement.call(this);
    };
    TextType.prototype.update = function (changedState) {
        _super.prototype.update.call(this, changedState);
        if ('value' in changedState) {
            this.getFormElement().value = changedState.value;
        }
    };
    TextType.prototype.setDefaultOptions = function (options) {
        _.defaults(options, {
            tagName: 'input',
            data: '',
            template: this.Handlebars.compile('{{>field_widget}}')
        });
        options = _super.prototype.setDefaultOptions.call(this, options);
        _.defaults(options.attrs, {
            type: 'text'
        });
        return options;
    };
    TextType.prototype.createTemplateContext = function () {
        var context = _super.prototype.createTemplateContext.call(this);
        context.attrs['value'] = this.getData();
        return context;
    };
    TextType.prototype.getData = function () {
        return this.state.value;
    };
    TextType.prototype.setData = function (data) {
        var isSame = data === this.getData();
        if (isSame) {
            return;
        }
        this.setState({
            value: data
        });
        this.emit('change');
    };
    return TextType;
})(FieldType);
module.exports = TextType;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Service/ServiceContainer":14,"./FieldType":5}],14:[function(require,module,exports){
var HtmlEvents = require('../Util/HtmlEvents');
var ServiceContainer = (function () {
    function ServiceContainer() {
    }
    ServiceContainer.HtmlEvents = HtmlEvents;
    return ServiceContainer;
})();
module.exports = ServiceContainer;

},{"../Util/HtmlEvents":15}],15:[function(require,module,exports){
var HtmlEvents = {
    addEventListener: function (element, type, listener, useCapture) {
        element.addEventListener(type, listener, useCapture);
    }
};
module.exports = HtmlEvents;

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
(function (global){
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
function whenIn(target, conf) {
    _.each(conf, function (cb, key) {
        if (key in target) {
            cb(target[key]);
        }
    });
}
module.exports = whenIn;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
(function (global){
//ts:ref=node.d.ts
var AbstractFormType = require('./FormType/AbstractFormType');
var GroupType = require('./FormType/GroupType');
var FormType = require('./FormType/FormType');
var FieldType = require('./FormType/FieldType');
var TextType = require('./FormType/TextType');
var ChoiceType = require('./FormType/ChoiceType');
var OptionType = require('./FormType/OptionType');
var LabelType = require('./FormType/LabelType');
var ListType = require('./FormType/ListType');
var SubmitType = require('./FormType/SubmitType');
var MultiChoiceType = require('./FormType/MultiChoiceType');
var CheckboxType = require('./FormType/CheckboxType');
var ServiceContainer = require('./Service/ServiceContainer');
var FormTypeExports = {
    AbstractFormType: AbstractFormType,
    GroupType: GroupType,
    FormType: FormType,
    FieldType: FieldType,
    TextType: TextType,
    ChoiceType: ChoiceType,
    OptionType: OptionType,
    MultiChoiceType: MultiChoiceType,
    CheckboxType: CheckboxType,
    LabelType: LabelType,
    ListType: ListType,
    SubmitType: SubmitType,
    ServiceContainer: ServiceContainer
};
global.FormTypes = FormTypeExports;
module.exports = FormTypeExports;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./FormType/AbstractFormType":2,"./FormType/CheckboxType":3,"./FormType/ChoiceType":4,"./FormType/FieldType":5,"./FormType/FormType":6,"./FormType/GroupType":7,"./FormType/LabelType":8,"./FormType/ListType":9,"./FormType/MultiChoiceType":10,"./FormType/OptionType":11,"./FormType/SubmitType":12,"./FormType/TextType":13,"./Service/ServiceContainer":14}]},{},[19])(19)
});