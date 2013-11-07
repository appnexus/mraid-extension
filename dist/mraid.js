;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],2:[function(require,module,exports){
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

var util = require('util');

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
  if (!util.isNumber(n) || n < 0)
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
        (util.isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (util.isUndefined(handler))
    return false;

  if (util.isFunction(handler)) {
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
  } else if (util.isObject(handler)) {
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

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              util.isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (util.isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (util.isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!util.isUndefined(this._maxListeners)) {
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
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  function g() {
    this.removeListener(type, g);
    listener.apply(this, arguments);
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!util.isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (util.isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (util.isObject(list)) {
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

  if (util.isFunction(listeners)) {
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
  else if (util.isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (util.isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};
},{"util":3}],3:[function(require,module,exports){
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

var shims = require('_shims');

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

  shims.forEach(array, function(val, idx) {
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
    var ret = value.inspect(recurseTimes);
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
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
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

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
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
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
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
  var length = shims.reduce(output, function(prev, cur) {
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
  return shims.isArray(ar);
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
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
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

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

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
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":1}],4:[function(require,module,exports){
module.exports = function (css) {
  var head = document.getElementsByTagName('head')[0],
      style = document.createElement('style');

  style.type = 'text/css';

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  
  head.appendChild(style);
};
},{}],5:[function(require,module,exports){
// Uses Node, AMD or browser globals to create a module.

// If you want something that will work in other stricter CommonJS environments,
// or if you need to create a circular dependency, see commonJsStrict.js

// Defines a module "returnExports" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.returnExports = factory();
    }
}(this, function () {/*!
 * jQuery JavaScript Library v1.8.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: Thu Aug 30 2012 17:17:22 GMT-0400 (Eastern Daylight Time)
 */
return (function( window, undefined ) {
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,
	navigator = window.navigator,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// Save a reference to some core methods
	core_push = Array.prototype.push,
	core_slice = Array.prototype.slice,
	core_indexOf = Array.prototype.indexOf,
	core_toString = Object.prototype.toString,
	core_hasOwn = Object.prototype.hasOwnProperty,
	core_trim = String.prototype.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,

	// Used for detecting and trimming whitespace
	core_rnotwhite = /\S/,
	core_rspace = /\s+/,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// The ready event handler and self cleanup method
	DOMContentLoaded = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
			jQuery.ready();
		} else if ( document.readyState === "complete" ) {
			// we're here because readyState === "complete" in oldIE
			// which is good enough for us to call the dom ready!
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	},

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context && context.nodeType ? context.ownerDocument || context : document );

					// scripts is true for back-compat
					selector = jQuery.parseHTML( match[1], doc, true );
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						this.attr.call( selector, context, true );
					}

					return jQuery.merge( this, selector );

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.8.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ),
			"slice", core_slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready, 1 );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ core_toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// scripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, scripts ) {
		var parsed;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			scripts = context;
			context = 0;
		}
		context = context || document;

		// Single tag
		if ( (parsed = rsingleTag.exec( data )) ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts ? null : [] );
		return jQuery.merge( [],
			(parsed.cacheable ? jQuery.clone( parsed.fragment ) : parsed.fragment).childNodes );
	},

	parseJSON: function( data ) {
		if ( !data || typeof data !== "string") {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && core_rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || jQuery.isFunction( obj );

		if ( args ) {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.apply( obj[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( obj[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in obj ) {
					if ( callback.call( obj[ name ], name, obj[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( obj[ i ], i, obj[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var type,
			ret = results || [];

		if ( arr != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			type = jQuery.type( arr );

			if ( arr.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( arr ) ) {
				core_push.call( ret, arr );
			} else {
				jQuery.merge( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key,
			ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready, 1 );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.split( core_rspace ), function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" && ( !options.unique || !self.has( arg ) ) ) {
								list.push( arg );
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				return jQuery.inArray( fn, list ) > -1;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ]( jQuery.isFunction( fn ) ?
								function() {
									var returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.done( newDefer.resolve )
											.fail( newDefer.reject )
											.progress( newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								} :
								newDefer[ action ]
							);
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return typeof obj === "object" ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ] = list.fire
			deferred[ tuple[0] ] = list.fire;
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		fragment,
		eventName,
		i,
		isSupported,
		clickFn,
		div = document.createElement("div");

	// Preliminary tests
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	a.style.cssText = "top:1px;float:left;opacity:.5";

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: ( document.compatMode === "CSS1Compat" ),

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", clickFn = function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent("onclick");
		div.detachEvent( "onclick", clickFn );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	input.setAttribute( "checked", "checked" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "name", "t" );

	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for ( i in {
			submit: true,
			change: true,
			focusin: true
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, div, tds, marginDiv,
			divReset = "padding:0;margin:0;border:0;display:block;overflow:hidden;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// NOTE: To any future maintainer, we've window.getComputedStyle
		// because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = document.createElement("div");
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";
			div.appendChild( marginDiv );
			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "block";
			div.style.overflow = "visible";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			container.style.zoom = 1;
		}

		// Null elements to avoid leaks in IE
		body.removeChild( container );
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	fragment.removeChild( div );
	all = a = select = opt = input = fragment = div = null;

	return support;
})();
var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	deletedIds: [],

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = jQuery.deletedIds.pop() || ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,
			id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split(" ");
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject( cache[ id ] ) ) {
				return;
			}
		}

		// Destroy the cache
		if ( isNode ) {
			jQuery.cleanData( [ elem ], true );

		// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
		} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
			delete cache[ id ];

		// When all else fails, null
		} else {
			cache[ id ] = null;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, part, attr, name, l,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attr = elem.attributes;
					for ( l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split( ".", 2 );
		parts[1] = parts[1] ? "." + parts[1] : "";
		part = parts[1] + "!";

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				data = this.triggerHandler( "getData" + part, [ parts[0] ] );

				// Try to fetch any internally stored data first
				if ( data === undefined && elem ) {
					data = jQuery.data( elem, key );
					data = dataAttr( elem, key, data );
				}

				return data === undefined && parts[1] ?
					this.data( parts[0] ) :
					data;
			}

			parts[1] = value;
			this.each(function() {
				var self = jQuery( this );

				self.triggerHandler( "setData" + part, parts );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + part, parts );
			});
		}, null, value, arguments.length > 1, null, false );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				// Only convert to a number if it doesn't change the string
				+data + "" === data ? +data :
				rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery.removeData( elem, type + "queue", true );
				jQuery.removeData( elem, key, true );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook, fixSpecified,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea|)$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var removes, className, elem, c, cl, i, l;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}
		if ( (value && typeof value === "string") || value === undefined ) {
			removes = ( value || "" ).split( core_rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];
				if ( elem.nodeType === 1 && elem.className ) {

					className = (" " + elem.className + " ").replace( rclass, " " );

					// loop over each item in the removal list
					for ( c = 0, cl = removes.length; c < cl; c++ ) {
						// Remove until there is nothing to remove,
						while ( className.indexOf(" " + removes[ c ] + " ") > -1 ) {
							className = className.replace( " " + removes[ c ] + " " , " " );
						}
					}
					elem.className = value ? jQuery.trim( className ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( core_rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	// Unused in 1.8, left in so attrFn-stabbers won't die; remove in 1.9
	attrFn: {},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && jQuery.isFunction( jQuery.fn[ name ] ) ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, isBool,
			i = 0;

		if ( value && elem.nodeType === 1 ) {

			attrNames = value.split( core_rspace );

			for ( ; i < attrNames.length; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;
					isBool = rboolean.test( name );

					// See #9699 for explanation of this approach (setting first, then removal)
					// Do not do this for boolean attributes (see #10870)
					if ( !isBool ) {
						jQuery.attr( elem, name, "" );
					}
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( isBool && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true,
		coords: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.value = value + "" );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*|)(?:\.(.+)|)$/,
	rhoverHack = /(?:^|\s)hover(\.\S+|)\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var t, tns, type, origType, namespaces, origCount,
			j, events, special, eventType, handleObj,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, "events", true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType,
			type = event.type || event,
			namespaces = [];

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			for ( old = elem; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old === (elem.ownerDocument || document) ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var i, j, cur, ret, selMatch, matched, matches, handleObj, sel, related,
			handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments ),
			run_all = !event.exclusive && !event.namespace,
			special = jQuery.event.special[ event.type ] || {},
			handlerQueue = [];

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers that should run if there are delegated events
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !(event.button && event.type === "click") ) {

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {

				// Don't process clicks (ONLY) on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					selMatch = {};
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];
						sel = handleObj.selector;

						if ( selMatch[ sel ] === undefined ) {
							selMatch[ sel ] = jQuery( sel, this ).index( cur ) >= 0;
						}
						if ( selMatch[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, matches: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328; IE6/7/8)
		event.metaKey = !!event.metaKey;

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8 –
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "_submit_attached" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "_submit_attached", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "_change_attached" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "_change_attached", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) { // && selector != null
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2012 jQuery Foundation and other contributors
 *  Released under the MIT license
 *  http://sizzlejs.com/
 */
(function( window, undefined ) {

var dirruns,
	cachedruns,
	assertGetIdNotName,
	Expr,
	getText,
	isXML,
	contains,
	compile,
	sortOrder,
	hasDuplicate,

	baseHasDuplicate = true,
	strundefined = "undefined",

	expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

	document = window.document,
	docElem = document.documentElement,
	done = 0,
	slice = [].slice,
	push = [].push,

	// Augment a function for special use by Sizzle
	markFunction = function( fn, value ) {
		fn[ expando ] = value || true;
		return fn;
	},

	createCache = function() {
		var cache = {},
			keys = [];

		return markFunction(function( key, value ) {
			// Only keep the most recent entries
			if ( keys.push( key ) > Expr.cacheLength ) {
				delete cache[ keys.shift() ];
			}

			return (cache[ key ] = value);
		}, cache );
	},

	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// Regex

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments not in parens/brackets,
	//   then attribute selectors and non-pseudos (denoted by :),
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

	// For matchExpr.POS and matchExpr.needsContext
	pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

	rnot = /^:not/,
	rsibling = /[\x20\t\r\n\f]*[+~]/,
	rendsWithNot = /:not\($/,

	rheader = /h\d/i,
	rinputs = /input|select|textarea|button/i,

	rbackslash = /\\(?!\\)/g,

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|nth|last|first)-child(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"POS": new RegExp( pos, "ig" ),
		// For use in libraries implementing .is()
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
	},

	// Support

	// Used for testing something on an element
	assert = function( fn ) {
		var div = document.createElement("div");

		try {
			return fn( div );
		} catch (e) {
			return false;
		} finally {
			// release memory in IE
			div = null;
		}
	},

	// Check if getElementsByTagName("*") returns only elements
	assertTagNameNoComments = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	}),

	// Check if getAttribute returns normalized href attributes
	assertHrefNotNormalized = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}),

	// Check if attributes should be retrieved by attribute nodes
	assertAttributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	}),

	// Check if getElementsByClassName can be trusted
	assertUsableClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	}),

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	assertUsableName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = document.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			document.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			document.getElementsByName( expando + 0 ).length;
		assertGetIdNotName = !document.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

// If slice is not available, provide a backup
try {
	slice.call( docElem.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem, results = [];
		for ( ; (elem = this[i]); i++ ) {
			results.push( elem );
		}
		return results;
	};
}

function Sizzle( selector, context, results, seed ) {
	results = results || [];
	context = context || document;
	var match, elem, xml, m,
		nodeType = context.nodeType;

	if ( nodeType !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	xml = isXML( context );

	if ( !xml && !seed ) {
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}
	}

	// All others
	return select( selector, context, results, seed, xml );
}

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	return Sizzle( expr, null, null, [ elem ] ).length > 0;
};

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (see #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	} else {

		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	}
	return ret;
};

isXML = Sizzle.isXML = function isXML( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Element contains another
contains = Sizzle.contains = docElem.contains ?
	function( a, b ) {
		var adown = a.nodeType === 9 ? a.documentElement : a,
			bup = b && b.parentNode;
		return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
	} :
	docElem.compareDocumentPosition ?
	function( a, b ) {
		return b && !!( a.compareDocumentPosition( b ) & 16 );
	} :
	function( a, b ) {
		while ( (b = b.parentNode) ) {
			if ( b === a ) {
				return true;
			}
		}
		return false;
	};

Sizzle.attr = function( elem, name ) {
	var attr,
		xml = isXML( elem );

	if ( !xml ) {
		name = name.toLowerCase();
	}
	if ( Expr.attrHandle[ name ] ) {
		return Expr.attrHandle[ name ]( elem );
	}
	if ( assertAttributes || xml ) {
		return elem.getAttribute( name );
	}
	attr = elem.getAttributeNode( name );
	return attr ?
		typeof elem[ name ] === "boolean" ?
			elem[ name ] ? name : null :
			attr.specified ? attr.value : null :
		null;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	order: new RegExp( "ID|TAG" +
		(assertUsableName ? "|NAME" : "") +
		(assertUsableClassName ? "|CLASS" : "")
	),

	// IE6/7 return a modified href
	attrHandle: assertHrefNotNormalized ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		},

	find: {
		"ID": assertGetIdNotName ?
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					return m && m.parentNode ? [m] : [];
				}
			} :
			function( id, context, xml ) {
				if ( typeof context.getElementById !== strundefined && !xml ) {
					var m = context.getElementById( id );

					return m ?
						m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
							[m] :
							undefined :
						[];
				}
			},

		"TAG": assertTagNameNoComments ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== strundefined ) {
					return context.getElementsByTagName( tag );
				}
			} :
			function( tag, context ) {
				var results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					var elem,
						tmp = [],
						i = 0;

					for ( ; (elem = results[i]); i++ ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			},

		"NAME": function( tag, context ) {
			if ( typeof context.getElementsByName !== strundefined ) {
				return context.getElementsByName( name );
			}
		},

		"CLASS": function( className, context, xml ) {
			if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
				return context.getElementsByClassName( className );
			}
		}
	},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( rbackslash, "" );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr.CHILD
				1 type (only|nth|...)
				2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				3 xn-component of xn+y argument ([+-]?\d*n|)
				4 sign of xn-component
				5 x of xn-component
				6 sign of y-component
				7 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1] === "nth" ) {
				// nth-child requires argument
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
				match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

			// other types prohibit arguments
			} else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match, context, xml ) {
			var unquoted, excess;
			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			if ( match[3] ) {
				match[2] = match[3];
			} else if ( (unquoted = match[4]) ) {
				// Only check arguments that contain a pseudo
				if ( rpseudo.test(unquoted) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, context, xml, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					unquoted = unquoted.slice( 0, excess );
					match[0] = match[0].slice( 0, excess );
				}
				match[2] = unquoted;
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {
		"ID": assertGetIdNotName ?
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					return elem.getAttribute("id") === id;
				};
			} :
			function( id ) {
				id = id.replace( rbackslash, "" );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
					return node && node.value === id;
				};
			},

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}
			nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ expando ][ className ];
			if ( !pattern ) {
				pattern = classCache( className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)") );
			}
			return function( elem ) {
				return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
			};
		},

		"ATTR": function( name, operator, check ) {
			if ( !operator ) {
				return function( elem ) {
					return Sizzle.attr( elem, name ) != null;
				};
			}

			return function( elem ) {
				var result = Sizzle.attr( elem, name ),
					value = result + "";

				if ( result == null ) {
					return operator === "!=";
				}

				switch ( operator ) {
					case "=":
						return value === check;
					case "!=":
						return value !== check;
					case "^=":
						return check && value.indexOf( check ) === 0;
					case "*=":
						return check && value.indexOf( check ) > -1;
					case "$=":
						return check && value.substr( value.length - check.length ) === check;
					case "~=":
						return ( " " + value + " " ).indexOf( check ) > -1;
					case "|=":
						return value === check || value.substr( 0, check.length + 1 ) === check + "-";
				}
			};
		},

		"CHILD": function( type, argument, first, last ) {

			if ( type === "nth" ) {
				var doneName = done++;

				return function( elem ) {
					var parent, diff,
						count = 0,
						node = elem;

					if ( first === 1 && last === 0 ) {
						return true;
					}

					parent = elem.parentNode;

					if ( parent && (parent[ expando ] !== doneName || !elem.sizset) ) {
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.sizset = ++count;
								if ( node === elem ) {
									break;
								}
							}
						}

						parent[ expando ] = doneName;
					}

					diff = elem.sizset - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
				};
			}

			return function( elem ) {
				var node = elem;

				switch ( type ) {
					case "only":
					case "first":
						while ( (node = node.previousSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						if ( type === "first" ) {
							return true;
						}

						node = elem;

						/* falls through */
					case "last":
						while ( (node = node.nextSibling) ) {
							if ( node.nodeType === 1 ) {
								return false;
							}
						}

						return true;
				}
			};
		},

		"PSEUDO": function( pseudo, argument, context, xml ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.pseudos[ pseudo.toLowerCase() ];

			if ( !fn ) {
				Sizzle.error( "unsupported pseudo: " + pseudo );
			}

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( !fn[ expando ] ) {
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return function( elem ) {
						return fn( elem, 0, args );
					};
				}
				return fn;
			}

			return fn( argument, context, xml );
		}
	},

	pseudos: {
		"not": markFunction(function( selector, context, xml ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var matcher = compile( selector.replace( rtrim, "$1" ), context, xml );
			return function( elem ) {
				return !matcher( elem );
			};
		}),

		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			var nodeType;
			elem = elem.firstChild;
			while ( elem ) {
				if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
					return false;
				}
				elem = elem.nextSibling;
			}
			return true;
		},

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"text": function( elem ) {
			var type, attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				(type = elem.type) === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
		},

		// Input types
		"radio": createInputPseudo("radio"),
		"checkbox": createInputPseudo("checkbox"),
		"file": createInputPseudo("file"),
		"password": createInputPseudo("password"),
		"image": createInputPseudo("image"),

		"submit": createButtonPseudo("submit"),
		"reset": createButtonPseudo("reset"),

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"focus": function( elem ) {
			var doc = elem.ownerDocument;
			return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
		},

		"active": function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},

	setFilters: {
		"first": function( elements, argument, not ) {
			return not ? elements.slice( 1 ) : [ elements[0] ];
		},

		"last": function( elements, argument, not ) {
			var elem = elements.pop();
			return not ? elements : [ elem ];
		},

		"even": function( elements, argument, not ) {
			var results = [],
				i = not ? 1 : 0,
				len = elements.length;
			for ( ; i < len; i = i + 2 ) {
				results.push( elements[i] );
			}
			return results;
		},

		"odd": function( elements, argument, not ) {
			var results = [],
				i = not ? 0 : 1,
				len = elements.length;
			for ( ; i < len; i = i + 2 ) {
				results.push( elements[i] );
			}
			return results;
		},

		"lt": function( elements, argument, not ) {
			return not ? elements.slice( +argument ) : elements.slice( 0, +argument );
		},

		"gt": function( elements, argument, not ) {
			return not ? elements.slice( 0, +argument + 1 ) : elements.slice( +argument + 1 );
		},

		"eq": function( elements, argument, not ) {
			var elem = elements.splice( +argument, 1 );
			return not ? elements : elem;
		}
	}
};

function siblingCheck( a, b, ret ) {
	if ( a === b ) {
		return ret;
	}

	var cur = a.nextSibling;

	while ( cur ) {
		if ( cur === b ) {
			return -1;
		}

		cur = cur.nextSibling;
	}

	return 1;
}

sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
			a.compareDocumentPosition :
			a.compareDocumentPosition(b) & 4
		) ? -1 : 1;
	} :
	function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

// Always assume the presence of duplicates if sort doesn't
// pass them to our comparison function (as in Google Chrome).
[0, 0].sort( sortOrder );
baseHasDuplicate = !hasDuplicate;

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		i = 1;

	hasDuplicate = baseHasDuplicate;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				results.splice( i--, 1 );
			}
		}
	}

	return results;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

function tokenize( selector, context, xml, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, group, i,
		preFilters, filters,
		checkContext = !xml && context !== document,
		// Token cache should maintain spaces
		key = ( checkContext ? "<s>" : "" ) + selector.replace( rtrim, "$1<s>" ),
		cached = tokenCache[ expando ][ key ];

	if ( cached ) {
		return parseOnly ? 0 : slice.call( cached, 0 );
	}

	soFar = selector;
	groups = [];
	i = 0;
	preFilters = Expr.preFilter;
	filters = Expr.filter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				soFar = soFar.slice( match[0].length );
				tokens.selector = group;
			}
			groups.push( tokens = [] );
			group = "";

			// Need to make sure we're within a narrower context if necessary
			// Adding a descendant combinator will generate what is needed
			if ( checkContext ) {
				soFar = " " + soFar;
			}
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			group += match[0];
			soFar = soFar.slice( match[0].length );

			// Cast descendant combinators to space
			matched = tokens.push({
				part: match.pop().replace( rtrim, " " ),
				string: match[0],
				captures: match
			});
		}

		// Filters
		for ( type in filters ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				( match = preFilters[ type ](match, context, xml) )) ) {

				group += match[0];
				soFar = soFar.slice( match[0].length );
				matched = tokens.push({
					part: type,
					string: match.shift(),
					captures: match
				});
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Attach the full group as a selector
	if ( group ) {
		tokens.selector = group;
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			slice.call( tokenCache(key, groups), 0 );
}

function addCombinator( matcher, combinator, context, xml ) {
	var dir = combinator.dir,
		doneName = done++;

	if ( !matcher ) {
		// If there is no matcher to check, check against the context
		matcher = function( elem ) {
			return elem === context;
		};
	}
	return combinator.first ?
		function( elem ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 ) {
					return matcher( elem ) && elem;
				}
			}
		} :
		xml ?
			function( elem ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 ) {
						if ( matcher( elem ) ) {
							return elem;
						}
					}
				}
			} :
			function( elem ) {
				var cache,
					dirkey = doneName + "." + dirruns,
					cachedkey = dirkey + "." + cachedruns;
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 ) {
						if ( (cache = elem[ expando ]) === cachedkey ) {
							return elem.sizset;
						} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
							if ( elem.sizset ) {
								return elem;
							}
						} else {
							elem[ expando ] = cachedkey;
							if ( matcher( elem ) ) {
								elem.sizset = true;
								return elem;
							}
							elem.sizset = false;
						}
					}
				}
			};
}

function addMatcher( higher, deeper ) {
	return higher ?
		function( elem ) {
			var result = deeper( elem );
			return result && higher( result === true ? elem : result );
		} :
		deeper;
}

// ["TAG", ">", "ID", " ", "CLASS"]
function matcherFromTokens( tokens, context, xml ) {
	var token, matcher,
		i = 0;

	for ( ; (token = tokens[i]); i++ ) {
		if ( Expr.relative[ token.part ] ) {
			matcher = addCombinator( matcher, Expr.relative[ token.part ], context, xml );
		} else {
			matcher = addMatcher( matcher, Expr.filter[ token.part ].apply(null, token.captures.concat( context, xml )) );
		}
	}

	return matcher;
}

function matcherFromGroupMatchers( matchers ) {
	return function( elem ) {
		var matcher,
			j = 0;
		for ( ; (matcher = matchers[j]); j++ ) {
			if ( matcher(elem) ) {
				return true;
			}
		}
		return false;
	};
}

compile = Sizzle.compile = function( selector, context, xml ) {
	var group, i, len,
		cached = compilerCache[ expando ][ selector ];

	// Return a cached group function if already generated (context dependent)
	if ( cached && cached.context === context ) {
		return cached;
	}

	// Generate a function of recursive functions that can be used to check each element
	group = tokenize( selector, context, xml );
	for ( i = 0, len = group.length; i < len; i++ ) {
		group[i] = matcherFromTokens(group[i], context, xml);
	}

	// Cache the compiled function
	cached = compilerCache( selector, matcherFromGroupMatchers(group) );
	cached.context = context;
	cached.runs = cached.dirruns = 0;
	return cached;
};

function multipleContexts( selector, contexts, results, seed ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results, seed );
	}
}

function handlePOSGroup( selector, posfilter, argument, contexts, seed, not ) {
	var results,
		fn = Expr.setFilters[ posfilter.toLowerCase() ];

	if ( !fn ) {
		Sizzle.error( posfilter );
	}

	if ( selector || !(results = seed) ) {
		multipleContexts( selector || "*", contexts, (results = []), seed );
	}

	return results.length > 0 ? fn( results, argument, not ) : [];
}

function handlePOS( groups, context, results, seed ) {
	var group, part, j, groupLen, token, selector,
		anchor, elements, match, matched,
		lastIndex, currentContexts, not,
		i = 0,
		len = groups.length,
		rpos = matchExpr["POS"],
		// This is generated here in case matchExpr["POS"] is extended
		rposgroups = new RegExp( "^" + rpos.source + "(?!" + whitespace + ")", "i" ),
		// This is for making sure non-participating
		// matching groups are represented cross-browser (IE6-8)
		setUndefined = function() {
			var i = 1,
				len = arguments.length - 2;
			for ( ; i < len; i++ ) {
				if ( arguments[i] === undefined ) {
					match[i] = undefined;
				}
			}
		};

	for ( ; i < len; i++ ) {
		group = groups[i];
		part = "";
		elements = seed;
		for ( j = 0, groupLen = group.length; j < groupLen; j++ ) {
			token = group[j];
			selector = token.string;
			if ( token.part === "PSEUDO" ) {
				// Reset regex index to 0
				rpos.exec("");
				anchor = 0;
				while ( (match = rpos.exec( selector )) ) {
					matched = true;
					lastIndex = rpos.lastIndex = match.index + match[0].length;
					if ( lastIndex > anchor ) {
						part += selector.slice( anchor, match.index );
						anchor = lastIndex;
						currentContexts = [ context ];

						if ( rcombinators.test(part) ) {
							if ( elements ) {
								currentContexts = elements;
							}
							elements = seed;
						}

						if ( (not = rendsWithNot.test( part )) ) {
							part = part.slice( 0, -5 ).replace( rcombinators, "$&*" );
							anchor++;
						}

						if ( match.length > 1 ) {
							match[0].replace( rposgroups, setUndefined );
						}
						elements = handlePOSGroup( part, match[1], match[2], currentContexts, elements, not );
					}
					part = "";
				}

			}

			if ( !matched ) {
				part += selector;
			}
			matched = false;
		}

		if ( part ) {
			if ( rcombinators.test(part) ) {
				multipleContexts( part, elements || [ context ], results, seed );
			} else {
				Sizzle( part, context, results, seed ? seed.concat(elements) : elements );
			}
		} else {
			push.apply( results, elements );
		}
	}

	// Do not sort if this is a single filter
	return len === 1 ? results : Sizzle.uniqueSort( results );
}

function select( selector, context, results, seed, xml ) {
	// Remove excessive whitespace
	selector = selector.replace( rtrim, "$1" );
	var elements, matcher, cached, elem,
		i, tokens, token, lastToken, findContext, type,
		match = tokenize( selector, context, xml ),
		contextNodeType = context.nodeType;

	// POS handling
	if ( matchExpr["POS"].test(selector) ) {
		return handlePOS( match, context, results, seed );
	}

	if ( seed ) {
		elements = slice.call( seed, 0 );

	// To maintain document order, only narrow the
	// set if there is one group
	} else if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		if ( (tokens = slice.call( match[0], 0 )).length > 2 &&
				(token = tokens[0]).part === "ID" &&
				contextNodeType === 9 && !xml &&
				Expr.relative[ tokens[1].part ] ) {

			context = Expr.find["ID"]( token.captures[0].replace( rbackslash, "" ), context, xml )[0];
			if ( !context ) {
				return results;
			}

			selector = selector.slice( tokens.shift().string.length );
		}

		findContext = ( (match = rsibling.exec( tokens[0].string )) && !match.index && context.parentNode ) || context;

		// Reduce the set if possible
		lastToken = "";
		for ( i = tokens.length - 1; i >= 0; i-- ) {
			token = tokens[i];
			type = token.part;
			lastToken = token.string + lastToken;
			if ( Expr.relative[ type ] ) {
				break;
			}
			if ( Expr.order.test(type) ) {
				elements = Expr.find[ type ]( token.captures[0].replace( rbackslash, "" ), findContext, xml );
				if ( elements == null ) {
					continue;
				} else {
					selector = selector.slice( 0, selector.length - lastToken.length ) +
						lastToken.replace( matchExpr[ type ], "" );

					if ( !selector ) {
						push.apply( results, slice.call(elements, 0) );
					}

					break;
				}
			}
		}
	}

	// Only loop over the given elements once
	if ( selector ) {
		matcher = compile( selector, context, xml );
		dirruns = matcher.dirruns++;
		if ( elements == null ) {
			elements = Expr.find["TAG"]( "*", (rsibling.test( selector ) && context.parentNode) || context );
		}

		for ( i = 0; (elem = elements[i]); i++ ) {
			cachedruns = matcher.runs++;
			if ( matcher(elem) ) {
				results.push( elem );
			}
		}
	}

	return results;
}

