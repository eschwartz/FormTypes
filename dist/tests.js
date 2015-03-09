(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = require('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && !isFinite(value)) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b)) {
    return a === b;
  }
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  var ka = objectKeys(a),
      kb = objectKeys(b),
      key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":6}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
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

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"_process":4,"inherits":3}],7:[function(require,module,exports){
var FormTemplateCollection = require('../View/Template/FormTemplateCollection');
var _ = require('underscore');
var Handlebars = require('handlebars');
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

},{"../View/Template/FormTemplateCollection":14,"events":2,"handlebars":"handlebars","underscore":"underscore"}],8:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FieldType = require('./FieldType');
var OptionType = require('./OptionType');
var _ = require('underscore');
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

},{"./FieldType":9,"./OptionType":11,"underscore":"underscore"}],9:[function(require,module,exports){
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
var _ = require('underscore');
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

},{"../Util/StringUtil":13,"./AbstractFormType":7,"underscore":"underscore"}],10:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var AbstractFormType = require('./AbstractFormType');
var _ = require('underscore');
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

},{"./AbstractFormType":7,"underscore":"underscore"}],11:[function(require,module,exports){
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
var _ = require('underscore');
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

},{"../Util/StringUtil":13,"./FieldType":9,"underscore":"underscore"}],12:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///ts:ref=underscore.d.ts
/// <reference path="../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
var FieldType = require('./FieldType');
var _ = require('underscore');
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

},{"./FieldType":9,"underscore":"underscore"}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
var Handlebars = require('handlebars');

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

},{"../TemplateHelper/PartialWidgetHelper":15,"handlebars":"handlebars"}],15:[function(require,module,exports){
var Handlebars = require('handlebars');
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

},{"handlebars":"handlebars"}],16:[function(require,module,exports){
var DomEvents = (function () {
    function DomEvents() {
    }
    DomEvents.dispatchInputEvent = function (el, value) {
        var event = document.createEvent('Event');
        event.initEvent('input', true, true);
        el.value = value;
        el.dispatchEvent(event);
    };
    DomEvents.dispatchChangeEvent = function (el, value) {
        var event = document.createEvent('Event');
        event.initEvent('change', true, true);
        el.value = value;
        el.dispatchEvent(event);
    };
    return DomEvents;
})();
module.exports = DomEvents;

},{}],17:[function(require,module,exports){
///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
var assert = require('assert');
var ChoiceType = require('../../../src/FormType/ChoiceType');
var sinon = require('sinon');
var DomEvents = require('../../Util/DomEvents');
var jsdom = require('mocha-jsdom');
describe('ChoiceType', function () {
    var $;
    if (typeof window === 'undefined') {
        jsdom();
    }
    before(function () {
        $ = require('jquery');
    });
    describe('render', function () {
        it('should create an empty select element', function () {
            var $select;
            var choiceType = new ChoiceType();
            choiceType.render();
            $select = $(choiceType.el).find('select');
            assert.equal($select.length, 1, 'Expected a single select element to be rendered.');
            assert.equal($select.children().length, 0, 'Expected select element to be empty.');
        });
        it('should create option elements for each choice', function () {
            var $select, $options;
            var choiceType = new ChoiceType({
                choices: {
                    us: 'United States',
                    ca: 'Canada'
                }
            });
            choiceType.render();
            $select = $(choiceType.el).find('select');
            $options = $select.children('option');
            assert.equal($options.length, 2, 'Expected option element to be created for each choice');
            // NOTE: these tests are fragile,
            //   as not all browsers may maintain object
            //   ordering they way you'd expect.
            assert.equal($options.eq(0).val(), 'us');
            assert.equal($options.eq(1).val(), 'ca');
            assert.equal($options.eq(0).text().trim(), 'United States');
            assert.equal($options.eq(1).text().trim(), 'Canada');
        });
        it('should select the specified option', function () {
            var $select, $options;
            var choiceType = new ChoiceType({
                choices: {
                    us: 'United States',
                    fr: 'France',
                    ca: 'Canada'
                },
                data: 'fr'
            });
            choiceType.render();
            $select = $(choiceType.el).find('select');
            $options = $select.children('option');
            // NOTE: these tests are fragile,
            //   as not all browsers may maintain object
            //   ordering they way you'd expect.
            assert.equal($options.eq(1).val(), 'fr');
            assert(!$options.eq(0).prop('selected'), 'Expected `us` not be selected');
            assert($options.eq(1).prop('selected'), 'Expected `fr` to be selected');
            assert(!$options.eq(2).prop('selected'), 'Expected `ca` not to be selected');
        });
    });
    describe('getData', function () {
        it('should return the initial data value, before rendering the type', function () {
            var choiceType = new ChoiceType({
                data: 'bar',
                choices: {
                    foo: 'Foo',
                    bar: 'Bar'
                }
            });
            assert.equal(choiceType.getData(), 'bar');
        });
        it('should return the initial data value, after rendering the type', function () {
            var choiceType = new ChoiceType({
                data: 'bar',
                choices: {
                    foo: 'Foo',
                    bar: 'Bar'
                }
            });
            choiceType.render();
            assert.equal(choiceType.getData(), 'bar');
        });
        it('should return the value of the first choice element, if no data is provided', function () {
            var choiceType = new ChoiceType({
                choices: {
                    foo: 'Foo',
                    bar: 'Bar'
                }
            });
            choiceType.render();
            assert.equal(choiceType.getData(), 'foo');
        });
        it('should return changed values', function () {
            var $select;
            var choiceType = new ChoiceType({
                data: 'foo',
                choices: {
                    foo: 'Foo',
                    bar: 'Bar'
                }
            });
            choiceType.render();
            $select = $(choiceType.el).find('select');
            $select.val('bar');
            assert.equal(choiceType.getData(), 'bar');
        });
    });
    describe('setData', function () {
        it('should set the value of the select element', function () {
            var select;
            var choiceType = new ChoiceType({
                choices: {
                    chicken: 'The Chicken',
                    egg: 'The Egg'
                },
                data: 'egg'
            });
            choiceType.render();
            choiceType.setData('chicken');
            select = choiceType.getFormElement();
            assert.equal(select.value, 'chicken');
        });
        it('should set the return value of getData()', function () {
            var choiceType = new ChoiceType({
                choices: {
                    chicken: 'The Chicken',
                    egg: 'The Egg'
                },
                data: 'egg'
            });
            choiceType.render();
            choiceType.setData('chicken');
            assert.equal(choiceType.getData(), 'chicken');
        });
        it('should set the return value of getData() - before render', function () {
            var choiceType = new ChoiceType({
                choices: {
                    chicken: 'The Chicken',
                    egg: 'The Egg'
                },
                data: 'egg'
            });
            choiceType.setData('chicken');
            assert.equal(choiceType.getData(), 'chicken');
        });
        it('should trigger a change event', function () {
            var onChange = sinon.spy();
            var choiceType = new ChoiceType({
                choices: {
                    chicken: 'The Chicken',
                    egg: 'The Egg'
                },
                data: 'egg'
            });
            choiceType.on('change', onChange);
            choiceType.setData('chicken');
            assert(onChange.called);
        });
        it('should not trigger a change event, if the data is the same', function () {
            var onChange = sinon.spy();
            var choiceType = new ChoiceType({
                choices: {
                    chicken: 'The Chicken',
                    egg: 'The Egg'
                },
                data: 'egg'
            });
            choiceType.on('change', onChange);
            choiceType.setData('egg');
            assert(!onChange.called);
        });
    });
    describe('change event', function () {
        it('should fire when the select input\'s value changes', function (done) {
            var select;
            var onChange = sinon.spy();
            var choiceType = new ChoiceType({
                choices: {
                    us: 'United States',
                    fr: 'France',
                    ca: 'Canada'
                },
                data: 'us'
            });
            choiceType.render();
            select = choiceType.getFormElement();
            choiceType.on('change', function () {
                assert.equal(select.value, 'fr');
                onChange();
                done();
            });
            DomEvents.dispatchChangeEvent(select, 'fr');
        });
    });
});

},{"../../../src/FormType/ChoiceType":8,"../../Util/DomEvents":16,"assert":1,"jquery":"jquery","mocha-jsdom":"mocha-jsdom","sinon":"sinon"}],18:[function(require,module,exports){
///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=underscore.d.ts
/// <reference path="../../../typings/generated/underscore/underscore.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
var assert = require('assert');
var FormType = require('../../../src/FormType/FormType');
var TextType = require('../../../src/FormType/TextType');
var ChoiceType = require('../../../src/FormType/ChoiceType');
var _ = require('underscore');
var DomEvents = require('../../Util/DomEvents');
var sinon = require('sinon');
var jsdom = require('mocha-jsdom');
describe('FormType', function () {
    var $;
    if (typeof window === 'undefined') {
        jsdom();
    }
    before(function () {
        $ = require('jquery');
    });
    describe('render', function () {
        it('should render an empty HTML form', function () {
            var formType = new FormType();
            var $form;
            formType.render();
            $form = $(formType.el);
            assert.equal($form.prop('tagName').toLowerCase(), 'form', 'Expected form element to exist');
            assert.equal($form.children().length, 0, 'Expected form to have no children');
        });
        it('should render child form types', function () {
            var $form, $inputs;
            var formType = new FormType({
                children: [
                    new TextType({
                        name: 'fooInput',
                        data: 'foo'
                    }),
                    new TextType({
                        name: 'barInput',
                        data: 'bar'
                    })
                ]
            });
            $form = $(formType.render().el);
            $inputs = $form.find('input');
            assert.equal($inputs.length, 2, 'Expected 2 child inputs to be rendered');
            assert.equal($inputs.eq(0).attr('name'), 'fooInput');
            assert.equal($inputs.eq(1).attr('name'), 'barInput');
            assert.equal($inputs.eq(0).val(), 'foo');
            assert.equal($inputs.eq(1).val(), 'bar');
        });
    });
    describe('getData', function () {
        describe('before render', function () {
            it('should return bootstrapped data', function () {
                var formType = new FormType({
                    children: [
                        new TextType({
                            name: 'fullName',
                            data: 'John Doe'
                        }),
                        new ChoiceType({
                            name: 'country',
                            choices: {
                                us: 'United State',
                                ca: 'Canada'
                            },
                            data: 'ca'
                        })
                    ]
                });
                assert(_.isEqual(formType.getData(), {
                    fullName: 'John Doe',
                    country: 'ca'
                }));
            });
        });
        describe('after render', function () {
            it('should return an empty object, if there are no child types', function () {
                var formType = new FormType();
                formType.render();
                assert(_.isEqual(formType.getData(), {}));
            });
            it('should return a hash of all the child type values, by type name', function () {
                var formType = new FormType({
                    children: [
                        new TextType({
                            name: 'fullName',
                            data: 'John Doe'
                        }),
                        new ChoiceType({
                            name: 'country',
                            choices: {
                                us: 'United State',
                                ca: 'Canada'
                            },
                            data: 'ca'
                        })
                    ]
                });
                formType.render();
                assert(_.isEqual(formType.getData(), {
                    fullName: 'John Doe',
                    country: 'ca'
                }));
            });
            it('should reflect changes to child type form elements', function () {
                var $form, $input, $select;
                var formType = new FormType({
                    children: [
                        new TextType({
                            name: 'fullName',
                            data: 'John Doe'
                        }),
                        new ChoiceType({
                            name: 'country',
                            choices: {
                                us: 'United State',
                                ca: 'Canada'
                            },
                            data: 'ca'
                        })
                    ]
                });
                formType.render();
                $form = $(formType.el);
                $input = $form.find('input');
                $select = $form.find('select');
                $input.val('Bob The Bob');
                $select.val('us');
                assert(_.isEqual(formType.getData(), {
                    fullName: 'Bob The Bob',
                    country: 'us'
                }));
            });
            it('should get data for nested FormType children', function () {
                var formType = new FormType({
                    children: [
                        new TextType({
                            name: 'fullName',
                            data: 'John Doe'
                        }),
                        new ChoiceType({
                            name: 'country',
                            choices: {
                                us: 'United State',
                                ca: 'Canada'
                            },
                            data: 'ca'
                        }),
                        new FormType({
                            name: 'contactInfo',
                            children: [
                                new TextType({
                                    name: 'phoneNumber',
                                    data: '555-1234'
                                }),
                                new TextType({
                                    name: 'email',
                                    data: 'joeShmo@example.com'
                                })
                            ]
                        })
                    ]
                });
                formType.render();
                assert(_.isEqual(formType.getData(), {
                    fullName: 'John Doe',
                    country: 'ca',
                    contactInfo: {
                        phoneNumber: '555-1234',
                        email: 'joeShmo@example.com'
                    }
                }));
            });
        });
    });
    describe('setData', function () {
        it('should set data for all child elements', function () {
            var $form;
            var formType = new FormType({
                children: [
                    new TextType({
                        name: 'firstName'
                    }),
                    new TextType({
                        name: 'lastName'
                    }),
                    new FormType({
                        name: 'contactInfo',
                        children: [
                            new TextType({
                                name: 'phoneNumber'
                            }),
                            new TextType({
                                name: 'email'
                            })
                        ]
                    })
                ]
            });
            formType.render();
            formType.setData({
                firstName: 'John',
                lastName: 'Doe',
                contactInfo: {
                    phoneNumber: '555-1212',
                    email: 'john_doe@example.com'
                }
            });
            $form = $(formType.el);
            assert.equal($form.find('[name=firstName]').val(), 'John');
            assert.equal($form.find('[name=lastName]').val(), 'Doe');
            assert.equal($form.find('[name=phoneNumber]').val(), '555-1212');
            assert.equal($form.find('[name=email]').val(), 'john_doe@example.com');
            assert(_.isEqual(formType.getData(), {
                firstName: 'John',
                lastName: 'Doe',
                contactInfo: {
                    phoneNumber: '555-1212',
                    email: 'john_doe@example.com'
                }
            }));
        });
    });
    describe('change event', function () {
        it('should fire when any child type changes', function (done) {
            var onChange = sinon.spy();
            var input;
            var formType = new FormType({
                children: [
                    new TextType({
                        name: 'fullName'
                    })
                ]
            });
            formType.render();
            input = formType.el.getElementsByTagName('input').item(0);
            formType.on('change', function () {
                assert.equal(formType.getData()['fullName'], 'Bob the Bob');
                onChange();
                done();
            });
            DomEvents.dispatchInputEvent(input, 'Bob the Bob');
            assert(onChange.called);
        });
    });
    describe('change:[child] event', function () {
        it('should fire when the child type changes', function (done) {
            var onChange = sinon.spy();
            var input;
            var formType = new FormType({
                children: [
                    new TextType({
                        name: 'fullName'
                    })
                ]
            });
            formType.render();
            input = formType.el.getElementsByTagName('input').item(0);
            formType.on('change:fullName', function () {
                assert.equal(formType.getData()['fullName'], 'Bob the Bob');
                onChange();
                done();
            });
            DomEvents.dispatchInputEvent(input, 'Bob the Bob');
            assert(onChange.called);
        });
    });
    describe('functional tests', function () {
        it('should swap out child types', function () {
            var $form, $countrySelect;
            var usForm = new FormType({
                name: 'usForm',
                children: [
                    new ChoiceType({
                        name: 'sodaOrPop',
                        choices: {
                            'soda': 'It\' called soda',
                            'pop': 'No, it\'s caled pop.'
                        }
                    })
                ]
            });
            var franceForm = new FormType({
                name: 'franceForm',
                children: [
                    new ChoiceType({
                        name: 'croissantOrBaguette',
                        choices: {
                            'croissant': 'Croissant',
                            'baguette': 'Baguette'
                        }
                    })
                ]
            });
            var formType = new FormType({
                children: [
                    new ChoiceType({
                        name: 'country',
                        choices: {
                            us: 'United State',
                            fr: 'France'
                        },
                        data: 'us'
                    }),
                    usForm
                ]
            });
            formType.on('change:country', function () {
                var selectedCountry = formType.getData()['country'];
                if (selectedCountry === 'us') {
                    formType.removeChild('franceForm');
                    formType.addChild(usForm);
                }
                else if (selectedCountry = 'fr') {
                    formType.removeChild('usForm');
                    formType.addChild(franceForm);
                }
            });
            formType.render();
            $form = $(formType.el);
            $countrySelect = $form.find('[name=country]');
            // Switch to France form
            DomEvents.dispatchChangeEvent($countrySelect[0], 'fr');
            // Check that the US form was replaced with the French form
            assert.equal($form.find('[name=sodaOrPop]').length, 0);
            assert.equal($form.find('[name=croissantOrBaguette]').length, 1);
            // Switch back to US form
            DomEvents.dispatchChangeEvent($countrySelect[0], 'us');
            // Check that the French form was replaced with the US form
            assert.equal($form.find('[name=croissantOrBaguette]').length, 0);
            assert.equal($form.find('[name=sodaOrPop]').length, 1);
        });
    });
});

},{"../../../src/FormType/ChoiceType":8,"../../../src/FormType/FormType":10,"../../../src/FormType/TextType":12,"../../Util/DomEvents":16,"assert":1,"jquery":"jquery","mocha-jsdom":"mocha-jsdom","sinon":"sinon","underscore":"underscore"}],19:[function(require,module,exports){
///ts:ref=mocha.d.ts
/// <reference path="../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=mocha-jsdom.d.ts
/// <reference path="../../../typings/mocha-jsdom/mocha-jsdom.d.ts"/> ///ts:ref:generated
///ts:ref=jquery.d.ts
/// <reference path="../../../typings/generated/jquery/jquery.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
var assert = require('assert');
var TextType = require('../../../src/FormType/TextType');
var sinon = require('sinon');
var DomEvents = require('../../Util/DomEvents');
var jsdom = require('mocha-jsdom');
describe('TextType', function () {
    var $;
    if (typeof window === 'undefined') {
        jsdom();
    }
    before(function () {
        $ = require('jquery');
    });
    describe('render', function () {
        it('should render a text input', function () {
            var textType = new TextType();
            var $inputForm, $input;
            textType.render();
            $inputForm = $(textType.el);
            $input = $inputForm.find('input');
            assert.equal($input.length, 1, 'Expected a single input element to exist');
        });
        it('should render the TextType\'s data as the input\'s value', function () {
            var $input;
            var textType = new TextType({
                data: 'foobar'
            });
            textType.render();
            $input = $(textType.el).find('input');
            assert.equal($input.val(), 'foobar');
        });
        it('should render attributes on the input', function () {
            var $input;
            var textType = new TextType({
                attrs: {
                    placeholder: 'Enter stuff here...',
                    required: true
                }
            });
            $input = $(textType.render().el).find('input');
            assert.equal($input.attr('placeholder'), 'Enter stuff here...', 'Expected `placeholder` attribute to be set.');
            assert($input.attr('required'), 'Expected `required` attribute to be set.');
        });
        it('should render a label for the input', function () {
            var textType = new TextType();
            textType.render();
            assert.equal($(textType.el).find('label').length, 1, 'Expected a single label to be rendered.');
        });
        it('should use the label option as the label text', function () {
            var $label;
            var textType = new TextType({
                label: 'My Great Text Input'
            });
            textType.render();
            $label = $(textType.el).find('label');
            assert.equal($label.text().trim(), 'My Great Text Input', 'Expected label text to match label option.');
        });
        it('should use the camelCased name option to generate a default label', function () {
            var $label;
            var textType = new TextType({
                name: 'userName'
            });
            textType.render();
            $label = $(textType.el).find('label');
            assert.equal($label.text().trim(), 'User Name', 'Expected label text to match label option.');
        });
        it('should use a shared uid for the input id and the label[for] attribute', function () {
            var $input, $label;
            var textType = new TextType({
                name: 'userName'
            });
            textType.render();
            $label = $(textType.el).find('label');
            $input = $(textType.el).find('input');
            assert($label.attr('for'), 'Expected label to have a `for` attribute');
            assert($input.attr('id'), 'Expected input to have an `id` attribute');
            assert.equal($label.attr('for'), $input.attr('id'), 'Expected label `for` attribute to match input\'s id');
        });
        it('should render label attributes', function () {
            var $label;
            var textType = new TextType({
                labelAttrs: {
                    'class': 'foo-bar faz-baz'
                }
            });
            textType.render();
            $label = $(textType.el).find('label');
            assert.equal($label.attr('class'), 'foo-bar faz-baz', 'Expected label to have attributes from `labelAttrs` option.');
        });
    });
    describe('getData', function () {
        it('should return the initial data value, before rendering the type', function () {
            var textType = new TextType({
                data: 'foo'
            });
            assert.equal(textType.getData(), 'foo');
        });
        it('should return the initial data value, after rendering the type', function () {
            var textType = new TextType({
                data: 'foo'
            });
            textType.render();
            assert.equal(textType.getData(), 'foo');
        });
        it('should return an empty string, if no data is provided', function () {
            var textType = new TextType();
            textType.render();
            assert.strictEqual(textType.getData(), '');
        });
        it('should return changed values', function () {
            var $input;
            var textType = new TextType({
                data: 'foo'
            });
            textType.render();
            $input = $(textType.el).find('input');
            $input.val('bar');
            assert.equal(textType.getData(), 'bar');
        });
    });
    describe('setData', function () {
        it('should set the value of the input element', function () {
            var input;
            var textType = new TextType();
            textType.render();
            textType.setData('foo');
            input = textType.getFormElement();
            assert.equal(input.value, 'foo');
        });
        it('should set the return value of getData()', function () {
            var textType = new TextType();
            textType.render();
            textType.setData('foo');
            assert.equal(textType.getData(), 'foo');
        });
        it('should set the return value of getData() - before render', function () {
            var textType = new TextType();
            textType.setData('foo');
            assert.equal(textType.getData(), 'foo');
        });
        it('should trigger a change event', function () {
            var onChange = sinon.spy();
            var textType = new TextType();
            textType.on('change', onChange);
            textType.setData('foo');
            assert(onChange.called);
        });
        it('should not trigger a change event, if the data is not changed', function () {
            var onChange = sinon.spy();
            var textType = new TextType({
                data: 'foo'
            });
            textType.on('change', onChange);
            textType.setData('foo');
            assert(!onChange.called);
        });
    });
    describe('`change` event', function () {
        it('should fire after the input\'s value has changed', function (done) {
            var onChange = sinon.spy();
            var textType = new TextType();
            var input;
            textType.render();
            input = textType.getFormElement();
            textType.on('change', function () {
                assert.equal(input.value, 'foo');
                onChange();
                done();
            });
            DomEvents.dispatchInputEvent(input, 'foo');
        });
    });
});

},{"../../../src/FormType/TextType":12,"../../Util/DomEvents":16,"assert":1,"jquery":"jquery","mocha-jsdom":"mocha-jsdom","sinon":"sinon"}],20:[function(require,module,exports){
///ts:ref=mocha.d.ts
/// <reference path="../../../../typings/generated/mocha/mocha.d.ts"/> ///ts:ref:generated
///ts:ref=sinon.d.ts
/// <reference path="../../../../typings/generated/sinon/sinon.d.ts"/> ///ts:ref:generated
///ts:ref=node.d.ts
/// <reference path="../../../../typings/generated/node/node.d.ts"/> ///ts:ref:generated
var DomEvents = require('../../../Util/DomEvents');
var assert = require('assert');
var sinon = require('sinon');
describe('DomEvents', function () {
    describe('dispatchInputEvent', function () {
        it('should simulate input events', function () {
            var onInput = sinon.spy();
            var input = document.createElement('input');
            input.addEventListener('input', function () {
                assert.equal(input.value, 'foo');
                onInput();
            });
            DomEvents.dispatchInputEvent(input, 'foo');
            assert(onInput.called);
        });
    });
});

},{"../../../Util/DomEvents":16,"assert":1,"sinon":"sinon"}]},{},[17,18,19,20]);