if ( document.querySelectorAll ) {
	(function() {
		var disconnectedMatch,
			oldSelect = select,
			rescape = /'|\\/g,
			rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
			rbuggyQSA = [],
			// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
			// A support test would require too much code (would include document ready)
			// just skip matchesSelector for :active
			rbuggyMatches = [":active"],
			matches = docElem.matchesSelector ||
				docElem.mozMatchesSelector ||
				docElem.webkitMatchesSelector ||
				docElem.oMatchesSelector ||
				docElem.msMatchesSelector;

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here (do not put tests after this one)
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE9 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<p test=''></p>";
			if ( div.querySelectorAll("[test^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here (do not put tests after this one)
			div.innerHTML = "<input type='hidden'/>";
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push(":enabled", ":disabled");
			}
		});

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

		select = function( selector, context, results, seed, xml ) {
			// Only use querySelectorAll when not filtering,
			// when this is not xml,
			// and when no QSA bugs apply
			if ( !seed && !xml && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
				if ( context.nodeType === 9 ) {
					try {
						push.apply( results, slice.call(context.querySelectorAll( selector ), 0) );
						return results;
					} catch(qsaError) {}
				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var groups, i, len,
						old = context.getAttribute("id"),
						nid = old || expando,
						newContext = rsibling.test( selector ) && context.parentNode || context;

					if ( old ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", nid );
					}

					groups = tokenize(selector, context, xml);
					// Trailing space is unnecessary
					// There is always a context check
					nid = "[id='" + nid + "']";
					for ( i = 0, len = groups.length; i < len; i++ ) {
						groups[i] = nid + groups[i].selector;
					}
					try {
						push.apply( results, slice.call( newContext.querySelectorAll(
							groups.join(",")
						), 0 ) );
						return results;
					} catch(qsaError) {
					} finally {
						if ( !old ) {
							context.removeAttribute("id");
						}
					}
				}
			}

			return oldSelect( selector, context, results, seed, xml );
		};

		if ( matches ) {
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				try {
					matches.call( div, "[test!='']:sizzle" );
					rbuggyMatches.push( matchExpr["PSEUDO"].source, matchExpr["POS"].source, "!=" );
				} catch ( e ) {}
			});

			// rbuggyMatches always contains :active, so no need for a length check
			rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

			Sizzle.matchesSelector = function( elem, expr ) {
				// Make sure that attribute selectors are quoted
				expr = expr.replace( rattributeQuotes, "='$1']" );

				// rbuggyMatches always contains :active, so no need for an existence check
				if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && (!rbuggyQSA || !rbuggyQSA.test( expr )) ) {
					try {
						var ret = matches.call( elem, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9
								elem.document && elem.document.nodeType !== 11 ) {
							return ret;
						}
					} catch(e) {}
				}

				return Sizzle( expr, null, null, [ elem ] ).length > 0;
			};
		}
	})();
}

// Deprecated
Expr.setFilters["nth"] = Expr.setFilters["eq"];

// Back-compat
Expr.filters = Expr.pseudos;

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, l, length, n, r, ret,
			self = this;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		ret = this.pushStack( "", "find", selector );

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, core_slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rcheckableType = /^(?:checkbox|radio)$/,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
// unless wrapped in a div with non-breaking characters in front of it.
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "X<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( set, this ), "before", this.selector );
		}
	},

	after: function() {
		if ( !isDisconnected( this[0] ) ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		}

		if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			return this.pushStack( jQuery.merge( this, set ), "after", this.selector );
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( elem.getElementsByTagName( "*" ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		if ( !isDisconnected( this[0] ) ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		}

		return this.length ?
			this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
			this;
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = [].concat.apply( [], args );

		var results, first, fragment, iNoClone,
			i = 0,
			value = args[0],
			scripts = [],
			l = this.length;

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && l > 1 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call( this, i, table ? self.html() : undefined );
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			results = jQuery.buildFragment( args, this, scripts );
			fragment = results.fragment;
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				// Fragments from the fragment cache must always be cloned and never used in place.
				for ( iNoClone = results.cacheable || l - 1; i < l; i++ ) {
					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						i === iNoClone ?
							fragment :
							jQuery.clone( fragment, true, true )
					);
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;

			if ( scripts.length ) {
				jQuery.each( scripts, function( i, elem ) {
					if ( elem.src ) {
						if ( jQuery.ajax ) {
							jQuery.ajax({
								url: elem.src,
								type: "GET",
								dataType: "script",
								async: false,
								global: false,
								"throws": true
							});
						} else {
							jQuery.error("no ajax");
						}
					} else {
						jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "" ) );
					}

					if ( elem.parentNode ) {
						elem.parentNode.removeChild( elem );
					}
				});
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	if ( nodeName === "object" ) {
		// IE6-10 improperly clones children of object elements using classid.
		// IE10 throws NoModificationAllowedError if parent is null, #12132.
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && (src.innerHTML && !jQuery.trim(dest.innerHTML)) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;

	// IE blanks contents when cloning scripts
	} else if ( nodeName === "script" && dest.text !== src.text ) {
		dest.text = src.text;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, context, scripts ) {
	var fragment, cacheable, cachehit,
		first = args[ 0 ];

	// Set context from what may come in as undefined or a jQuery collection or a node
	// Updated to fix #12266 where accessing context[0] could throw an exception in IE9/10 &
	// also doubles as fix for #8950 where plain objects caused createDocumentFragment exception
	context = context || document;
	context = !context.nodeType && context[0] || context;
	context = context.ownerDocument || context;

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && context === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		// Mark cacheable and look for a hit
		cacheable = true;
		fragment = jQuery.fragments[ first ];
		cachehit = fragment !== undefined;
	}

	if ( !fragment ) {
		fragment = context.createDocumentFragment();
		jQuery.clean( args, context, fragment, scripts );

		// Update the cache, but only store false
		// unless this is a second parsing of the same content
		if ( cacheable ) {
			jQuery.fragments[ first ] = cachehit && fragment;
		}
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			l = insert.length,
			parent = this.length === 1 && this[0].parentNode;

		if ( (parent == null || parent && parent.nodeType === 11 && parent.childNodes.length === 1) && l === 1 ) {
			insert[ original ]( this[0] );
			return this;
		} else {
			for ( ; i < l; i++ ) {
				elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			clone;

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var i, j, elem, tag, wrap, depth, div, hasBody, tbody, len, handleScript, jsTags,
			safe = context === document && safeFragment,
			ret = [];

		// Ensure that context is a document
		if ( !context || typeof context.createDocumentFragment === "undefined" ) {
			context = document;
		}

		// Use the already-created safe fragment if context permits
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Ensure a safe container in which to render the html
					safe = safe || createSafeFragment( context );
					div = context.createElement("div");
					safe.appendChild( div );

					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Go to html and back, then peel off extra wrappers
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					depth = wrap[0];
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						hasBody = rtbody.test(elem);
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;

					// Take out of fragment container (we need a fresh div each time)
					div.parentNode.removeChild( div );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				jQuery.merge( ret, elem );
			}
		}

		// Fix #11356: Clear elements from safeFragment
		if ( div ) {
			elem = div = safe = null;
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				if ( jQuery.nodeName( elem, "input" ) ) {
					fixDefaultChecked( elem );
				} else if ( typeof elem.getElementsByTagName !== "undefined" ) {
					jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
				}
			}
		}

		// Append elements to a provided document fragment
		if ( fragment ) {
			// Special handling of each script element
			handleScript = function( elem ) {
				// Check if we consider it executable
				if ( !elem.type || rscriptType.test( elem.type ) ) {
					// Detach the script and store it in the scripts array (if provided) or the fragment
					// Return truthy to indicate that it has been handled
					return scripts ?
						scripts.push( elem.parentNode ? elem.parentNode.removeChild( elem ) : elem ) :
						fragment.appendChild( elem );
				}
			};

			for ( i = 0; (elem = ret[i]) != null; i++ ) {
				// Check if we're done after handling an executable script
				if ( !( jQuery.nodeName( elem, "script" ) && handleScript( elem ) ) ) {
					// Append to fragment and handle embedded scripts
					fragment.appendChild( elem );
					if ( typeof elem.getElementsByTagName !== "undefined" ) {
						// handleScript alters the DOM, so use jQuery.merge to ensure snapshot iteration
						jsTags = jQuery.grep( jQuery.merge( [], elem.getElementsByTagName("script") ), handleScript );

						// Splice the scripts into ret after their former ancestor and advance our index beyond them
						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
						i += jsTags.length;
					}
				}
			}
		}

		return ret;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var data, id, elem, type,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( elem.removeAttribute ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						jQuery.deletedIds.push( id );
					}
				}
			}
		}
	}
});
// Limit scope pollution from any deprecated API
(function() {

var matched, browser;

// Use of jQuery.browser is frowned upon.
// More details: http://api.jquery.com/jQuery.browser
// jQuery.uaMatch maintained for back-compat
jQuery.uaMatch = function( ua ) {
	ua = ua.toLowerCase();

	var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		/(msie) ([\w.]+)/.exec( ua ) ||
		ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		[];

	return {
		browser: match[ 1 ] || "",
		version: match[ 2 ] || "0"
	};
};

matched = jQuery.uaMatch( navigator.userAgent );
browser = {};

if ( matched.browser ) {
	browser[ matched.browser ] = true;
	browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if ( browser.chrome ) {
	browser.webkit = true;
} else if ( browser.webkit ) {
	browser.safari = true;
}

jQuery.browser = browser;

jQuery.sub = function() {
	function jQuerySub( selector, context ) {
		return new jQuerySub.fn.init( selector, context );
	}
	jQuery.extend( true, jQuerySub, this );
	jQuerySub.superclass = this;
	jQuerySub.fn = jQuerySub.prototype = this();
	jQuerySub.fn.constructor = jQuerySub;
	jQuerySub.sub = this.sub;
	jQuerySub.fn.init = function init( selector, context ) {
		if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
			context = jQuerySub( context );
		}

		return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
	};
	jQuerySub.fn.init.prototype = jQuerySub.fn;
	var rootjQuerySub = jQuerySub(document);
	return jQuerySub;
};

})();
var curCSS, iframe, iframeDoc,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([-+])=(" + core_pnum + ")", "i" ),
	elemdisplay = {},

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],

	eventsToggle = jQuery.fn.toggle;

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var elem, display,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		values[ index ] = jQuery._data( elem, "olddisplay" );
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && elem.style.display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {
			display = curCSS( elem, "display" );

			if ( !values[ index ] && display !== "none" ) {
				jQuery._data( elem, "olddisplay", display );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state, fn2 ) {
		var bool = typeof state === "boolean";

		if ( jQuery.isFunction( state ) && jQuery.isFunction( fn2 ) ) {
			return eventsToggle.apply( this, arguments );
		}

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;

				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, numeric, extra ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( numeric || extra !== undefined ) {
			num = parseFloat( val );
			return numeric || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: To any future maintainer, we've window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	curCSS = function( elem, name ) {
		var ret, width, minWidth, maxWidth,
			computed = window.getComputedStyle( elem, null ),
			style = elem.style;

		if ( computed ) {

			ret = computed[ name ];
			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	curCSS = function( elem, name ) {
		var left, rsLeft,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			// we use jQuery.css instead of curCSS here
			// because of the reliableMarginRight CSS hook!
			val += jQuery.css( elem, extra + cssExpand[ i ], true );
		}

		// From this point on we use curCSS for maximum performance (relevant in animations)
		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += parseFloat( curCSS( elem, "padding" + cssExpand[ i ] ) ) || 0;

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += parseFloat( curCSS( elem, "border" + cssExpand[ i ] + "Width" ) ) || 0;
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		valueIsBorderBox = true,
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox
		)
	) + "px";
}


// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	if ( elemdisplay[ nodeName ] ) {
		return elemdisplay[ nodeName ];
	}

	var elem = jQuery( "<" + nodeName + ">" ).appendTo( document.body ),
		display = elem.css("display");
	elem.remove();

	// If the simple way fails,
	// get element's real default display by attaching it to a temp iframe
	if ( display === "none" || display === "" ) {
		// Use the already-created iframe if possible
		iframe = document.body.appendChild(
			iframe || jQuery.extend( document.createElement("iframe"), {
				frameBorder: 0,
				width: 0,
				height: 0
			})
		);

		// Create a cacheable copy of the iframe document on first call.
		// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
		// document to it; WebKit & Firefox won't allow reusing the iframe document.
		if ( !iframeDoc || !iframe.createElement ) {
			iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
			iframeDoc.write("<!doctype html><html><body>");
			iframeDoc.close();
		}

		elem = iframeDoc.body.appendChild( iframeDoc.createElement(nodeName) );

		display = curCSS( elem, "display" );
		document.body.removeChild( iframe );
	}

	// Store the correct default display
	elemdisplay[ nodeName ] = display;

	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				if ( elem.offsetWidth === 0 && rdisplayswap.test( curCSS( elem, "display" ) ) ) {
					return jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					});
				} else {
					return getWidthOrHeight( elem, name, extra );
				}
			}
		},

		set: function( elem, value, extra ) {
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing" ) === "border-box"
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
				style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						return curCSS( elem, "marginRight" );
					}
				});
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						var ret = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( ret ) ? jQuery( elem ).position()[ prop ] + "px" : ret;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		return ( elem.offsetWidth === 0 && elem.offsetHeight === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || curCSS( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i,

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ],
				expanded = {};

			for ( i = 0; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	rselectTextarea = /^(?:select|textarea)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
var // Document location
	ajaxLocation,
	// Document location segments
	ajaxLocParts,

	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType, list, placeBefore,
			dataTypes = dataTypeExpression.toLowerCase().split( core_rspace ),
			i = 0,
			length = dataTypes.length;

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var selection,
		list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters );

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	// Don't do a request if no elements are being requested
	if ( !this.length ) {
		return this;
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// Request the remote document
	jQuery.ajax({
		url: url,

		// if "type" variable is undefined, then "GET" method will be used
		type: type,
		dataType: "html",
		data: params,
		complete: function( jqXHR, status ) {
			if ( callback ) {
				self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
			}
		}
	}).done(function( responseText ) {

		// Save response for use in complete callback
		response = arguments;

		// See if a selector was specified
		self.html( selector ?

			// Create a dummy div to hold the results
			jQuery("<div>")

				// inject the contents of the document in, removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				.append( responseText.replace( rscript, "" ) )

				// Locate the specified elements
				.find( selector ) :

			// If not, just inject the full result
			responseText );

	});

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // ifModified key
			ifModifiedKey,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || strAbort;
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ ifModifiedKey ] = modified;
					}
					modified = jqXHR.getResponseHeader("Etag");
					if ( modified ) {
						jQuery.etag[ ifModifiedKey ] = modified;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.always( tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( core_rspace );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already and return
				return jqXHR.abort();

		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	var conv, conv2, current, tmp,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ],
		converters = {},
		i = 0;

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
var oldCallbacks = [],
	rquestion = /\?/,
	rjsonp = /(=)\?(?=&|$)|\?\?/,
	nonce = jQuery.now();

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		data = s.data,
		url = s.url,
		hasCallback = s.jsonp !== false,
		replaceInUrl = hasCallback && rjsonp.test( url ),
		replaceInData = hasCallback && !replaceInUrl && typeof data === "string" &&
			!( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") &&
			rjsonp.test( data );

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( s.dataTypes[ 0 ] === "jsonp" || replaceInUrl || replaceInData ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;
		overwritten = window[ callbackName ];

		// Insert callback into url or form data
		if ( replaceInUrl ) {
			s.url = url.replace( rjsonp, "$1" + callbackName );
		} else if ( replaceInData ) {
			s.data = data.replace( rjsonp, "$1" + callbackName );
		} else if ( hasCallback ) {
			s.url += ( rquestion.test( url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});
var xhrCallbacks,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									try {
										responses.text = xhr.responseText;
									} catch( _ ) {
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback, 0 );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([-+])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit, prevScale,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						prevScale = scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

						// Update scale, tolerating zeroes from tween.cur()
						scale = tween.cur() / target;

					// Stop looping if we've hit the mark or scale is unchanged
					} while ( scale !== 1 && scale !== prevScale );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	}, 0 );
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		index = 0,
		tweenerIndex = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				percent = 1 - ( remaining / animation.duration || 0 ),
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end, easing ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			anim: animation,
			queue: animation.opts.queue,
			elem: elem
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	var index, prop, value, length, dataShow, tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.done(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery.removeData( elem, "fxshow", true );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing any value as a 4th parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, false, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ||
			// special check for .toggle( handler, handler, ... )
			( !i && jQuery.isFunction( speed ) && jQuery.isFunction( easing ) ) ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations resolve immediately
				if ( empty ) {
					anim.stop( true );
				}
			};

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) && !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.interval = 13;

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
var rroot = /^(?:body|html)$/i;

jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var box, docElem, body, win, clientTop, clientLeft, scrollTop, scrollLeft, top, left,
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	if ( (body = doc.body) === elem ) {
		return jQuery.offset.bodyOffset( elem );
	}

	docElem = doc.documentElement;

	// Make sure we're not dealing with a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return { top: 0, left: 0 };
	}

	box = elem.getBoundingClientRect();
	win = getWindow( doc );
	clientTop  = docElem.clientTop  || body.clientTop  || 0;
	clientLeft = docElem.clientLeft || body.clientLeft || 0;
	scrollTop  = win.pageYOffset || docElem.scrollTop;
	scrollLeft = win.pageXOffset || docElem.scrollLeft;
	top  = box.top  + scrollTop  - clientTop;
	left = box.left + scrollLeft - clientLeft;

	return { top: top, left: left };
};

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.body;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					 top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, value, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

return jQuery;

})( window ); }));

},{}],6:[function(require,module,exports){
(function () {
  /**
   * @fileoverview Main function src.
   */

  // HTML5 Shiv. Must be in <head> to support older browsers.
  document.createElement('video');document.createElement('audio');

  /**
   * Doubles as the main function for users to create a player instance and also
   * the main library object.
   *
   * @param  {String|Element} id      Video element or video element ID
   * @param  {Object=} options        Optional options object for config/settings
   * @param  {Function=} ready        Optional ready callback
   * @return {vjs.Player}             A player instance
   */
  var vjs = function(id, options, ready){
    var tag; // Element of ID

    // Allow for element or ID to be passed in
    // String ID
    if (typeof id === 'string') {

      // Adjust for jQuery ID syntax
      if (id.indexOf('#') === 0) {
        id = id.slice(1);
      }

      // If a player instance has already been created for this ID return it.
      if (vjs.players[id]) {
        return vjs.players[id];

      // Otherwise get element for ID
      } else {
        tag = vjs.el(id);
      }

    // ID is a media element
    } else {
      tag = id;
    }

    // Check for a useable element
    if (!tag || !tag.nodeName) { // re: nodeName, could be a box div also
      throw new TypeError('The element or ID supplied is not valid. (videojs)'); // Returns
    }

    // Element may have a player attr referring to an already created player instance.
    // If not, set up a new player and return the instance.
    return tag['player'] || new vjs.Player(tag, options, ready);
  };

  // Extended name, also available externally, window.videojs
  var videojs = vjs;
  // nope! exported at end of the module.
  // window.videojs = window.vjs = vjs;

  // CDN Version. Used to target right flash swf.
  vjs.CDN_VERSION = '4.0';
  vjs.ACCESS_PROTOCOL = ('https:' == document.location.protocol ? 'https://' : 'http://');

  /**
   * Global Player instance options, surfaced from vjs.Player.prototype.options_
   * vjs.options = vjs.Player.prototype.options_
   * All options should use string keys so they avoid
   * renaming by closure compiler
   * @type {Object}
   */
  vjs.options = {
    // Default order of fallback technology
    'techOrder': ['html5','flash'],
    // techOrder: ['flash','html5'],

    'html5': {},
    'flash': {},

    // Default of web browser is 300x150. Should rely on source width/height.
    'width': 300,
    'height': 150,
    // defaultVolume: 0.85,
    'defaultVolume': 0.00, // The freakin seaguls are driving me crazy!

    // Included control sets
    'children': {
      'mediaLoader': {},
      'posterImage': {},
      'textTrackDisplay': {},
      'loadingSpinner': {},
      'bigPlayButton': {},
      'controlBar': {}
    }
  };

  // Set CDN Version of swf
  // The added (+) blocks the replace from changing this 4.0 string
  if (vjs.CDN_VERSION !== 'GENERATED'+'_CDN_VSN') {
    videojs.options['flash']['swf'] = vjs.ACCESS_PROTOCOL + 'vjs.zencdn.net/'+vjs.CDN_VERSION+'/video-js.swf';
  }

  /**
   * Global player list
   * @type {Object}
   */
  vjs.players = {};
  /**
   * Core Object/Class for objects that use inheritance + contstructors
   * @constructor
   */
  vjs.CoreObject = vjs['CoreObject'] = function(){};
  // Manually exporting vjs['CoreObject'] here for Closure Compiler
  // because of the use of the extend/create class methods
  // If we didn't do this, those functions would get flattend to something like
  // `a = ...` and `this.prototype` would refer to the global object instead of
  // CoreObject

  /**
   * Create a new object that inherits from this Object
   * @param {Object} props Functions and properties to be applied to the
   *                       new object's prototype
   * @return {vjs.CoreObject} Returns an object that inherits from CoreObject
   * @this {*}
   */
  vjs.CoreObject.extend = function(props){
    var init, subObj;

    props = props || {};
    // Set up the constructor using the supplied init method
    // or using the init of the parent object
    // Make sure to check the unobfuscated version for external libs
    init = props['init'] || props.init || this.prototype['init'] || this.prototype.init || function(){};
    // In Resig's simple class inheritance (previously used) the constructor
    //  is a function that calls `this.init.apply(arguments)`
    // However that would prevent us from using `ParentObject.call(this);`
    //  in a Child constuctor because the `this` in `this.init`
    //  would still refer to the Child and cause an inifinite loop.
    // We would instead have to do
    //    `ParentObject.prototype.init.apply(this, argumnents);`
    //  Bleh. We're not creating a _super() function, so it's good to keep
    //  the parent constructor reference simple.
    subObj = function(){
      init.apply(this, arguments);
    };

    // Inherit from this object's prototype
    subObj.prototype = vjs.obj.create(this.prototype);
    // Reset the constructor property for subObj otherwise
    // instances of subObj would have the constructor of the parent Object
    subObj.prototype.constructor = subObj;

    // Make the class extendable
    subObj.extend = vjs.CoreObject.extend;
    // Make a function for creating instances
    subObj.create = vjs.CoreObject.create;

    // Extend subObj's prototype with functions and other properties from props
    for (var name in props) {
      if (props.hasOwnProperty(name)) {
        subObj.prototype[name] = props[name];
      }
    }

    return subObj;
  };

  /**
   * Create a new instace of this Object class
   * @return {vjs.CoreObject} Returns an instance of a CoreObject subclass
   * @this {*}
   */
  vjs.CoreObject.create = function(){
    // Create a new object that inherits from this object's prototype
    var inst = vjs.obj.create(this.prototype);

    // Apply this constructor function to the new object
    this.apply(inst, arguments);

    // Return the new object
    return inst;
  };
  /**
   * @fileoverview Event System (John Resig - Secrets of a JS Ninja http://jsninja.com/)
   * (Original book version wasn't completely usable, so fixed some things and made Closure Compiler compatible)
   * This should work very similarly to jQuery's events, however it's based off the book version which isn't as
   * robust as jquery's, so there's probably some differences.
   */

  /**
   * Add an event listener to element
   * It stores the handler function in a separate cache object
   * and adds a generic handler to the element's event,
   * along with a unique id (guid) to the element.
   * @param  {Element|Object}   elem Element or object to bind listeners to
   * @param  {String}   type Type of event to bind to.
   * @param  {Function} fn   Event listener.
   */
  vjs.on = function(elem, type, fn){
    var data = vjs.getData(elem);

    // We need a place to store all our handler data
    if (!data.handlers) data.handlers = {};

    if (!data.handlers[type]) data.handlers[type] = [];

    if (!fn.guid) fn.guid = vjs.guid++;

    data.handlers[type].push(fn);

    if (!data.dispatcher) {
      data.disabled = false;

      data.dispatcher = function (event){

        if (data.disabled) return;
        event = vjs.fixEvent(event);

        var handlers = data.handlers[event.type];

        if (handlers) {
          // Copy handlers so if handlers are added/removed during the process it doesn't throw everything off.
          var handlersCopy = handlers.slice(0);

          for (var m = 0, n = handlersCopy.length; m < n; m++) {
            if (event.isImmediatePropagationStopped()) {
              break;
            } else {
              handlersCopy[m].call(elem, event);
            }
          }
        }
      };
    }

    if (data.handlers[type].length == 1) {
      if (document.addEventListener) {
        elem.addEventListener(type, data.dispatcher, false);
      } else if (document.attachEvent) {
        elem.attachEvent('on' + type, data.dispatcher);
      }
    }
  };

  /**
   * Removes event listeners from an element
   * @param  {Element|Object}   elem Object to remove listeners from
   * @param  {String=}   type Type of listener to remove. Don't include to remove all events from element.
   * @param  {Function} fn   Specific listener to remove. Don't incldue to remove listeners for an event type.
   */
  vjs.off = function(elem, type, fn) {
    // Don't want to add a cache object through getData if not needed
    if (!vjs.hasData(elem)) return;

    var data = vjs.getData(elem);

    // If no events exist, nothing to unbind
    if (!data.handlers) { return; }

    // Utility function
    var removeType = function(t){
       data.handlers[t] = [];
       vjs.cleanUpEvents(elem,t);
    };

    // Are we removing all bound events?
    if (!type) {
      for (var t in data.handlers) removeType(t);
      return;
    }

    var handlers = data.handlers[type];

    // If no handlers exist, nothing to unbind
    if (!handlers) return;

    // If no listener was provided, remove all listeners for type
    if (!fn) {
      removeType(type);
      return;
    }

    // We're only removing a single handler
    if (fn.guid) {
      for (var n = 0; n < handlers.length; n++) {
        if (handlers[n].guid === fn.guid) {
          handlers.splice(n--, 1);
        }
      }
    }

    vjs.cleanUpEvents(elem, type);
  };

  /**
   * Clean up the listener cache and dispatchers
   * @param  {Element|Object} elem Element to clean up
   * @param  {String} type Type of event to clean up
   */
  vjs.cleanUpEvents = function(elem, type) {
    var data = vjs.getData(elem);

    // Remove the events of a particular type if there are none left
    if (data.handlers[type].length === 0) {
      delete data.handlers[type];
      // data.handlers[type] = null;
      // Setting to null was causing an error with data.handlers

      // Remove the meta-handler from the element
      if (document.removeEventListener) {
        elem.removeEventListener(type, data.dispatcher, false);
      } else if (document.detachEvent) {
        elem.detachEvent('on' + type, data.dispatcher);
      }
    }

    // Remove the events object if there are no types left
    if (vjs.isEmpty(data.handlers)) {
      delete data.handlers;
      delete data.dispatcher;
      delete data.disabled;

      // data.handlers = null;
      // data.dispatcher = null;
      // data.disabled = null;
    }

    // Finally remove the expando if there is no data left
    if (vjs.isEmpty(data)) {
      vjs.removeData(elem);
    }
  };

  /**
   * Fix a native event to have standard property values
   * @param  {Object} event Event object to fix
   * @return {Object}
   */
  vjs.fixEvent = function(event) {

    function returnTrue() { return true; }
    function returnFalse() { return false; }

    // Test if fixing up is needed
    // Used to check if !event.stopPropagation instead of isPropagationStopped
    // But native events return true for stopPropagation, but don't have
    // other expected methods like isPropagationStopped. Seems to be a problem
    // with the Javascript Ninja code. So we're just overriding all events now.
    if (!event || !event.isPropagationStopped) {
      var old = event || window.event;

      event = {};
      // Clone the old object so that we can modify the values event = {};
      // IE8 Doesn't like when you mess with native event properties
      // Firefox returns false for event.hasOwnProperty('type') and other props
      //  which makes copying more difficult.
      // TODO: Probably best to create a whitelist of event props
      for (var key in old) {
        // Safari 6.0.3 warns you if you try to copy deprecated layerX/Y
        if (key !== 'layerX' && key !== 'layerY') {
          event[key] = old[key];
        }
      }

      // The event occurred on this element
      if (!event.target) {
        event.target = event.srcElement || document;
      }

      // Handle which other element the event is related to
      event.relatedTarget = event.fromElement === event.target ?
        event.toElement :
        event.fromElement;

      // Stop the default browser action
      event.preventDefault = function () {
        if (old.preventDefault) {
          old.preventDefault();
        }
        event.returnValue = false;
        event.isDefaultPrevented = returnTrue;
      };

      event.isDefaultPrevented = returnFalse;

      // Stop the event from bubbling
      event.stopPropagation = function () {
        if (old.stopPropagation) {
          old.stopPropagation();
        }
        event.cancelBubble = true;
        event.isPropagationStopped = returnTrue;
      };

      event.isPropagationStopped = returnFalse;

      // Stop the event from bubbling and executing other handlers
      event.stopImmediatePropagation = function () {
        if (old.stopImmediatePropagation) {
          old.stopImmediatePropagation();
        }
        event.isImmediatePropagationStopped = returnTrue;
        event.stopPropagation();
      };

      event.isImmediatePropagationStopped = returnFalse;

      // Handle mouse position
      if (event.clientX != null) {
        var doc = document.documentElement, body = document.body;

        event.pageX = event.clientX +
          (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);
        event.pageY = event.clientY +
          (doc && doc.scrollTop || body && body.scrollTop || 0) -
          (doc && doc.clientTop || body && body.clientTop || 0);
      }

      // Handle key presses
      event.which = event.charCode || event.keyCode;

      // Fix button for mouse clicks:
      // 0 == left; 1 == middle; 2 == right
      if (event.button != null) {
        event.button = (event.button & 1 ? 0 :
          (event.button & 4 ? 1 :
            (event.button & 2 ? 2 : 0)));
      }
    }

    // Returns fixed-up instance
    return event;
  };

  /**
   * Trigger an event for an element
   * @param  {Element|Object} elem  Element to trigger an event on
   * @param  {String} event Type of event to trigger
   */
  vjs.trigger = function(elem, event) {
    // Fetches element data and a reference to the parent (for bubbling).
    // Don't want to add a data object to cache for every parent,
    // so checking hasData first.
    var elemData = (vjs.hasData(elem)) ? vjs.getData(elem) : {};
    var parent = elem.parentNode || elem.ownerDocument;
        // type = event.type || event,
        // handler;

    // If an event name was passed as a string, creates an event out of it
    if (typeof event === 'string') {
      event = { type:event, target:elem };
    }
    // Normalizes the event properties.
    event = vjs.fixEvent(event);

    // If the passed element has a dispatcher, executes the established handlers.
    if (elemData.dispatcher) {
      elemData.dispatcher.call(elem, event);
    }

    // Unless explicitly stopped, recursively calls this function to bubble the event up the DOM.
    if (parent && !event.isPropagationStopped()) {
      vjs.trigger(parent, event);

    // If at the top of the DOM, triggers the default action unless disabled.
    } else if (!parent && !event.isDefaultPrevented()) {
      var targetData = vjs.getData(event.target);

      // Checks if the target has a default action for this event.
      if (event.target[event.type]) {
        // Temporarily disables event dispatching on the target as we have already executed the handler.
        targetData.disabled = true;
        // Executes the default action.
        if (typeof event.target[event.type] === 'function') {
          event.target[event.type]();
        }
        // Re-enables event dispatching.
        targetData.disabled = false;
      }
    }

    // Inform the triggerer if the default was prevented by returning false
    return !event.isDefaultPrevented();
    /* Original version of js ninja events wasn't complete.
     * We've since updated to the latest version, but keeping this around
     * for now just in case.
     */
    // // Added in attion to book. Book code was broke.
    // event = typeof event === 'object' ?
    //   event[vjs.expando] ?
    //     event :
    //     new vjs.Event(type, event) :
    //   new vjs.Event(type);

    // event.type = type;
    // if (handler) {
    //   handler.call(elem, event);
    // }

    // // Clean up the event in case it is being reused
    // event.result = undefined;
    // event.target = elem;
  };

  /**
   * Trigger a listener only once for an event
   * @param  {Element|Object}   elem Element or object to
   * @param  {[type]}   type [description]
   * @param  {Function} fn   [description]
   * @return {[type]}
   */
  vjs.one = function(elem, type, fn) {
    vjs.on(elem, type, function(){
      vjs.off(elem, type, arguments.callee);
      fn.apply(this, arguments);
    });
  };
  var hasOwnProp = Object.prototype.hasOwnProperty;

  /**
   * Creates an element and applies properties.
   * @param  {String=} tagName    Name of tag to be created.
   * @param  {Object=} properties Element properties to be applied.
   * @return {Element}
   */
  vjs.createEl = function(tagName, properties){
    var el = document.createElement(tagName || 'div');

    for (var propName in properties){
      if (hasOwnProp.call(properties, propName)) {
        //el[propName] = properties[propName];
        // Not remembering why we were checking for dash
        // but using setAttribute means you have to use getAttribute

        // The check for dash checks for the aria-* attributes, like aria-label, aria-valuemin.
        // The additional check for "role" is because the default method for adding attributes does not
        // add the attribute "role". My guess is because it's not a valid attribute in some namespaces, although
        // browsers handle the attribute just fine. The W3C allows for aria-* attributes to be used in pre-HTML5 docs.
        // http://www.w3.org/TR/wai-aria-primer/#ariahtml. Using setAttribute gets around this problem.

         if (propName.indexOf('aria-') !== -1 || propName=='role') {
           el.setAttribute(propName, properties[propName]);
         } else {
           el[propName] = properties[propName];
         }
      }
    }
    return el;
  };

  /**
   * Uppercase the first letter of a string
   * @param  {String} string String to be uppercased
   * @return {String}
   */
  vjs.capitalize = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  /**
   * Object functions container
   * @type {Object}
   */
  vjs.obj = {};

  /**
   * Object.create shim for prototypal inheritance.
   * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
   * @param  {Object}   obj Object to use as prototype
   */
   vjs.obj.create = Object.create || function(obj){
    //Create a new function called 'F' which is just an empty object.
    function F() {}

    //the prototype of the 'F' function should point to the
    //parameter of the anonymous function.
    F.prototype = obj;

    //create a new constructor function based off of the 'F' function.
    return new F();
  };

  /**
   * Loop through each property in an object and call a function
   * whose arguments are (key,value)
   * @param  {Object}   obj Object of properties
   * @param  {Function} fn  Function to be called on each property.
   * @this {*}
   */
  vjs.obj.each = function(obj, fn, context){
    for (var key in obj) {
      if (hasOwnProp.call(obj, key)) {
        fn.call(context || this, key, obj[key]);
      }
    }
  };

  /**
   * Merge two objects together and return the original.
   * @param  {Object} obj1
   * @param  {Object} obj2
   * @return {Object}
   */
  vjs.obj.merge = function(obj1, obj2){
    if (!obj2) { return obj1; }
    for (var key in obj2){
      if (hasOwnProp.call(obj2, key)) {
        obj1[key] = obj2[key];
      }
    }
    return obj1;
  };

  /**
   * Merge two objects, and merge any properties that are objects
   * instead of just overwriting one. Uses to merge options hashes
   * where deeper default settings are important.
   * @param  {Object} obj1 Object to override
   * @param  {Object} obj2 Overriding object
   * @return {Object}      New object. Obj1 and Obj2 will be untouched.
   */
  vjs.obj.deepMerge = function(obj1, obj2){
    var key, val1, val2, objDef;
    objDef = '[object Object]';

    // Make a copy of obj1 so we're not ovewriting original values.
    // like prototype.options_ and all sub options objects
    obj1 = vjs.obj.copy(obj1);

    for (key in obj2){
      if (hasOwnProp.call(obj2, key)) {
        val1 = obj1[key];
        val2 = obj2[key];

        // Check if both properties are pure objects and do a deep merge if so
        if (vjs.obj.isPlain(val1) && vjs.obj.isPlain(val2)) {
          obj1[key] = vjs.obj.deepMerge(val1, val2);
        } else {
          obj1[key] = obj2[key];
        }
      }
    }
    return obj1;
  };

  /**
   * Make a copy of the supplied object
   * @param  {Object} obj Object to copy
   * @return {Object}     Copy of object
   */
  vjs.obj.copy = function(obj){
    return vjs.obj.merge({}, obj);
  };

  /**
   * Check if an object is plain, and not a dom node or any object sub-instance
   * @param  {Object} obj Object to check
   * @return {Boolean}     True if plain, false otherwise
   */
  vjs.obj.isPlain = function(obj){
    return !!obj
      && typeof obj === 'object'
      && obj.toString() === '[object Object]'
      && obj.constructor === Object;
  };

  /**
   * Bind (a.k.a proxy or Context). A simple method for changing the context of a function
     It also stores a unique id on the function so it can be easily removed from events
   * @param  {*}   context The object to bind as scope
   * @param  {Function} fn      The function to be bound to a scope
   * @param  {Number=}   uid     An optional unique ID for the function to be set
   * @return {Function}
   */
  vjs.bind = function(context, fn, uid) {
    // Make sure the function has a unique ID
    if (!fn.guid) { fn.guid = vjs.guid++; }

    // Create the new function that changes the context
    var ret = function() {
      return fn.apply(context, arguments);
    };

    // Allow for the ability to individualize this function
    // Needed in the case where multiple objects might share the same prototype
    // IF both items add an event listener with the same function, then you try to remove just one
    // it will remove both because they both have the same guid.
    // when using this, you need to use the bind method when you remove the listener as well.
    // currently used in text tracks
    ret.guid = (uid) ? uid + '_' + fn.guid : fn.guid;

    return ret;
  };

  /**
   * Element Data Store. Allows for binding data to an element without putting it directly on the element.
   * Ex. Event listneres are stored here.
   * (also from jsninja.com, slightly modified and updated for closure compiler)
   * @type {Object}
   */
  vjs.cache = {};

  /**
   * Unique ID for an element or function
   * @type {Number}
   */
  vjs.guid = 1;

  /**
   * Unique attribute name to store an element's guid in
   * @type {String}
   * @constant
   */
  vjs.expando = 'vdata' + (new Date()).getTime();

  /**
   * Returns the cache object where data for an element is stored
   * @param  {Element} el Element to store data for.
   * @return {Object}
   */
  vjs.getData = function(el){
    var id = el[vjs.expando];
    if (!id) {
      id = el[vjs.expando] = vjs.guid++;
      vjs.cache[id] = {};
    }
    return vjs.cache[id];
  };

  /**
   * Returns the cache object where data for an element is stored
   * @param  {Element} el Element to store data for.
   * @return {Object}
   */
  vjs.hasData = function(el){
    var id = el[vjs.expando];
    return !(!id || vjs.isEmpty(vjs.cache[id]));
  };

  /**
   * Delete data for the element from the cache and the guid attr from getElementById
   * @param  {Element} el Remove data for an element
   */
  vjs.removeData = function(el){
    var id = el[vjs.expando];
    if (!id) { return; }
    // Remove all stored data
    // Changed to = null
    // http://coding.smashingmagazine.com/2012/11/05/writing-fast-memory-efficient-javascript/
    // vjs.cache[id] = null;
    delete vjs.cache[id];

    // Remove the expando property from the DOM node
    try {
      delete el[vjs.expando];
    } catch(e) {
      if (el.removeAttribute) {
        el.removeAttribute(vjs.expando);
      } else {
        // IE doesn't appear to support removeAttribute on the document element
        el[vjs.expando] = null;
      }
    }
  };

  vjs.isEmpty = function(obj) {
    for (var prop in obj) {
      // Inlude null properties as empty.
      if (obj[prop] !== null) {
        return false;
      }
    }
    return true;
  };

  /**
   * Add a CSS class name to an element
   * @param {Element} element    Element to add class name to
   * @param {String} classToAdd Classname to add
   */
  vjs.addClass = function(element, classToAdd){
    if ((' '+element.className+' ').indexOf(' '+classToAdd+' ') == -1) {
      element.className = element.className === '' ? classToAdd : element.className + ' ' + classToAdd;
    }
  };

  /**
   * Remove a CSS class name from an element
   * @param {Element} element    Element to remove from class name
   * @param {String} classToAdd Classname to remove
   */
  vjs.removeClass = function(element, classToRemove){
    if (element.className.indexOf(classToRemove) == -1) { return; }
    var classNames = element.className.split(' ');
    // IE8 Does not support array.indexOf so using a for loop
    for (var i = classNames.length - 1; i >= 0; i--) {
      if (classNames[i] === classToRemove) {
        classNames.splice(i,1);
      }
    }
    // classNames.splice(classNames.indexOf(classToRemove),1);
    element.className = classNames.join(' ');
  };

  /**
   * Element for testing browser HTML5 video capabilities
   * @type {Element}
   * @constant
   */
  vjs.TEST_VID = vjs.createEl('video');

  /**
   * Useragent for browser testing.
   * @type {String}
   * @constant
   */
  vjs.USER_AGENT = navigator.userAgent;

  /**
   * Device is an iPhone
   * @type {Boolean}
   * @constant
   */
  vjs.IS_IPHONE = !!vjs.USER_AGENT.match(/iPhone/i);
  vjs.IS_IPAD = !!vjs.USER_AGENT.match(/iPad/i);
  vjs.IS_IPOD = !!vjs.USER_AGENT.match(/iPod/i);
  vjs.IS_IOS = vjs.IS_IPHONE || vjs.IS_IPAD || vjs.IS_IPOD;

  vjs.IOS_VERSION = (function(){
    var match = vjs.USER_AGENT.match(/OS (\d+)_/i);
    if (match && match[1]) { return match[1]; }
  })();

  vjs.IS_ANDROID = !!vjs.USER_AGENT.match(/Android.*AppleWebKit/i);
  vjs.ANDROID_VERSION = (function() {
    var match = vjs.USER_AGENT.match(/Android (\d+)\./i);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  })();

  vjs.IS_FIREFOX = function(){ return !!vjs.USER_AGENT.match('Firefox'); };


  /**
   * Get an element's attribute values, as defined on the HTML tag
   * Attributs are not the same as properties. They're defined on the tag
   * or with setAttribute (which shouldn't be used with HTML)
   * This will return true or false for boolean attributes.
   * @param  {Element} tag Element from which to get tag attributes
   * @return {Object}
   */
  vjs.getAttributeValues = function(tag){
    var obj = {};

    // Known boolean attributes
    // We can check for matching boolean properties, but older browsers
    // won't know about HTML5 boolean attributes that we still read from.
    // Bookending with commas to allow for an easy string search.
    var knownBooleans = ','+'autoplay,controls,loop,muted,default'+',';

    if (tag && tag.attributes && tag.attributes.length > 0) {
      var attrs = tag.attributes;
      var attrName, attrVal;

      for (var i = attrs.length - 1; i >= 0; i--) {
        attrName = attrs[i].name;
        attrVal = attrs[i].value;

        // Check for known booleans
        // The matching element property will return a value for typeof
        if (typeof tag[attrName] === 'boolean' || knownBooleans.indexOf(','+attrName+',') !== -1) {
          // The value of an included boolean attribute is typically an empty string ('')
          // which would equal false if we just check for a false value.
          // We also don't want support bad code like autoplay='false'
          attrVal = (attrVal !== null) ? true : false;
        }

        obj[attrName] = attrVal;
      }
    }

    return obj;
  };

  /**
   * Get the computed style value for an element
   * From http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
   * @param  {Element} el        Element to get style value for
   * @param  {String} strCssRule Style name
   * @return {String}            Style value
   */
  vjs.getComputedDimension = function(el, strCssRule){
    var strValue = '';
    if(document.defaultView && document.defaultView.getComputedStyle){
      strValue = document.defaultView.getComputedStyle(el, '').getPropertyValue(strCssRule);

    } else if(el.currentStyle){
      // IE8 Width/Height support
      strValue = el['client'+strCssRule.substr(0,1).toUpperCase() + strCssRule.substr(1)] + 'px';
    }
    return strValue;
  };

  /**
   * Insert an element as the first child node of another
   * @param  {Element} child   Element to insert
   * @param  {[type]} parent Element to insert child into
   */
  vjs.insertFirst = function(child, parent){
    if (parent.firstChild) {
      parent.insertBefore(child, parent.firstChild);
    } else {
      parent.appendChild(child);
    }
  };

  /**
   * Object to hold browser support information
   * @type {Object}
   */
  vjs.support = {};

  /**
   * Shorthand for document.getElementById()
   * Also allows for CSS (jQuery) ID syntax. But nothing other than IDs.
   * @param  {String} id  Element ID
   * @return {Element}    Element with supplied ID
   */
  vjs.el = function(id){
    if (id.indexOf('#') === 0) {
      id = id.slice(1);
    }

    return document.getElementById(id);
  };

  /**
   * Format seconds as a time string, H:MM:SS or M:SS
   * Supplying a guide (in seconds) will force a number of leading zeros
   * to cover the length of the guide
   * @param  {Number} seconds Number of seconds to be turned into a string
   * @param  {Number} guide   Number (in seconds) to model the string after
   * @return {String}         Time formatted as H:MM:SS or M:SS
   */
  vjs.formatTime = function(seconds, guide) {
    guide = guide || seconds; // Default to using seconds as guide
    var s = Math.floor(seconds % 60),
        m = Math.floor(seconds / 60 % 60),
        h = Math.floor(seconds / 3600),
        gm = Math.floor(guide / 60 % 60),
        gh = Math.floor(guide / 3600);

    // Check if we need to show hours
    h = (h > 0 || gh > 0) ? h + ':' : '';

    // If hours are showing, we may need to add a leading zero.
    // Always show at least one digit of minutes.
    m = (((h || gm >= 10) && m < 10) ? '0' + m : m) + ':';

    // Check if leading zero is need for seconds
    s = (s < 10) ? '0' + s : s;

    return h + m + s;
  };

  // Attempt to block the ability to select text while dragging controls
  vjs.blockTextSelection = function(){
    document.body.focus();
    document.onselectstart = function () { return false; };
  };
  // Turn off text selection blocking
  vjs.unblockTextSelection = function(){ document.onselectstart = function () { return true; }; };

  /**
   * Trim whitespace from the ends of a string.
   * @param  {String} string String to trim
   * @return {String}        Trimmed string
   */
  vjs.trim = function(string){
    return string.toString().replace(/^\s+/, '').replace(/\s+$/, '');
  };

  /**
   * Should round off a number to a decimal place
   * @param  {Number} num Number to round
   * @param  {Number} dec Number of decimal places to round to
   * @return {Number}     Rounded number
   */
  vjs.round = function(num, dec) {
    if (!dec) { dec = 0; }
    return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
  };

  /**
   * Should create a fake TimeRange object
   * Mimics an HTML5 time range instance, which has functions that
   * return the start and end times for a range
   * TimeRanges are returned by the buffered() method
   * @param  {Number} start Start time in seconds
   * @param  {Number} end   End time in seconds
   * @return {Object}       Fake TimeRange object
   */
  vjs.createTimeRange = function(start, end){
    return {
      length: 1,
      start: function() { return start; },
      end: function() { return end; }
    };
  };

  /**
   * Simple http request for retrieving external files (e.g. text tracks)
   * @param  {String} url           URL of resource
   * @param  {Function=} onSuccess  Success callback
   * @param  {Function=} onError    Error callback
   */
  vjs.get = function(url, onSuccess, onError){
    var local = (url.indexOf('file:') === 0 || (window.location.href.indexOf('file:') === 0 && url.indexOf('http') === -1));

    if (typeof XMLHttpRequest === 'undefined') {
      window.XMLHttpRequest = function () {
        try { return new window.ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch (e) {}
        try { return new window.ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch (f) {}
        try { return new window.ActiveXObject('Msxml2.XMLHTTP'); } catch (g) {}
        throw new Error('This browser does not support XMLHttpRequest.');
      };
    }

    var request = new XMLHttpRequest();

    try {
      request.open('GET', url);
    } catch(e) {
      onError(e);
    }

    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200 || local && request.status === 0) {
          onSuccess(request.responseText);
        } else {
          if (onError) {
            onError();
          }
        }
      }
    };

    try {
      request.send();
    } catch(e) {
      if (onError) {
        onError(e);
      }
    }
  };

  /* Local Storage
  ================================================================================ */
  vjs.setLocalStorage = function(key, value){
    try {
      // IE was throwing errors referencing the var anywhere without this
      var localStorage = window.localStorage || false;
      if (!localStorage) { return; }
      localStorage[key] = value;
    } catch(e) {
      if (e.code == 22 || e.code == 1014) { // Webkit == 22 / Firefox == 1014
        vjs.log('LocalStorage Full (VideoJS)', e);
      } else {
        if (e.code == 18) {
          vjs.log('LocalStorage not allowed (VideoJS)', e);
        } else {
          vjs.log('LocalStorage Error (VideoJS)', e);
        }
      }
    }
  };

  /**
   * Get abosolute version of relative URL. Used to tell flash correct URL.
   * http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue
   * @param  {String} url URL to make absolute
   * @return {String}     Absolute URL
   */
  vjs.getAbsoluteURL = function(url){

    // Check if absolute URL
    if (!url.match(/^https?:\/\//)) {
      // Convert to absolute URL. Flash hosted off-site needs an absolute URL.
      url = vjs.createEl('div', {
        innerHTML: '<a href="'+url+'">x</a>'
      }).firstChild.href;
    }

    return url;
  };

  // usage: log('inside coolFunc',this,arguments);
  // http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
  vjs.log = function(){
    vjs.log.history = vjs.log.history || [];   // store logs to an array for reference
    vjs.log.history.push(arguments);
    if(window.console){
      window.console.log(Array.prototype.slice.call(arguments));
    }
  };

  // Offset Left
  // getBoundingClientRect technique from John Resig http://ejohn.org/blog/getboundingclientrect-is-awesome/
  vjs.findPosition = function(el) {
      var box, docEl, body, clientLeft, scrollLeft, left, clientTop, scrollTop, top;

      if (el.getBoundingClientRect && el.parentNode) {
        box = el.getBoundingClientRect();
      }

      if (!box) {
        return {
          left: 0,
          top: 0
        };
      }

      docEl = document.documentElement;
      body = document.body;

      clientLeft = docEl.clientLeft || body.clientLeft || 0;
      scrollLeft = window.pageXOffset || body.scrollLeft;
      left = box.left + scrollLeft - clientLeft;

      clientTop = docEl.clientTop || body.clientTop || 0;
      scrollTop = window.pageYOffset || body.scrollTop;
      top = box.top + scrollTop - clientTop;

      return {
        left: left,
        top: top
      };
  };
  /**
   * @fileoverview Player Component - Base class for all UI objects
   *
   */

  /**
   * Base UI Component class
   * @param {Object} player  Main Player
   * @param {Object=} options
   * @constructor
   */
  vjs.Component = vjs.CoreObject.extend({
    /** @constructor */
    init: function(player, options, ready){
      this.player_ = player;

      // Make a copy of prototype.options_ to protect against overriding global defaults
      this.options_ = vjs.obj.copy(this.options_);

      // Updated options with supplied options
      options = this.options(options);

      // Get ID from options, element, or create using player ID and unique ID
      this.id_ = options['id'] || ((options['el'] && options['el']['id']) ? options['el']['id'] : player.id() + '_component_' + vjs.guid++ );

      this.name_ = options['name'] || null;

      // Create element if one wasn't provided in options
      this.el_ = options['el'] || this.createEl();

      this.children_ = [];
      this.childIndex_ = {};
      this.childNameIndex_ = {};

      // Add any child components in options
      this.initChildren();

      this.ready(ready);
      // Don't want to trigger ready here or it will before init is actually
      // finished for all children that run this constructor
    }
  });

  /**
   * Dispose of the component and all child components.
   */
  vjs.Component.prototype.dispose = function(){
    // Dispose all children.
    if (this.children_) {
      for (var i = this.children_.length - 1; i >= 0; i--) {
        if (this.children_[i].dispose) {
          this.children_[i].dispose();
        }
      }
    }

    // Delete child references
    this.children_ = null;
    this.childIndex_ = null;
    this.childNameIndex_ = null;

    // Remove all event listeners.
    this.off();

    // Remove element from DOM
    if (this.el_.parentNode) {
      this.el_.parentNode.removeChild(this.el_);
    }

    vjs.removeData(this.el_);
    this.el_ = null;
  };

  /**
   * Reference to main player instance.
   * @type {vjs.Player}
   * @private
   */
  vjs.Component.prototype.player_;

  /**
   * Return the component's player.
   * @return {vjs.Player}
   */
  vjs.Component.prototype.player = function(){
    return this.player_;
  };

  /**
   * Component options object.
   * @type {Object}
   * @private
   */
  vjs.Component.prototype.options_;

  /**
   * Deep merge of options objects
   * Whenever a property is an object on both options objects
   * the two properties will be merged using vjs.obj.deepMerge.
   *
   * This is used for merging options for child components. We
   * want it to be easy to override individual options on a child
   * component without having to rewrite all the other default options.
   *
   * Parent.prototype.options_ = {
   *   children: {
   *     'childOne': { 'foo': 'bar', 'asdf': 'fdsa' },
   *     'childTwo': {},
   *     'childThree': {}
   *   }
   * }
   * newOptions = {
   *   children: {
   *     'childOne': { 'foo': 'baz', 'abc': '123' }
   *     'childTwo': null,
   *     'childFour': {}
   *   }
   * }
   *
   * this.options(newOptions);
   *
   * RESULT
   *
   * {
   *   children: {
   *     'childOne': { 'foo': 'baz', 'asdf': 'fdsa', 'abc': '123' },
   *     'childTwo': null, // Disabled. Won't be initialized.
   *     'childThree': {},
   *     'childFour': {}
   *   }
   * }
   *
   * @param  {Object} obj Object whose values will be overwritten
   * @return {Object}      NEW merged object. Does not return obj1.
   */
  vjs.Component.prototype.options = function(obj){
    if (obj === undefined) return this.options_;

    return this.options_ = vjs.obj.deepMerge(this.options_, obj);
  };

  /**
   * The DOM element for the component.
   * @type {Element}
   * @private
   */
  vjs.Component.prototype.el_;

  /**
   * Create the component's DOM element.
   * @param  {String=} tagName  Element's node type. e.g. 'div'
   * @param  {Object=} attributes An object of element attributes that should be set on the element.
   * @return {Element}
   */
  vjs.Component.prototype.createEl = function(tagName, attributes){
    return vjs.createEl(tagName, attributes);
  };

  /**
   * Return the component's DOM element.
   * @return {Element}
   */
  vjs.Component.prototype.el = function(){
    return this.el_;
  };

  /**
   * An optional element where, if defined, children will be inserted
   *   instead of directly in el_
   * @type {Element}
   * @private
   */
  vjs.Component.prototype.contentEl_;

  /**
   * Return the component's DOM element for embedding content.
   *   will either be el_ or a new element defined in createEl
   * @return {Element}
   */
  vjs.Component.prototype.contentEl = function(){
    return this.contentEl_ || this.el_;
  };

  /**
   * The ID for the component.
   * @type {String}
   * @private
   */
  vjs.Component.prototype.id_;

  /**
   * Return the component's ID.
   * @return {String}
   */
  vjs.Component.prototype.id = function(){
    return this.id_;
  };

  /**
   * The name for the component. Often used to reference the component.
   * @type {String}
   * @private
   */
  vjs.Component.prototype.name_;

  /**
   * Return the component's ID.
   * @return {String}
   */
  vjs.Component.prototype.name = function(){
    return this.name_;
  };

  /**
   * Array of child components
   * @type {Array}
   * @private
   */
  vjs.Component.prototype.children_;

  /**
   * Returns array of all child components.
   * @return {Array}
   */
  vjs.Component.prototype.children = function(){
    return this.children_;
  };

  /**
   * Object of child components by ID
   * @type {Object}
   * @private
   */
  vjs.Component.prototype.childIndex_;

  /**
   * Returns a child component with the provided ID.
   * @return {Array}
   */
  vjs.Component.prototype.getChildById = function(id){
    return this.childIndex_[id];
  };

  /**
   * Object of child components by Name
   * @type {Object}
   * @private
   */
  vjs.Component.prototype.childNameIndex_;

  /**
   * Returns a child component with the provided ID.
   * @return {Array}
   */
  vjs.Component.prototype.getChild = function(name){
    return this.childNameIndex_[name];
  };

  /**
   * Adds a child component inside this component.
   * @param {String|vjs.Component} child The class name or instance of a child to add.
   * @param {Object=} options Optional options, including options to be passed to
   *  children of the child.
   * @return {vjs.Component} The child component, because it might be created in this process.
   * @suppress {accessControls|checkRegExp|checkTypes|checkVars|const|constantProperty|deprecated|duplicate|es5Strict|fileoverviewTags|globalThis|invalidCasts|missingProperties|nonStandardJsDocs|strictModuleDepCheck|undefinedNames|undefinedVars|unknownDefines|uselessCode|visibility}
   */
  vjs.Component.prototype.addChild = function(child, options){
    var component, componentClass, componentName, componentId;

    // If string, create new component with options
    if (typeof child === 'string') {

      componentName = child;

      // Make sure options is at least an empty object to protect against errors
      options = options || {};

      // Assume name of set is a lowercased name of the UI Class (PlayButton, etc.)
      componentClass = options['componentClass'] || vjs.capitalize(componentName);

      // Set name through options
      options['name'] = componentName;

      // Create a new object & element for this controls set
      // If there's no .player_, this is a player
      // Closure Compiler throws an 'incomplete alias' warning if we use the vjs variable directly.
      // Every class should be exported, so this should never be a problem here.
      component = new vjs[componentClass](this.player_ || this, options);

    // child is a component instance
    } else {
      component = child;
    }

    this.children_.push(component);

    if (typeof component.id === 'function') {
      this.childIndex_[component.id()] = component;
    }

    // If a name wasn't used to create the component, check if we can use the
    // name function of the component
    componentName = componentName || (component.name && component.name());

    if (componentName) {
      this.childNameIndex_[componentName] = component;
    }

    // Add the UI object's element to the container div (box)
    // Having an element is not required
    if (typeof component['el'] === 'function' && component['el']()) {
      this.contentEl().appendChild(component['el']());
    }

    // Return so it can stored on parent object if desired.
    return component;
  };

  vjs.Component.prototype.removeChild = function(component){
    if (typeof component === 'string') {
      component = this.getChild(component);
    }

    if (!component || !this.children_) return;

    var childFound = false;
    for (var i = this.children_.length - 1; i >= 0; i--) {
      if (this.children_[i] === component) {
        childFound = true;
        this.children_.splice(i,1);
        break;
      }
    }

    if (!childFound) return;

    this.childIndex_[component.id] = null;
    this.childNameIndex_[component.name] = null;

    var compEl = component.el();
    if (compEl && compEl.parentNode === this.contentEl()) {
      this.contentEl().removeChild(component.el());
    }
  };

  /**
   * Initialize default child components from options
   */
  vjs.Component.prototype.initChildren = function(){
    var options = this.options_;

    if (options && options['children']) {
      var self = this;

      // Loop through components and add them to the player
      vjs.obj.each(options['children'], function(name, opts){
        // Allow for disabling default components
        // e.g. vjs.options['children']['posterImage'] = false
        if (opts === false) return;

        // Allow waiting to add components until a specific event is called
        var tempAdd = function(){
          // Set property name on player. Could cause conflicts with other prop names, but it's worth making refs easy.
          self[name] = self.addChild(name, opts);
        };

        if (opts['loadEvent']) {
          // this.one(opts.loadEvent, tempAdd)
        } else {
          tempAdd();
        }
      });
    }
  };

  vjs.Component.prototype.buildCSSClass = function(){
      // Child classes can include a function that does:
      // return 'CLASS NAME' + this._super();
      return '';
  };

  /* Events
  ============================================================================= */

  /**
   * Add an event listener to this component's element. Context will be the component.
   * @param  {String}   type Event type e.g. 'click'
   * @param  {Function} fn   Event listener
   * @return {vjs.Component}
   */
  vjs.Component.prototype.on = function(type, fn){
    vjs.on(this.el_, type, vjs.bind(this, fn));
    return this;
  };

  /**
   * Remove an event listener from the component's element
   * @param  {String=}   type Optional event type. Without type it will remove all listeners.
   * @param  {Function=} fn   Optional event listener. Without fn it will remove all listeners for a type.
   * @return {vjs.Component}
   */
  vjs.Component.prototype.off = function(type, fn){
    vjs.off(this.el_, type, fn);
    return this;
  };

  /**
   * Add an event listener to be triggered only once and then removed
   * @param  {String}   type Event type
   * @param  {Function} fn   Event listener
   * @return {vjs.Component}
   */
  vjs.Component.prototype.one = function(type, fn) {
    vjs.one(this.el_, type, vjs.bind(this, fn));
    return this;
  };

  /**
   * Trigger an event on an element
   * @param  {String} type  Event type to trigger
   * @param  {Event|Object} event Event object to be passed to the listener
   * @return {vjs.Component}
   */
  vjs.Component.prototype.trigger = function(type, event){
    vjs.trigger(this.el_, type, event);
    return this;
  };

  /* Ready
  ================================================================================ */
  /**
   * Is the component loaded.
   * @type {Boolean}
   * @private
   */
  vjs.Component.prototype.isReady_;

  /**
   * Trigger ready as soon as initialization is finished.
   *   Allows for delaying ready. Override on a sub class prototype.
   *   If you set this.isReadyOnInitFinish_ it will affect all components.
   *   Specially used when waiting for the Flash player to asynchrnously load.
   *   @type {Boolean}
   *   @private
   */
  vjs.Component.prototype.isReadyOnInitFinish_ = true;

  /**
   * List of ready listeners
   * @type {Array}
   * @private
   */
  vjs.Component.prototype.readyQueue_;

  /**
   * Bind a listener to the component's ready state.
   *   Different from event listeners in that if the ready event has already happend
   *   it will trigger the function immediately.
   * @param  {Function} fn Ready listener
   * @return {vjs.Component}
   */
  vjs.Component.prototype.ready = function(fn){
    if (fn) {
      if (this.isReady_) {
        fn.call(this);
      } else {
        if (this.readyQueue_ === undefined) {
          this.readyQueue_ = [];
        }
        this.readyQueue_.push(fn);
      }
    }
    return this;
  };

  /**
   * Trigger the ready listeners
   * @return {vjs.Component}
   */
  vjs.Component.prototype.triggerReady = function(){
    this.isReady_ = true;

    var readyQueue = this.readyQueue_;

    if (readyQueue && readyQueue.length > 0) {

      for (var i = 0, j = readyQueue.length; i < j; i++) {
        readyQueue[i].call(this);
      }

      // Reset Ready Queue
      this.readyQueue_ = [];

      // Allow for using event listeners also, in case you want to do something everytime a source is ready.
      this.trigger('ready');
    }
  };

  /* Display
  ============================================================================= */

  /**
   * Add a CSS class name to the component's element
   * @param {String} classToAdd Classname to add
   * @return {vjs.Component}
   */
  vjs.Component.prototype.addClass = function(classToAdd){
    vjs.addClass(this.el_, classToAdd);
    return this;
  };

  /**
   * Remove a CSS class name from the component's element
   * @param {String} classToRemove Classname to remove
   * @return {vjs.Component}
   */
  vjs.Component.prototype.removeClass = function(classToRemove){
    vjs.removeClass(this.el_, classToRemove);
    return this;
  };

  /**
   * Show the component element if hidden
   * @return {vjs.Component}
   */
  vjs.Component.prototype.show = function(){
    this.el_.style.display = 'block';
    return this;
  };

  /**
   * Hide the component element if hidden
   * @return {vjs.Component}
   */
  vjs.Component.prototype.hide = function(){
    this.el_.style.display = 'none';
    return this;
  };

  /**
   * Fade a component in using CSS
   * @return {vjs.Component}
   */
  vjs.Component.prototype.fadeIn = function(){
    this.removeClass('vjs-fade-out');
    this.addClass('vjs-fade-in');
    return this;
  };

  /**
   * Fade a component out using CSS
   * @return {vjs.Component}
   */
  vjs.Component.prototype.fadeOut = function(){
    this.removeClass('vjs-fade-in');
    this.addClass('vjs-fade-out');
    return this;
  };

  /**
   * Lock an item in its visible state. To be used with fadeIn/fadeOut.
   * @return {vjs.Component}
   */
  vjs.Component.prototype.lockShowing = function(){
    this.addClass('vjs-lock-showing');
    return this;
  };

  /**
   * Unlock an item to be hidden. To be used with fadeIn/fadeOut.
   * @return {vjs.Component}
   */
  vjs.Component.prototype.unlockShowing = function(){
    this.removeClass('vjs-lock-showing');
    return this;
  };

  /**
   * Disable component by making it unshowable
   */
  vjs.Component.prototype.disable = function(){
    this.hide();
    this.show = function(){};
    this.fadeIn = function(){};
  };

  // TODO: Get enable working
  // vjs.Component.prototype.enable = function(){
  //   this.fadeIn = vjs.Component.prototype.fadeIn;
  //   this.show = vjs.Component.prototype.show;
  // };

  /**
   * If a value is provided it will change the width of the player to that value
   * otherwise the width is returned
   * http://dev.w3.org/html5/spec/dimension-attributes.html#attr-dim-height
   * Video tag width/height only work in pixels. No percents.
   * But allowing limited percents use. e.g. width() will return number+%, not computed width
   * @param  {Number|String=} num   Optional width number
   * @param  {[type]} skipListeners Skip the 'resize' event trigger
   * @return {vjs.Component|Number|String} Returns 'this' if dimension was set.
   *   Otherwise it returns the dimension.
   */
  vjs.Component.prototype.width = function(num, skipListeners){
    return this.dimension('width', num, skipListeners);
  };

  /**
   * Get or set the height of the player
   * @param  {Number|String=} num     Optional new player height
   * @param  {Boolean=} skipListeners Optional skip resize event trigger
   * @return {vjs.Component|Number|String} The player, or the dimension
   */
  vjs.Component.prototype.height = function(num, skipListeners){
    return this.dimension('height', num, skipListeners);
  };

  /**
   * Set both width and height at the same time.
   * @param  {Number|String} width
   * @param  {Number|String} height
   * @return {vjs.Component}   The player.
   */
  vjs.Component.prototype.dimensions = function(width, height){
    // Skip resize listeners on width for optimization
    return this.width(width, true).height(height);
  };

  /**
   * Get or set width or height.
   * All for an integer, integer + 'px' or integer + '%';
   * Known issue: hidden elements. Hidden elements officially have a width of 0.
   * So we're defaulting to the style.width value and falling back to computedStyle
   * which has the hidden element issue.
   * Info, but probably not an efficient fix:
   * http://www.foliotek.com/devblog/getting-the-width-of-a-hidden-element-with-jquery-using-width/
   * @param  {String=} widthOrHeight 'width' or 'height'
   * @param  {Number|String=} num           New dimension
   * @param  {Boolean=} skipListeners Skip resize event trigger
   * @return {vjs.Component|Number|String} Return the player if setting a dimension.
   *                                         Otherwise it returns the dimension.
   */
  vjs.Component.prototype.dimension = function(widthOrHeight, num, skipListeners){
    if (num !== undefined) {

      // Check if using css width/height (% or px) and adjust
      if ((''+num).indexOf('%') !== -1 || (''+num).indexOf('px') !== -1) {
        this.el_.style[widthOrHeight] = num;
      } else if (num === 'auto') {
        this.el_.style[widthOrHeight] = '';
      } else {
        this.el_.style[widthOrHeight] = num+'px';
      }

      // skipListeners allows us to avoid triggering the resize event when setting both width and height
      if (!skipListeners) { this.trigger('resize'); }

      // Return component
      return this;
    }

    // Not setting a value, so getting it
    // Make sure element exists
    if (!this.el_) return 0;

    // Get dimension value from style
    var val = this.el_.style[widthOrHeight];
    var pxIndex = val.indexOf('px');
    if (pxIndex !== -1) {
      // Return the pixel value with no 'px'
      return parseInt(val.slice(0,pxIndex), 10);

    // No px so using % or no style was set, so falling back to offsetWidth/height
    // If component has display:none, offset will return 0
    // TODO: handle display:none and no dimension style using px
    } else {

      return parseInt(this.el_['offset'+vjs.capitalize(widthOrHeight)], 10);

      // ComputedStyle version.
      // Only difference is if the element is hidden it will return
      // the percent value (e.g. '100%'')
      // instead of zero like offsetWidth returns.
      // var val = vjs.getComputedStyleValue(this.el_, widthOrHeight);
      // var pxIndex = val.indexOf('px');

      // if (pxIndex !== -1) {
      //   return val.slice(0, pxIndex);
      // } else {
      //   return val;
      // }
    }
  };
  /* Button - Base class for all buttons
  ================================================================================ */
  /**
   * Base class for all buttons
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.Button = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      var touchstart = false;
      this.on('touchstart', function() {
        touchstart = true;
      });
      this.on('touchmove', function() {
        touchstart = false;
      });
      var self = this;
      this.on('touchend', function(event) {
        if (touchstart) {
          self.onClick(event);
        }
        event.preventDefault();
        event.stopPropagation();
      });

      this.on('click', this.onClick);
      this.on('focus', this.onFocus);
      this.on('blur', this.onBlur);
    }
  });

  vjs.Button.prototype.createEl = function(type, props){
    // Add standard Aria and Tabindex info
    props = vjs.obj.merge({
      className: this.buildCSSClass(),
      innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + (this.buttonText || 'Need Text') + '</span></div>',
      role: 'button',
      'aria-live': 'polite', // let the screen reader user know that the text of the button may change
      tabIndex: 0
    }, props);

    return vjs.Component.prototype.createEl.call(this, type, props);
  };

  vjs.Button.prototype.buildCSSClass = function(){
    // TODO: Change vjs-control to vjs-button?
    return 'vjs-control ' + vjs.Component.prototype.buildCSSClass.call(this);
  };

    // Click - Override with specific functionality for button
  vjs.Button.prototype.onClick = function(){};

    // Focus - Add keyboard functionality to element
  vjs.Button.prototype.onFocus = function(){
    vjs.on(document, 'keyup', vjs.bind(this, this.onKeyPress));
  };

    // KeyPress (document level) - Trigger click when keys are pressed
  vjs.Button.prototype.onKeyPress = function(event){
    // Check for space bar (32) or enter (13) keys
    if (event.which == 32 || event.which == 13) {
      event.preventDefault();
      this.onClick();
    }
  };

  // Blur - Remove keyboard triggers
  vjs.Button.prototype.onBlur = function(){
    vjs.off(document, 'keyup', vjs.bind(this, this.onKeyPress));
  };
  /* Slider
  ================================================================================ */
  /**
   * Parent for seek bar and volume slider
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.Slider = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      // Set property names to bar and handle to match with the child Slider class is looking for
      this.bar = this.getChild(this.options_['barName']);
      this.handle = this.getChild(this.options_['handleName']);

      player.on(this.playerEvent, vjs.bind(this, this.update));

      this.on('mousedown', this.onMouseDown);
      this.on('touchstart', this.onMouseDown);
      this.on('focus', this.onFocus);
      this.on('blur', this.onBlur);
      this.on('click', this.onClick);

      this.player_.on('controlsvisible', vjs.bind(this, this.update));

      // This is actually to fix the volume handle position. http://twitter.com/#!/gerritvanaaken/status/159046254519787520
      // this.player_.one('timeupdate', vjs.bind(this, this.update));

      player.ready(vjs.bind(this, this.update));

      this.boundEvents = {};
    }
  });

  vjs.Slider.prototype.createEl = function(type, props) {
    props = props || {};
    // Add the slider element class to all sub classes
    props.className = props.className + ' vjs-slider';
    props = vjs.obj.merge({
      role: 'slider',
      'aria-valuenow': 0,
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      tabIndex: 0
    }, props);

    return vjs.Component.prototype.createEl.call(this, type, props);
  };

  vjs.Slider.prototype.onMouseDown = function(event){
    event.preventDefault();
    vjs.blockTextSelection();

    this.boundEvents.move = vjs.bind(this, this.onMouseMove);
    this.boundEvents.end = vjs.bind(this, this.onMouseUp);

    vjs.on(document, 'mousemove', this.boundEvents.move);
    vjs.on(document, 'mouseup', this.boundEvents.end);
    vjs.on(document, 'touchmove', this.boundEvents.move);
    vjs.on(document, 'touchend', this.boundEvents.end);

    this.onMouseMove(event);
  };

  vjs.Slider.prototype.onMouseUp = function() {
    vjs.unblockTextSelection();
    vjs.off(document, 'mousemove', this.boundEvents.move, false);
    vjs.off(document, 'mouseup', this.boundEvents.end, false);
    vjs.off(document, 'touchmove', this.boundEvents.move, false);
    vjs.off(document, 'touchend', this.boundEvents.end, false);

    this.update();
  };

  vjs.Slider.prototype.update = function(){
    // In VolumeBar init we have a setTimeout for update that pops and update to the end of the
    // execution stack. The player is destroyed before then update will cause an error
    if (!this.el_) return;

    // If scrubbing, we could use a cached value to make the handle keep up with the user's mouse.
    // On HTML5 browsers scrubbing is really smooth, but some flash players are slow, so we might want to utilize this later.
    // var progress =  (this.player_.scrubbing) ? this.player_.getCache().currentTime / this.player_.duration() : this.player_.currentTime() / this.player_.duration();

    var barProgress,
        progress = this.getPercent(),
        handle = this.handle,
        bar = this.bar;

    // Protect against no duration and other division issues
    if (isNaN(progress)) { progress = 0; }

    barProgress = progress;

    // If there is a handle, we need to account for the handle in our calculation for progress bar
    // so that it doesn't fall short of or extend past the handle.
    if (handle) {

      var box = this.el_,
          boxWidth = box.offsetWidth,

          handleWidth = handle.el().offsetWidth,

          // The width of the handle in percent of the containing box
          // In IE, widths may not be ready yet causing NaN
          handlePercent = (handleWidth) ? handleWidth / boxWidth : 0,

          // Get the adjusted size of the box, considering that the handle's center never touches the left or right side.
          // There is a margin of half the handle's width on both sides.
          boxAdjustedPercent = 1 - handlePercent,

          // Adjust the progress that we'll use to set widths to the new adjusted box width
          adjustedProgress = progress * boxAdjustedPercent;

      // The bar does reach the left side, so we need to account for this in the bar's width
      barProgress = adjustedProgress + (handlePercent / 2);

      // Move the handle from the left based on the adjected progress
      handle.el().style.left = vjs.round(adjustedProgress * 100, 2) + '%';
    }

    // Set the new bar width
    bar.el().style.width = vjs.round(barProgress * 100, 2) + '%';
  };

  vjs.Slider.prototype.calculateDistance = function(event){
    var el, box, boxX, boxY, boxW, boxH, handle, pageX, pageY;

    el = this.el_;
    box = vjs.findPosition(el);
    boxW = boxH = el.offsetWidth;
    handle = this.handle;

    if (this.options_.vertical) {
      boxY = box.top;

      if (event.changedTouches) {
        pageY = event.changedTouches[0].pageY;
      } else {
        pageY = event.pageY;
      }

      if (handle) {
        var handleH = handle.el().offsetHeight;
        // Adjusted X and Width, so handle doesn't go outside the bar
        boxY = boxY + (handleH / 2);
        boxH = boxH - handleH;
      }

      // Percent that the click is through the adjusted area
      return Math.max(0, Math.min(1, ((boxY - pageY) + boxH) / boxH));

    } else {
      boxX = box.left;

      if (event.changedTouches) {
        pageX = event.changedTouches[0].pageX;
      } else {
        pageX = event.pageX;
      }

      if (handle) {
        var handleW = handle.el().offsetWidth;

        // Adjusted X and Width, so handle doesn't go outside the bar
        boxX = boxX + (handleW / 2);
        boxW = boxW - handleW;
      }

      // Percent that the click is through the adjusted area
      return Math.max(0, Math.min(1, (pageX - boxX) / boxW));
    }
  };

  vjs.Slider.prototype.onFocus = function(){
    vjs.on(document, 'keyup', vjs.bind(this, this.onKeyPress));
  };

  vjs.Slider.prototype.onKeyPress = function(event){
    if (event.which == 37) { // Left Arrow
      event.preventDefault();
      this.stepBack();
    } else if (event.which == 39) { // Right Arrow
      event.preventDefault();
      this.stepForward();
    }
  };

  vjs.Slider.prototype.onBlur = function(){
    vjs.off(document, 'keyup', vjs.bind(this, this.onKeyPress));
  };

  /**
   * Listener for click events on slider, used to prevent clicks
   *   from bubbling up to parent elements like button menus.
   * @param  {Object} event Event object
   */
  vjs.Slider.prototype.onClick = function(event){
    event.stopImmediatePropagation();
    event.preventDefault();
  };

  /**
   * SeekBar Behavior includes play progress bar, and seek handle
   * Needed so it can determine seek position based on handle position/size
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.SliderHandle = vjs.Component.extend();

  /**
   * Default value of the slider
   * @type {Number}
   */
  vjs.SliderHandle.prototype.defaultValue = 0;

  /** @inheritDoc */
  vjs.SliderHandle.prototype.createEl = function(type, props) {
    props = props || {};
    // Add the slider element class to all sub classes
    props.className = props.className + ' vjs-slider-handle';
    props = vjs.obj.merge({
      innerHTML: '<span class="vjs-control-text">'+this.defaultValue+'</span>'
    }, props);

    return vjs.Component.prototype.createEl.call(this, 'div', props);
  };
  /* Menu
  ================================================================================ */
  /**
   * The base for text track and settings menu buttons.
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.Menu = vjs.Component.extend();

  /**
   * Add a menu item to the menu
   * @param {Object|String} component Component or component type to add
   */
  vjs.Menu.prototype.addItem = function(component){
    this.addChild(component);
    component.on('click', vjs.bind(this, function(){
      this.unlockShowing();
    }));
  };

  /** @inheritDoc */
  vjs.Menu.prototype.createEl = function(){
    var contentElType = this.options().contentElType || 'ul';
    this.contentEl_ = vjs.createEl(contentElType, {
      className: 'vjs-menu-content'
    });
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
      append: this.contentEl_,
      className: 'vjs-menu'
    });
    el.appendChild(this.contentEl_);

    // Prevent clicks from bubbling up. Needed for Menu Buttons,
    // where a click on the parent is significant
    vjs.on(el, 'click', function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
    });

    return el;
  };

  /**
   * Menu item
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.MenuItem = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);
      this.selected(options['selected']);
    }
  });

  /** @inheritDoc */
  vjs.MenuItem.prototype.createEl = function(type, props){
    return vjs.Button.prototype.createEl.call(this, 'li', vjs.obj.merge({
      className: 'vjs-menu-item',
      innerHTML: this.options_['label']
    }, props));
  };

  /** @inheritDoc */
  vjs.MenuItem.prototype.onClick = function(){
    this.selected(true);
  };

  /**
   * Set this menu item as selected or not
   * @param  {Boolean} selected
   */
  vjs.MenuItem.prototype.selected = function(selected){
    if (selected) {
      this.addClass('vjs-selected');
      this.el_.setAttribute('aria-selected',true);
    } else {
      this.removeClass('vjs-selected');
      this.el_.setAttribute('aria-selected',false);
    }
  };


  /**
   * A button class with a popup menu
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.MenuButton = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);

      this.menu = this.createMenu();

      // Add list to element
      this.addChild(this.menu);

      // Automatically hide empty menu buttons
      if (this.items && this.items.length === 0) {
        this.hide();
      }

      this.on('keyup', this.onKeyPress);
      this.el_.setAttribute('aria-haspopup', true);
      this.el_.setAttribute('role', 'button');
    }
  });

  /**
   * Track the state of the menu button
   * @type {Boolean}
   */
  vjs.MenuButton.prototype.buttonPressed_ = false;

  vjs.MenuButton.prototype.createMenu = function(){
    var menu = new vjs.Menu(this.player_);

    // Add a title list item to the top
    if (this.options().title) {
      menu.el().appendChild(vjs.createEl('li', {
        className: 'vjs-menu-title',
        innerHTML: vjs.capitalize(this.kind_),
        tabindex: -1
      }));
    }

    this.items = this.createItems();

    if (this.items) {
      // Add menu items to the menu
      for (var i = 0; i < this.items.length; i++) {
        menu.addItem(this.items[i]);
      }
    }

    return menu;
  };

  /**
   * Create the list of menu items. Specific to each subclass.
   */
  vjs.MenuButton.prototype.createItems = function(){};

  /** @inheritDoc */
  vjs.MenuButton.prototype.buildCSSClass = function(){
    return this.className + ' vjs-menu-button ' + vjs.Button.prototype.buildCSSClass.call(this);
  };

  // Focus - Add keyboard functionality to element
  // This function is not needed anymore. Instead, the keyboard functionality is handled by
  // treating the button as triggering a submenu. When the button is pressed, the submenu
  // appears. Pressing the button again makes the submenu disappear.
  vjs.MenuButton.prototype.onFocus = function(){};
  // Can't turn off list display that we turned on with focus, because list would go away.
  vjs.MenuButton.prototype.onBlur = function(){};

  vjs.MenuButton.prototype.onClick = function(){
    // When you click the button it adds focus, which will show the menu indefinitely.
    // So we'll remove focus when the mouse leaves the button.
    // Focus is needed for tab navigation.
    this.one('mouseout', vjs.bind(this, function(){
      this.menu.unlockShowing();
      this.el_.blur();
    }));
    if (this.buttonPressed_){
      this.unpressButton();
    } else {
      this.pressButton();
    }
  };

  vjs.MenuButton.prototype.onKeyPress = function(event){
    event.preventDefault();

    // Check for space bar (32) or enter (13) keys
    if (event.which == 32 || event.which == 13) {
      if (this.buttonPressed_){
        this.unpressButton();
      } else {
        this.pressButton();
      }
    // Check for escape (27) key
    } else if (event.which == 27){
      if (this.buttonPressed_){
        this.unpressButton();
      }
    }
  };

  vjs.MenuButton.prototype.pressButton = function(){
    this.buttonPressed_ = true;
    this.menu.lockShowing();
    this.el_.setAttribute('aria-pressed', true);
    if (this.items && this.items.length > 0) {
      this.items[0].el().focus(); // set the focus to the title of the submenu
    }
  };

  vjs.MenuButton.prototype.unpressButton = function(){
    this.buttonPressed_ = false;
    this.menu.unlockShowing();
    this.el_.setAttribute('aria-pressed', false);
  };

  /**
   * Main player class. A player instance is returned by _V_(id);
   * @param {Element} tag        The original video tag used for configuring options
   * @param {Object=} options    Player options
   * @param {Function=} ready    Ready callback function
   * @constructor
   */
  vjs.Player = vjs.Component.extend({
    /** @constructor */
    init: function(tag, options, ready){
      this.tag = tag; // Store the original tag used to set options

      // Set Options
      // The options argument overrides options set in the video tag
      // which overrides globally set options.
      // This latter part coincides with the load order
      // (tag must exist before Player)
      options = vjs.obj.merge(this.getTagSettings(tag), options);

      // Cache for video property values.
      this.cache_ = {};

      // Set poster
      this.poster_ = options['poster'];
      // Set controls
      this.controls_ = options['controls'];
      // Use native controls for iOS and Android by default
      //  until controls are more stable on those devices.
      if (options['customControlsOnMobile'] !== true && (vjs.IS_IOS || vjs.IS_ANDROID)) {
        tag.controls = options['controls'];
        this.controls_ = false;
      } else {
        // Original tag settings stored in options
        // now remove immediately so native controls don't flash.
        tag.controls = false;
      }

      // Run base component initializing with new options.
      // Builds the element through createEl()
      // Inits and embeds any child components in opts
      vjs.Component.call(this, this, options, ready);

      // Firstplay event implimentation. Not sold on the event yet.
      // Could probably just check currentTime==0?
      this.one('play', function(e){
        var fpEvent = { type: 'firstplay', target: this.el_ };
        // Using vjs.trigger so we can check if default was prevented
        var keepGoing = vjs.trigger(this.el_, fpEvent);

        if (!keepGoing) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      });

      this.on('ended', this.onEnded);
      this.on('play', this.onPlay);
      this.on('firstplay', this.onFirstPlay);
      this.on('pause', this.onPause);
      this.on('progress', this.onProgress);
      this.on('durationchange', this.onDurationChange);
      this.on('error', this.onError);
      this.on('fullscreenchange', this.onFullscreenChange);

      // Make player easily findable by ID
      vjs.players[this.id_] = this;

      if (options['plugins']) {
        vjs.obj.each(options['plugins'], function(key, val){
          this[key](val);
        }, this);
      }
    }
  });

  /**
   * Player instance options, surfaced using vjs.options
   * vjs.options = vjs.Player.prototype.options_
   * Make changes in vjs.options, not here.
   * All options should use string keys so they avoid
   * renaming by closure compiler
   * @type {Object}
   * @private
   */
  vjs.Player.prototype.options_ = vjs.options;

  vjs.Player.prototype.dispose = function(){
    // this.isReady_ = false;

    // Kill reference to this player
    vjs.players[this.id_] = null;
    if (this.tag && this.tag['player']) { this.tag['player'] = null; }
    if (this.el_ && this.el_['player']) { this.el_['player'] = null; }

    // Ensure that tracking progress and time progress will stop and plater deleted
    this.stopTrackingProgress();
    this.stopTrackingCurrentTime();

    if (this.tech) { this.tech.dispose(); }

    // Component dispose
    vjs.Component.prototype.dispose.call(this);
  };

  vjs.Player.prototype.getTagSettings = function(tag){
    var options = {
      'sources': [],
      'tracks': []
    };

    vjs.obj.merge(options, vjs.getAttributeValues(tag));

    // Get tag children settings
    if (tag.hasChildNodes()) {
      var child, childName,
          children = tag.childNodes,
          i = 0,
          j = children.length;

      for (; i < j; i++) {
        child = children[i];
        // Change case needed: http://ejohn.org/blog/nodename-case-sensitivity/
        childName = child.nodeName.toLowerCase();

        if (childName === 'source') {
          options['sources'].push(vjs.getAttributeValues(child));

        } else if (childName === 'track') {
          options['tracks'].push(vjs.getAttributeValues(child));

        }
      }
    }

    return options;
  };

  vjs.Player.prototype.createEl = function(){
    var el = this.el_ = vjs.Component.prototype.createEl.call(this, 'div');
    var tag = this.tag;

    // Remove width/height attrs from tag so CSS can make it 100% width/height
    tag.removeAttribute('width');
    tag.removeAttribute('height');
    // Empty video tag sources and tracks so the built-in player doesn't use them also.
    // This may not be fast enough to stop HTML5 browsers from reading the tags
    // so we'll need to turn off any default tracks if we're manually doing
    // captions and subtitles. videoElement.textTracks
    if (tag.hasChildNodes()) {
      var nrOfChildNodes = tag.childNodes.length;
      for (var i=0,j=tag.childNodes;i<nrOfChildNodes;i++) {
        if (j[0].nodeName.toLowerCase() == 'source' || j[0].nodeName.toLowerCase() == 'track') {
          tag.removeChild(j[0]);
        }
      }
    }

    // Make sure tag ID exists
    tag.id = tag.id || 'vjs_video_' + vjs.guid++;

    // Give video tag ID and class to player div
    // ID will now reference player box, not the video tag
    el.id = tag.id;
    el.className = tag.className;

    // Update tag id/class for use as HTML5 playback tech
    // Might think we should do this after embedding in container so .vjs-tech class
    // doesn't flash 100% width/height, but class only applies with .video-js parent
    tag.id += '_html5_api';
    tag.className = 'vjs-tech';

    // Make player findable on elements
    tag['player'] = el['player'] = this;
    // Default state of video is paused
    this.addClass('vjs-paused');

    // Make box use width/height of tag, or rely on default implementation
    // Enforce with CSS since width/height attrs don't work on divs
    this.width(this.options_['width'], true); // (true) Skip resize listener on load
    this.height(this.options_['height'], true);

    // Wrap video tag in div (el/box) container
    if (tag.parentNode) {
      tag.parentNode.insertBefore(el, tag);
    }
    vjs.insertFirst(tag, el); // Breaks iPhone, fixed in HTML5 setup.

    return el;
  };

  // /* Media Technology (tech)
  // ================================================================================ */
  // Load/Create an instance of playback technlogy including element and API methods
  // And append playback element in player div.
  vjs.Player.prototype.loadTech = function(techName, source){

    // Pause and remove current playback technology
    if (this.tech) {
      this.unloadTech();

    // If the first time loading, HTML5 tag will exist but won't be initialized
    // So we need to remove it if we're not loading HTML5
    } else if (techName !== 'Html5' && this.tag) {
      this.el_.removeChild(this.tag);
      this.tag.player = null;
      this.tag = null;
    }

    this.techName = techName;

    // Turn off API access because we're loading a new tech that might load asynchronously
    this.isReady_ = false;

    var techReady = function(){
      this.player_.triggerReady();

      // Manually track progress in cases where the browser/flash player doesn't report it.
      if (!this.features.progressEvents) {
        this.player_.manualProgressOn();
      }

      // Manually track timeudpates in cases where the browser/flash player doesn't report it.
      if (!this.features.timeupdateEvents) {
        this.player_.manualTimeUpdatesOn();
      }
    };

    // Grab tech-specific options from player options and add source and parent element to use.
    var techOptions = vjs.obj.merge({ 'source': source, 'parentEl': this.el_ }, this.options_[techName.toLowerCase()]);

    if (source) {
      if (source.src == this.cache_.src && this.cache_.currentTime > 0) {
        techOptions['startTime'] = this.cache_.currentTime;
      }

      this.cache_.src = source.src;
    }

    // Initialize tech instance
    this.tech = new vjs[techName](this, techOptions);

    this.tech.ready(techReady);
  };

  vjs.Player.prototype.unloadTech = function(){
    this.isReady_ = false;
    this.tech.dispose();

    // Turn off any manual progress or timeupdate tracking
    if (this.manualProgress) { this.manualProgressOff(); }

    if (this.manualTimeUpdates) { this.manualTimeUpdatesOff(); }

    this.tech = false;
  };

  // There's many issues around changing the size of a Flash (or other plugin) object.
  // First is a plugin reload issue in Firefox that has been around for 11 years: https://bugzilla.mozilla.org/show_bug.cgi?id=90268
  // Then with the new fullscreen API, Mozilla and webkit browsers will reload the flash object after going to fullscreen.
  // To get around this, we're unloading the tech, caching source and currentTime values, and reloading the tech once the plugin is resized.
  // reloadTech: function(betweenFn){
  //   vjs.log('unloadingTech')
  //   this.unloadTech();
  //   vjs.log('unloadedTech')
  //   if (betweenFn) { betweenFn.call(); }
  //   vjs.log('LoadingTech')
  //   this.loadTech(this.techName, { src: this.cache_.src })
  //   vjs.log('loadedTech')
  // },

  /* Fallbacks for unsupported event types
  ================================================================================ */
  // Manually trigger progress events based on changes to the buffered amount
  // Many flash players and older HTML5 browsers don't send progress or progress-like events
  vjs.Player.prototype.manualProgressOn = function(){
    this.manualProgress = true;

    // Trigger progress watching when a source begins loading
    this.trackProgress();

    // Watch for a native progress event call on the tech element
    // In HTML5, some older versions don't support the progress event
    // So we're assuming they don't, and turning off manual progress if they do.
    // As opposed to doing user agent detection
    this.tech.one('progress', function(){

      // Update known progress support for this playback technology
      this.features.progressEvents = true;

      // Turn off manual progress tracking
      this.player_.manualProgressOff();
    });
  };

  vjs.Player.prototype.manualProgressOff = function(){
    this.manualProgress = false;
    this.stopTrackingProgress();
  };

  vjs.Player.prototype.trackProgress = function(){

    this.progressInterval = setInterval(vjs.bind(this, function(){
      // Don't trigger unless buffered amount is greater than last time
      // log(this.cache_.bufferEnd, this.buffered().end(0), this.duration())
      /* TODO: update for multiple buffered regions */
      if (this.cache_.bufferEnd < this.buffered().end(0)) {
        this.trigger('progress');
      } else if (this.bufferedPercent() == 1) {
        this.stopTrackingProgress();
        this.trigger('progress'); // Last update
      }
    }), 500);
  };
  vjs.Player.prototype.stopTrackingProgress = function(){ clearInterval(this.progressInterval); };

  /* Time Tracking -------------------------------------------------------------- */
  vjs.Player.prototype.manualTimeUpdatesOn = function(){
    this.manualTimeUpdates = true;

    this.on('play', this.trackCurrentTime);
    this.on('pause', this.stopTrackingCurrentTime);
    // timeupdate is also called by .currentTime whenever current time is set

    // Watch for native timeupdate event
    this.tech.one('timeupdate', function(){
      // Update known progress support for this playback technology
      this.features.timeupdateEvents = true;
      // Turn off manual progress tracking
      this.player_.manualTimeUpdatesOff();
    });
  };

  vjs.Player.prototype.manualTimeUpdatesOff = function(){
    this.manualTimeUpdates = false;
    this.stopTrackingCurrentTime();
    this.off('play', this.trackCurrentTime);
    this.off('pause', this.stopTrackingCurrentTime);
  };

  vjs.Player.prototype.trackCurrentTime = function(){
    if (this.currentTimeInterval) { this.stopTrackingCurrentTime(); }
    this.currentTimeInterval = setInterval(vjs.bind(this, function(){
      this.trigger('timeupdate');
    }), 250); // 42 = 24 fps // 250 is what Webkit uses // FF uses 15
  };

  // Turn off play progress tracking (when paused or dragging)
  vjs.Player.prototype.stopTrackingCurrentTime = function(){ clearInterval(this.currentTimeInterval); };

  // /* Player event handlers (how the player reacts to certain events)
  // ================================================================================ */
  vjs.Player.prototype.onEnded = function(){
    if (this.options_['loop']) {
      this.currentTime(0);
      this.play();
    }
  };

  vjs.Player.prototype.onPlay = function(){
    vjs.removeClass(this.el_, 'vjs-paused');
    vjs.addClass(this.el_, 'vjs-playing');
  };

  vjs.Player.prototype.onFirstPlay = function(){
      //If the first starttime attribute is specified
      //then we will start at the given offset in seconds
      if(this.options_['starttime']){
        this.currentTime(this.options_['starttime']);
      }
  };

  vjs.Player.prototype.onPause = function(){
    vjs.removeClass(this.el_, 'vjs-playing');
    vjs.addClass(this.el_, 'vjs-paused');
  };

  vjs.Player.prototype.onProgress = function(){
    // Add custom event for when source is finished downloading.
    if (this.bufferedPercent() == 1) {
      this.trigger('loadedalldata');
    }
  };

  // Update duration with durationchange event
  // Allows for cacheing value instead of asking player each time.
  vjs.Player.prototype.onDurationChange = function(){
    this.duration(this.techGet('duration'));
  };

  vjs.Player.prototype.onError = function(e) {
    vjs.log('Video Error', e);
  };

  vjs.Player.prototype.onFullscreenChange = function() {
    if (this.isFullScreen) {
      this.addClass('vjs-fullscreen');
    } else {
      this.removeClass('vjs-fullscreen');
    }
  };

  // /* Player API
  // ================================================================================ */

  /**
   * Object for cached values.
   * @private
   */
  vjs.Player.prototype.cache_;

  vjs.Player.prototype.getCache = function(){
    return this.cache_;
  };

  // Pass values to the playback tech
  vjs.Player.prototype.techCall = function(method, arg){
    // If it's not ready yet, call method when it is
    if (this.tech && this.tech.isReady_) {
      this.tech.ready(function(){
        this[method](arg);
      });

    // Otherwise call method now
    } else {
      try {
        this.tech[method](arg);
      } catch(e) {
        vjs.log(e);
        throw e;
      }
    }
  };

  // Get calls can't wait for the tech, and sometimes don't need to.
  vjs.Player.prototype.techGet = function(method){

    // Make sure there is a tech
    if (!this.tech) {
      return;
    }

    if (this.tech.isReady_) {

      // Flash likes to die and reload when you hide or reposition it.
      // In these cases the object methods go away and we get errors.
      // When that happens we'll catch the errors and inform tech that it's not ready any more.
      try {
        return this.tech[method]();
      } catch(e) {
        // When building additional tech libs, an expected method may not be defined yet
        if (this.tech[method] === undefined) {
          vjs.log('Video.js: ' + method + ' method not defined for '+this.techName+' playback technology.', e);
        } else {
          // When a method isn't available on the object it throws a TypeError
          if (e.name == 'TypeError') {
            vjs.log('Video.js: ' + method + ' unavailable on '+this.techName+' playback technology element.', e);
            this.tech.isReady_ = false;
          } else {
            vjs.log(e);
          }
        }
        throw e;
      }
    }

    return;
  };

  /**
   * Start media playback
   * http://dev.w3.org/html5/spec/video.html#dom-media-play
   * We're triggering the 'play' event here instead of relying on the
   * media element to allow using event.preventDefault() to stop
   * play from happening if desired. Usecase: preroll ads.
   */
  vjs.Player.prototype.play = function(){
    this.techCall('play');
    return this;
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-pause
  vjs.Player.prototype.pause = function(){
    this.techCall('pause');
    return this;
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-paused
  // The initial state of paused should be true (in Safari it's actually false)
  vjs.Player.prototype.paused = function(){
    return (this.techGet('paused') === false) ? false : true;
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-currenttime
  vjs.Player.prototype.currentTime = function(seconds){
    if (seconds !== undefined) {

      // Cache the last set value for smoother scrubbing.
      this.cache_.lastSetCurrentTime = seconds;

      this.techCall('setCurrentTime', seconds);

      // Improve the accuracy of manual timeupdates
      if (this.manualTimeUpdates) { this.trigger('timeupdate'); }

      return this;
    }

    // Cache last currentTime and return
    // Default to 0 seconds
    return this.cache_.currentTime = (this.techGet('currentTime') || 0);
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-duration
  // Duration should return NaN if not available. ParseFloat will turn false-ish values to NaN.
  vjs.Player.prototype.duration = function(seconds){
    if (seconds !== undefined) {

      // Cache the last set value for optimiized scrubbing (esp. Flash)
      this.cache_.duration = parseFloat(seconds);

      return this;
    }

    return this.cache_.duration;
  };

  // Calculates how much time is left. Not in spec, but useful.
  vjs.Player.prototype.remainingTime = function(){
    return this.duration() - this.currentTime();
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-buffered
  // Buffered returns a timerange object.
  // Kind of like an array of portions of the video that have been downloaded.
  // So far no browsers return more than one range (portion)
  vjs.Player.prototype.buffered = function(){
    var buffered = this.techGet('buffered'),
        start = 0,
        // Default end to 0 and store in values
        end = this.cache_.bufferEnd = this.cache_.bufferEnd || 0;

    if (buffered && buffered.length > 0 && buffered.end(0) !== end) {
      end = buffered.end(0);
      // Storing values allows them be overridden by setBufferedFromProgress
      this.cache_.bufferEnd = end;
    }

    return vjs.createTimeRange(start, end);
  };

  // Calculates amount of buffer is full. Not in spec but useful.
  vjs.Player.prototype.bufferedPercent = function(){
    return (this.duration()) ? this.buffered().end(0) / this.duration() : 0;
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-volume
  vjs.Player.prototype.volume = function(percentAsDecimal){
    var vol;

    if (percentAsDecimal !== undefined) {
      vol = Math.max(0, Math.min(1, parseFloat(percentAsDecimal))); // Force value to between 0 and 1
      this.cache_.volume = vol;
      this.techCall('setVolume', vol);
      vjs.setLocalStorage('volume', vol);
      return this;
    }

    // Default to 1 when returning current volume.
    vol = parseFloat(this.techGet('volume'));
    return (isNaN(vol)) ? 1 : vol;
  };

  // http://dev.w3.org/html5/spec/video.html#attr-media-muted
  vjs.Player.prototype.muted = function(muted){
    if (muted !== undefined) {
      this.techCall('setMuted', muted);
      return this;
    }
    return this.techGet('muted') || false; // Default to false
  };

  // Check if current tech can support native fullscreen (e.g. with built in controls lik iOS, so not our flash swf)
  vjs.Player.prototype.supportsFullScreen = function(){ return this.techGet('supportsFullScreen') || false; };

  // Turn on fullscreen (or window) mode
  vjs.Player.prototype.requestFullScreen = function(){
    var requestFullScreen = vjs.support.requestFullScreen;
    this.isFullScreen = true;

    if (requestFullScreen) {
      // the browser supports going fullscreen at the element level so we can
      // take the controls fullscreen as well as the video

      // Trigger fullscreenchange event after change
      // We have to specifically add this each time, and remove
      // when cancelling fullscreen. Otherwise if there's multiple
      // players on a page, they would all be reacting to the same fullscreen
      // events
      vjs.on(document, requestFullScreen.eventName, vjs.bind(this, function(e){
        this.isFullScreen = document[requestFullScreen.isFullScreen];

        // If cancelling fullscreen, remove event listener.
        if (this.isFullScreen === false) {
          vjs.off(document, requestFullScreen.eventName, arguments.callee);
        }

        this.trigger('fullscreenchange');
      }));

      this.el_[requestFullScreen.requestFn]();

    } else if (this.tech.supportsFullScreen()) {
      // we can't take the video.js controls fullscreen but we can go fullscreen
      // with native controls
      this.techCall('enterFullScreen');
    } else {
      // fullscreen isn't supported so we'll just stretch the video element to
      // fill the viewport
      this.enterFullWindow();
      this.trigger('fullscreenchange');
    }

    return this;
  };

  vjs.Player.prototype.cancelFullScreen = function(){
    var requestFullScreen = vjs.support.requestFullScreen;
    this.isFullScreen = false;

    // Check for browser element fullscreen support
    if (requestFullScreen) {
      document[requestFullScreen.cancelFn]();
    } else if (this.tech.supportsFullScreen()) {
     this.techCall('exitFullScreen');
    } else {
     this.exitFullWindow();
     this.trigger('fullscreenchange');
    }

    return this;
  };

  // When fullscreen isn't supported we can stretch the video container to as wide as the browser will let us.
  vjs.Player.prototype.enterFullWindow = function(){
    this.isFullWindow = true;

    // Storing original doc overflow value to return to when fullscreen is off
    this.docOrigOverflow = document.documentElement.style.overflow;

    // Add listener for esc key to exit fullscreen
    vjs.on(document, 'keydown', vjs.bind(this, this.fullWindowOnEscKey));

    // Hide any scroll bars
    document.documentElement.style.overflow = 'hidden';

    // Apply fullscreen styles
    vjs.addClass(document.body, 'vjs-full-window');

    this.trigger('enterFullWindow');
  };
  vjs.Player.prototype.fullWindowOnEscKey = function(event){
    if (event.keyCode === 27) {
      if (this.isFullScreen === true) {
        this.cancelFullScreen();
      } else {
        this.exitFullWindow();
      }
    }
  };

  vjs.Player.prototype.exitFullWindow = function(){
    this.isFullWindow = false;
    vjs.off(document, 'keydown', this.fullWindowOnEscKey);

    // Unhide scroll bars.
    document.documentElement.style.overflow = this.docOrigOverflow;

    // Remove fullscreen styles
    vjs.removeClass(document.body, 'vjs-full-window');

    // Resize the box, controller, and poster to original sizes
    // this.positionAll();
    this.trigger('exitFullWindow');
  };

  vjs.Player.prototype.selectSource = function(sources){

    // Loop through each playback technology in the options order
    for (var i=0,j=this.options_['techOrder'];i<j.length;i++) {
      var techName = vjs.capitalize(j[i]),
          tech = vjs[techName];

      // Check if the browser supports this technology
      if (tech.isSupported()) {
        // Loop through each source object
        for (var a=0,b=sources;a<b.length;a++) {
          var source = b[a];

          // Check if source can be played with this technology
          if (tech['canPlaySource'](source)) {
            return { source: source, tech: techName };
          }
        }
      }
    }

    return false;
  };

  // src is a pretty powerful function
  // If you pass it an array of source objects, it will find the best source to play and use that object.src
  //   If the new source requires a new playback technology, it will switch to that.
  // If you pass it an object, it will set the source to object.src
  // If you pass it anything else (url string) it will set the video source to that
  vjs.Player.prototype.src = function(source){
    // Case: Array of source objects to choose from and pick the best to play
    if (source instanceof Array) {

      var sourceTech = this.selectSource(source),
          techName;

      if (sourceTech) {
          source = sourceTech.source;
          techName = sourceTech.tech;

        // If this technology is already loaded, set source
        if (techName == this.techName) {
          this.src(source); // Passing the source object
        // Otherwise load this technology with chosen source
        } else {
          this.loadTech(techName, source);
        }
      } else {
        this.el_.appendChild(vjs.createEl('p', {
          innerHTML: 'Sorry, no compatible source and playback technology were found for this video. Try using another browser like <a href="http://bit.ly/ccMUEC">Chrome</a> or download the latest <a href="http://adobe.ly/mwfN1">Adobe Flash Player</a>.'
        }));
      }

    // Case: Source object { src: '', type: '' ... }
    } else if (source instanceof Object) {

      if (vjs[this.techName]['canPlaySource'](source)) {
        this.src(source.src);
      } else {
        // Send through tech loop to check for a compatible technology.
        this.src([source]);
      }

    // Case: URL String (http://myvideo...)
    } else {
      // Cache for getting last set source
      this.cache_.src = source;

      if (!this.isReady_) {
        this.ready(function(){
          this.src(source);
        });
      } else {
        this.techCall('src', source);
        if (this.options_['preload'] == 'auto') {
          this.load();
        }
        if (this.options_['autoplay']) {
          this.play();
        }
      }
    }
    return this;
  };

  // Begin loading the src data
  // http://dev.w3.org/html5/spec/video.html#dom-media-load
  vjs.Player.prototype.load = function(){
    this.techCall('load');
    return this;
  };

  // http://dev.w3.org/html5/spec/video.html#dom-media-currentsrc
  vjs.Player.prototype.currentSrc = function(){
    return this.techGet('currentSrc') || this.cache_.src || '';
  };

  // Attributes/Options
  vjs.Player.prototype.preload = function(value){
    if (value !== undefined) {
      this.techCall('setPreload', value);
      this.options_['preload'] = value;
      return this;
    }
    return this.techGet('preload');
  };
  vjs.Player.prototype.autoplay = function(value){
    if (value !== undefined) {
      this.techCall('setAutoplay', value);
      this.options_['autoplay'] = value;
      return this;
    }
    return this.techGet('autoplay', value);
  };
  vjs.Player.prototype.loop = function(value){
    if (value !== undefined) {
      this.techCall('setLoop', value);
      this.options_['loop'] = value;
      return this;
    }
    return this.techGet('loop');
  };

  /**
   * The url of the poster image source.
   * @type {String}
   * @private
   */
  vjs.Player.prototype.poster_;

  /**
   * Get or set the poster image source url.
   * @param  {String} src Poster image source URL
   * @return {String}    Poster image source URL or null
   */
  vjs.Player.prototype.poster = function(src){
    if (src !== undefined) {
      this.poster_ = src;
    }
    return this.poster_;
  };

  /**
   * Whether or not the controls are showing
   * @type {Boolean}
   * @private
   */
  vjs.Player.prototype.controls_;

  /**
   * Get or set whether or not the controls are showing.
   * @param  {Boolean} controls Set controls to showing or not
   * @return {Boolean}    Controls are showing
   */
  vjs.Player.prototype.controls = function(controls){
    if (controls !== undefined) {
      // Don't trigger a change event unless it actually changed
      if (this.controls_ !== controls) {
        this.controls_ = !!controls; // force boolean
        this.trigger('controlschange');
      }
    }
    return this.controls_;
  };

  vjs.Player.prototype.error = function(){ return this.techGet('error'); };
  vjs.Player.prototype.ended = function(){ return this.techGet('ended'); };

  // Methods to add support for
  // networkState: function(){ return this.techCall('networkState'); },
  // readyState: function(){ return this.techCall('readyState'); },
  // seeking: function(){ return this.techCall('seeking'); },
  // initialTime: function(){ return this.techCall('initialTime'); },
  // startOffsetTime: function(){ return this.techCall('startOffsetTime'); },
  // played: function(){ return this.techCall('played'); },
  // seekable: function(){ return this.techCall('seekable'); },
  // videoTracks: function(){ return this.techCall('videoTracks'); },
  // audioTracks: function(){ return this.techCall('audioTracks'); },
  // videoWidth: function(){ return this.techCall('videoWidth'); },
  // videoHeight: function(){ return this.techCall('videoHeight'); },
  // defaultPlaybackRate: function(){ return this.techCall('defaultPlaybackRate'); },
  // playbackRate: function(){ return this.techCall('playbackRate'); },
  // mediaGroup: function(){ return this.techCall('mediaGroup'); },
  // controller: function(){ return this.techCall('controller'); },
  // defaultMuted: function(){ return this.techCall('defaultMuted'); }

  // TODO
  // currentSrcList: the array of sources including other formats and bitrates
  // playList: array of source lists in order of playback

  // RequestFullscreen API
  (function(){
    var prefix, requestFS, div;

    div = document.createElement('div');

    requestFS = {};

    // Current W3C Spec
    // http://dvcs.w3.org/hg/fullscreen/raw-file/tip/Overview.html#api
    // Mozilla Draft: https://wiki.mozilla.org/Gecko:FullScreenAPI#fullscreenchange_event
    // New: https://dvcs.w3.org/hg/fullscreen/raw-file/529a67b8d9f3/Overview.html
    if (div.cancelFullscreen !== undefined) {
      requestFS.requestFn = 'requestFullscreen';
      requestFS.cancelFn = 'exitFullscreen';
      requestFS.eventName = 'fullscreenchange';
      requestFS.isFullScreen = 'fullScreen';

    // Webkit (Chrome/Safari) and Mozilla (Firefox) have working implementations
    // that use prefixes and vary slightly from the new W3C spec. Specifically,
    // using 'exit' instead of 'cancel', and lowercasing the 'S' in Fullscreen.
    // Other browsers don't have any hints of which version they might follow yet,
    // so not going to try to predict by looping through all prefixes.
    } else {

      if (document.mozCancelFullScreen) {
        prefix = 'moz';
        requestFS.isFullScreen = prefix + 'FullScreen';
      } else {
        prefix = 'webkit';
        requestFS.isFullScreen = prefix + 'IsFullScreen';
      }

      if (div[prefix + 'RequestFullScreen']) {
        requestFS.requestFn = prefix + 'RequestFullScreen';
        requestFS.cancelFn = prefix + 'CancelFullScreen';
      }
      requestFS.eventName = prefix + 'fullscreenchange';
    }

    if (document[requestFS.cancelFn]) {
      vjs.support.requestFullScreen = requestFS;
    }

  })();
  /**
   * Container of main controls
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.ControlBar = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      if (!player.controls()) {
        this.disable();
      }

      player.one('play', vjs.bind(this, function(){
        var touchstart,
          fadeIn = vjs.bind(this, this.fadeIn),
          fadeOut = vjs.bind(this, this.fadeOut);

        this.fadeOut();

        if ( !('ontouchstart' in window) ) {
          this.player_.on('mouseover', fadeIn);
          this.player_.on('mouseout', fadeOut);
          this.player_.on('pause', vjs.bind(this, this.lockShowing));
          this.player_.on('play', vjs.bind(this, this.unlockShowing));
        }

        touchstart = false;
        this.player_.on('touchstart', function() {
          touchstart = true;
        });
        this.player_.on('touchmove', function() {
          touchstart = false;
        });
        this.player_.on('touchend', vjs.bind(this, function(event) {
          var idx;
          if (touchstart) {
            idx = this.el().className.search('fade-in');
            if (idx !== -1) {
              this.fadeOut();
            } else {
              this.fadeIn();
            }
          }
          touchstart = false;

          if (!this.player_.paused()) {
            event.preventDefault();
          }
        }));
      }));
    }
  });

  vjs.ControlBar.prototype.options_ = {
    loadEvent: 'play',
    children: {
      'playToggle': {},
      'currentTimeDisplay': {},
      'timeDivider': {},
      'durationDisplay': {},
      'remainingTimeDisplay': {},
      'progressControl': {},
      'fullscreenToggle': {},
      'volumeControl': {},
      'muteToggle': {}
      // 'volumeMenuButton': {}
    }
  };

  vjs.ControlBar.prototype.createEl = function(){
    return vjs.createEl('div', {
      className: 'vjs-control-bar'
    });
  };

  vjs.ControlBar.prototype.fadeIn = function(){
    vjs.Component.prototype.fadeIn.call(this);
    this.player_.trigger('controlsvisible');
  };

  vjs.ControlBar.prototype.fadeOut = function(){
    vjs.Component.prototype.fadeOut.call(this);
    this.player_.trigger('controlshidden');
  };/**
   * Button to toggle between play and pause
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.PlayToggle = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);

      player.on('play', vjs.bind(this, this.onPlay));
      player.on('pause', vjs.bind(this, this.onPause));
    }
  });

  vjs.PlayToggle.prototype.buttonText = 'Play';

  vjs.PlayToggle.prototype.buildCSSClass = function(){
    return 'vjs-play-control ' + vjs.Button.prototype.buildCSSClass.call(this);
  };

    // OnClick - Toggle between play and pause
  vjs.PlayToggle.prototype.onClick = function(){
    if (this.player_.paused()) {
      this.player_.play();
    } else {
      this.player_.pause();
    }
  };

    // OnPlay - Add the vjs-playing class to the element so it can change appearance
  vjs.PlayToggle.prototype.onPlay = function(){
    vjs.removeClass(this.el_, 'vjs-paused');
    vjs.addClass(this.el_, 'vjs-playing');
    this.el_.children[0].children[0].innerHTML = 'Pause'; // change the button text to "Pause"
  };

    // OnPause - Add the vjs-paused class to the element so it can change appearance
  vjs.PlayToggle.prototype.onPause = function(){
    vjs.removeClass(this.el_, 'vjs-playing');
    vjs.addClass(this.el_, 'vjs-paused');
    this.el_.children[0].children[0].innerHTML = 'Play'; // change the button text to "Play"
  };/**
   * Displays the current time
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.CurrentTimeDisplay = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      player.on('timeupdate', vjs.bind(this, this.updateContent));
    }
  });

  vjs.CurrentTimeDisplay.prototype.createEl = function(){
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-current-time vjs-time-controls vjs-control'
    });

    this.content = vjs.createEl('div', {
      className: 'vjs-current-time-display',
      innerHTML: '<span class="vjs-control-text">Current Time </span>' + '0:00', // label the current time for screen reader users
      'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
    });

    el.appendChild(vjs.createEl('div').appendChild(this.content));
    return el;
  };

  vjs.CurrentTimeDisplay.prototype.updateContent = function(){
    // Allows for smooth scrubbing, when player can't keep up.
    var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    this.content.innerHTML = '<span class="vjs-control-text">Current Time </span>' + vjs.formatTime(time, this.player_.duration());
  };

  /**
   * Displays the duration
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.DurationDisplay = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      player.on('timeupdate', vjs.bind(this, this.updateContent)); // this might need to be changes to 'durationchange' instead of 'timeupdate' eventually, however the durationchange event fires before this.player_.duration() is set, so the value cannot be written out using this method. Once the order of durationchange and this.player_.duration() being set is figured out, this can be updated.
    }
  });

  vjs.DurationDisplay.prototype.createEl = function(){
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-duration vjs-time-controls vjs-control'
    });

    this.content = vjs.createEl('div', {
      className: 'vjs-duration-display',
      innerHTML: '<span class="vjs-control-text">Duration Time </span>' + '0:00', // label the duration time for screen reader users
      'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
    });

    el.appendChild(vjs.createEl('div').appendChild(this.content));
    return el;
  };

  vjs.DurationDisplay.prototype.updateContent = function(){
    if (this.player_.duration()) {
        this.content.innerHTML = '<span class="vjs-control-text">Duration Time </span>' + vjs.formatTime(this.player_.duration()); // label the duration time for screen reader users
    }
  };

  /**
   * Time Separator (Not used in main skin, but still available, and could be used as a 'spare element')
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.TimeDivider = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);
    }
  });

  vjs.TimeDivider.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-time-divider',
      innerHTML: '<div><span>/</span></div>'
    });
  };

  /**
   * Displays the time left in the video
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.RemainingTimeDisplay = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      player.on('timeupdate', vjs.bind(this, this.updateContent));
    }
  });

  vjs.RemainingTimeDisplay.prototype.createEl = function(){
    var el = vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-remaining-time vjs-time-controls vjs-control'
    });

    this.content = vjs.createEl('div', {
      className: 'vjs-remaining-time-display',
      innerHTML: '<span class="vjs-control-text">Remaining Time </span>' + '-0:00', // label the remaining time for screen reader users
      'aria-live': 'off' // tell screen readers not to automatically read the time as it changes
    });

    el.appendChild(vjs.createEl('div').appendChild(this.content));
    return el;
  };

  vjs.RemainingTimeDisplay.prototype.updateContent = function(){
    if (this.player_.duration()) {
        if (this.player_.duration()) {
            this.content.innerHTML = '<span class="vjs-control-text">Remaining Time </span>' + '-'+ vjs.formatTime(this.player_.remainingTime());
        }
    }

    // Allows for smooth scrubbing, when player can't keep up.
    // var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
    // this.content.innerHTML = vjs.formatTime(time, this.player_.duration());
  };/**
   * Toggle fullscreen video
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.FullscreenToggle = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);
    }
  });

  vjs.FullscreenToggle.prototype.buttonText = 'Fullscreen';

  vjs.FullscreenToggle.prototype.buildCSSClass = function(){
    return 'vjs-fullscreen-control ' + vjs.Button.prototype.buildCSSClass.call(this);
  };

  vjs.FullscreenToggle.prototype.onClick = function(){
    if (!this.player_.isFullScreen) {
      this.player_.requestFullScreen();
      this.el_.children[0].children[0].innerHTML = 'Non-Fullscreen'; // change the button text to "Non-Fullscreen"
    } else {
      this.player_.cancelFullScreen();
      this.el_.children[0].children[0].innerHTML = 'Fullscreen'; // change the button to "Fullscreen"
    }
  };/**
   * Seek, Load Progress, and Play Progress
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.ProgressControl = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);
    }
  });

  vjs.ProgressControl.prototype.options_ = {
    children: {
      'seekBar': {}
    }
  };

  vjs.ProgressControl.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-progress-control vjs-control'
    });
  };

  /**
   * Seek Bar and holder for the progress bars
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.SeekBar = vjs.Slider.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Slider.call(this, player, options);
      player.on('timeupdate', vjs.bind(this, this.updateARIAAttributes));
      player.ready(vjs.bind(this, this.updateARIAAttributes));
    }
  });

  vjs.SeekBar.prototype.options_ = {
    children: {
      'loadProgressBar': {},
      'playProgressBar': {},
      'seekHandle': {}
    },
    'barName': 'playProgressBar',
    'handleName': 'seekHandle'
  };

  vjs.SeekBar.prototype.playerEvent = 'timeupdate';

  vjs.SeekBar.prototype.createEl = function(){
    return vjs.Slider.prototype.createEl.call(this, 'div', {
      className: 'vjs-progress-holder',
      'aria-label': 'video progress bar'
    });
  };

  vjs.SeekBar.prototype.updateARIAAttributes = function(){
      // Allows for smooth scrubbing, when player can't keep up.
      var time = (this.player_.scrubbing) ? this.player_.getCache().currentTime : this.player_.currentTime();
      this.el_.setAttribute('aria-valuenow',vjs.round(this.getPercent()*100, 2)); // machine readable value of progress bar (percentage complete)
      this.el_.setAttribute('aria-valuetext',vjs.formatTime(time, this.player_.duration())); // human readable value of progress bar (time complete)
  };

  vjs.SeekBar.prototype.getPercent = function(){
    return this.player_.currentTime() / this.player_.duration();
  };

  vjs.SeekBar.prototype.onMouseDown = function(event){
    vjs.Slider.prototype.onMouseDown.call(this, event);

    this.player_.scrubbing = true;

    this.videoWasPlaying = !this.player_.paused();
    this.player_.pause();
  };

  vjs.SeekBar.prototype.onMouseMove = function(event){
    var newTime = this.calculateDistance(event) * this.player_.duration();

    // Don't let video end while scrubbing.
    if (newTime == this.player_.duration()) { newTime = newTime - 0.1; }

    // Set new time (tell player to seek to new time)
    this.player_.currentTime(newTime);
  };

  vjs.SeekBar.prototype.onMouseUp = function(event){
    vjs.Slider.prototype.onMouseUp.call(this, event);

    this.player_.scrubbing = false;
    if (this.videoWasPlaying) {
      this.player_.play();
    }
  };

  vjs.SeekBar.prototype.stepForward = function(){
    this.player_.currentTime(this.player_.currentTime() + 5); // more quickly fast forward for keyboard-only users
  };

  vjs.SeekBar.prototype.stepBack = function(){
    this.player_.currentTime(this.player_.currentTime() - 5); // more quickly rewind for keyboard-only users
  };


  /**
   * Shows load progres
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.LoadProgressBar = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);
      player.on('progress', vjs.bind(this, this.update));
    }
  });

  vjs.LoadProgressBar.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-load-progress',
      innerHTML: '<span class="vjs-control-text">Loaded: 0%</span>'
    });
  };

  vjs.LoadProgressBar.prototype.update = function(){
    if (this.el_.style) { this.el_.style.width = vjs.round(this.player_.bufferedPercent() * 100, 2) + '%'; }
  };


  /**
   * Shows play progress
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.PlayProgressBar = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);
    }
  });

  vjs.PlayProgressBar.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-play-progress',
      innerHTML: '<span class="vjs-control-text">Progress: 0%</span>'
    });
  };

  /**
   * SeekBar component includes play progress bar, and seek handle
   * Needed so it can determine seek position based on handle position/size
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.SeekHandle = vjs.SliderHandle.extend();

  /** @inheritDoc */
  vjs.SeekHandle.prototype.defaultValue = '00:00';

  /** @inheritDoc */
  vjs.SeekHandle.prototype.createEl = function(){
    return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
      className: 'vjs-seek-handle'
    });
  };/**
   * Control the volume
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.VolumeControl = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      // hide volume controls when they're not supported by the current tech
      if (player.tech && player.tech.features && player.tech.features.volumeControl === false) {
        this.addClass('vjs-hidden');
      }
      player.on('loadstart', vjs.bind(this, function(){
        if (player.tech.features && player.tech.features.volumeControl === false) {
          this.addClass('vjs-hidden');
        } else {
          this.removeClass('vjs-hidden');
        }
      }));
    }
  });

  vjs.VolumeControl.prototype.options_ = {
    children: {
      'volumeBar': {}
    }
  };

  vjs.VolumeControl.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-control vjs-control'
    });
  };

  /**
   * Contains volume level
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.VolumeBar = vjs.Slider.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Slider.call(this, player, options);
      player.on('volumechange', vjs.bind(this, this.updateARIAAttributes));
      player.ready(vjs.bind(this, this.updateARIAAttributes));
      setTimeout(vjs.bind(this, this.update), 0); // update when elements is in DOM
    }
  });

  vjs.VolumeBar.prototype.updateARIAAttributes = function(){
    // Current value of volume bar as a percentage
    this.el_.setAttribute('aria-valuenow',vjs.round(this.player_.volume()*100, 2));
    this.el_.setAttribute('aria-valuetext',vjs.round(this.player_.volume()*100, 2)+'%');
  };

  vjs.VolumeBar.prototype.options_ = {
    children: {
      'volumeLevel': {},
      'volumeHandle': {}
    },
    'barName': 'volumeLevel',
    'handleName': 'volumeHandle'
  };

  vjs.VolumeBar.prototype.playerEvent = 'volumechange';

  vjs.VolumeBar.prototype.createEl = function(){
    return vjs.Slider.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-bar',
      'aria-label': 'volume level'
    });
  };

  vjs.VolumeBar.prototype.onMouseMove = function(event) {
    this.player_.volume(this.calculateDistance(event));
  };

  vjs.VolumeBar.prototype.getPercent = function(){
    if (this.player_.muted()) {
      return 0;
    } else {
      return this.player_.volume();
    }
  };

  vjs.VolumeBar.prototype.stepForward = function(){
    this.player_.volume(this.player_.volume() + 0.1);
  };

  vjs.VolumeBar.prototype.stepBack = function(){
    this.player_.volume(this.player_.volume() - 0.1);
  };

  /**
   * Shows volume level
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.VolumeLevel = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);
    }
  });

  vjs.VolumeLevel.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-level',
      innerHTML: '<span class="vjs-control-text"></span>'
    });
  };

  /**
   * Change volume level
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
   vjs.VolumeHandle = vjs.SliderHandle.extend();

   /** @inheritDoc */
   vjs.VolumeHandle.prototype.defaultValue = '00:00';

   /** @inheritDoc */
   vjs.VolumeHandle.prototype.createEl = function(){
     return vjs.SliderHandle.prototype.createEl.call(this, 'div', {
       className: 'vjs-volume-handle'
     });
   };/**
   * Mute the audio
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.MuteToggle = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);

      player.on('volumechange', vjs.bind(this, this.update));

      // hide mute toggle if the current tech doesn't support volume control
      if (player.tech && player.tech.features && player.tech.features.volumeControl === false) {
        this.addClass('vjs-hidden');
      }
      player.on('loadstart', vjs.bind(this, function(){
        if (player.tech.features && player.tech.features.volumeControl === false) {
          this.addClass('vjs-hidden');
        } else {
          this.removeClass('vjs-hidden');
        }
      }));
    }
  });

  vjs.MuteToggle.prototype.createEl = function(){
    return vjs.Button.prototype.createEl.call(this, 'div', {
      className: 'vjs-mute-control vjs-control',
      innerHTML: '<div><span class="vjs-control-text">Mute</span></div>'
    });
  };

  vjs.MuteToggle.prototype.onClick = function(){
    this.player_.muted( this.player_.muted() ? false : true );
  };

  vjs.MuteToggle.prototype.update = function(){
    var vol = this.player_.volume(),
        level = 3;

    if (vol === 0 || this.player_.muted()) {
      level = 0;
    } else if (vol < 0.33) {
      level = 1;
    } else if (vol < 0.67) {
      level = 2;
    }

    // Don't rewrite the button text if the actual text doesn't change.
    // This causes unnecessary and confusing information for screen reader users.
    // This check is needed because this function gets called every time the volume level is changed.
    if(this.player_.muted()){
        if(this.el_.children[0].children[0].innerHTML!='Unmute'){
            this.el_.children[0].children[0].innerHTML = 'Unmute'; // change the button text to "Unmute"
        }
    } else {
        if(this.el_.children[0].children[0].innerHTML!='Mute'){
            this.el_.children[0].children[0].innerHTML = 'Mute'; // change the button text to "Mute"
        }
    }

    /* TODO improve muted icon classes */
    for (var i = 0; i < 4; i++) {
      vjs.removeClass(this.el_, 'vjs-vol-'+i);
    }
    vjs.addClass(this.el_, 'vjs-vol-'+level);
  };/**
   * Menu button with a popup for showing the volume slider.
   * @constructor
   */
  vjs.VolumeMenuButton = vjs.MenuButton.extend({
    /** @constructor */
    init: function(player, options){
      vjs.MenuButton.call(this, player, options);

      // Same listeners as MuteToggle
      player.on('volumechange', vjs.bind(this, this.update));

      // hide mute toggle if the current tech doesn't support volume control
      if (player.tech && player.tech.features && player.tech.features.volumeControl === false) {
        this.addClass('vjs-hidden');
      }
      player.on('loadstart', vjs.bind(this, function(){
        if (player.tech.features && player.tech.features.volumeControl === false) {
          this.addClass('vjs-hidden');
        } else {
          this.removeClass('vjs-hidden');
        }
      }));
      this.addClass('vjs-menu-button');
    }
  });

  vjs.VolumeMenuButton.prototype.createMenu = function(){
    var menu = new vjs.Menu(this.player_, {
      contentElType: 'div'
    });
    var vc = new vjs.VolumeBar(this.player_, vjs.obj.merge({vertical: true}, this.options_.volumeBar));
    menu.addChild(vc);
    return menu;
  };

  vjs.VolumeMenuButton.prototype.onClick = function(){
    vjs.MuteToggle.prototype.onClick.call(this);
    vjs.MenuButton.prototype.onClick.call(this);
  };

  vjs.VolumeMenuButton.prototype.createEl = function(){
    return vjs.Button.prototype.createEl.call(this, 'div', {
      className: 'vjs-volume-menu-button vjs-menu-button vjs-control',
      innerHTML: '<div><span class="vjs-control-text">Mute</span></div>'
    });
  };
  vjs.VolumeMenuButton.prototype.update = vjs.MuteToggle.prototype.update;
  /* Poster Image
  ================================================================================ */
  /**
   * Poster image. Shows before the video plays.
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.PosterImage = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);

      if (!player.poster() || !player.controls()) {
        this.hide();
      }

      player.on('play', vjs.bind(this, this.hide));
    }
  });

  vjs.PosterImage.prototype.createEl = function(){
    var el = vjs.createEl('div', {
          className: 'vjs-poster',

          // Don't want poster to be tabbable.
          tabIndex: -1
        }),
        poster = this.player_.poster();

    if (poster) {
      if ('backgroundSize' in el.style) {
        el.style.backgroundImage = 'url("' + poster + '")';
      } else {
        el.appendChild(vjs.createEl('img', { src: poster }));
      }
    }

    return el;
  };

  vjs.PosterImage.prototype.onClick = function(){
    this.player_.play();
  };
  /* Loading Spinner
  ================================================================================ */
  /**
   * Loading spinner for waiting events
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.LoadingSpinner = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      player.on('canplay', vjs.bind(this, this.hide));
      player.on('canplaythrough', vjs.bind(this, this.hide));
      player.on('playing', vjs.bind(this, this.hide));
      player.on('seeked', vjs.bind(this, this.hide));

      player.on('seeking', vjs.bind(this, this.show));

      // in some browsers seeking does not trigger the 'playing' event,
      // so we also need to trap 'seeked' if we are going to set a
      // 'seeking' event
      player.on('seeked', vjs.bind(this, this.hide));

      player.on('error', vjs.bind(this, this.show));

      // Not showing spinner on stalled any more. Browsers may stall and then not trigger any events that would remove the spinner.
      // Checked in Chrome 16 and Safari 5.1.2. http://help.videojs.com/discussions/problems/883-why-is-the-download-progress-showing
      // player.on('stalled', vjs.bind(this, this.show));

      player.on('waiting', vjs.bind(this, this.show));
    }
  });

  vjs.LoadingSpinner.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-loading-spinner'
    });
  };
  /* Big Play Button
  ================================================================================ */
  /**
   * Initial play button. Shows before the video has played.
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.BigPlayButton = vjs.Button.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Button.call(this, player, options);

      if (!player.controls()) {
        this.hide();
      }

      player.on('play', vjs.bind(this, this.hide));
      // player.on('ended', vjs.bind(this, this.show));
    }
  });

  vjs.BigPlayButton.prototype.createEl = function(){
    return vjs.Button.prototype.createEl.call(this, 'div', {
      className: 'vjs-big-play-button',
      innerHTML: '<span></span>',
      'aria-label': 'play video'
    });
  };

  vjs.BigPlayButton.prototype.onClick = function(){
    // Go back to the beginning if big play button is showing at the end.
    // Have to check for current time otherwise it might throw a 'not ready' error.
    //if(this.player_.currentTime()) {
      //this.player_.currentTime(0);
    //}
    this.player_.play();
  };
  /**
   * @fileoverview Media Technology Controller - Base class for media playback technology controllers like Flash and HTML5
   */

  /**
   * Base class for media (HTML5 Video, Flash) controllers
   * @param {vjs.Player|Object} player  Central player instance
   * @param {Object=} options Options object
   * @constructor
   */
  vjs.MediaTechController = vjs.Component.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.Component.call(this, player, options, ready);

      // Make playback element clickable
      // this.addEvent('click', this.proxy(this.onClick));

      // player.triggerEvent('techready');
    }
  });

  // destroy: function(){},
  // createElement: function(){},

  /**
   * Handle a click on the media element. By default will play the media.
   *
   * On android browsers, having this toggle play state interferes with being
   * able to toggle the controls and toggling play state with the play button
   */
  vjs.MediaTechController.prototype.onClick = (function(){
    if (vjs.IS_ANDROID) {
      return function () {};
    } else {
      return function () {
        if (this.player_.controls()) {
          if (this.player_.paused()) {
            this.player_.play();
          } else {
            this.player_.pause();
          }
        }
      };
    }
  })();

  vjs.MediaTechController.prototype.features = {
    volumeControl: true,

    // Resizing plugins using request fullscreen reloads the plugin
    fullscreenResize: false,

    // Optional events that we can manually mimic with timers
    // currently not triggered by video-js-swf
    progressEvents: false,
    timeupdateEvents: false
  };

  vjs.media = {};

  /**
   * List of default API methods for any MediaTechController
   * @type {String}
   */
  vjs.media.ApiMethods = 'play,pause,paused,currentTime,setCurrentTime,duration,buffered,volume,setVolume,muted,setMuted,width,height,supportsFullScreen,enterFullScreen,src,load,currentSrc,preload,setPreload,autoplay,setAutoplay,loop,setLoop,error,networkState,readyState,seeking,initialTime,startOffsetTime,played,seekable,ended,videoTracks,audioTracks,videoWidth,videoHeight,textTracks,defaultPlaybackRate,playbackRate,mediaGroup,controller,controls,defaultMuted'.split(',');
  // Create placeholder methods for each that warn when a method isn't supported by the current playback technology

  function createMethod(methodName){
    return function(){
      throw new Error('The "'+methodName+'" method is not available on the playback technology\'s API');
    };
  }

  for (var i = vjs.media.ApiMethods.length - 1; i >= 0; i--) {
    var methodName = vjs.media.ApiMethods[i];
    vjs.MediaTechController.prototype[vjs.media.ApiMethods[i]] = createMethod(methodName);
  }
  /**
   * @fileoverview HTML5 Media Controller - Wrapper for HTML5 Media API
   */

  /**
   * HTML5 Media Controller - Wrapper for HTML5 Media API
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @param {Function=} ready
   * @constructor
   */
  vjs.Html5 = vjs.MediaTechController.extend({
    /** @constructor */
    init: function(player, options, ready){
      // volume cannot be changed from 1 on iOS
      this.features.volumeControl = vjs.Html5.canControlVolume();

      // In iOS, if you move a video element in the DOM, it breaks video playback.
      this.features.movingMediaElementInDOM = !vjs.IS_IOS;

      // HTML video is able to automatically resize when going to fullscreen
      this.features.fullscreenResize = true;

      vjs.MediaTechController.call(this, player, options, ready);

      var source = options['source'];

      // If the element source is already set, we may have missed the loadstart event, and want to trigger it.
      // We don't want to set the source again and interrupt playback.
      if (source && this.el_.currentSrc == source.src) {
        player.trigger('loadstart');

      // Otherwise set the source if one was provided.
      } else if (source) {
        this.el_.src = source.src;
      }

      // Chrome and Safari both have issues with autoplay.
      // In Safari (5.1.1), when we move the video element into the container div, autoplay doesn't work.
      // In Chrome (15), if you have autoplay + a poster + no controls, the video gets hidden (but audio plays)
      // This fixes both issues. Need to wait for API, so it updates displays correctly
      player.ready(function(){
        if (this.options_['autoplay'] && this.paused()) {
          this.tag.poster = null; // Chrome Fix. Fixed in Chrome v16.
          this.play();
        }
      });

      this.on('click', this.onClick);

      this.setupTriggers();

      this.triggerReady();
    }
  });

  vjs.Html5.prototype.dispose = function(){
    vjs.MediaTechController.prototype.dispose.call(this);
  };

  vjs.Html5.prototype.createEl = function(){
    var player = this.player_,
        // If possible, reuse original tag for HTML5 playback technology element
        el = player.tag,
        newEl;

    // Check if this browser supports moving the element into the box.
    // On the iPhone video will break if you move the element,
    // So we have to create a brand new element.
    if (!el || this.features.movingMediaElementInDOM === false) {

      // If the original tag is still there, remove it.
      if (el) {
        player.el().removeChild(el);
        el = el.cloneNode(false);
      } else {
        el = vjs.createEl('video', {
          id:player.id() + '_html5_api',
          className:'vjs-tech'
        });
      }
      // associate the player with the new tag
      el['player'] = player;

      vjs.insertFirst(el, player.el());
    }

    // Update specific tag settings, in case they were overridden
    var attrs = ['autoplay','preload','loop','muted'];
    for (var i = attrs.length - 1; i >= 0; i--) {
      var attr = attrs[i];
      if (player.options_[attr] !== null) {
        el[attr] = player.options_[attr];
      }
    }

    return el;
    // jenniisawesome = true;
  };

  // Make video events trigger player events
  // May seem verbose here, but makes other APIs possible.
  vjs.Html5.prototype.setupTriggers = function(){
    for (var i = vjs.Html5.Events.length - 1; i >= 0; i--) {
      vjs.on(this.el_, vjs.Html5.Events[i], vjs.bind(this.player_, this.eventHandler));
    }
  };
  // Triggers removed using this.off when disposed

  vjs.Html5.prototype.eventHandler = function(e){
    this.trigger(e);

    // No need for media events to bubble up.
    e.stopPropagation();
  };


  vjs.Html5.prototype.play = function(){ this.el_.play(); };
  vjs.Html5.prototype.pause = function(){ this.el_.pause(); };
  vjs.Html5.prototype.paused = function(){ return this.el_.paused; };

  vjs.Html5.prototype.currentTime = function(){ return this.el_.currentTime; };
  vjs.Html5.prototype.setCurrentTime = function(seconds){
    try {
      this.el_.currentTime = seconds;
    } catch(e) {
      vjs.log(e, 'Video is not ready. (Video.js)');
      // this.warning(VideoJS.warnings.videoNotReady);
    }
  };

  vjs.Html5.prototype.duration = function(){ return this.el_.duration || 0; };
  vjs.Html5.prototype.buffered = function(){ return this.el_.buffered; };

  vjs.Html5.prototype.volume = function(){ return this.el_.volume; };
  vjs.Html5.prototype.setVolume = function(percentAsDecimal){ this.el_.volume = percentAsDecimal; };
  vjs.Html5.prototype.muted = function(){ return this.el_.muted; };
  vjs.Html5.prototype.setMuted = function(muted){ this.el_.muted = muted; };

  vjs.Html5.prototype.width = function(){ return this.el_.offsetWidth; };
  vjs.Html5.prototype.height = function(){ return this.el_.offsetHeight; };

  vjs.Html5.prototype.supportsFullScreen = function(){
    if (typeof this.el_.webkitEnterFullScreen == 'function') {

      // Seems to be broken in Chromium/Chrome && Safari in Leopard
      if (/Android/.test(vjs.USER_AGENT) || !/Chrome|Mac OS X 10.5/.test(vjs.USER_AGENT)) {
        return true;
      }
    }
    return false;
  };

  vjs.Html5.prototype.enterFullScreen = function(){
    var video = this.el_;
    if (video.paused && video.networkState <= video.HAVE_METADATA) {
      // attempt to prime the video element for programmatic access
      // this isn't necessary on the desktop but shouldn't hurt
      this.el_.play();

      // playing and pausing synchronously during the transition to fullscreen
      // can get iOS ~6.1 devices into a play/pause loop
      setTimeout(function(){
        video.pause();
        video.webkitEnterFullScreen();
      }, 0);
    } else {
      video.webkitEnterFullScreen();
    }
  };
  vjs.Html5.prototype.exitFullScreen = function(){
    this.el_.webkitExitFullScreen();
  };
  vjs.Html5.prototype.src = function(src){ this.el_.src = src; };
  vjs.Html5.prototype.load = function(){ this.el_.load(); };
  vjs.Html5.prototype.currentSrc = function(){ return this.el_.currentSrc; };

  vjs.Html5.prototype.preload = function(){ return this.el_.preload; };
  vjs.Html5.prototype.setPreload = function(val){ this.el_.preload = val; };
  vjs.Html5.prototype.autoplay = function(){ return this.el_.autoplay; };
  vjs.Html5.prototype.setAutoplay = function(val){ this.el_.autoplay = val; };
  vjs.Html5.prototype.loop = function(){ return this.el_.loop; };
  vjs.Html5.prototype.setLoop = function(val){ this.el_.loop = val; };

  vjs.Html5.prototype.error = function(){ return this.el_.error; };
    // networkState: function(){ return this.el_.networkState; },
    // readyState: function(){ return this.el_.readyState; },
  vjs.Html5.prototype.seeking = function(){ return this.el_.seeking; };
    // initialTime: function(){ return this.el_.initialTime; },
    // startOffsetTime: function(){ return this.el_.startOffsetTime; },
    // played: function(){ return this.el_.played; },
    // seekable: function(){ return this.el_.seekable; },
  vjs.Html5.prototype.ended = function(){ return this.el_.ended; };
    // videoTracks: function(){ return this.el_.videoTracks; },
    // audioTracks: function(){ return this.el_.audioTracks; },
    // videoWidth: function(){ return this.el_.videoWidth; },
    // videoHeight: function(){ return this.el_.videoHeight; },
    // textTracks: function(){ return this.el_.textTracks; },
    // defaultPlaybackRate: function(){ return this.el_.defaultPlaybackRate; },
    // playbackRate: function(){ return this.el_.playbackRate; },
    // mediaGroup: function(){ return this.el_.mediaGroup; },
    // controller: function(){ return this.el_.controller; },
  vjs.Html5.prototype.defaultMuted = function(){ return this.el_.defaultMuted; };

  /* HTML5 Support Testing ---------------------------------------------------- */

  vjs.Html5.isSupported = function(){
    return !!document.createElement('video').canPlayType;
  };

  vjs.Html5.canPlaySource = function(srcObj){
    return !!document.createElement('video').canPlayType(srcObj.type);
    // TODO: Check Type
    // If no Type, check ext
    // Check Media Type
  };

  vjs.Html5.canControlVolume = function(){
    var volume =  vjs.TEST_VID.volume;
    vjs.TEST_VID.volume = (volume / 2) + 0.1;
    return volume !== vjs.TEST_VID.volume;
  };

  // List of all HTML5 events (various uses).
  vjs.Html5.Events = 'loadstart,suspend,abort,error,emptied,stalled,loadedmetadata,loadeddata,canplay,canplaythrough,playing,waiting,seeking,seeked,ended,durationchange,timeupdate,progress,play,pause,ratechange,volumechange'.split(',');


  // HTML5 Feature detection and Device Fixes --------------------------------- //

  // Android
  if (vjs.IS_ANDROID) {

    // Override Android 2.2 and less canPlayType method which is broken
    if (vjs.ANDROID_VERSION < 3) {
      document.createElement('video').constructor.prototype.canPlayType = function(type){
        return (type && type.toLowerCase().indexOf('video/mp4') != -1) ? 'maybe' : '';
      };
    }
  }
  /**
   * @fileoverview VideoJS-SWF - Custom Flash Player with HTML5-ish API
   * https://github.com/zencoder/video-js-swf
   * Not using setupTriggers. Using global onEvent func to distribute events
   */

  /**
   * HTML5 Media Controller - Wrapper for HTML5 Media API
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @param {Function=} ready
   * @constructor
   */
  vjs.Flash = vjs.MediaTechController.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.MediaTechController.call(this, player, options, ready);

      var source = options['source'],

          // Which element to embed in
          parentEl = options['parentEl'],

          // Create a temporary element to be replaced by swf object
          placeHolder = this.el_ = vjs.createEl('div', { id: player.id() + '_temp_flash' }),

          // Generate ID for swf object
          objId = player.id()+'_flash_api',

          // Store player options in local var for optimization
          // TODO: switch to using player methods instead of options
          // e.g. player.autoplay();
          playerOptions = player.options_,

          // Merge default flashvars with ones passed in to init
          flashVars = vjs.obj.merge({

            // SWF Callback Functions
            'readyFunction': 'videojs.Flash.onReady',
            'eventProxyFunction': 'videojs.Flash.onEvent',
            'errorEventProxyFunction': 'videojs.Flash.onError',

            // Player Settings
            'autoplay': playerOptions.autoplay,
            'preload': playerOptions.preload,
            'loop': playerOptions.loop,
            'muted': playerOptions.muted

          }, options['flashVars']),

          // Merge default parames with ones passed in
          params = vjs.obj.merge({
            'wmode': 'opaque', // Opaque is needed to overlay controls, but can affect playback performance
            'bgcolor': '#000000' // Using bgcolor prevents a white flash when the object is loading
          }, options['params']),

          // Merge default attributes with ones passed in
          attributes = vjs.obj.merge({
            'id': objId,
            'name': objId, // Both ID and Name needed or swf to identifty itself
            'class': 'vjs-tech'
          }, options['attributes'])
      ;

      // If source was supplied pass as a flash var.
      if (source) {
        flashVars['src'] = encodeURIComponent(vjs.getAbsoluteURL(source.src));
      }

      // Add placeholder to player div
      vjs.insertFirst(placeHolder, parentEl);

      // Having issues with Flash reloading on certain page actions (hide/resize/fullscreen) in certain browsers
      // This allows resetting the playhead when we catch the reload
      if (options['startTime']) {
        this.ready(function(){
          this.load();
          this.play();
          this.currentTime(options['startTime']);
        });
      }

      // Flash iFrame Mode
      // In web browsers there are multiple instances where changing the parent element or visibility of a plugin causes the plugin to reload.
      // - Firefox just about always. https://bugzilla.mozilla.org/show_bug.cgi?id=90268 (might be fixed by version 13)
      // - Webkit when hiding the plugin
      // - Webkit and Firefox when using requestFullScreen on a parent element
      // Loading the flash plugin into a dynamically generated iFrame gets around most of these issues.
      // Issues that remain include hiding the element and requestFullScreen in Firefox specifically

      // There's on particularly annoying issue with this method which is that Firefox throws a security error on an offsite Flash object loaded into a dynamically created iFrame.
      // Even though the iframe was inserted into a page on the web, Firefox + Flash considers it a local app trying to access an internet file.
      // I tried mulitple ways of setting the iframe src attribute but couldn't find a src that worked well. Tried a real/fake source, in/out of domain.
      // Also tried a method from stackoverflow that caused a security error in all browsers. http://stackoverflow.com/questions/2486901/how-to-set-document-domain-for-a-dynamically-generated-iframe
      // In the end the solution I found to work was setting the iframe window.location.href right before doing a document.write of the Flash object.
      // The only downside of this it seems to trigger another http request to the original page (no matter what's put in the href). Not sure why that is.

      // NOTE (2012-01-29): Cannot get Firefox to load the remote hosted SWF into a dynamically created iFrame
      // Firefox 9 throws a security error, unleess you call location.href right before doc.write.
      //    Not sure why that even works, but it causes the browser to look like it's continuously trying to load the page.
      // Firefox 3.6 keeps calling the iframe onload function anytime I write to it, causing an endless loop.

      if (options['iFrameMode'] === true && !vjs.IS_FIREFOX) {

        // Create iFrame with vjs-tech class so it's 100% width/height
        var iFrm = vjs.createEl('iframe', {
          'id': objId + '_iframe',
          'name': objId + '_iframe',
          'className': 'vjs-tech',
          'scrolling': 'no',
          'marginWidth': 0,
          'marginHeight': 0,
          'frameBorder': 0
        });

        // Update ready function names in flash vars for iframe window
        flashVars['readyFunction'] = 'ready';
        flashVars['eventProxyFunction'] = 'events';
        flashVars['errorEventProxyFunction'] = 'errors';

        // Tried multiple methods to get this to work in all browsers

        // Tried embedding the flash object in the page first, and then adding a place holder to the iframe, then replacing the placeholder with the page object.
        // The goal here was to try to load the swf URL in the parent page first and hope that got around the firefox security error
        // var newObj = vjs.Flash.embed(options['swf'], placeHolder, flashVars, params, attributes);
        // (in onload)
        //  var temp = vjs.createEl('a', { id:'asdf', innerHTML: 'asdf' } );
        //  iDoc.body.appendChild(temp);

        // Tried embedding the flash object through javascript in the iframe source.
        // This works in webkit but still triggers the firefox security error
        // iFrm.src = 'javascript: document.write('"+vjs.Flash.getEmbedCode(options['swf'], flashVars, params, attributes)+"');";

        // Tried an actual local iframe just to make sure that works, but it kills the easiness of the CDN version if you require the user to host an iframe
        // We should add an option to host the iframe locally though, because it could help a lot of issues.
        // iFrm.src = "iframe.html";

        // Wait until iFrame has loaded to write into it.
        vjs.on(iFrm, 'load', vjs.bind(this, function(){

          var iDoc,
              iWin = iFrm.contentWindow;

          // The one working method I found was to use the iframe's document.write() to create the swf object
          // This got around the security issue in all browsers except firefox.
          // I did find a hack where if I call the iframe's window.location.href='', it would get around the security error
          // However, the main page would look like it was loading indefinitely (URL bar loading spinner would never stop)
          // Plus Firefox 3.6 didn't work no matter what I tried.
          // if (vjs.USER_AGENT.match('Firefox')) {
          //   iWin.location.href = '';
          // }

          // Get the iFrame's document depending on what the browser supports
          iDoc = iFrm.contentDocument ? iFrm.contentDocument : iFrm.contentWindow.document;

          // Tried ensuring both document domains were the same, but they already were, so that wasn't the issue.
          // Even tried adding /. that was mentioned in a browser security writeup
          // document.domain = document.domain+'/.';
          // iDoc.domain = document.domain+'/.';

          // Tried adding the object to the iframe doc's innerHTML. Security error in all browsers.
          // iDoc.body.innerHTML = swfObjectHTML;

          // Tried appending the object to the iframe doc's body. Security error in all browsers.
          // iDoc.body.appendChild(swfObject);

          // Using document.write actually got around the security error that browsers were throwing.
          // Again, it's a dynamically generated (same domain) iframe, loading an external Flash swf.
          // Not sure why that's a security issue, but apparently it is.
          iDoc.write(vjs.Flash.getEmbedCode(options['swf'], flashVars, params, attributes));

          // Setting variables on the window needs to come after the doc write because otherwise they can get reset in some browsers
          // So far no issues with swf ready event being called before it's set on the window.
          iWin['player'] = this.player_;

          // Create swf ready function for iFrame window
          iWin['ready'] = vjs.bind(this.player_, function(currSwf){
            var el = iDoc.getElementById(currSwf),
                player = this,
                tech = player.tech;

            // Update reference to playback technology element
            tech.el_ = el;

            // Now that the element is ready, make a click on the swf play the video
            vjs.on(el, 'click', tech.bind(tech.onClick));

            // Make sure swf is actually ready. Sometimes the API isn't actually yet.
            vjs.Flash.checkReady(tech);
          });

          // Create event listener for all swf events
          iWin['events'] = vjs.bind(this.player_, function(swfID, eventName){
            var player = this;
            if (player && player.techName === 'flash') {
              player.trigger(eventName);
            }
          });

          // Create error listener for all swf errors
          iWin['errors'] = vjs.bind(this.player_, function(swfID, eventName){
            vjs.log('Flash Error', eventName);
          });

        }));

        // Replace placeholder with iFrame (it will load now)
        placeHolder.parentNode.replaceChild(iFrm, placeHolder);

      // If not using iFrame mode, embed as normal object
      } else {
        vjs.Flash.embed(options['swf'], placeHolder, flashVars, params, attributes);
      }
    }
  });

  vjs.Flash.prototype.dispose = function(){
    vjs.MediaTechController.prototype.dispose.call(this);
  };

  vjs.Flash.prototype.play = function(){
    this.el_.vjs_play();
  };

  vjs.Flash.prototype.pause = function(){
    this.el_.vjs_pause();
  };

  vjs.Flash.prototype.src = function(src){
    // Make sure source URL is abosolute.
    src = vjs.getAbsoluteURL(src);

    this.el_.vjs_src(src);

    // Currently the SWF doesn't autoplay if you load a source later.
    // e.g. Load player w/ no source, wait 2s, set src.
    if (this.player_.autoplay()) {
      var tech = this;
      setTimeout(function(){ tech.play(); }, 0);
    }
  };

  vjs.Flash.prototype.load = function(){
    this.el_.vjs_load();
  };

  vjs.Flash.prototype.poster = function(){
    this.el_.vjs_getProperty('poster');
  };

  vjs.Flash.prototype.buffered = function(){
    return vjs.createTimeRange(0, this.el_.vjs_getProperty('buffered'));
  };

  vjs.Flash.prototype.supportsFullScreen = function(){
    return false; // Flash does not allow fullscreen through javascript
  };

  vjs.Flash.prototype.enterFullScreen = function(){
    return false;
  };


  // Create setters and getters for attributes
  var api = vjs.Flash.prototype,
      readWrite = 'preload,currentTime,defaultPlaybackRate,playbackRate,autoplay,loop,mediaGroup,controller,controls,volume,muted,defaultMuted'.split(','),
      readOnly = 'error,currentSrc,networkState,readyState,seeking,initialTime,duration,startOffsetTime,paused,played,seekable,ended,videoTracks,audioTracks,videoWidth,videoHeight,textTracks'.split(',');
      // Overridden: buffered

  /**
   * @this {*}
   */
  var createSetter = function(attr){
    var attrUpper = attr.charAt(0).toUpperCase() + attr.slice(1);
    api['set'+attrUpper] = function(val){ return this.el_.vjs_setProperty(attr, val); };
  };

  /**
   * @this {*}
   */
  var createGetter = function(attr){
    api[attr] = function(){ return this.el_.vjs_getProperty(attr); };
  };

  (function(){
    var i;
    // Create getter and setters for all read/write attributes
    for (i = 0; i < readWrite.length; i++) {
      createGetter(readWrite[i]);
      createSetter(readWrite[i]);
    }

    // Create getters for read-only attributes
    for (i = 0; i < readOnly.length; i++) {
      createGetter(readOnly[i]);
    }
  })();

  /* Flash Support Testing -------------------------------------------------------- */

  vjs.Flash.isSupported = function(){
    return vjs.Flash.version()[0] >= 10;
    // return swfobject.hasFlashPlayerVersion('10');
  };

  vjs.Flash.canPlaySource = function(srcObj){
    if (srcObj.type in vjs.Flash.formats) { return 'maybe'; }
  };

  vjs.Flash.formats = {
    'video/flv': 'FLV',
    'video/x-flv': 'FLV',
    'video/mp4': 'MP4',
    'video/m4v': 'MP4'
  };

  vjs.Flash['onReady'] = function(currSwf){
    var el = vjs.el(currSwf);

    // Get player from box
    // On firefox reloads, el might already have a player
    var player = el['player'] || el.parentNode['player'],
        tech = player.tech;

    // Reference player on tech element
    el['player'] = player;

    // Update reference to playback technology element
    tech.el_ = el;

    // Now that the element is ready, make a click on the swf play the video
    tech.on('click', tech.onClick);

    vjs.Flash.checkReady(tech);
  };

  // The SWF isn't alwasy ready when it says it is. Sometimes the API functions still need to be added to the object.
  // If it's not ready, we set a timeout to check again shortly.
  vjs.Flash.checkReady = function(tech){

    // Check if API property exists
    if (tech.el().vjs_getProperty) {

      // If so, tell tech it's ready
      tech.triggerReady();

    // Otherwise wait longer.
    } else {

      setTimeout(function(){
        vjs.Flash.checkReady(tech);
      }, 50);

    }
  };

  // Trigger events from the swf on the player
  vjs.Flash['onEvent'] = function(swfID, eventName){
    var player = vjs.el(swfID)['player'];
    player.trigger(eventName);
  };

  // Log errors from the swf
  vjs.Flash['onError'] = function(swfID, err){
    var player = vjs.el(swfID)['player'];
    player.trigger('error');
    vjs.log('Flash Error', err, swfID);
  };

  // Flash Version Check
  vjs.Flash.version = function(){
    var version = '0,0,0';

    // IE
    try {
      version = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];

    // other browsers
    } catch(e) {
      try {
        if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin){
          version = (navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
        }
      } catch(err) {}
    }
    return version.split(',');
  };

  // Flash embedding method. Only used in non-iframe mode
  vjs.Flash.embed = function(swf, placeHolder, flashVars, params, attributes){
    var code = vjs.Flash.getEmbedCode(swf, flashVars, params, attributes),

        // Get element by embedding code and retrieving created element
        obj = vjs.createEl('div', { innerHTML: code }).childNodes[0],

        par = placeHolder.parentNode
    ;

    placeHolder.parentNode.replaceChild(obj, placeHolder);

    // IE6 seems to have an issue where it won't initialize the swf object after injecting it.
    // This is a dumb fix
    var newObj = par.childNodes[0];
    setTimeout(function(){
      newObj.style.display = 'block';
    }, 1000);

    return obj;

  };

  vjs.Flash.getEmbedCode = function(swf, flashVars, params, attributes){

    var objTag = '<object type="application/x-shockwave-flash"',
        flashVarsString = '',
        paramsString = '',
        attrsString = '';

    // Convert flash vars to string
    if (flashVars) {
      vjs.obj.each(flashVars, function(key, val){
        flashVarsString += (key + '=' + val + '&amp;');
      });
    }

    // Add swf, flashVars, and other default params
    params = vjs.obj.merge({
      'movie': swf,
      'flashvars': flashVarsString,
      'allowScriptAccess': 'always', // Required to talk to swf
      'allowNetworking': 'all' // All should be default, but having security issues.
    }, params);

    // Create param tags string
    vjs.obj.each(params, function(key, val){
      paramsString += '<param name="'+key+'" value="'+val+'" />';
    });

    attributes = vjs.obj.merge({
      // Add swf to attributes (need both for IE and Others to work)
      'data': swf,

      // Default to 100% width/height
      'width': '100%',
      'height': '100%'

    }, attributes);

    // Create Attributes string
    vjs.obj.each(attributes, function(key, val){
      attrsString += (key + '="' + val + '" ');
    });

    return objTag + attrsString + '>' + paramsString + '</object>';
  };
  /**
   * @constructor
   */
  vjs.MediaLoader = vjs.Component.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.Component.call(this, player, options, ready);

      // If there are no sources when the player is initialized,
      // load the first supported playback technology.
      if (!player.options_['sources'] || player.options_['sources'].length === 0) {
        for (var i=0,j=player.options_['techOrder']; i<j.length; i++) {
          var techName = vjs.capitalize(j[i]),
              tech = vjs[techName];

          // Check if the browser supports this technology
          if (tech && tech.isSupported()) {
            player.loadTech(techName);
            break;
          }
        }
      } else {
        // // Loop through playback technologies (HTML5, Flash) and check for support.
        // // Then load the best source.
        // // A few assumptions here:
        // //   All playback technologies respect preload false.
        player.src(player.options_['sources']);
      }
    }
  });/**
   * @fileoverview Text Tracks
   * Text tracks are tracks of timed text events.
   * Captions - text displayed over the video for the hearing impared
   * Subtitles - text displayed over the video for those who don't understand langauge in the video
   * Chapters - text displayed in a menu allowing the user to jump to particular points (chapters) in the video
   * Descriptions (not supported yet) - audio descriptions that are read back to the user by a screen reading device
   */

  // Player Additions - Functions add to the player object for easier access to tracks

  /**
   * List of associated text tracks
   * @type {Array}
   * @private
   */
  vjs.Player.prototype.textTracks_;

  /**
   * Get an array of associated text tracks. captions, subtitles, chapters, descriptions
   * http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-texttracks
   * @return {Array}           Array of track objects
   */
  vjs.Player.prototype.textTracks = function(){
    this.textTracks_ = this.textTracks_ || [];
    return this.textTracks_;
  };

  /**
   * Add a text track
   * In addition to the W3C settings we allow adding additional info through options.
   * http://www.w3.org/html/wg/drafts/html/master/embedded-content-0.html#dom-media-addtexttrack
   * @param {String}  kind        Captions, subtitles, chapters, descriptions, or metadata
   * @param {String=} label       Optional label
   * @param {String=} language    Optional language
   * @param {Object=} options     Additional track options, like src
   */
  vjs.Player.prototype.addTextTrack = function(kind, label, language, options){
    var tracks = this.textTracks_ = this.textTracks_ || [];
    options = options || {};

    options['kind'] = kind;
    options['label'] = label;
    options['language'] = language;

    // HTML5 Spec says default to subtitles.
    // Uppercase first letter to match class names
    var Kind = vjs.capitalize(kind || 'subtitles');

    // Create correct texttrack class. CaptionsTrack, etc.
    var track = new vjs[Kind + 'Track'](this, options);

    tracks.push(track);

    // If track.dflt() is set, start showing immediately
    // TODO: Add a process to deterime the best track to show for the specific kind
    // Incase there are mulitple defaulted tracks of the same kind
    // Or the user has a set preference of a specific language that should override the default
    // if (track.dflt()) {
    //   this.ready(vjs.bind(track, track.show));
    // }

    return track;
  };

  /**
   * Add an array of text tracks. captions, subtitles, chapters, descriptions
   * Track objects will be stored in the player.textTracks() array
   * @param {Array} trackList Array of track elements or objects (fake track elements)
   */
  vjs.Player.prototype.addTextTracks = function(trackList){
    var trackObj;

    for (var i = 0; i < trackList.length; i++) {
      trackObj = trackList[i];
      this.addTextTrack(trackObj['kind'], trackObj['label'], trackObj['language'], trackObj);
    }

    return this;
  };

  // Show a text track
  // disableSameKind: disable all other tracks of the same kind. Value should be a track kind (captions, etc.)
  vjs.Player.prototype.showTextTrack = function(id, disableSameKind){
    var tracks = this.textTracks_,
        i = 0,
        j = tracks.length,
        track, showTrack, kind;

    // Find Track with same ID
    for (;i<j;i++) {
      track = tracks[i];
      if (track.id() === id) {
        track.show();
        showTrack = track;

      // Disable tracks of the same kind
      } else if (disableSameKind && track.kind() == disableSameKind && track.mode() > 0) {
        track.disable();
      }
    }

    // Get track kind from shown track or disableSameKind
    kind = (showTrack) ? showTrack.kind() : ((disableSameKind) ? disableSameKind : false);

    // Trigger trackchange event, captionstrackchange, subtitlestrackchange, etc.
    if (kind) {
      this.trigger(kind+'trackchange');
    }

    return this;
  };

  /**
   * Track Class
   * Contains track methods for loading, showing, parsing cues of tracks
   * @param {vjs.Player|Object} player
   * @param {Object=} options
   * @constructor
   */
  vjs.TextTrack = vjs.Component.extend({
    /** @constructor */
    init: function(player, options){
      vjs.Component.call(this, player, options);

      // Apply track info to track object
      // Options will often be a track element

      // Build ID if one doesn't exist
      this.id_ = options['id'] || ('vjs_' + options['kind'] + '_' + options['language'] + '_' + vjs.guid++);
      this.src_ = options['src'];
      // 'default' is a reserved keyword in js so we use an abbreviated version
      this.dflt_ = options['default'] || options['dflt'];
      this.title_ = options['title'];
      this.language_ = options['srclang'];
      this.label_ = options['label'];
      this.cues_ = [];
      this.activeCues_ = [];
      this.readyState_ = 0;
      this.mode_ = 0;

      this.player_.on('fullscreenchange', vjs.bind(this, this.adjustFontSize));
    }
  });

  /**
   * Track kind value. Captions, subtitles, etc.
   * @private
   */
  vjs.TextTrack.prototype.kind_;

  /**
   * Get the track kind value
   * @return {String}
   */
  vjs.TextTrack.prototype.kind = function(){
    return this.kind_;
  };

  /**
   * Track src value
   * @private
   */
  vjs.TextTrack.prototype.src_;

  /**
   * Get the track src value
   * @return {String}
   */
  vjs.TextTrack.prototype.src = function(){
    return this.src_;
  };

  /**
   * Track default value
   * If default is used, subtitles/captions to start showing
   * @private
   */
  vjs.TextTrack.prototype.dflt_;

  /**
   * Get the track default value
   * 'default' is a reserved keyword
   * @return {Boolean}
   */
  vjs.TextTrack.prototype.dflt = function(){
    return this.dflt_;
  };

  /**
   * Track title value
   * @private
   */
  vjs.TextTrack.prototype.title_;

  /**
   * Get the track title value
   * @return {String}
   */
  vjs.TextTrack.prototype.title = function(){
    return this.title_;
  };

  /**
   * Language - two letter string to represent track language, e.g. 'en' for English
   * Spec def: readonly attribute DOMString language;
   * @private
   */
  vjs.TextTrack.prototype.language_;

  /**
   * Get the track language value
   * @return {String}
   */
  vjs.TextTrack.prototype.language = function(){
    return this.language_;
  };

  /**
   * Track label e.g. 'English'
   * Spec def: readonly attribute DOMString label;
   * @private
   */
  vjs.TextTrack.prototype.label_;

  /**
   * Get the track label value
   * @return {String}
   */
  vjs.TextTrack.prototype.label = function(){
    return this.label_;
  };

  /**
   * All cues of the track. Cues have a startTime, endTime, text, and other properties.
   * Spec def: readonly attribute TextTrackCueList cues;
   * @private
   */
  vjs.TextTrack.prototype.cues_;

  /**
   * Get the track cues
   * @return {Array}
   */
  vjs.TextTrack.prototype.cues = function(){
    return this.cues_;
  };

  /**
   * ActiveCues is all cues that are currently showing
   * Spec def: readonly attribute TextTrackCueList activeCues;
   * @private
   */
  vjs.TextTrack.prototype.activeCues_;

  /**
   * Get the track active cues
   * @return {Array}
   */
  vjs.TextTrack.prototype.activeCues = function(){
    return this.activeCues_;
  };

  /**
   * ReadyState describes if the text file has been loaded
   * const unsigned short NONE = 0;
   * const unsigned short LOADING = 1;
   * const unsigned short LOADED = 2;
   * const unsigned short ERROR = 3;
   * readonly attribute unsigned short readyState;
   * @private
   */
  vjs.TextTrack.prototype.readyState_;

  /**
   * Get the track readyState
   * @return {Number}
   */
  vjs.TextTrack.prototype.readyState = function(){
    return this.readyState_;
  };

  /**
   * Mode describes if the track is showing, hidden, or disabled
   * const unsigned short OFF = 0;
   * const unsigned short HIDDEN = 1; (still triggering cuechange events, but not visible)
   * const unsigned short SHOWING = 2;
   * attribute unsigned short mode;
   * @private
   */
  vjs.TextTrack.prototype.mode_;

  /**
   * Get the track mode
   * @return {Number}
   */
  vjs.TextTrack.prototype.mode = function(){
    return this.mode_;
  };

  /**
   * Change the font size of the text track to make it larger when playing in fullscreen mode
   * and restore it to its normal size when not in fullscreen mode.
   */
  vjs.TextTrack.prototype.adjustFontSize = function(){
      if (this.player_.isFullScreen) {
          // Scale the font by the same factor as increasing the video width to the full screen window width.
          // Additionally, multiply that factor by 1.4, which is the default font size for
          // the caption track (from the CSS)
          this.el_.style.fontSize = screen.width / this.player_.width() * 1.4 * 100 + '%';
      } else {
          // Change the font size of the text track back to its original non-fullscreen size
          this.el_.style.fontSize = '';
      }
  };

  /**
   * Create basic div to hold cue text
   * @return {Element}
   */
  vjs.TextTrack.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-' + this.kind_ + ' vjs-text-track'
    });
  };

  /**
   * Show: Mode Showing (2)
   * Indicates that the text track is active. If no attempt has yet been made to obtain the track's cues, the user agent will perform such an attempt momentarily.
   * The user agent is maintaining a list of which cues are active, and events are being fired accordingly.
   * In addition, for text tracks whose kind is subtitles or captions, the cues are being displayed over the video as appropriate;
   * for text tracks whose kind is descriptions, the user agent is making the cues available to the user in a non-visual fashion;
   * and for text tracks whose kind is chapters, the user agent is making available to the user a mechanism by which the user can navigate to any point in the media resource by selecting a cue.
   * The showing by default state is used in conjunction with the default attribute on track elements to indicate that the text track was enabled due to that attribute.
   * This allows the user agent to override the state if a later track is discovered that is more appropriate per the user's preferences.
   */
  vjs.TextTrack.prototype.show = function(){
    this.activate();

    this.mode_ = 2;

    // Show element.
    vjs.Component.prototype.show.call(this);
  };

  /**
   * Hide: Mode Hidden (1)
   * Indicates that the text track is active, but that the user agent is not actively displaying the cues.
   * If no attempt has yet been made to obtain the track's cues, the user agent will perform such an attempt momentarily.
   * The user agent is maintaining a list of which cues are active, and events are being fired accordingly.
   */
  vjs.TextTrack.prototype.hide = function(){
    // When hidden, cues are still triggered. Disable to stop triggering.
    this.activate();

    this.mode_ = 1;

    // Hide element.
    vjs.Component.prototype.hide.call(this);
  };

  /**
   * Disable: Mode Off/Disable (0)
   * Indicates that the text track is not active. Other than for the purposes of exposing the track in the DOM, the user agent is ignoring the text track.
   * No cues are active, no events are fired, and the user agent will not attempt to obtain the track's cues.
   */
  vjs.TextTrack.prototype.disable = function(){
    // If showing, hide.
    if (this.mode_ == 2) { this.hide(); }

    // Stop triggering cues
    this.deactivate();

    // Switch Mode to Off
    this.mode_ = 0;
  };

  /**
   * Turn on cue tracking. Tracks that are showing OR hidden are active.
   */
  vjs.TextTrack.prototype.activate = function(){
    // Load text file if it hasn't been yet.
    if (this.readyState_ === 0) { this.load(); }

    // Only activate if not already active.
    if (this.mode_ === 0) {
      // Update current cue on timeupdate
      // Using unique ID for bind function so other tracks don't remove listener
      this.player_.on('timeupdate', vjs.bind(this, this.update, this.id_));

      // Reset cue time on media end
      this.player_.on('ended', vjs.bind(this, this.reset, this.id_));

      // Add to display
      if (this.kind_ === 'captions' || this.kind_ === 'subtitles') {
        this.player_.getChild('textTrackDisplay').addChild(this);
      }
    }
  };

  /**
   * Turn off cue tracking.
   */
  vjs.TextTrack.prototype.deactivate = function(){
    // Using unique ID for bind function so other tracks don't remove listener
    this.player_.off('timeupdate', vjs.bind(this, this.update, this.id_));
    this.player_.off('ended', vjs.bind(this, this.reset, this.id_));
    this.reset(); // Reset

    // Remove from display
    this.player_.getChild('textTrackDisplay').removeChild(this);
  };

  // A readiness state
  // One of the following:
  //
  // Not loaded
  // Indicates that the text track is known to exist (e.g. it has been declared with a track element), but its cues have not been obtained.
  //
  // Loading
  // Indicates that the text track is loading and there have been no fatal errors encountered so far. Further cues might still be added to the track.
  //
  // Loaded
  // Indicates that the text track has been loaded with no fatal errors. No new cues will be added to the track except if the text track corresponds to a MutableTextTrack object.
  //
  // Failed to load
  // Indicates that the text track was enabled, but when the user agent attempted to obtain it, this failed in some way (e.g. URL could not be resolved, network error, unknown text track format). Some or all of the cues are likely missing and will not be obtained.
  vjs.TextTrack.prototype.load = function(){

    // Only load if not loaded yet.
    if (this.readyState_ === 0) {
      this.readyState_ = 1;
      vjs.get(this.src_, vjs.bind(this, this.parseCues), vjs.bind(this, this.onError));
    }

  };

  vjs.TextTrack.prototype.onError = function(err){
    this.error = err;
    this.readyState_ = 3;
    this.trigger('error');
  };

  // Parse the WebVTT text format for cue times.
  // TODO: Separate parser into own class so alternative timed text formats can be used. (TTML, DFXP)
  vjs.TextTrack.prototype.parseCues = function(srcContent) {
    var cue, time, text,
        lines = srcContent.split('\n'),
        line = '', id;

    for (var i=1, j=lines.length; i<j; i++) {
      // Line 0 should be 'WEBVTT', so skipping i=0

      line = vjs.trim(lines[i]); // Trim whitespace and linebreaks

      if (line) { // Loop until a line with content

        // First line could be an optional cue ID
        // Check if line has the time separator
        if (line.indexOf('-->') == -1) {
          id = line;
          // Advance to next line for timing.
          line = vjs.trim(lines[++i]);
        } else {
          id = this.cues_.length;
        }

        // First line - Number
        cue = {
          id: id, // Cue Number
          index: this.cues_.length // Position in Array
        };

        // Timing line
        time = line.split(' --> ');
        cue.startTime = this.parseCueTime(time[0]);
        cue.endTime = this.parseCueTime(time[1]);

        // Additional lines - Cue Text
        text = [];

        // Loop until a blank line or end of lines
        // Assumeing trim('') returns false for blank lines
        while (lines[++i] && (line = vjs.trim(lines[i]))) {
          text.push(line);
        }

        cue.text = text.join('<br/>');

        // Add this cue
        this.cues_.push(cue);
      }
    }

    this.readyState_ = 2;
    this.trigger('loaded');
  };


  vjs.TextTrack.prototype.parseCueTime = function(timeText) {
    var parts = timeText.split(':'),
        time = 0,
        hours, minutes, other, seconds, ms;

    // Check if optional hours place is included
    // 00:00:00.000 vs. 00:00.000
    if (parts.length == 3) {
      hours = parts[0];
      minutes = parts[1];
      other = parts[2];
    } else {
      hours = 0;
      minutes = parts[0];
      other = parts[1];
    }

    // Break other (seconds, milliseconds, and flags) by spaces
    // TODO: Make additional cue layout settings work with flags
    other = other.split(/\s+/);
    // Remove seconds. Seconds is the first part before any spaces.
    seconds = other.splice(0,1)[0];
    // Could use either . or , for decimal
    seconds = seconds.split(/\.|,/);
    // Get milliseconds
    ms = parseFloat(seconds[1]);
    seconds = seconds[0];

    // hours => seconds
    time += parseFloat(hours) * 3600;
    // minutes => seconds
    time += parseFloat(minutes) * 60;
    // Add seconds
    time += parseFloat(seconds);
    // Add milliseconds
    if (ms) { time += ms/1000; }

    return time;
  };

  // Update active cues whenever timeupdate events are triggered on the player.
  vjs.TextTrack.prototype.update = function(){
    if (this.cues_.length > 0) {

      // Get curent player time
      var time = this.player_.currentTime();

      // Check if the new time is outside the time box created by the the last update.
      if (this.prevChange === undefined || time < this.prevChange || this.nextChange <= time) {
        var cues = this.cues_,

            // Create a new time box for this state.
            newNextChange = this.player_.duration(), // Start at beginning of the timeline
            newPrevChange = 0, // Start at end

            reverse = false, // Set the direction of the loop through the cues. Optimized the cue check.
            newCues = [], // Store new active cues.

            // Store where in the loop the current active cues are, to provide a smart starting point for the next loop.
            firstActiveIndex, lastActiveIndex,
            cue, i; // Loop vars

        // Check if time is going forwards or backwards (scrubbing/rewinding)
        // If we know the direction we can optimize the starting position and direction of the loop through the cues array.
        if (time >= this.nextChange || this.nextChange === undefined) { // NextChange should happen
          // Forwards, so start at the index of the first active cue and loop forward
          i = (this.firstActiveIndex !== undefined) ? this.firstActiveIndex : 0;
        } else {
          // Backwards, so start at the index of the last active cue and loop backward
          reverse = true;
          i = (this.lastActiveIndex !== undefined) ? this.lastActiveIndex : cues.length - 1;
        }

        while (true) { // Loop until broken
          cue = cues[i];

          // Cue ended at this point
          if (cue.endTime <= time) {
            newPrevChange = Math.max(newPrevChange, cue.endTime);

            if (cue.active) {
              cue.active = false;
            }

            // No earlier cues should have an active start time.
            // Nevermind. Assume first cue could have a duration the same as the video.
            // In that case we need to loop all the way back to the beginning.
            // if (reverse && cue.startTime) { break; }

          // Cue hasn't started
          } else if (time < cue.startTime) {
            newNextChange = Math.min(newNextChange, cue.startTime);

            if (cue.active) {
              cue.active = false;
            }

            // No later cues should have an active start time.
            if (!reverse) { break; }

          // Cue is current
          } else {

            if (reverse) {
              // Add cue to front of array to keep in time order
              newCues.splice(0,0,cue);

              // If in reverse, the first current cue is our lastActiveCue
              if (lastActiveIndex === undefined) { lastActiveIndex = i; }
              firstActiveIndex = i;
            } else {
              // Add cue to end of array
              newCues.push(cue);

              // If forward, the first current cue is our firstActiveIndex
              if (firstActiveIndex === undefined) { firstActiveIndex = i; }
              lastActiveIndex = i;
            }

            newNextChange = Math.min(newNextChange, cue.endTime);
            newPrevChange = Math.max(newPrevChange, cue.startTime);

            cue.active = true;
          }

          if (reverse) {
            // Reverse down the array of cues, break if at first
            if (i === 0) { break; } else { i--; }
          } else {
            // Walk up the array fo cues, break if at last
            if (i === cues.length - 1) { break; } else { i++; }
          }

        }

        this.activeCues_ = newCues;
        this.nextChange = newNextChange;
        this.prevChange = newPrevChange;
        this.firstActiveIndex = firstActiveIndex;
        this.lastActiveIndex = lastActiveIndex;

        this.updateDisplay();

        this.trigger('cuechange');
      }
    }
  };

  // Add cue HTML to display
  vjs.TextTrack.prototype.updateDisplay = function(){
    var cues = this.activeCues_,
        html = '',
        i=0,j=cues.length;

    for (;i<j;i++) {
      html += '<span class="vjs-tt-cue">'+cues[i].text+'</span>';
    }

    this.el_.innerHTML = html;
  };

  // Set all loop helper values back
  vjs.TextTrack.prototype.reset = function(){
    this.nextChange = 0;
    this.prevChange = this.player_.duration();
    this.firstActiveIndex = 0;
    this.lastActiveIndex = 0;
  };

  // Create specific track types
  /**
   * @constructor
   */
  vjs.CaptionsTrack = vjs.TextTrack.extend();
  vjs.CaptionsTrack.prototype.kind_ = 'captions';
  // Exporting here because Track creation requires the track kind
  // to be available on global object. e.g. new vjs[Kind + 'Track']

  /**
   * @constructor
   */
  vjs.SubtitlesTrack = vjs.TextTrack.extend();
  vjs.SubtitlesTrack.prototype.kind_ = 'subtitles';

  /**
   * @constructor
   */
  vjs.ChaptersTrack = vjs.TextTrack.extend();
  vjs.ChaptersTrack.prototype.kind_ = 'chapters';


  /* Text Track Display
  ============================================================================= */
  // Global container for both subtitle and captions text. Simple div container.

  /**
   * @constructor
   */
  vjs.TextTrackDisplay = vjs.Component.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.Component.call(this, player, options, ready);

      // This used to be called during player init, but was causing an error
      // if a track should show by default and the display hadn't loaded yet.
      // Should probably be moved to an external track loader when we support
      // tracks that don't need a display.
      if (player.options_['tracks'] && player.options_['tracks'].length > 0) {
        this.player_.addTextTracks(player.options_['tracks']);
      }
    }
  });

  vjs.TextTrackDisplay.prototype.createEl = function(){
    return vjs.Component.prototype.createEl.call(this, 'div', {
      className: 'vjs-text-track-display'
    });
  };


  /* Text Track Menu Items
  ============================================================================= */
  /**
   * @constructor
   */
  vjs.TextTrackMenuItem = vjs.MenuItem.extend({
    /** @constructor */
    init: function(player, options){
      var track = this.track = options['track'];

      // Modify options for parent MenuItem class's init.
      options['label'] = track.label();
      options['selected'] = track.dflt();
      vjs.MenuItem.call(this, player, options);

      this.player_.on(track.kind() + 'trackchange', vjs.bind(this, this.update));
    }
  });

  vjs.TextTrackMenuItem.prototype.onClick = function(){
    vjs.MenuItem.prototype.onClick.call(this);
    this.player_.showTextTrack(this.track.id_, this.track.kind());
  };

  vjs.TextTrackMenuItem.prototype.update = function(){
    if (this.track.mode() == 2) {
      this.selected(true);
    } else {
      this.selected(false);
    }
  };

  /**
   * @constructor
   */
  vjs.OffTextTrackMenuItem = vjs.TextTrackMenuItem.extend({
    /** @constructor */
    init: function(player, options){
      // Create pseudo track info
      // Requires options['kind']
      options['track'] = {
        kind: function() { return options['kind']; },
        player: player,
        label: function(){ return options['kind'] + ' off'; },
        dflt: function(){ return false; },
        mode: function(){ return false; }
      };
      vjs.TextTrackMenuItem.call(this, player, options);
      this.selected(true);
    }
  });

  vjs.OffTextTrackMenuItem.prototype.onClick = function(){
    vjs.TextTrackMenuItem.prototype.onClick.call(this);
    this.player_.showTextTrack(this.track.id_, this.track.kind());
  };

  vjs.OffTextTrackMenuItem.prototype.update = function(){
    var tracks = this.player_.textTracks(),
        i=0, j=tracks.length, track,
        off = true;

    for (;i<j;i++) {
      track = tracks[i];
      if (track.kind() == this.track.kind() && track.mode() == 2) {
        off = false;
      }
    }

    if (off) {
      this.selected(true);
    } else {
      this.selected(false);
    }
  };

  /* Captions Button
  ================================================================================ */
  /**
   * @constructor
   */
  vjs.TextTrackButton = vjs.MenuButton.extend({
    /** @constructor */
    init: function(player, options){
      vjs.MenuButton.call(this, player, options);

      if (this.items.length <= 1) {
        this.hide();
      }
    }
  });

  // vjs.TextTrackButton.prototype.buttonPressed = false;

  // vjs.TextTrackButton.prototype.createMenu = function(){
  //   var menu = new vjs.Menu(this.player_);

  //   // Add a title list item to the top
  //   // menu.el().appendChild(vjs.createEl('li', {
  //   //   className: 'vjs-menu-title',
  //   //   innerHTML: vjs.capitalize(this.kind_),
  //   //   tabindex: -1
  //   // }));

  //   this.items = this.createItems();

  //   // Add menu items to the menu
  //   for (var i = 0; i < this.items.length; i++) {
  //     menu.addItem(this.items[i]);
  //   }

  //   // Add list to element
  //   this.addChild(menu);

  //   return menu;
  // };

  // Create a menu item for each text track
  vjs.TextTrackButton.prototype.createItems = function(){
    var items = [], track;

    // Add an OFF menu item to turn all tracks off
    items.push(new vjs.OffTextTrackMenuItem(this.player_, { 'kind': this.kind_ }));

    for (var i = 0; i < this.player_.textTracks().length; i++) {
      track = this.player_.textTracks()[i];
      if (track.kind() === this.kind_) {
        items.push(new vjs.TextTrackMenuItem(this.player_, {
          'track': track
        }));
      }
    }

    return items;
  };

  /**
   * @constructor
   */
  vjs.CaptionsButton = vjs.TextTrackButton.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.TextTrackButton.call(this, player, options, ready);
      this.el_.setAttribute('aria-label','Captions Menu');
    }
  });
  vjs.CaptionsButton.prototype.kind_ = 'captions';
  vjs.CaptionsButton.prototype.buttonText = 'Captions';
  vjs.CaptionsButton.prototype.className = 'vjs-captions-button';

  /**
   * @constructor
   */
  vjs.SubtitlesButton = vjs.TextTrackButton.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.TextTrackButton.call(this, player, options, ready);
      this.el_.setAttribute('aria-label','Subtitles Menu');
    }
  });
  vjs.SubtitlesButton.prototype.kind_ = 'subtitles';
  vjs.SubtitlesButton.prototype.buttonText = 'Subtitles';
  vjs.SubtitlesButton.prototype.className = 'vjs-subtitles-button';

  // Chapters act much differently than other text tracks
  // Cues are navigation vs. other tracks of alternative languages
  /**
   * @constructor
   */
  vjs.ChaptersButton = vjs.TextTrackButton.extend({
    /** @constructor */
    init: function(player, options, ready){
      vjs.TextTrackButton.call(this, player, options, ready);
      this.el_.setAttribute('aria-label','Chapters Menu');
    }
  });
  vjs.ChaptersButton.prototype.kind_ = 'chapters';
  vjs.ChaptersButton.prototype.buttonText = 'Chapters';
  vjs.ChaptersButton.prototype.className = 'vjs-chapters-button';

  // Create a menu item for each text track
  vjs.ChaptersButton.prototype.createItems = function(){
    var items = [], track;

    for (var i = 0; i < this.player_.textTracks().length; i++) {
      track = this.player_.textTracks()[i];
      if (track.kind() === this.kind_) {
        items.push(new vjs.TextTrackMenuItem(this.player_, {
          'track': track
        }));
      }
    }

    return items;
  };

  vjs.ChaptersButton.prototype.createMenu = function(){
    var tracks = this.player_.textTracks(),
        i = 0,
        j = tracks.length,
        track, chaptersTrack,
        items = this.items = [];

    for (;i<j;i++) {
      track = tracks[i];
      if (track.kind() == this.kind_ && track.dflt()) {
        if (track.readyState() < 2) {
          this.chaptersTrack = track;
          track.on('loaded', vjs.bind(this, this.createMenu));
          return;
        } else {
          chaptersTrack = track;
          break;
        }
      }
    }

    var menu = this.menu = new vjs.Menu(this.player_);

    menu.el_.appendChild(vjs.createEl('li', {
      className: 'vjs-menu-title',
      innerHTML: vjs.capitalize(this.kind_),
      tabindex: -1
    }));

    if (chaptersTrack) {
      var cues = chaptersTrack.cues_, cue, mi;
      i = 0;
      j = cues.length;

      for (;i<j;i++) {
        cue = cues[i];

        mi = new vjs.ChaptersTrackMenuItem(this.player_, {
          'track': chaptersTrack,
          'cue': cue
        });

        items.push(mi);

        menu.addChild(mi);
      }
    }

    if (this.items.length > 0) {
      this.show();
    }

    return menu;
  };


  /**
   * @constructor
   */
  vjs.ChaptersTrackMenuItem = vjs.MenuItem.extend({
    /** @constructor */
    init: function(player, options){
      var track = this.track = options['track'],
          cue = this.cue = options['cue'],
          currentTime = player.currentTime();

      // Modify options for parent MenuItem class's init.
      options['label'] = cue.text;
      options['selected'] = (cue.startTime <= currentTime && currentTime < cue.endTime);
      vjs.MenuItem.call(this, player, options);

      track.on('cuechange', vjs.bind(this, this.update));
    }
  });

  vjs.ChaptersTrackMenuItem.prototype.onClick = function(){
    vjs.MenuItem.prototype.onClick.call(this);
    this.player_.currentTime(this.cue.startTime);
    this.update(this.cue.startTime);
  };

  vjs.ChaptersTrackMenuItem.prototype.update = function(){
    var cue = this.cue,
        currentTime = this.player_.currentTime();

    // vjs.log(currentTime, cue.startTime);
    if (cue.startTime <= currentTime && currentTime < cue.endTime) {
      this.selected(true);
    } else {
      this.selected(false);
    }
  };

  // Add Buttons to controlBar
  vjs.obj.merge(vjs.ControlBar.prototype.options_['children'], {
    'subtitlesButton': {},
    'captionsButton': {},
    'chaptersButton': {}
  });

  // vjs.Cue = vjs.Component.extend({
  //   /** @constructor */
  //   init: function(player, options){
  //     vjs.Component.call(this, player, options);
  //   }
  // });
  /**
   * @fileoverview Add JSON support
   * @suppress {undefinedVars}
   * (Compiler doesn't like JSON not being declared)
   */

  /**
   * Javascript JSON implementation
   * (Parse Method Only)
   * https://github.com/douglascrockford/JSON-js/blob/master/json2.js
   * Only using for parse method when parsing data-setup attribute JSON.
   * @type {Object}
   * @suppress {undefinedVars}
   */
  vjs.JSON;

  /**
   * @suppress {undefinedVars}
   */
  if (typeof window.JSON !== 'undefined' && window.JSON.parse === 'function') {
    vjs.JSON = window.JSON;

  } else {
    vjs.JSON = {};

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    vjs.JSON.parse = function (text, reviver) {
        var j;

        function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }
        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
            text = text.replace(cx, function (a) {
                return '\\u' +
                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }

        if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

            j = eval('(' + text + ')');

            return typeof reviver === 'function' ?
                walk({'': j}, '') : j;
        }

        throw new SyntaxError('JSON.parse(): invalid or malformed JSON data');
    };
  }
  /**
   * @fileoverview Functions for automatically setting up a player
   * based on the data-setup attribute of the video tag
   */

  // Automatically set up any tags that have a data-setup attribute
  vjs.autoSetup = function(){
    var options, vid, player,
        vids = document.getElementsByTagName('video');

    // Check if any media elements exist
    if (vids && vids.length > 0) {

      for (var i=0,j=vids.length; i<j; i++) {
        vid = vids[i];

        // Check if element exists, has getAttribute func.
        // IE seems to consider typeof el.getAttribute == 'object' instead of 'function' like expected, at least when loading the player immediately.
        if (vid && vid.getAttribute) {

          // Make sure this player hasn't already been set up.
          if (vid['player'] === undefined) {
            options = vid.getAttribute('data-setup');

            // Check if data-setup attr exists.
            // We only auto-setup if they've added the data-setup attr.
            if (options !== null) {

              // Parse options JSON
              // If empty string, make it a parsable json object.
              options = vjs.JSON.parse(options || '{}');

              // Create new video.js instance.
              player = videojs(vid, options);
            }
          }

        // If getAttribute isn't defined, we need to wait for the DOM.
        } else {
          vjs.autoSetupTimeout(1);
          break;
        }
      }

    // No videos were found, so keep looping unless page is finisehd loading.
    } else if (!vjs.windowLoaded) {
      vjs.autoSetupTimeout(1);
    }
  };

  // Pause to let the DOM keep processing
  vjs.autoSetupTimeout = function(wait){
    setTimeout(vjs.autoSetup, wait);
  };

  vjs.one(window, 'load', function(){
    vjs.windowLoaded = true;
  });

  // Run Auto-load players
  // You have to wait at least once in case this script is loaded after your video in the DOM (weird behavior only with minified version)
  vjs.autoSetupTimeout(1);
  vjs.plugin = function(name, init){
    vjs.Player.prototype[name] = init;
  };

  module.exports = vjs;
}());

},{}],7:[function(require,module,exports){
var Mraid = require('./mraid'),
	$ = require('jquery-browserify');

window.mraid = new Mraid({
	placementType: 'inline',
	screen: {
		width: 768,
		height: 1024
	}
});

if (!window.mocha){
	if (window.document.readyState === 'complete'){
		window.mraid.triggerReady();
	} else {
		$(window).load(function(){
			window.mraid.triggerReady();
		});
	}
}

},{"./mraid":8,"jquery-browserify":5}],8:[function(require,module,exports){
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var StateManager = require('./state-manager');
var WebView = require('./web-view');

var defaultSupports = {
	'sms': true,
	'tel': true,
	'calendar': true,
	'storepicture': true,
	'inlinevideo': true
};

function Mraid(options){
	EventEmitter.call(this);

	var self = this, 
		webView = new WebView(options.screen), 
		expandProperties = Object.create(webView.getScreenSize()), 
		resizeProperties, 
		placementType = options.placementType || 'inline',
		stateManager = new StateManager();

	expandProperties.useCustomClose = false;

	this.open = function(url){ 

		if (/^(tel|sms):/){
			webView.showMessage(url);
			return;
		}

		window.open(url); 
	};

	this.close = function(){
		switch (stateManager.get()){
			case 'default':
				webView.hide();
				webView.resetSize();
				stateManager.set('hidden');
			break;

			case 'resized':
			case 'expanded':
				webView.hideClose();
				webView.resetSize();
				stateManager.set('default');
			break;
		}
	};

	this.resize = function(){
		var rp = this.getResizeProperties();
		if (!rp){
			this.emit('error');
			return;
		}

		switch (stateManager.get()){
			case 'expanded':
			case 'default':
			case 'resized':
				webView.showClose();
				webView.setSize(rp.width || 100, rp.height || 100);
				stateManager.set('resized');
			break;
		}
	};

	this.expand = function(url){
		if (!stateManager.isValid('expanded'))return;
		
		var expandProps = this.getExpandProperties();

		webView.setSize(expandProps.width, expandProps.height);

		if (expandProps.useCustomClose){
			webView.hideClose();
		} else {
			webView.showClose();
		}

		if (url){
			webView.showUrl(url);
		}

		stateManager.set('expanded');
	};

	this.getPlacementType = function(){ return placementType; };
	this.getExpandProperties = function(){ return expandProperties; };
	this.setExpandProperties = function(p){ expandProperties = p; };
	this.getResizeProperties = function(){ return resizeProperties; };
	this.setResizeProperties = function(p){ resizeProperties = p; };
	this.playVideo = function(url){ webView.showVideo(url); };
	
	this.storePicture = function(a){ 
		console.log('mraid.storePicture("'+a+'") ');
		webView.showMessage('mraid.storePicture(...)'); 
	};
	this.createCalendarEvent = function(a){ 
		console.log('mraid.createCalendarEvent(...) called with following argument: ');
		console.log(a);
		webView.showMessage('mraid.createCalendarEvent(...)'); 
	};
	this.getCurrentPosition = function(){ return webView.getCurrentPosition(); };
	this.getDefaultPosition = function(){ return webView.getDefaultPosition(); };
	this.getMaxSize = function(){ return webView.getScreenSize();};
	this.getScreenSize = function(){return webView.getScreenSize();};
	this.supports = function(feature){
		return typeof feature === 'string' &&
			feature.toLowerCase() in defaultSupports;
	};

	this.getVersion = function(){ return 'appnexus'; };
	this.getState = function(){ return stateManager.get(); };
	this.isViewable = function(){ return true; };

	this.addEventListener = function(event_name, method){ this.on(event_name, method); };

	this.removeEventListener=function(eventName, method){
		if (method === undefined){
			this.removeAllListeners(eventName);
		} else {
			this.removeListener(eventName, method);
		}
	};

	this.useCustomClose = function(b){
		var ep = this.getExpandProperties();
		ep.useCustomClose = b;
		this.setExpandProperties(ep);
	};

	this.triggerReady = function(){
		webView.triggerReady();
	};

	function init(){
		stateManager.on('stateChange', function(data){ self.emit('stateChange', data); });
		stateManager.on('error', function(data){ self.emit('error', data); });

		webView.on('close-click', function(){ self.close(); });
		webView.on('ready', function(){
			stateManager.set('default');
			self.emit('ready');
		});

		self.on('error', function(){}); // this is so node doesn't throw if no one is listening
	}

	init();
}

util.inherits(Mraid, EventEmitter);

module.exports = Mraid;

},{"./state-manager":9,"./web-view":11,"events":2,"util":3}],9:[function(require,module,exports){
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _STATES = {
	loading:'loading',
	default: 'default',
	expanded: 'expanded',
	resized: 'resized',
	hidden: 'hidden'
};

var StateManager = function(){
	EventEmitter.call(this);
	this.__state = 'loading';
};

util.inherits(StateManager, EventEmitter);

StateManager.prototype.get = function() { return this.__state; };
StateManager.prototype.set = function(state, isTest){
	var s = _STATES[(state || '').toLowerCase()];

	if (!s){
		throw {msg: 'bad state: ' + state};
	}

	// only resize can fire again and again
	if (this.__state === s && s !== 'resized') return;

	if (!this.isValid(s)){
		_checkForError(this, this.__state, s);
		return;
	}

	this.__state = s;
	this.emit('stateChange', this.__state);

	return s;
};
StateManager.prototype.isValid = function(newState){
	var oldState = this.__state;
	if (!oldState || !newState) return;

	switch (newState){
		case 'resized':
			switch (oldState){
				case 'resized':
					return true;
				case 'hidden':
				case 'loading':
					return false;
				case 'expanded':
					return false;
			}
			break;
		case 'expanded':
			switch (oldState){
				case 'loading':
				case 'hidden':
					return false;
			}
			break;
		case 'loading':
			return false;
	}

	return true;
};
function _checkForError(obj, oldState, newState){
	if (oldState === 'expanded' && newState === 'resized'){
		obj.emit('error', 'cannot transition from expanded to resized.');
	}
}
module.exports = StateManager;

},{"events":2,"util":3}],10:[function(require,module,exports){
var css = 'body.anx-mraid-webview {\
  padding: 0;\
  margin: 0; }\
\
.anx-mraid-webview {\
  overflow: hidden;\
  position: relative; }\
\
.anx-mraid-close {\
  padding: 4px;\
  padding-top: 1px;\
  display: none;\
  background-color: red;\
  color: white;\
  position: absolute;\
  top: 0;\
  right: 0;\
  z-index: 300;\
  -webkit-border-radius: 999px;\
  -moz-border-radius: 999px;\
  border-radius: 999px;\
  width: 11px;\
  height: 14px;\
  background: black;\
  border: 3px solid white;\
  cursor: pointer;\
  -webkit-box-shadow: 3px 3px 3px black;\
  -moz-box-shadow: 3px 3px 3px black;\
  box-shadow: 3px 3px 3px black; }\
  .anx-mraid-close span {\
    position: absolute; }\
\
.anx-mraid-close-iframe {\
  top: -7px;\
  right: -6px; }\
\
.anx-mraid-msg {\
  display: none;\
  opacity: .7;\
  position: absolute;\
  top: 0;\
  bottom: 0;\
  left: 0;\
  right: 0;\
  background-color: black;\
  color: #c46e07;\
  text-align: center;\
  z-index: 200;\
  outline: 1px solid #eee;\
  font-weight: bold;\
  text-shadow: 0px 2px 3px black; }\
\
.anx-mraid-url {\
  position: absolute;\
  top: 0;\
  bottom: 0;\
  left: 0;\
  right: 0;\
  z-index: 200;\
  border: 0;\
  width: 100%;\
  height: 100%; }\
\
#ad-cntr {\
  position: fixed;\
  top: 100px;\
  right: 200px; }\
'; (require('cssify2'))(css); module.exports = css;
},{"cssify2":4}],11:[function(require,module,exports){
var videoJs = require('videojs'),
	util = require('util'),
	$ = require('jquery-browserify'),
	EventEmitter = require('events').EventEmitter;

var inIframe = window !== window.top;

// todo: handle this like a grownup
try {
	var css = require('./style.scss');
}
catch (e){}

var WebView = function(options){
	EventEmitter.call(this);

	var self = this,
		$mraidTag,
		$webView,
		$close,
		videoCount = 0,
		initialSize,
		screenSize;

	options = options || {};
	screenSize = {
		width: options.width || 300,
		height: options.height || 500
	};

	function buildCloseButton(){
		var $close =  $('<div />')
			.attr('class', 'anx-mraid-close')
			.append('<span>X</span>')
			.hide();

		if (!inIframe){
			$close.addClass('anx-mraid-close-iframe');
		}

		return $close;
	}

	function findWebView(){
		var $el;
		$el = $mraidTag.parent();
		if ($el.length && $el.is('head')){
			$el = $('body');
		}

		if (!inIframe && $el.is('body')){
			// if we are the only thing on page then empty the page and re-request the 
			// creative from within an iframe so that we have a container that we can size.

			$el.empty();

			var $iframe = $('<iframe />')
				.css('border', 'none')
				.attr('src', window.location.toString());
	
			$el.append($iframe);
			return null;
		}

		return $el;
	}

	this.hide = function() { $webView.hide(); };
	this.show = function() { $webView.show(); };
	this.showClose = function(){ $close.show(); };
	this.hideClose = function(){ $close.hide(); };

	this.resetSize = function(){
		this.setSize(initialSize.width, initialSize.height);
	};

	this.getInitialSize = function(){ return initialSize; };
	this.getScreenSize = function() { return screenSize; };
	this.getCurrentPosition = function() {
		if (!$webView) return {x: 0, y: 0};

		return {
			x: 0,
			y: 0,
			width: $webView.width(),
			height: $webView.height()
		};
	};

	this.getDefaultPosition = function(){
		var pos = Object.create(this.getInitialSize());
		pos.x = 0;
		pos.y = 0;

		return pos;
	};

	this.showMessage = function(txt){
		var $msg = $('<div class="anx-mraid-msg"></div>');

		$msg.append($('<p></p>')
			.text(txt));

		var $closeBtn = buildCloseButton();

		$closeBtn.click(function(){
			$msg.remove();
			$(this).remove();
		});

		$webView.append($closeBtn);
		$webView.append($msg);
		$msg.slideDown('fast', function (){ $closeBtn.fadeIn('fast'); });
	};

	this.showUrl = function(url){
		var $iframe = $('<iframe class="anx-mraid-url"></iframe>')
			.attr('src', url);
	
		$webView.append($iframe);
	};

	this.showVideo = function(url){
		videoCount += 1;
		url = url || '';

		var beforeVideoSize = this.getCurrentPosition();
		var maxSize = this.getScreenSize();
		var $children = $webView.children();
		$children.hide();

		var videoOptions = {
			autoplay: true,
			controls: false
		};

		var videoId = 'anx-mraid-video-' + videoCount;
		var $video = $('<video class="video-js"></video>')
			.css('max-width', maxSize.width + 'px')
			.css('max-height', maxSize.height + 'px')
			.attr('id', videoId);

		var $source = $('<source></source>')
			.attr('type', 'video/'+ url.match(/\.(\w*)($|\?)/)[1])
			.attr('src', url);

		$video.append($source);
		$webView.append($video);

		var $closeBtn = buildCloseButton();
		$closeBtn.addClass('anx-mraid-video-close');
		$closeBtn.show();

		$closeBtn.click(function(){
			$('#'+videoId).remove();
			$closeBtn.remove();
			$children.show();

			self.setSize(beforeVideoSize.width, beforeVideoSize.height);
		});

		videoJs(videoId, videoOptions, function(){
			this.on('loadedmetadata', function(){
				self.setSize(this.tech.width(), this.tech.height());

				$(this.tag)
					.parent()
					.append($closeBtn);
			});
		});
	};
	
	this.setSize = function(width, height){
		width = width.toString().match(/^(\d+)/)[1] * 1;
		height = height.toString().match(/^(\d+)/)[1] * 1;

		width = Math.min(width, screenSize.width);
		height = Math.min(height, screenSize.height);
	
		if (inIframe){
			// the browser extensions will be listening for this message
			window.parent.postMessage({
				name:'mraid-resize',
				src: window.location.toString(),
				width: width, 
				height: height
			}, '*');
		} else {
			$webView
				.css('width', width + 'px')
				.css('height', height + 'px');
		}
	};

	this.triggerReady = function(){
		$(window.document.head).prepend($('<style></style>').html(css));

		$mraidTag = $('script[src*="mraid.js"]');
		if (!$mraidTag || !$mraidTag.length){
			// no mraid tag, bail!
			return;
		}

		$webView = findWebView();
		if (!$webView) return;

		$webView.addClass('anx-mraid-webview');
		
		$close = buildCloseButton();

		$close.click(function(){
			$webView.find('.anx-mraid-url').remove();
			self.emit('close-click');
			self.hideClose();
		});

		$webView.append($close);

		initialSize = {
			width: $webView.width(),
			height: $webView.height()
		};

		if (inIframe){
			self.setSize(initialSize.width, initialSize.height);
		}

		self.emit('ready');
	};
};

util.inherits(WebView, EventEmitter);

module.exports = WebView;

},{"./style.scss":10,"events":2,"jquery-browserify":5,"util":3,"videojs":6}]},{},[7])
;