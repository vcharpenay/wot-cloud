(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sttl = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],3:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

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

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
module.exports = exports = window.fetch;

// Needed for TypeScript and Webpack.
exports.default = window.fetch.bind(window);

exports.Headers = window.Headers;
exports.Request = window.Request;
exports.Response = window.Response;

},{}],6:[function(require,module,exports){
var XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';

function Generator(options, prefixes) {
  this._options = options || {};

  prefixes = prefixes || {};
  this._prefixByIri = {};
  var prefixIris = [];
  for (var prefix in prefixes) {
    var iri = prefixes[prefix];
    if (typeof iri === 'string') {
      this._prefixByIri[iri] = prefix;
      prefixIris.push(iri);
    }
  }
  var iriList = prefixIris.join('|').replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
  this._prefixRegex = new RegExp('^(' + iriList + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
  this._usedPrefixes = {};
}

// Converts the parsed query object into a SPARQL query
Generator.prototype.toQuery = function (q) {
  var query = '';

  if (q.queryType)
    query += q.queryType.toUpperCase() + ' ';
  if (q.reduced)
    query += 'REDUCED ';
  if (q.distinct)
    query += 'DISTINCT ';

  if (q.variables)
    query += mapJoin(q.variables, undefined, function (variable) {
      return isString(variable) ? this.toEntity(variable) :
             '(' + this.toExpression(variable.expression) + ' AS ' + variable.variable + ')';
    }, this) + ' ';
  else if (q.template)
    query += this.group(q.template, true) + '\n';

  if (q.from)
    query += mapJoin(q.from.default || [], '', function (g) { return 'FROM ' + this.toEntity(g) + '\n'; }, this) +
             mapJoin(q.from.named || [], '', function (g) { return 'FROM NAMED ' + this.toEntity(g) + '\n'; }, this);
  if (q.where)
    query += 'WHERE ' + this.group(q.where, true)  + '\n';

  if (q.updates)
    query += mapJoin(q.updates, ';\n', this.toUpdate, this);

  if (q.group)
    query += 'GROUP BY ' + mapJoin(q.group, undefined, function (it) {
      var result = isString(it.expression) ? it.expression : '(' + this.toExpression(it.expression) + ')';
      return it.variable ? '(' + result + ' AS ' + it.variable + ')' : result;
    }, this) + '\n';
  if (q.having)
    query += 'HAVING (' + mapJoin(q.having, undefined, this.toExpression, this) + ')\n';
  if (q.order)
    query += 'ORDER BY ' + mapJoin(q.order, undefined, function (it) {
      var expr = '(' + this.toExpression(it.expression) + ')';
      return !it.descending ? expr : 'DESC ' + expr;
    }, this) + '\n';

  if (q.offset)
    query += 'OFFSET ' + q.offset + '\n';
  if (q.limit)
    query += 'LIMIT ' + q.limit + '\n';

  if (q.values)
    query += this.values(q);

  // stringify prefixes at the end to mark used ones
  query = this.baseAndPrefixes(q) + query;
  return query.trim();
};

Generator.prototype.baseAndPrefixes = function (q) {
  var base = q.base ? ('BASE <' + q.base + '>\n') : '';
  var prefixes = '';
  for (var key in q.prefixes) {
    if (this._options.allPrefixes || this._usedPrefixes[key])
      prefixes += 'PREFIX ' + key + ': <' + q.prefixes[key] + '>\n';
  }
  return base + prefixes;
};

// Converts the parsed SPARQL pattern into a SPARQL pattern
Generator.prototype.toPattern = function (pattern) {
  var type = pattern.type || (pattern instanceof Array) && 'array' ||
             (pattern.subject && pattern.predicate && pattern.object ? 'triple' : '');
  if (!(type in this))
    throw new Error('Unknown entry type: ' + type);
  return this[type](pattern);
};

Generator.prototype.triple = function (t) {
  return this.toEntity(t.subject) + ' ' + this.toEntity(t.predicate) + ' ' + this.toEntity(t.object) + '.';
};

Generator.prototype.array = function (items) {
  return mapJoin(items, '\n', this.toPattern, this);
};

Generator.prototype.bgp = function (bgp) {
  return mapJoin(bgp.triples, '\n', this.triple, this);
};

Generator.prototype.graph = function (graph) {
  return 'GRAPH ' + this.toEntity(graph.name) + ' ' + this.group(graph);
};

Generator.prototype.group = function (group, inline) {
  group = inline !== true ? this.array(group.patterns || group.triples)
                          : this.toPattern(group.type !== 'group' ? group : group.patterns);
  return group.indexOf('\n') === -1 ? '{ ' + group + ' }' : '{\n' + indent(group) + '\n}';
};

Generator.prototype.query = function (query) {
  return this.toQuery(query);
};

Generator.prototype.filter = function (filter) {
  return 'FILTER(' + this.toExpression(filter.expression) + ')';
};

Generator.prototype.bind = function (bind) {
  return 'BIND(' + this.toExpression(bind.expression) + ' AS ' + bind.variable + ')';
};

Generator.prototype.optional = function (optional) {
  return 'OPTIONAL ' + this.group(optional);
};

Generator.prototype.union = function (union) {
  return mapJoin(union.patterns, '\nUNION\n', function (p) { return this.group(p, true); }, this);
};

Generator.prototype.minus = function (minus) {
  return 'MINUS ' + this.group(minus);
};

Generator.prototype.values = function (valuesList) {
  // Gather unique keys
  var keys = Object.keys(valuesList.values.reduce(function (keyHash, values) {
    for (var key in values) keyHash[key] = true;
    return keyHash;
  }, {}));
  // Create value rows
  return 'VALUES (' + keys.join(' ') + ') {\n' +
    mapJoin(valuesList.values, '\n', function (values) {
      return '  (' + mapJoin(keys, undefined, function (key) {
        return values[key] !== undefined ? this.toEntity(values[key]) : 'UNDEF';
      }, this) + ')';
    }, this) + '\n}';
};

Generator.prototype.service = function (service) {
  return 'SERVICE ' + (service.silent ? 'SILENT ' : '') + this.toEntity(service.name) + ' ' +
         this.group(service);
};

// Converts the parsed expression object into a SPARQL expression
Generator.prototype.toExpression = function (expr) {
  if (isString(expr))
    return this.toEntity(expr);

  switch (expr.type.toLowerCase()) {
    case 'aggregate':
      return expr.aggregation.toUpperCase() +
             '(' + (expr.distinct ? 'DISTINCT ' : '') + this.toExpression(expr.expression) +
             (expr.separator ? '; SEPARATOR = ' + this.toEntity('"' + expr.separator + '"') : '') + ')';
    case 'functioncall':
      return this.toEntity(expr.function) + '(' + mapJoin(expr.args, ', ', this.toExpression, this) + ')';
    case 'operation':
      var operator = expr.operator.toUpperCase(), args = expr.args || [];
      switch (expr.operator.toLowerCase()) {
      // Infix operators
      case '<':
      case '>':
      case '>=':
      case '<=':
      case '&&':
      case '||':
      case '=':
      case '!=':
      case '+':
      case '-':
      case '*':
      case '/':
          return (isString(args[0]) ? this.toEntity(args[0]) : '(' + this.toExpression(args[0]) + ')') +
                 ' ' + operator + ' ' +
                 (isString(args[1]) ? this.toEntity(args[1]) : '(' + this.toExpression(args[1]) + ')');
      // Unary operators
      case '!':
        return '!' + this.toExpression(args[0]);
      // IN and NOT IN
      case 'notin':
        operator = 'NOT IN';
      case 'in':
        return this.toExpression(args[0]) + ' ' + operator +
               '(' + (isString(args[1]) ? args[1] : mapJoin(args[1], ', ', this.toExpression, this)) + ')';
      // EXISTS and NOT EXISTS
      case 'notexists':
        operator = 'NOT EXISTS';
      case 'exists':
        return operator + ' ' + this.group(args[0], true);
      // Other expressions
      default:
        return operator + '(' + mapJoin(args, ', ', this.toExpression, this) + ')';
      }
    default:
      throw new Error('Unknown expression type: ' + expr.type);
  }
};

// Converts the parsed entity (or property path) into a SPARQL entity
Generator.prototype.toEntity = function (value) {
  // regular entity
  if (isString(value)) {
    switch (value[0]) {
    // variable, * selector, or blank node
    case '?':
    case '$':
    case '*':
    case '_':
      return value;
    // literal
    case '"':
      var match = value.match(/^"([^]*)"(?:(@.+)|\^\^(.+))?$/) || {},
          lexical = match[1] || '', language = match[2] || '', datatype = match[3];
      value = '"' + lexical.replace(escape, escapeReplacer) + '"' + language;
      if (datatype) {
        if (datatype === XSD_INTEGER && /^\d+$/.test(lexical))
          // Add space to avoid confusion with decimals in broken parsers
          return lexical + ' ';
        value += '^^' + this.encodeIRI(datatype);
      }
      return value;
    // IRI
    default:
      return this.encodeIRI(value);
    }
  }
  // property path
  else {
    var items = value.items.map(this.toEntity, this), path = value.pathType;
    switch (path) {
    // prefix operator
    case '^':
    case '!':
      return path + items[0];
    // postfix operator
    case '*':
    case '+':
    case '?':
      return '(' + items[0] + path + ')';
    // infix operator
    default:
      return '(' + items.join(path) + ')';
    }
  }
};
var escape = /["\\\t\n\r\b\f]/g,
    escapeReplacer = function (c) { return escapeReplacements[c]; },
    escapeReplacements = { '\\': '\\\\', '"': '\\"', '\t': '\\t',
                           '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f' };

// Represent the IRI, as a prefixed name when possible
Generator.prototype.encodeIRI = function (iri) {
  var prefixMatch = this._prefixRegex.exec(iri);
  if (prefixMatch) {
    var prefix = this._prefixByIri[prefixMatch[1]];
    this._usedPrefixes[prefix] = true;
    return prefix + ':' + prefixMatch[2];
  }
  return '<' + iri + '>';
};

// Converts the parsed update object into a SPARQL update clause
Generator.prototype.toUpdate = function (update) {
  switch (update.type || update.updateType) {
  case 'load':
    return 'LOAD' + (update.source ? ' ' + this.toEntity(update.source) : '') +
           (update.destination ? ' INTO GRAPH ' + this.toEntity(update.destination) : '');
  case 'insert':
    return 'INSERT DATA '  + this.group(update.insert, true);
  case 'delete':
    return 'DELETE DATA '  + this.group(update.delete, true);
  case 'deletewhere':
    return 'DELETE WHERE ' + this.group(update.delete, true);
  case 'insertdelete':
    return (update.graph ? 'WITH ' + this.toEntity(update.graph) + '\n' : '') +
           (update.delete.length ? 'DELETE ' + this.group(update.delete, true) + '\n' : '') +
           (update.insert.length ? 'INSERT ' + this.group(update.insert, true) + '\n' : '') +
           'WHERE ' + this.group(update.where, true);
  case 'add':
  case 'copy':
  case 'move':
    return update.type.toUpperCase() + (update.source.default ? ' DEFAULT ' : ' ') +
           'TO ' + this.toEntity(update.destination.name);
  default:
    throw new Error('Unknown update query type: ' + update.type);
  }
};

// Checks whether the object is a string
function isString(object) { return typeof object === 'string'; }

// Maps the array with the given function, and joins the results using the separator
function mapJoin(array, sep, func, self) {
  return array.map(func, self).join(isString(sep) ? sep : ' ');
}

// Indents each line of the string
function indent(text) { return text.replace(/^/gm, '  '); }

/**
 * @param options {
 *   allPrefixes: boolean
 * }
 */
module.exports = function SparqlGenerator(options) {
  return {
    stringify: function (q) { return new Generator(options, q.prefixes).toQuery(q); }
  };
};

},{}],7:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var SparqlParser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[6,12,15,24,34,43,48,97,107,110,112,113,122,123,128,295,296,297,298,299],$V1=[2,194],$V2=[97,107,110,112,113,122,123,128,295,296,297,298,299],$V3=[1,18],$V4=[1,27],$V5=[6,83],$V6=[38,39,51],$V7=[38,51],$V8=[1,55],$V9=[1,57],$Va=[1,53],$Vb=[1,56],$Vc=[28,29,290],$Vd=[13,16,283],$Ve=[109,131,293,300],$Vf=[13,16,109,131,283],$Vg=[1,79],$Vh=[1,83],$Vi=[1,85],$Vj=[109,131,293,294,300],$Vk=[13,16,109,131,283,294],$Vl=[1,91],$Vm=[2,234],$Vn=[1,90],$Vo=[13,16,28,29,80,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$Vp=[6,38,39,51,61,68,71,79,81,83],$Vq=[6,13,16,28,38,39,51,61,68,71,79,81,83,283],$Vr=[6,13,16,28,29,31,32,38,39,41,51,61,68,71,79,80,81,83,90,106,109,122,123,125,130,157,158,160,163,164,165,183,194,205,210,212,213,215,216,220,224,228,243,248,265,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,301,304,305,307,308,309,310,311,312,313,314],$Vs=[1,106],$Vt=[1,107],$Vu=[6,13,16,28,29,39,41,80,83,109,157,158,160,163,164,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,301],$Vv=[28,32],$Vw=[2,291],$Vx=[1,122],$Vy=[1,120],$Vz=[6,194],$VA=[2,308],$VB=[2,296],$VC=[38,125],$VD=[6,41,68,71,79,81,83],$VE=[2,236],$VF=[1,136],$VG=[1,138],$VH=[1,148],$VI=[1,154],$VJ=[1,157],$VK=[1,153],$VL=[1,155],$VM=[1,151],$VN=[1,152],$VO=[1,158],$VP=[1,159],$VQ=[1,162],$VR=[1,163],$VS=[1,164],$VT=[1,165],$VU=[1,166],$VV=[1,167],$VW=[1,168],$VX=[1,169],$VY=[1,170],$VZ=[1,171],$V_=[1,172],$V$=[1,173],$V01=[6,61,68,71,79,81,83],$V11=[28,29,38,39,51],$V21=[13,16,28,29,80,245,246,247,249,251,252,254,255,258,260,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,314,315,316,317,318,319],$V31=[2,405],$V41=[1,186],$V51=[1,187],$V61=[1,188],$V71=[13,16,41,80,90,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$V81=[6,106,194],$V91=[41,109],$Va1=[6,41,71,79,81,83],$Vb1=[2,320],$Vc1=[2,312],$Vd1=[13,16,28,183,283],$Ve1=[2,348],$Vf1=[2,344],$Vg1=[13,16,28,29,32,39,41,80,83,109,157,158,160,163,164,165,183,194,205,210,212,213,215,216,248,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,301],$Vh1=[13,16,28,29,31,32,39,41,80,83,90,109,157,158,160,163,164,165,183,194,205,210,212,213,215,216,220,224,228,243,248,265,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,301,305,308,309,310,311,312,313,314],$Vi1=[13,16,28,29,31,32,39,41,80,83,90,109,157,158,160,163,164,165,183,194,205,210,212,213,215,216,220,224,228,243,248,265,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,301,305,308,309,310,311,312,313,314],$Vj1=[31,32,194,220,248],$Vk1=[31,32,194,220,224,248],$Vl1=[31,32,194,220,224,228,243,248,265,277,278,279,280,281,282,308,309,310,311,312,313,314],$Vm1=[31,32,194,220,224,228,243,248,265,277,278,279,280,281,282,290,305,308,309,310,311,312,313,314],$Vn1=[1,252],$Vo1=[1,253],$Vp1=[1,255],$Vq1=[1,256],$Vr1=[1,257],$Vs1=[1,258],$Vt1=[1,260],$Vu1=[1,261],$Vv1=[2,412],$Vw1=[1,263],$Vx1=[1,264],$Vy1=[1,265],$Vz1=[1,271],$VA1=[1,266],$VB1=[1,267],$VC1=[1,268],$VD1=[1,269],$VE1=[1,270],$VF1=[1,278],$VG1=[1,289],$VH1=[6,41,79,81,83],$VI1=[1,306],$VJ1=[1,305],$VK1=[39,41,83,109,157,158,160,163,164],$VL1=[1,314],$VM1=[1,315],$VN1=[41,109,301],$VO1=[13,16,28,29,32,80,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$VP1=[13,16,28,29,32,39,41,80,83,109,157,158,160,163,164,165,194,212,213,215,216,248,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,301],$VQ1=[13,16,28,29,80,205,243,245,246,247,249,251,252,254,255,258,260,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,308,314,315,316,317,318,319],$VR1=[1,341],$VS1=[1,342],$VT1=[1,344],$VU1=[1,343],$VV1=[6,13,16,28,29,31,32,39,41,68,71,74,76,79,80,81,83,109,157,158,160,163,164,165,194,212,215,216,220,224,228,243,245,246,247,248,249,251,252,254,255,258,260,265,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,301,305,308,309,310,311,312,313,314,315,316,317,318,319],$VW1=[1,352],$VX1=[1,351],$VY1=[29,165],$VZ1=[13,16,32,41,80,90,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$V_1=[29,41],$V$1=[2,311],$V02=[6,41,83],$V12=[6,13,16,29,41,71,79,81,83,245,246,247,249,251,252,254,255,258,260,283,314,315,316,317,318,319],$V22=[6,13,16,28,29,39,41,71,74,76,79,80,81,83,109,157,158,160,163,164,165,212,215,216,245,246,247,249,251,252,254,255,258,260,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,301,314,315,316,317,318,319],$V32=[6,13,16,28,29,41,68,71,79,81,83,245,246,247,249,251,252,254,255,258,260,283,314,315,316,317,318,319],$V42=[6,13,16,28,29,31,32,39,41,61,68,71,74,76,79,80,81,83,109,157,158,160,163,164,165,194,212,215,216,220,224,228,243,245,246,247,248,249,251,252,254,255,258,260,265,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,301,302,305,308,309,310,311,312,313,314,315,316,317,318,319],$V52=[13,16,29,183,205,210,283],$V62=[2,362],$V72=[1,393],$V82=[39,41,83,109,157,158,160,163,164,301],$V92=[2,350],$Va2=[13,16,28,29,32,39,41,80,83,109,157,158,160,163,164,165,183,194,212,213,215,216,248,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,301],$Vb2=[13,16,28,29,80,205,243,245,246,247,249,251,252,254,255,258,260,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,308,314,315,316,317,318,319],$Vc2=[1,443],$Vd2=[1,440],$Ve2=[1,441],$Vf2=[13,16,28,29,39,41,80,83,109,157,158,160,163,164,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$Vg2=[13,16,28,283],$Vh2=[13,16,28,29,39,41,80,83,109,157,158,160,163,164,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,301],$Vi2=[2,323],$Vj2=[13,16,28,183,194,283],$Vk2=[13,16,32,80,90,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$Vl2=[6,13,16,28,29,41,74,76,79,81,83,245,246,247,249,251,252,254,255,258,260,283,314,315,316,317,318,319],$Vm2=[2,318],$Vn2=[13,16,29,183,205,283],$Vo2=[39,41,83,109,157,158,160,163,164,194,213,301],$Vp2=[13,16,28,29,41,80,109,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283],$Vq2=[13,16,28,29,32,80,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,304,305],$Vr2=[13,16,28,29,32,80,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,304,305,307,308],$Vs2=[1,553],$Vt2=[1,554],$Vu2=[2,306],$Vv2=[13,16,32,183,210,283];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"QueryOrUpdate":3,"Prologue":4,"QueryOrUpdate_group0":5,"EOF":6,"Prologue_repetition0":7,"Query":8,"Query_group0":9,"Query_option0":10,"BaseDecl":11,"BASE":12,"IRIREF":13,"PrefixDecl":14,"PREFIX":15,"PNAME_NS":16,"SelectQuery":17,"SelectClause":18,"SelectQuery_repetition0":19,"WhereClause":20,"SolutionModifier":21,"SubSelect":22,"SubSelect_option0":23,"SELECT":24,"SelectClause_option0":25,"SelectClause_group0":26,"SelectClauseItem":27,"VAR":28,"(":29,"Expression":30,"AS":31,")":32,"ConstructQuery":33,"CONSTRUCT":34,"ConstructTemplate":35,"ConstructQuery_repetition0":36,"ConstructQuery_repetition1":37,"WHERE":38,"{":39,"ConstructQuery_option0":40,"}":41,"DescribeQuery":42,"DESCRIBE":43,"DescribeQuery_group0":44,"DescribeQuery_repetition0":45,"DescribeQuery_option0":46,"AskQuery":47,"ASK":48,"AskQuery_repetition0":49,"DatasetClause":50,"FROM":51,"DatasetClause_option0":52,"iri":53,"WhereClause_option0":54,"GroupGraphPattern":55,"SolutionModifier_option0":56,"SolutionModifier_option1":57,"SolutionModifier_option2":58,"SolutionModifier_option3":59,"GroupClause":60,"GROUP":61,"BY":62,"GroupClause_repetition_plus0":63,"GroupCondition":64,"BuiltInCall":65,"FunctionCall":66,"HavingClause":67,"HAVING":68,"HavingClause_repetition_plus0":69,"OrderClause":70,"ORDER":71,"OrderClause_repetition_plus0":72,"OrderCondition":73,"ASC":74,"BrackettedExpression":75,"DESC":76,"Constraint":77,"LimitOffsetClauses":78,"LIMIT":79,"INTEGER":80,"OFFSET":81,"ValuesClause":82,"VALUES":83,"InlineData":84,"InlineData_repetition0":85,"InlineData_repetition1":86,"InlineData_repetition2":87,"DataBlockValue":88,"Literal":89,"UNDEF":90,"DataBlockValueList":91,"DataBlockValueList_repetition0":92,"Update":93,"Update_repetition0":94,"Update1":95,"Update_option0":96,"LOAD":97,"Update1_option0":98,"Update1_option1":99,"Update1_group0":100,"Update1_option2":101,"GraphRefAll":102,"Update1_group1":103,"Update1_option3":104,"GraphOrDefault":105,"TO":106,"CREATE":107,"Update1_option4":108,"GRAPH":109,"INSERTDATA":110,"QuadPattern":111,"DELETEDATA":112,"DELETEWHERE":113,"Update1_option5":114,"InsertClause":115,"Update1_option6":116,"Update1_repetition0":117,"Update1_option7":118,"DeleteClause":119,"Update1_option8":120,"Update1_repetition1":121,"DELETE":122,"INSERT":123,"UsingClause":124,"USING":125,"UsingClause_option0":126,"WithClause":127,"WITH":128,"IntoGraphClause":129,"INTO":130,"DEFAULT":131,"GraphOrDefault_option0":132,"GraphRefAll_group0":133,"QuadPattern_option0":134,"QuadPattern_repetition0":135,"QuadsNotTriples":136,"QuadsNotTriples_group0":137,"QuadsNotTriples_option0":138,"QuadsNotTriples_option1":139,"QuadsNotTriples_option2":140,"TriplesTemplate":141,"TriplesTemplate_repetition0":142,"TriplesSameSubject":143,"TriplesTemplate_option0":144,"GroupGraphPatternSub":145,"GroupGraphPatternSub_option0":146,"GroupGraphPatternSub_repetition0":147,"GroupGraphPatternSubTail":148,"GraphPatternNotTriples":149,"GroupGraphPatternSubTail_option0":150,"GroupGraphPatternSubTail_option1":151,"TriplesBlock":152,"TriplesBlock_repetition0":153,"TriplesSameSubjectPath":154,"TriplesBlock_option0":155,"GraphPatternNotTriples_repetition0":156,"OPTIONAL":157,"MINUS":158,"GraphPatternNotTriples_group0":159,"SERVICE":160,"GraphPatternNotTriples_option0":161,"GraphPatternNotTriples_group1":162,"FILTER":163,"BIND":164,"NIL":165,"FunctionCall_option0":166,"FunctionCall_repetition0":167,"ExpressionList":168,"ExpressionList_repetition0":169,"ConstructTemplate_option0":170,"ConstructTriples":171,"ConstructTriples_repetition0":172,"ConstructTriples_option0":173,"VarOrTerm":174,"PropertyListNotEmpty":175,"TriplesNode":176,"PropertyList":177,"PropertyList_option0":178,"PropertyListNotEmpty_repetition0":179,"VerbObjectList":180,"Verb":181,"ObjectList":182,"a":183,"ObjectList_repetition0":184,"GraphNode":185,"PropertyListPathNotEmpty":186,"TriplesNodePath":187,"TriplesSameSubjectPath_option0":188,"PropertyListPathNotEmpty_group0":189,"PropertyListPathNotEmpty_repetition0":190,"GraphNodePath":191,"PropertyListPathNotEmpty_repetition1":192,"PropertyListPathNotEmptyTail":193,";":194,"PropertyListPathNotEmptyTail_group0":195,"Path":196,"Path_repetition0":197,"PathSequence":198,"PathSequence_repetition0":199,"PathEltOrInverse":200,"PathElt":201,"PathPrimary":202,"PathElt_option0":203,"PathEltOrInverse_option0":204,"!":205,"PathNegatedPropertySet":206,"PathOneInPropertySet":207,"PathNegatedPropertySet_repetition0":208,"PathNegatedPropertySet_option0":209,"^":210,"TriplesNode_repetition_plus0":211,"[":212,"]":213,"TriplesNodePath_repetition_plus0":214,"BLANK_NODE_LABEL":215,"ANON":216,"ConditionalAndExpression":217,"Expression_repetition0":218,"ExpressionTail":219,"||":220,"RelationalExpression":221,"ConditionalAndExpression_repetition0":222,"ConditionalAndExpressionTail":223,"&&":224,"AdditiveExpression":225,"RelationalExpression_group0":226,"RelationalExpression_option0":227,"IN":228,"MultiplicativeExpression":229,"AdditiveExpression_repetition0":230,"AdditiveExpressionTail":231,"AdditiveExpressionTail_group0":232,"NumericLiteralPositive":233,"AdditiveExpressionTail_repetition0":234,"NumericLiteralNegative":235,"AdditiveExpressionTail_repetition1":236,"UnaryExpression":237,"MultiplicativeExpression_repetition0":238,"MultiplicativeExpressionTail":239,"MultiplicativeExpressionTail_group0":240,"UnaryExpression_option0":241,"PrimaryExpression":242,"-":243,"Aggregate":244,"FUNC_ARITY0":245,"FUNC_ARITY1":246,"FUNC_ARITY2":247,",":248,"IF":249,"BuiltInCall_group0":250,"BOUND":251,"BNODE":252,"BuiltInCall_option0":253,"EXISTS":254,"COUNT":255,"Aggregate_option0":256,"Aggregate_group0":257,"FUNC_AGGREGATE":258,"Aggregate_option1":259,"GROUP_CONCAT":260,"Aggregate_option2":261,"Aggregate_option3":262,"GroupConcatSeparator":263,"SEPARATOR":264,"=":265,"String":266,"LANGTAG":267,"^^":268,"DECIMAL":269,"DOUBLE":270,"true":271,"false":272,"STRING_LITERAL1":273,"STRING_LITERAL2":274,"STRING_LITERAL_LONG1":275,"STRING_LITERAL_LONG2":276,"INTEGER_POSITIVE":277,"DECIMAL_POSITIVE":278,"DOUBLE_POSITIVE":279,"INTEGER_NEGATIVE":280,"DECIMAL_NEGATIVE":281,"DOUBLE_NEGATIVE":282,"PNAME_LN":283,"QueryOrUpdate_group0_option0":284,"Prologue_repetition0_group0":285,"SelectClause_option0_group0":286,"DISTINCT":287,"REDUCED":288,"SelectClause_group0_repetition_plus0":289,"*":290,"DescribeQuery_group0_repetition_plus0_group0":291,"DescribeQuery_group0_repetition_plus0":292,"NAMED":293,"SILENT":294,"CLEAR":295,"DROP":296,"ADD":297,"MOVE":298,"COPY":299,"ALL":300,".":301,"UNION":302,"PropertyListNotEmpty_repetition0_repetition_plus0":303,"|":304,"/":305,"PathElt_option0_group0":306,"?":307,"+":308,"!=":309,"<":310,">":311,"<=":312,">=":313,"NOT":314,"CONCAT":315,"COALESCE":316,"SUBSTR":317,"REGEX":318,"REPLACE":319,"$accept":0,"$end":1},
terminals_: {2:"error",6:"EOF",12:"BASE",13:"IRIREF",15:"PREFIX",16:"PNAME_NS",24:"SELECT",28:"VAR",29:"(",31:"AS",32:")",34:"CONSTRUCT",38:"WHERE",39:"{",41:"}",43:"DESCRIBE",48:"ASK",51:"FROM",61:"GROUP",62:"BY",68:"HAVING",71:"ORDER",74:"ASC",76:"DESC",79:"LIMIT",80:"INTEGER",81:"OFFSET",83:"VALUES",90:"UNDEF",97:"LOAD",106:"TO",107:"CREATE",109:"GRAPH",110:"INSERTDATA",112:"DELETEDATA",113:"DELETEWHERE",122:"DELETE",123:"INSERT",125:"USING",128:"WITH",130:"INTO",131:"DEFAULT",157:"OPTIONAL",158:"MINUS",160:"SERVICE",163:"FILTER",164:"BIND",165:"NIL",183:"a",194:";",205:"!",210:"^",212:"[",213:"]",215:"BLANK_NODE_LABEL",216:"ANON",220:"||",224:"&&",228:"IN",243:"-",245:"FUNC_ARITY0",246:"FUNC_ARITY1",247:"FUNC_ARITY2",248:",",249:"IF",251:"BOUND",252:"BNODE",254:"EXISTS",255:"COUNT",258:"FUNC_AGGREGATE",260:"GROUP_CONCAT",264:"SEPARATOR",265:"=",267:"LANGTAG",268:"^^",269:"DECIMAL",270:"DOUBLE",271:"true",272:"false",273:"STRING_LITERAL1",274:"STRING_LITERAL2",275:"STRING_LITERAL_LONG1",276:"STRING_LITERAL_LONG2",277:"INTEGER_POSITIVE",278:"DECIMAL_POSITIVE",279:"DOUBLE_POSITIVE",280:"INTEGER_NEGATIVE",281:"DECIMAL_NEGATIVE",282:"DOUBLE_NEGATIVE",283:"PNAME_LN",287:"DISTINCT",288:"REDUCED",290:"*",293:"NAMED",294:"SILENT",295:"CLEAR",296:"DROP",297:"ADD",298:"MOVE",299:"COPY",300:"ALL",301:".",302:"UNION",304:"|",305:"/",307:"?",308:"+",309:"!=",310:"<",311:">",312:"<=",313:">=",314:"NOT",315:"CONCAT",316:"COALESCE",317:"SUBSTR",318:"REGEX",319:"REPLACE"},
productions_: [0,[3,3],[4,1],[8,2],[11,2],[14,3],[17,4],[22,4],[18,3],[27,1],[27,5],[33,5],[33,7],[42,5],[47,4],[50,3],[20,2],[21,4],[60,3],[64,1],[64,1],[64,3],[64,5],[64,1],[67,2],[70,3],[73,2],[73,2],[73,1],[73,1],[78,2],[78,2],[78,4],[78,4],[82,2],[84,4],[84,6],[88,1],[88,1],[88,1],[91,3],[93,3],[95,4],[95,3],[95,5],[95,4],[95,2],[95,2],[95,2],[95,6],[95,6],[119,2],[115,2],[124,3],[127,2],[129,3],[105,1],[105,2],[102,2],[102,1],[111,4],[136,7],[141,3],[55,3],[55,3],[145,2],[148,3],[152,3],[149,2],[149,2],[149,2],[149,3],[149,4],[149,2],[149,6],[149,1],[77,1],[77,1],[77,1],[66,2],[66,6],[168,1],[168,4],[35,3],[171,3],[143,2],[143,2],[177,1],[175,2],[180,2],[181,1],[181,1],[181,1],[182,2],[154,2],[154,2],[186,4],[193,1],[193,3],[196,2],[198,2],[201,2],[200,2],[202,1],[202,1],[202,2],[202,3],[206,1],[206,1],[206,4],[207,1],[207,1],[207,2],[207,2],[176,3],[176,3],[187,3],[187,3],[185,1],[185,1],[191,1],[191,1],[174,1],[174,1],[174,1],[174,1],[174,1],[174,1],[30,2],[219,2],[217,2],[223,2],[221,1],[221,3],[221,4],[225,2],[231,2],[231,2],[231,2],[229,2],[239,2],[237,2],[237,2],[237,2],[242,1],[242,1],[242,1],[242,1],[242,1],[242,1],[75,3],[65,1],[65,2],[65,4],[65,6],[65,8],[65,2],[65,4],[65,2],[65,4],[65,3],[244,5],[244,5],[244,6],[263,4],[89,1],[89,2],[89,3],[89,1],[89,1],[89,1],[89,1],[89,1],[89,1],[89,1],[266,1],[266,1],[266,1],[266,1],[233,1],[233,1],[233,1],[235,1],[235,1],[235,1],[53,1],[53,1],[53,1],[284,0],[284,1],[5,1],[5,1],[285,1],[285,1],[7,0],[7,2],[9,1],[9,1],[9,1],[9,1],[10,0],[10,1],[19,0],[19,2],[23,0],[23,1],[286,1],[286,1],[25,0],[25,1],[289,1],[289,2],[26,1],[26,1],[36,0],[36,2],[37,0],[37,2],[40,0],[40,1],[291,1],[291,1],[292,1],[292,2],[44,1],[44,1],[45,0],[45,2],[46,0],[46,1],[49,0],[49,2],[52,0],[52,1],[54,0],[54,1],[56,0],[56,1],[57,0],[57,1],[58,0],[58,1],[59,0],[59,1],[63,1],[63,2],[69,1],[69,2],[72,1],[72,2],[85,0],[85,2],[86,0],[86,2],[87,0],[87,2],[92,0],[92,2],[94,0],[94,4],[96,0],[96,2],[98,0],[98,1],[99,0],[99,1],[100,1],[100,1],[101,0],[101,1],[103,1],[103,1],[103,1],[104,0],[104,1],[108,0],[108,1],[114,0],[114,1],[116,0],[116,1],[117,0],[117,2],[118,0],[118,1],[120,0],[120,1],[121,0],[121,2],[126,0],[126,1],[132,0],[132,1],[133,1],[133,1],[133,1],[134,0],[134,1],[135,0],[135,2],[137,1],[137,1],[138,0],[138,1],[139,0],[139,1],[140,0],[140,1],[142,0],[142,3],[144,0],[144,1],[146,0],[146,1],[147,0],[147,2],[150,0],[150,1],[151,0],[151,1],[153,0],[153,3],[155,0],[155,1],[156,0],[156,3],[159,1],[159,1],[161,0],[161,1],[162,1],[162,1],[166,0],[166,1],[167,0],[167,3],[169,0],[169,3],[170,0],[170,1],[172,0],[172,3],[173,0],[173,1],[178,0],[178,1],[303,1],[303,2],[179,0],[179,3],[184,0],[184,3],[188,0],[188,1],[189,1],[189,1],[190,0],[190,3],[192,0],[192,2],[195,1],[195,1],[197,0],[197,3],[199,0],[199,3],[306,1],[306,1],[306,1],[203,0],[203,1],[204,0],[204,1],[208,0],[208,3],[209,0],[209,1],[211,1],[211,2],[214,1],[214,2],[218,0],[218,2],[222,0],[222,2],[226,1],[226,1],[226,1],[226,1],[226,1],[226,1],[227,0],[227,1],[230,0],[230,2],[232,1],[232,1],[234,0],[234,2],[236,0],[236,2],[238,0],[238,2],[240,1],[240,1],[241,0],[241,1],[250,1],[250,1],[250,1],[250,1],[250,1],[253,0],[253,1],[256,0],[256,1],[257,1],[257,1],[259,0],[259,1],[261,0],[261,1],[262,0],[262,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

      $$[$0-1] = $$[$0-1] || {};
      if (Parser.base)
        $$[$0-1].base = Parser.base;
      Parser.base = base = basePath = baseRoot = '';
      $$[$0-1].prefixes = Parser.prefixes;
      Parser.prefixes = null;
      return $$[$0-1];
    
break;
case 3:
this.$ = extend($$[$0-1], $$[$0], { type: 'query' });
break;
case 4:

      Parser.base = resolveIRI($$[$0])
      base = basePath = baseRoot = '';
    
break;
case 5:

      if (!Parser.prefixes) Parser.prefixes = {};
      $$[$0-1] = $$[$0-1].substr(0, $$[$0-1].length - 1);
      $$[$0] = resolveIRI($$[$0]);
      Parser.prefixes[$$[$0-1]] = $$[$0];
    
break;
case 6:
this.$ = extend($$[$0-3], groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 7:
this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], { type: 'query' });
break;
case 8:
this.$ = extend({ queryType: 'SELECT', variables: $$[$0] === '*' ? ['*'] : $$[$0] }, $$[$0-1] && ($$[$0-2] = lowercase($$[$0-1]), $$[$0-1] = {}, $$[$0-1][$$[$0-2]] = true, $$[$0-1]));
break;
case 9: case 90: case 122: case 149:
this.$ = toVar($$[$0]);
break;
case 10: case 22:
this.$ = expression($$[$0-3], { variable: toVar($$[$0-1]) });
break;
case 11:
this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-3] }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 12:
this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-2] = ($$[$0-2] ? $$[$0-2].triples : []) }, groupDatasets($$[$0-5]), { where: [ { type: 'bgp', triples: appendAllTo([], $$[$0-2]) } ] }, $$[$0]);
break;
case 13:
this.$ = extend({ queryType: 'DESCRIBE', variables: $$[$0-3] === '*' ? ['*'] : $$[$0-3].map(toVar) }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 14:
this.$ = extend({ queryType: 'ASK' }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 15: case 53:
this.$ = { iri: $$[$0], named: !!$$[$0-1] };
break;
case 16:
this.$ = { where: $$[$0].patterns };
break;
case 17:
this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0]);
break;
case 18:
this.$ = { group: $$[$0] };
break;
case 19: case 20: case 26: case 28:
this.$ = expression($$[$0]);
break;
case 21:
this.$ = expression($$[$0-1]);
break;
case 23: case 29:
this.$ = expression(toVar($$[$0]));
break;
case 24:
this.$ = { having: $$[$0] };
break;
case 25:
this.$ = { order: $$[$0] };
break;
case 27:
this.$ = expression($$[$0], { descending: true });
break;
case 30:
this.$ = { limit:  toInt($$[$0]) };
break;
case 31:
this.$ = { offset: toInt($$[$0]) };
break;
case 32:
this.$ = { limit: toInt($$[$0-2]), offset: toInt($$[$0]) };
break;
case 33:
this.$ = { limit: toInt($$[$0]), offset: toInt($$[$0-2]) };
break;
case 34:
this.$ = { type: 'values', values: $$[$0] };
break;
case 35:

      $$[$0-3] = toVar($$[$0-3]);
      this.$ = $$[$0-1].map(function(v) { var o = {}; o[$$[$0-3]] = v; return o; })
    
break;
case 36:

      var length = $$[$0-4].length;
      $$[$0-4] = $$[$0-4].map(toVar);
      this.$ = $$[$0-1].map(function (values) {
        if (values.length !== length)
          throw Error('Inconsistent VALUES length');
        var valuesObject = {};
        for(var i = 0; i<length; i++)
          valuesObject[$$[$0-4][i]] = values[i];
        return valuesObject;
      });
    
break;
case 39:
this.$ = undefined;
break;
case 40: case 83: case 106: case 150:
this.$ = $$[$0-1];
break;
case 41:
this.$ = { type: 'update', updates: appendTo($$[$0-2], $$[$0-1]) };
break;
case 42:
this.$ = extend({ type: 'load', silent: !!$$[$0-2], source: $$[$0-1] }, $$[$0] && { destination: $$[$0] });
break;
case 43:
this.$ = { type: lowercase($$[$0-2]), silent: !!$$[$0-1], graph: $$[$0] };
break;
case 44:
this.$ = { type: lowercase($$[$0-4]), silent: !!$$[$0-3], source: $$[$0-2], destination: $$[$0] };
break;
case 45:
this.$ = { type: 'create', silent: !!$$[$0-2], graph: $$[$0-1] };
break;
case 46:
this.$ = { updateType: 'insert',      insert: $$[$0] };
break;
case 47:
this.$ = { updateType: 'delete',      delete: $$[$0] };
break;
case 48:
this.$ = { updateType: 'deletewhere', delete: $$[$0] };
break;
case 49:
this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { insert: $$[$0-4] || [] }, { delete: $$[$0-3] || [] }, groupDatasets($$[$0-2]), { where: $$[$0].patterns });
break;
case 50:
this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { delete: $$[$0-4] || [] }, { insert: $$[$0-3] || [] }, groupDatasets($$[$0-2]), { where: $$[$0].patterns });
break;
case 51: case 52: case 55: case 141:
this.$ = $$[$0];
break;
case 54:
this.$ = { graph: $$[$0] };
break;
case 56:
this.$ = { type: 'graph', default: true };
break;
case 57: case 58:
this.$ = { type: 'graph', name: $$[$0] };
break;
case 59:
 this.$ = {}; this.$[lowercase($$[$0])] = true; 
break;
case 60:
this.$ = $$[$0-2] ? unionAll($$[$0-1], [$$[$0-2]]) : unionAll($$[$0-1]);
break;
case 61:

      var graph = extend($$[$0-3] || { triples: [] }, { type: 'graph', name: toVar($$[$0-5]) });
      this.$ = $$[$0] ? [graph, $$[$0]] : [graph];
    
break;
case 62: case 67:
this.$ = { type: 'bgp', triples: unionAll($$[$0-2], [$$[$0-1]]) };
break;
case 63:
this.$ = { type: 'group', patterns: [ $$[$0-1] ] };
break;
case 64:
this.$ = { type: 'group', patterns: $$[$0-1] };
break;
case 65:
this.$ = $$[$0-1] ? unionAll([$$[$0-1]], $$[$0]) : unionAll($$[$0]);
break;
case 66:
this.$ = $$[$0] ? [$$[$0-2], $$[$0]] : $$[$0-2];
break;
case 68:

      if ($$[$0-1].length)
        this.$ = { type: 'union', patterns: unionAll($$[$0-1].map(degroupSingle), [degroupSingle($$[$0])]) };
      else
        this.$ = $$[$0];
    
break;
case 69:
this.$ = extend($$[$0], { type: 'optional' });
break;
case 70:
this.$ = extend($$[$0], { type: 'minus' });
break;
case 71:
this.$ = extend($$[$0], { type: 'graph', name: toVar($$[$0-1]) });
break;
case 72:
this.$ = extend($$[$0], { type: 'service', name: toVar($$[$0-1]), silent: !!$$[$0-2] });
break;
case 73:
this.$ = { type: 'filter', expression: $$[$0] };
break;
case 74:
this.$ = { type: 'bind', variable: toVar($$[$0-1]), expression: $$[$0-3] };
break;
case 79:
this.$ = { type: 'functionCall', function: $$[$0-1], args: [] };
break;
case 80:
this.$ = { type: 'functionCall', function: $$[$0-5], args: appendTo($$[$0-2], $$[$0-1]), distinct: !!$$[$0-3] };
break;
case 81: case 97: case 108: case 194: case 202: case 214: case 216: case 226: case 230: case 250: case 252: case 254: case 256: case 258: case 281: case 287: case 298: case 308: case 314: case 320: case 324: case 334: case 336: case 340: case 348: case 350: case 356: case 358: case 362: case 364: case 373: case 381: case 383: case 393: case 397: case 399: case 401:
this.$ = [];
break;
case 82:
this.$ = appendTo($$[$0-2], $$[$0-1]);
break;
case 84:
this.$ = unionAll($$[$0-2], [$$[$0-1]]);
break;
case 85: case 94:
this.$ = $$[$0].map(function (t) { return extend(triple($$[$0-1]), t); });
break;
case 86:
this.$ = appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
break;
case 88:
this.$ = unionAll($$[$0-1], [$$[$0]]);
break;
case 89:
this.$ = objectListToTriples($$[$0-1], $$[$0]);
break;
case 92: case 104: case 111:
this.$ = RDF_TYPE;
break;
case 93:
this.$ = appendTo($$[$0-1], $$[$0]);
break;
case 95:
this.$ = !$$[$0] ? $$[$0-1].triples : appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
break;
case 96:
this.$ = objectListToTriples(toVar($$[$0-3]), appendTo($$[$0-2], $$[$0-1]), $$[$0]);
break;
case 98:
this.$ = objectListToTriples(toVar($$[$0-1]), $$[$0]);
break;
case 99:
this.$ = $$[$0-1].length ? path('|',appendTo($$[$0-1], $$[$0])) : $$[$0];
break;
case 100:
this.$ = $$[$0-1].length ? path('/', appendTo($$[$0-1], $$[$0])) : $$[$0];
break;
case 101:
this.$ = $$[$0] ? path($$[$0], [$$[$0-1]]) : $$[$0-1];
break;
case 102:
this.$ = $$[$0-1] ? path($$[$0-1], [$$[$0]]) : $$[$0];;
break;
case 105: case 112:
this.$ = path($$[$0-1], [$$[$0]]);
break;
case 109:
this.$ = path('|', appendTo($$[$0-2], $$[$0-1]));
break;
case 113:
this.$ = path($$[$0-1], [RDF_TYPE]);
break;
case 114: case 116:
this.$ = createList($$[$0-1]);
break;
case 115: case 117:
this.$ = createAnonymousObject($$[$0-1]);
break;
case 118:
this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNode */;
break;
case 120:
this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNodePath */;
break;
case 126:
this.$ = blank();
break;
case 127:
this.$ = RDF_NIL;
break;
case 128: case 130: case 135: case 139:
this.$ = createOperationTree($$[$0-1], $$[$0]);
break;
case 129:
this.$ = ['||', $$[$0]];
break;
case 131:
this.$ = ['&&', $$[$0]];
break;
case 133:
this.$ = operation($$[$0-1], [$$[$0-2], $$[$0]]);
break;
case 134:
this.$ = operation($$[$0-2] ? 'notin' : 'in', [$$[$0-3], $$[$0]]);
break;
case 136: case 140:
this.$ = [$$[$0-1], $$[$0]];
break;
case 137:
this.$ = ['+', createOperationTree($$[$0-1], $$[$0])];
break;
case 138:
this.$ = ['-', createOperationTree($$[$0-1].replace('-', ''), $$[$0])];
break;
case 142:
this.$ = operation($$[$0-1], [$$[$0]]);
break;
case 143:
this.$ = operation('UMINUS', [$$[$0]]);
break;
case 152:
this.$ = operation(lowercase($$[$0-1]));
break;
case 153:
this.$ = operation(lowercase($$[$0-3]), [$$[$0-1]]);
break;
case 154:
this.$ = operation(lowercase($$[$0-5]), [$$[$0-3], $$[$0-1]]);
break;
case 155:
this.$ = operation(lowercase($$[$0-7]), [$$[$0-5], $$[$0-3], $$[$0-1]]);
break;
case 156:
this.$ = operation(lowercase($$[$0-1]), $$[$0]);
break;
case 157:
this.$ = operation('bound', [toVar($$[$0-1])]);
break;
case 158:
this.$ = operation($$[$0-1], []);
break;
case 159:
this.$ = operation($$[$0-3], [$$[$0-1]]);
break;
case 160:
this.$ = operation($$[$0-2] ? 'notexists' :'exists', [degroupSingle($$[$0])]);
break;
case 161: case 162:
this.$ = expression($$[$0-1], { type: 'aggregate', aggregation: lowercase($$[$0-4]), distinct: !!$$[$0-2] });
break;
case 163:
this.$ = expression($$[$0-2], { type: 'aggregate', aggregation: lowercase($$[$0-5]), distinct: !!$$[$0-3], separator: $$[$0-1] || ' ' });
break;
case 164:
this.$ = $$[$0].substr(1, $$[$0].length - 2);
break;
case 166:
this.$ = $$[$0-1] + lowercase($$[$0]);
break;
case 167:
this.$ = $$[$0-2] + '^^' + $$[$0];
break;
case 168: case 182:
this.$ = createLiteral($$[$0], XSD_INTEGER);
break;
case 169: case 183:
this.$ = createLiteral($$[$0], XSD_DECIMAL);
break;
case 170: case 184:
this.$ = createLiteral(lowercase($$[$0]), XSD_DOUBLE);
break;
case 173:
this.$ = XSD_TRUE;
break;
case 174:
this.$ = XSD_FALSE;
break;
case 175: case 176:
this.$ = unescapeString($$[$0], 1);
break;
case 177: case 178:
this.$ = unescapeString($$[$0], 3);
break;
case 179:
this.$ = createLiteral($$[$0].substr(1), XSD_INTEGER);
break;
case 180:
this.$ = createLiteral($$[$0].substr(1), XSD_DECIMAL);
break;
case 181:
this.$ = createLiteral($$[$0].substr(1).toLowerCase(), XSD_DOUBLE);
break;
case 185:
this.$ = resolveIRI($$[$0]);
break;
case 186:

      var namePos = $$[$0].indexOf(':'),
          prefix = $$[$0].substr(0, namePos),
          expansion = Parser.prefixes[prefix];
      if (!expansion) throw new Error('Unknown prefix: ' + prefix);
      this.$ = resolveIRI(expansion + $$[$0].substr(namePos + 1));
    
break;
case 187:

      $$[$0] = $$[$0].substr(0, $$[$0].length - 1);
      if (!($$[$0] in Parser.prefixes)) throw new Error('Unknown prefix: ' + $$[$0]);
      this.$ = resolveIRI(Parser.prefixes[$$[$0]]);
    
break;
case 195: case 203: case 211: case 215: case 217: case 223: case 227: case 231: case 245: case 247: case 249: case 251: case 253: case 255: case 257: case 282: case 288: case 299: case 315: case 347: case 359: case 378: case 380: case 382: case 384: case 394: case 398: case 400: case 402:
$$[$0-1].push($$[$0]);
break;
case 210: case 222: case 244: case 246: case 248: case 346: case 377: case 379:
this.$ = [$$[$0]];
break;
case 259:
$$[$0-3].push($$[$0-2]);
break;
case 309: case 321: case 325: case 335: case 337: case 341: case 349: case 351: case 357: case 363: case 365: case 374:
$$[$0-2].push($$[$0-1]);
break;
}
},
table: [o($V0,$V1,{3:1,4:2,7:3}),{1:[3]},o($V2,[2,258],{5:4,8:5,284:6,9:7,93:8,17:9,33:10,42:11,47:12,94:13,18:14,6:[2,188],24:$V3,34:[1,15],43:[1,16],48:[1,17]}),o([6,24,34,43,48,97,107,110,112,113,122,123,128,295,296,297,298,299],[2,2],{285:19,11:20,14:21,12:[1,22],15:[1,23]}),{6:[1,24]},{6:[2,190]},{6:[2,191]},{6:[2,200],10:25,82:26,83:$V4},{6:[2,189]},o($V5,[2,196]),o($V5,[2,197]),o($V5,[2,198]),o($V5,[2,199]),{95:28,97:[1,29],100:30,103:31,107:[1,32],110:[1,33],112:[1,34],113:[1,35],114:36,118:37,122:[2,283],123:[2,277],127:43,128:[1,44],295:[1,38],296:[1,39],297:[1,40],298:[1,41],299:[1,42]},o($V6,[2,202],{19:45}),o($V7,[2,216],{35:46,37:47,39:[1,48]}),{13:$V8,16:$V9,28:$Va,44:49,53:54,283:$Vb,290:[1,51],291:52,292:50},o($V6,[2,230],{49:58}),o($Vc,[2,208],{25:59,286:60,287:[1,61],288:[1,62]}),o($V0,[2,195]),o($V0,[2,192]),o($V0,[2,193]),{13:[1,63]},{16:[1,64]},{1:[2,1]},{6:[2,3]},{6:[2,201]},{28:[1,66],29:[1,67],84:65},{6:[2,260],96:68,194:[1,69]},o($Vd,[2,262],{98:70,294:[1,71]}),o($Ve,[2,268],{101:72,294:[1,73]}),o($Vf,[2,273],{104:74,294:[1,75]}),{108:76,109:[2,275],294:[1,77]},{39:$Vg,111:78},{39:$Vg,111:80},{39:$Vg,111:81},{115:82,123:$Vh},{119:84,122:$Vi},o($Vj,[2,266]),o($Vj,[2,267]),o($Vk,[2,270]),o($Vk,[2,271]),o($Vk,[2,272]),{122:[2,284],123:[2,278]},{13:$V8,16:$V9,53:86,283:$Vb},{20:87,38:$Vl,39:$Vm,50:88,51:$Vn,54:89},o($V6,[2,214],{36:92}),{38:[1,93],50:94,51:$Vn},o($Vo,[2,340],{170:95,171:96,172:97,41:[2,338]}),o($Vp,[2,226],{45:98}),o($Vp,[2,224],{53:54,291:99,13:$V8,16:$V9,28:$Va,283:$Vb}),o($Vp,[2,225]),o($Vq,[2,222]),o($Vq,[2,220]),o($Vq,[2,221]),o($Vr,[2,185]),o($Vr,[2,186]),o($Vr,[2,187]),{20:100,38:$Vl,39:$Vm,50:101,51:$Vn,54:89},{26:102,27:105,28:$Vs,29:$Vt,289:103,290:[1,104]},o($Vc,[2,209]),o($Vc,[2,206]),o($Vc,[2,207]),o($V0,[2,4]),{13:[1,108]},o($Vu,[2,34]),{39:[1,109]},o($Vv,[2,252],{86:110}),{6:[2,41]},o($V0,$V1,{7:3,4:111}),{13:$V8,16:$V9,53:112,283:$Vb},o($Vd,[2,263]),{102:113,109:[1,114],131:[1,116],133:115,293:[1,117],300:[1,118]},o($Ve,[2,269]),o($Vd,$Vw,{105:119,132:121,109:$Vx,131:$Vy}),o($Vf,[2,274]),{109:[1,123]},{109:[2,276]},o($Vz,[2,46]),o($Vo,$VA,{134:124,141:125,142:126,41:$VB,109:$VB}),o($Vz,[2,47]),o($Vz,[2,48]),o($VC,[2,279],{116:127,119:128,122:$Vi}),{39:$Vg,111:129},o($VC,[2,285],{120:130,115:131,123:$Vh}),{39:$Vg,111:132},o([122,123],[2,54]),o($VD,$VE,{21:133,56:134,60:135,61:$VF}),o($V6,[2,203]),{39:$VG,55:137},o($Vd,[2,232],{52:139,293:[1,140]}),{39:[2,235]},{20:141,38:$Vl,39:$Vm,50:142,51:$Vn,54:89},{39:[1,143]},o($V7,[2,217]),{41:[1,144]},{41:[2,339]},{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,143:145,165:$VK,174:146,176:147,212:$VL,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($V01,[2,228],{54:89,46:174,50:175,20:176,38:$Vl,39:$Vm,51:$Vn}),o($Vq,[2,223]),o($VD,$VE,{56:134,60:135,21:177,61:$VF}),o($V6,[2,231]),o($V6,[2,8]),o($V6,[2,212],{27:178,28:$Vs,29:$Vt}),o($V6,[2,213]),o($V11,[2,210]),o($V11,[2,9]),o($V21,$V31,{30:179,217:180,221:181,225:182,229:183,237:184,241:185,205:$V41,243:$V51,308:$V61}),o($V0,[2,5]),o($V71,[2,250],{85:189}),{28:[1,191],32:[1,190]},o($V2,[2,259],{6:[2,261]}),o($Vz,[2,264],{99:192,129:193,130:[1,194]}),o($Vz,[2,43]),{13:$V8,16:$V9,53:195,283:$Vb},o($Vz,[2,59]),o($Vz,[2,293]),o($Vz,[2,294]),o($Vz,[2,295]),{106:[1,196]},o($V81,[2,56]),{13:$V8,16:$V9,53:197,283:$Vb},o($Vd,[2,292]),{13:$V8,16:$V9,53:198,283:$Vb},o($V91,[2,298],{135:199}),o($V91,[2,297]),{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,143:200,165:$VK,174:146,176:147,212:$VL,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($VC,[2,281],{117:201}),o($VC,[2,280]),o([38,122,125],[2,52]),o($VC,[2,287],{121:202}),o($VC,[2,286]),o([38,123,125],[2,51]),o($V5,[2,6]),o($Va1,[2,238],{57:203,67:204,68:[1,205]}),o($VD,[2,237]),{62:[1,206]},o([6,41,61,68,71,79,81,83],[2,16]),o($Vo,$Vb1,{22:207,145:208,18:209,146:210,152:211,153:212,24:$V3,39:$Vc1,41:$Vc1,83:$Vc1,109:$Vc1,157:$Vc1,158:$Vc1,160:$Vc1,163:$Vc1,164:$Vc1}),{13:$V8,16:$V9,53:213,283:$Vb},o($Vd,[2,233]),o($VD,$VE,{56:134,60:135,21:214,61:$VF}),o($V6,[2,215]),o($Vo,$VA,{142:126,40:215,141:216,41:[2,218]}),o($V6,[2,83]),{41:[2,342],173:217,301:[1,218]},o($Vd1,$Ve1,{175:219,179:220}),o($Vd1,$Ve1,{179:220,177:221,178:222,175:223,41:$Vf1,109:$Vf1,301:$Vf1}),o($Vg1,[2,122]),o($Vg1,[2,123]),o($Vg1,[2,124]),o($Vg1,[2,125]),o($Vg1,[2,126]),o($Vg1,[2,127]),{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,165:$VK,174:226,176:227,185:225,211:224,212:$VL,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($Vd1,$Ve1,{179:220,175:228}),o($Vh1,[2,165],{267:[1,229],268:[1,230]}),o($Vh1,[2,168]),o($Vh1,[2,169]),o($Vh1,[2,170]),o($Vh1,[2,171]),o($Vh1,[2,172]),o($Vh1,[2,173]),o($Vh1,[2,174]),o($Vi1,[2,175]),o($Vi1,[2,176]),o($Vi1,[2,177]),o($Vi1,[2,178]),o($Vh1,[2,179]),o($Vh1,[2,180]),o($Vh1,[2,181]),o($Vh1,[2,182]),o($Vh1,[2,183]),o($Vh1,[2,184]),o($VD,$VE,{56:134,60:135,21:231,61:$VF}),o($Vp,[2,227]),o($V01,[2,229]),o($V5,[2,14]),o($V11,[2,211]),{31:[1,232]},o($Vj1,[2,381],{218:233}),o($Vk1,[2,383],{222:234}),o($Vk1,[2,132],{226:235,227:236,228:[2,391],265:[1,237],309:[1,238],310:[1,239],311:[1,240],312:[1,241],313:[1,242],314:[1,243]}),o($Vl1,[2,393],{230:244}),o($Vm1,[2,401],{238:245}),{13:$V8,16:$V9,28:$Vn1,29:$Vo1,53:249,65:248,66:250,75:247,80:$VJ,89:251,233:160,235:161,242:246,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},{13:$V8,16:$V9,28:$Vn1,29:$Vo1,53:249,65:248,66:250,75:247,80:$VJ,89:251,233:160,235:161,242:272,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},{13:$V8,16:$V9,28:$Vn1,29:$Vo1,53:249,65:248,66:250,75:247,80:$VJ,89:251,233:160,235:161,242:273,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},o($V21,[2,406]),{13:$V8,16:$V9,41:[1,274],53:276,80:$VJ,88:275,89:277,90:$VF1,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},{39:[1,279]},o($Vv,[2,253]),o($Vz,[2,42]),o($Vz,[2,265]),{109:[1,280]},o($Vz,[2,58]),o($Vd,$Vw,{132:121,105:281,109:$Vx,131:$Vy}),o($V81,[2,57]),o($Vz,[2,45]),{41:[1,282],109:[1,284],136:283},o($V91,[2,310],{144:285,301:[1,286]}),{38:[1,287],124:288,125:$VG1},{38:[1,290],124:291,125:$VG1},o($VH1,[2,240],{58:292,70:293,71:[1,294]}),o($Va1,[2,239]),{13:$V8,16:$V9,29:$Vo1,53:300,65:298,66:299,69:295,75:297,77:296,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},{13:$V8,16:$V9,28:$VI1,29:$VJ1,53:300,63:301,64:302,65:303,66:304,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},{41:[1,307]},{41:[1,308]},{20:309,38:$Vl,39:$Vm,54:89},o($VK1,[2,314],{147:310}),o($VK1,[2,313]),{13:$V8,16:$V9,28:$VH,29:$VL1,53:149,80:$VJ,89:150,154:311,165:$VK,174:312,187:313,212:$VM1,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($Vp,[2,15]),o($V5,[2,11]),{41:[1,316]},{41:[2,219]},{41:[2,84]},o($Vo,[2,341],{41:[2,343]}),o($VN1,[2,85]),{13:$V8,16:$V9,28:[1,319],53:320,180:317,181:318,183:[1,321],283:$Vb},o($VN1,[2,86]),o($VN1,[2,87]),o($VN1,[2,345]),{13:$V8,16:$V9,28:$VH,29:$VI,32:[1,322],53:149,80:$VJ,89:150,165:$VK,174:226,176:227,185:323,212:$VL,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($VO1,[2,377]),o($VP1,[2,118]),o($VP1,[2,119]),{213:[1,324]},o($Vh1,[2,166]),{13:$V8,16:$V9,53:325,283:$Vb},o($V5,[2,13]),{28:[1,326]},o([31,32,194,248],[2,128],{219:327,220:[1,328]}),o($Vj1,[2,130],{223:329,224:[1,330]}),o($V21,$V31,{229:183,237:184,241:185,225:331,205:$V41,243:$V51,308:$V61}),{228:[1,332]},o($VQ1,[2,385]),o($VQ1,[2,386]),o($VQ1,[2,387]),o($VQ1,[2,388]),o($VQ1,[2,389]),o($VQ1,[2,390]),{228:[2,392]},o([31,32,194,220,224,228,248,265,309,310,311,312,313,314],[2,135],{231:333,232:334,233:335,235:336,243:[1,338],277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,308:[1,337]}),o($Vl1,[2,139],{239:339,240:340,290:$VR1,305:$VS1}),o($Vm1,[2,141]),o($Vm1,[2,144]),o($Vm1,[2,145]),o($Vm1,[2,146],{29:$VT1,165:$VU1}),o($Vm1,[2,147]),o($Vm1,[2,148]),o($Vm1,[2,149]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:345,205:$V41,243:$V51,308:$V61}),o($VV1,[2,151]),{165:[1,346]},{29:[1,347]},{29:[1,348]},{29:[1,349]},{29:$VW1,165:$VX1,168:350},{29:[1,353]},{29:[1,355],165:[1,354]},{254:[1,356]},{29:[1,357]},{29:[1,358]},{29:[1,359]},o($VY1,[2,407]),o($VY1,[2,408]),o($VY1,[2,409]),o($VY1,[2,410]),o($VY1,[2,411]),{254:[2,413]},o($Vm1,[2,142]),o($Vm1,[2,143]),o($Vu,[2,35]),o($V71,[2,251]),o($VZ1,[2,37]),o($VZ1,[2,38]),o($VZ1,[2,39]),o($V_1,[2,254],{87:360}),{13:$V8,16:$V9,53:361,283:$Vb},o($Vz,[2,44]),o([6,38,122,123,125,194],[2,60]),o($V91,[2,299]),{13:$V8,16:$V9,28:[1,363],53:364,137:362,283:$Vb},o($V91,[2,62]),o($Vo,[2,309],{41:$V$1,109:$V$1}),{39:$VG,55:365},o($VC,[2,282]),o($Vd,[2,289],{126:366,293:[1,367]}),{39:$VG,55:368},o($VC,[2,288]),o($V02,[2,242],{59:369,78:370,79:[1,371],81:[1,372]}),o($VH1,[2,241]),{62:[1,373]},o($Va1,[2,24],{244:254,250:259,253:262,75:297,65:298,66:299,53:300,77:374,13:$V8,16:$V9,29:$Vo1,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,251:$Vt1,252:$Vu1,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1}),o($V12,[2,246]),o($V22,[2,76]),o($V22,[2,77]),o($V22,[2,78]),{29:$VT1,165:$VU1},o($VD,[2,18],{244:254,250:259,253:262,53:300,65:303,66:304,64:375,13:$V8,16:$V9,28:$VI1,29:$VJ1,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,251:$Vt1,252:$Vu1,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1}),o($V32,[2,244]),o($V32,[2,19]),o($V32,[2,20]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:376,205:$V41,243:$V51,308:$V61}),o($V32,[2,23]),o($V42,[2,63]),o($V42,[2,64]),o($VD,$VE,{56:134,60:135,21:377,61:$VF}),{39:[2,324],41:[2,65],82:387,83:$V4,109:[1,383],148:378,149:379,156:380,157:[1,381],158:[1,382],160:[1,384],163:[1,385],164:[1,386]},o($VK1,[2,322],{155:388,301:[1,389]}),o($V52,$V62,{186:390,189:391,196:392,197:394,28:$V72}),o($V82,[2,352],{189:391,196:392,197:394,188:395,186:396,13:$V62,16:$V62,29:$V62,183:$V62,205:$V62,210:$V62,283:$V62,28:$V72}),{13:$V8,16:$V9,28:$VH,29:$VL1,53:149,80:$VJ,89:150,165:$VK,174:399,187:400,191:398,212:$VM1,214:397,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($V52,$V62,{189:391,196:392,197:394,186:401,28:$V72}),o($VD,$VE,{56:134,60:135,21:402,61:$VF}),o([41,109,213,301],[2,88],{303:403,194:[1,404]}),o($Vo,$V92,{182:405,184:406}),o($Vo,[2,90]),o($Vo,[2,91]),o($Vo,[2,92]),o($Va2,[2,114]),o($VO1,[2,378]),o($Va2,[2,115]),o($Vh1,[2,167]),{32:[1,407]},o($Vj1,[2,382]),o($V21,$V31,{221:181,225:182,229:183,237:184,241:185,217:408,205:$V41,243:$V51,308:$V61}),o($Vk1,[2,384]),o($V21,$V31,{225:182,229:183,237:184,241:185,221:409,205:$V41,243:$V51,308:$V61}),o($Vk1,[2,133]),{29:$VW1,165:$VX1,168:410},o($Vl1,[2,394]),o($V21,$V31,{237:184,241:185,229:411,205:$V41,243:$V51,308:$V61}),o($Vm1,[2,397],{234:412}),o($Vm1,[2,399],{236:413}),o($VQ1,[2,395]),o($VQ1,[2,396]),o($Vm1,[2,402]),o($V21,$V31,{241:185,237:414,205:$V41,243:$V51,308:$V61}),o($VQ1,[2,403]),o($VQ1,[2,404]),o($VV1,[2,79]),o($VQ1,[2,332],{166:415,287:[1,416]}),{32:[1,417]},o($VV1,[2,152]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:418,205:$V41,243:$V51,308:$V61}),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:419,205:$V41,243:$V51,308:$V61}),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:420,205:$V41,243:$V51,308:$V61}),o($VV1,[2,156]),o($VV1,[2,81]),o($VQ1,[2,336],{169:421}),{28:[1,422]},o($VV1,[2,158]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:423,205:$V41,243:$V51,308:$V61}),{39:$VG,55:424},o($Vb2,[2,414],{256:425,287:[1,426]}),o($VQ1,[2,418],{259:427,287:[1,428]}),o($VQ1,[2,420],{261:429,287:[1,430]}),{29:[1,433],41:[1,431],91:432},o($Vz,[2,55]),{39:[1,434]},{39:[2,300]},{39:[2,301]},o($Vz,[2,49]),{13:$V8,16:$V9,53:435,283:$Vb},o($Vd,[2,290]),o($Vz,[2,50]),o($V02,[2,17]),o($V02,[2,243]),{80:[1,436]},{80:[1,437]},{13:$V8,16:$V9,28:$Vc2,29:$Vo1,53:300,65:298,66:299,72:438,73:439,74:$Vd2,75:297,76:$Ve2,77:442,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},o($V12,[2,247]),o($V32,[2,245]),{31:[1,445],32:[1,444]},{23:446,41:[2,204],82:447,83:$V4},o($VK1,[2,315]),o($Vf2,[2,316],{150:448,301:[1,449]}),{39:$VG,55:450},{39:$VG,55:451},{39:$VG,55:452},{13:$V8,16:$V9,28:[1,454],53:455,159:453,283:$Vb},o($Vg2,[2,328],{161:456,294:[1,457]}),{13:$V8,16:$V9,29:$Vo1,53:300,65:298,66:299,75:297,77:458,244:254,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,250:259,251:$Vt1,252:$Vu1,253:262,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1},{29:[1,459]},o($Vh2,[2,75]),o($VK1,[2,67]),o($Vo,[2,321],{39:$Vi2,41:$Vi2,83:$Vi2,109:$Vi2,157:$Vi2,158:$Vi2,160:$Vi2,163:$Vi2,164:$Vi2}),o($V82,[2,94]),o($Vo,[2,356],{190:460}),o($Vo,[2,354]),o($Vo,[2,355]),o($V52,[2,364],{198:461,199:462}),o($V82,[2,95]),o($V82,[2,353]),{13:$V8,16:$V9,28:$VH,29:$VL1,32:[1,463],53:149,80:$VJ,89:150,165:$VK,174:399,187:400,191:464,212:$VM1,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($VO1,[2,379]),o($VP1,[2,120]),o($VP1,[2,121]),{213:[1,465]},o($V5,[2,12]),o($Vd1,[2,349],{194:[1,466]}),o($Vj2,[2,346]),o([41,109,194,213,301],[2,89]),{13:$V8,16:$V9,28:$VH,29:$VI,53:149,80:$VJ,89:150,165:$VK,174:226,176:227,185:467,212:$VL,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($V11,[2,10]),o($Vj1,[2,129]),o($Vk1,[2,131]),o($Vk1,[2,134]),o($Vl1,[2,136]),o($Vl1,[2,137],{240:340,239:468,290:$VR1,305:$VS1}),o($Vl1,[2,138],{240:340,239:469,290:$VR1,305:$VS1}),o($Vm1,[2,140]),o($VQ1,[2,334],{167:470}),o($VQ1,[2,333]),o([6,13,16,28,29,31,32,39,41,71,74,76,79,80,81,83,109,157,158,160,163,164,165,194,212,215,216,220,224,228,243,245,246,247,248,249,251,252,254,255,258,260,265,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,290,301,305,308,309,310,311,312,313,314,315,316,317,318,319],[2,150]),{32:[1,471]},{248:[1,472]},{248:[1,473]},o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:474,205:$V41,243:$V51,308:$V61}),{32:[1,475]},{32:[1,476]},o($VV1,[2,160]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,257:477,30:479,205:$V41,243:$V51,290:[1,478],308:$V61}),o($Vb2,[2,415]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:480,205:$V41,243:$V51,308:$V61}),o($VQ1,[2,419]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:481,205:$V41,243:$V51,308:$V61}),o($VQ1,[2,421]),o($Vu,[2,36]),o($V_1,[2,255]),o($Vk2,[2,256],{92:482}),o($Vo,$VA,{142:126,138:483,141:484,41:[2,302]}),o($VC,[2,53]),o($V02,[2,30],{81:[1,485]}),o($V02,[2,31],{79:[1,486]}),o($VH1,[2,25],{244:254,250:259,253:262,75:297,65:298,66:299,53:300,77:442,73:487,13:$V8,16:$V9,28:$Vc2,29:$Vo1,74:$Vd2,76:$Ve2,245:$Vp1,246:$Vq1,247:$Vr1,249:$Vs1,251:$Vt1,252:$Vu1,254:$Vv1,255:$Vw1,258:$Vx1,260:$Vy1,283:$Vb,314:$Vz1,315:$VA1,316:$VB1,317:$VC1,318:$VD1,319:$VE1}),o($Vl2,[2,248]),{29:$Vo1,75:488},{29:$Vo1,75:489},o($Vl2,[2,28]),o($Vl2,[2,29]),o($V32,[2,21]),{28:[1,490]},{41:[2,7]},{41:[2,205]},o($Vo,$Vb1,{153:212,151:491,152:492,39:$Vm2,41:$Vm2,83:$Vm2,109:$Vm2,157:$Vm2,158:$Vm2,160:$Vm2,163:$Vm2,164:$Vm2}),o($Vf2,[2,317]),o($Vh2,[2,68],{302:[1,493]}),o($Vh2,[2,69]),o($Vh2,[2,70]),{39:$VG,55:494},{39:[2,326]},{39:[2,327]},{13:$V8,16:$V9,28:[1,496],53:497,162:495,283:$Vb},o($Vg2,[2,329]),o($Vh2,[2,73]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:498,205:$V41,243:$V51,308:$V61}),{13:$V8,16:$V9,28:$VH,29:$VL1,53:149,80:$VJ,89:150,165:$VK,174:399,187:400,191:499,212:$VM1,215:$VM,216:$VN,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},o($VO1,[2,99],{304:[1,500]}),o($Vn2,[2,371],{200:501,204:502,210:[1,503]}),o($Vg1,[2,116]),o($VO1,[2,380]),o($Vg1,[2,117]),o($Vj2,[2,347]),o($Vo2,[2,93],{248:[1,504]}),o($Vm1,[2,398]),o($Vm1,[2,400]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:505,205:$V41,243:$V51,308:$V61}),o($VV1,[2,153]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:506,205:$V41,243:$V51,308:$V61}),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:507,205:$V41,243:$V51,308:$V61}),{32:[1,508],248:[1,509]},o($VV1,[2,157]),o($VV1,[2,159]),{32:[1,510]},{32:[2,416]},{32:[2,417]},{32:[1,511]},{32:[2,422],194:[1,514],262:512,263:513},{13:$V8,16:$V9,32:[1,515],53:276,80:$VJ,88:516,89:277,90:$VF1,233:160,235:161,266:156,269:$VO,270:$VP,271:$VQ,272:$VR,273:$VS,274:$VT,275:$VU,276:$VV,277:$VW,278:$VX,279:$VY,280:$VZ,281:$V_,282:$V$,283:$Vb},{41:[1,517]},{41:[2,303]},{80:[1,518]},{80:[1,519]},o($Vl2,[2,249]),o($Vl2,[2,26]),o($Vl2,[2,27]),{32:[1,520]},o($VK1,[2,66]),o($VK1,[2,319]),{39:[2,325]},o($Vh2,[2,71]),{39:$VG,55:521},{39:[2,330]},{39:[2,331]},{31:[1,522]},o($Vo2,[2,358],{192:523,248:[1,524]}),o($V52,[2,363]),o([13,16,28,29,32,80,165,212,215,216,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,304],[2,100],{305:[1,525]}),{13:$V8,16:$V9,29:[1,531],53:528,183:[1,529],201:526,202:527,205:[1,530],283:$Vb},o($Vn2,[2,372]),o($Vo,[2,351]),{32:[1,532],248:[1,533]},{32:[1,534]},{248:[1,535]},o($VV1,[2,82]),o($VQ1,[2,337]),o($VV1,[2,161]),o($VV1,[2,162]),{32:[1,536]},{32:[2,423]},{264:[1,537]},o($V_1,[2,40]),o($Vk2,[2,257]),o($Vp2,[2,304],{139:538,301:[1,539]}),o($V02,[2,32]),o($V02,[2,33]),o($V32,[2,22]),o($Vh2,[2,72]),{28:[1,540]},o([39,41,83,109,157,158,160,163,164,213,301],[2,96],{193:541,194:[1,542]}),o($Vo,[2,357]),o($V52,[2,365]),o($Vq2,[2,102]),o($Vq2,[2,369],{203:543,306:544,290:[1,546],307:[1,545],308:[1,547]}),o($Vr2,[2,103]),o($Vr2,[2,104]),{13:$V8,16:$V9,29:[1,551],53:552,165:[1,550],183:$Vs2,206:548,207:549,210:$Vt2,283:$Vb},o($V52,$V62,{197:394,196:555}),o($VV1,[2,80]),o($VQ1,[2,335]),o($VV1,[2,154]),o($V21,$V31,{217:180,221:181,225:182,229:183,237:184,241:185,30:556,205:$V41,243:$V51,308:$V61}),o($VV1,[2,163]),{265:[1,557]},o($Vo,$VA,{142:126,140:558,141:559,41:$Vu2,109:$Vu2}),o($Vp2,[2,305]),{32:[1,560]},o($Vo2,[2,359]),o($Vo2,[2,97],{197:394,195:561,196:562,13:$V62,16:$V62,29:$V62,183:$V62,205:$V62,210:$V62,283:$V62,28:[1,563]}),o($Vq2,[2,101]),o($Vq2,[2,370]),o($Vq2,[2,366]),o($Vq2,[2,367]),o($Vq2,[2,368]),o($Vr2,[2,105]),o($Vr2,[2,107]),o($Vr2,[2,108]),o($Vv2,[2,373],{208:564}),o($Vr2,[2,110]),o($Vr2,[2,111]),{13:$V8,16:$V9,53:565,183:[1,566],283:$Vb},{32:[1,567]},{32:[1,568]},{266:569,273:$VS,274:$VT,275:$VU,276:$VV},o($V91,[2,61]),o($V91,[2,307]),o($Vh2,[2,74]),o($Vo,$V92,{184:406,182:570}),o($Vo,[2,360]),o($Vo,[2,361]),{13:$V8,16:$V9,32:[2,375],53:552,183:$Vs2,207:572,209:571,210:$Vt2,283:$Vb},o($Vr2,[2,112]),o($Vr2,[2,113]),o($Vr2,[2,106]),o($VV1,[2,155]),{32:[2,164]},o($Vo2,[2,98]),{32:[1,573]},{32:[2,376],304:[1,574]},o($Vr2,[2,109]),o($Vv2,[2,374])],
defaultActions: {5:[2,190],6:[2,191],8:[2,189],24:[2,1],25:[2,3],26:[2,201],68:[2,41],77:[2,276],91:[2,235],96:[2,339],216:[2,219],217:[2,84],243:[2,392],271:[2,413],363:[2,300],364:[2,301],446:[2,7],447:[2,205],454:[2,326],455:[2,327],478:[2,416],479:[2,417],484:[2,303],493:[2,325],496:[2,330],497:[2,331],513:[2,423],569:[2,164]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  /*
    SPARQL parser in the Jison parser generator format.
  */

  // Common namespaces and entities
  var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      RDF_TYPE  = RDF + 'type',
      RDF_FIRST = RDF + 'first',
      RDF_REST  = RDF + 'rest',
      RDF_NIL   = RDF + 'nil',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean',
      XSD_TRUE =  '"true"^^'  + XSD_BOOLEAN,
      XSD_FALSE = '"false"^^' + XSD_BOOLEAN;

  var base = '', basePath = '', baseRoot = '';

  // Returns a lowercase version of the given string
  function lowercase(string) {
    return string.toLowerCase();
  }

  // Appends the item to the array and returns the array
  function appendTo(array, item) {
    return array.push(item), array;
  }

  // Appends the items to the array and returns the array
  function appendAllTo(array, items) {
    return array.push.apply(array, items), array;
  }

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (var name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    var union = [];
    for (var i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // Resolves an IRI against a base path
  function resolveIRI(iri) {
    // Strip off possible angular brackets
    if (iri[0] === '<')
      iri = iri.substring(1, iri.length - 1);
    // Return absolute IRIs unmodified
    if (/^[a-z]+:/.test(iri))
      return iri;
    if (!Parser.base)
      throw new Error('Cannot resolve relative IRI ' + iri + ' because no base IRI was set.');
    if (!base) {
      base = Parser.base;
      basePath = base.replace(/[^\/:]*$/, '');
      baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    }
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined:
      return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#':
      return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?':
      return base.replace(/(?:\?.*)?$/, iri);
    // Resolve root relative IRIs at the root of the base IRI
    case '/':
      return baseRoot + iri;
    // Resolve all other IRIs at the base IRI's path
    default:
      return basePath + iri;
    }
  }

  // If the item is a variable, ensures it starts with a question mark
  function toVar(variable) {
    if (variable) {
      var first = variable[0];
      if (first === '?') return variable;
      if (first === '$') return '?' + variable.substr(1);
    }
    return variable;
  }

  // Creates an operation with the given name and arguments
  function operation(operatorName, args) {
    return { type: 'operation', operator: operatorName, args: args || [] };
  }

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    var expression = { expression: expr };
    if (attr)
      for (var a in attr)
        expression[a] = attr[a];
    return expression;
  }

  // Creates a path with the given type and items
  function path(type, items) {
    return { type: 'path', pathType: type, items: items };
  }

  // Transforms a list of operations types and arguments into a tree of operations
  function createOperationTree(initialExpression, operationList) {
    for (var i = 0, l = operationList.length, item; i < l && (item = operationList[i]); i++)
      initialExpression = operation(item[0], [initialExpression, item[1]]);
    return initialExpression;
  }

  // Group datasets by default and named
  function groupDatasets(fromClauses) {
    var defaults = [], named = [], l = fromClauses.length, fromClause;
    for (var i = 0; i < l && (fromClause = fromClauses[i]); i++)
      (fromClause.named ? named : defaults).push(fromClause.iri);
    return l ? { from: { default: defaults, named: named } } : null;
  }

  // Converts the number to a string
  function toInt(string) {
    return parseInt(string, 10);
  }

  // Transforms a possibly single group into its patterns
  function degroupSingle(group) {
    return group.type === 'group' && group.patterns.length === 1 ? group.patterns[0] : group;
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return '"' + value + '"^^' + type;
  }

  // Creates a triple with the given subject, predicate, and object
  function triple(subject, predicate, object) {
    var triple = {};
    if (subject   != null) triple.subject   = subject;
    if (predicate != null) triple.predicate = predicate;
    if (object    != null) triple.object    = object;
    return triple;
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }

  // Regular expression and replacement strings to escape strings
  var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
      escapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                             't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      fromCharCode = String.fromCharCode;

  // Translates escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    try {
      string = string.replace(escapeSequence, function (sequence, unicode4, unicode8, escapedChar) {
        var charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return fromCharCode(charCode);
          return fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          var replacement = escapeReplacements[escapedChar];
          if (!replacement) throw new Error();
          return replacement;
        }
      });
    }
    catch (error) { return ''; }
    return '"' + string + '"';
  }

  // Creates a list, collecting its (possibly blank) items and triples associated with those items
  function createList(objects) {
    var list = blank(), head = list, listItems = [], listTriples, triples = [];
    objects.forEach(function (o) { listItems.push(o.entity); appendAllTo(triples, o.triples); });

    // Build an RDF list out of the items
    for (var i = 0, j = 0, l = listItems.length, listTriples = Array(l * 2); i < l;)
      listTriples[j++] = triple(head, RDF_FIRST, listItems[i]),
      listTriples[j++] = triple(head, RDF_REST,  head = ++i < l ? blank() : RDF_NIL);

    // Return the list's identifier, its triples, and the triples associated with its items
    return { entity: list, triples: appendAllTo(listTriples, triples) };
  }

  // Creates a blank node identifier, collecting triples with that blank node as subject
  function createAnonymousObject(propertyList) {
    var entity = blank();
    return {
      entity: entity,
      triples: propertyList.map(function (t) { return extend(triple(entity), t); })
    };
  }

  // Collects all (possibly blank) objects, and triples that have them as subject
  function objectListToTriples(predicate, objectList, otherTriples) {
    var objects = [], triples = [];
    objectList.forEach(function (l) {
      objects.push(triple(null, predicate, l.entity));
      appendAllTo(triples, l.triples);
    });
    return unionAll(objects, otherTriples || [], triples);
  }

  // Simplifies groups by merging adjacent BGPs
  function mergeAdjacentBGPs(groups) {
    var merged = [], currentBgp;
    for (var i = 0, group; group = groups[i]; i++) {
      switch (group.type) {
        // Add a BGP's triples to the current BGP
        case 'bgp':
          if (group.triples.length) {
            if (!currentBgp)
              appendTo(merged, currentBgp = group);
            else
              appendAllTo(currentBgp.triples, group.triples);
          }
          break;
        // All other groups break up a BGP
        default:
          // Only add the group if its pattern is non-empty
          if (!group.patterns || group.patterns.length > 0) {
            appendTo(merged, group);
            currentBgp = null;
          }
      }
    }
    return merged;
  }
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"flex":true,"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* ignore */
break;
case 1:return 12
break;
case 2:return 15
break;
case 3:return 24
break;
case 4:return 287
break;
case 5:return 288
break;
case 6:return 29
break;
case 7:return 31
break;
case 8:return 32
break;
case 9:return 290
break;
case 10:return 34
break;
case 11:return 38
break;
case 12:return 39
break;
case 13:return 41
break;
case 14:return 43
break;
case 15:return 48
break;
case 16:return 51
break;
case 17:return 293
break;
case 18:return 61
break;
case 19:return 62
break;
case 20:return 68
break;
case 21:return 71
break;
case 22:return 74
break;
case 23:return 76
break;
case 24:return 79
break;
case 25:return 81
break;
case 26:return 83
break;
case 27:return 194
break;
case 28:return 97
break;
case 29:return 294
break;
case 30:return 130
break;
case 31:return 295
break;
case 32:return 296
break;
case 33:return 107
break;
case 34:return 297
break;
case 35:return 106
break;
case 36:return 298
break;
case 37:return 299
break;
case 38:return 110
break;
case 39:return 112
break;
case 40:return 113
break;
case 41:return 128
break;
case 42:return 122
break;
case 43:return 123
break;
case 44:return 125
break;
case 45:return 131
break;
case 46:return 109
break;
case 47:return 300
break;
case 48:return 301
break;
case 49:return 157
break;
case 50:return 160
break;
case 51:return 164
break;
case 52:return 90
break;
case 53:return 158
break;
case 54:return 302
break;
case 55:return 163
break;
case 56:return 248
break;
case 57:return 183
break;
case 58:return 304
break;
case 59:return 305
break;
case 60:return 210
break;
case 61:return 307
break;
case 62:return 308
break;
case 63:return 205
break;
case 64:return 212
break;
case 65:return 213
break;
case 66:return 220
break;
case 67:return 224
break;
case 68:return 265
break;
case 69:return 309
break;
case 70:return 310
break;
case 71:return 311
break;
case 72:return 312
break;
case 73:return 313
break;
case 74:return 228
break;
case 75:return 314
break;
case 76:return 243
break;
case 77:return 251
break;
case 78:return 252
break;
case 79:return 245
break;
case 80:return 246
break;
case 81:return 247
break;
case 82:return 315
break;
case 83:return 316
break;
case 84:return 249
break;
case 85:return 318
break;
case 86:return 317
break;
case 87:return 319
break;
case 88:return 254
break;
case 89:return 255
break;
case 90:return 258
break;
case 91:return 260
break;
case 92:return 264
break;
case 93:return 268
break;
case 94:return 271
break;
case 95:return 272
break;
case 96:return 13
break;
case 97:return 16
break;
case 98:return 283
break;
case 99:return 215
break;
case 100:return 28
break;
case 101:return 267
break;
case 102:return 80
break;
case 103:return 269
break;
case 104:return 270
break;
case 105:return 277
break;
case 106:return 278
break;
case 107:return 279
break;
case 108:return 280
break;
case 109:return 281
break;
case 110:return 282
break;
case 111:return 'EXPONENT'
break;
case 112:return 273
break;
case 113:return 274
break;
case 114:return 275
break;
case 115:return 276
break;
case 116:return 165
break;
case 117:return 216
break;
case 118:return 6
break;
case 119:return 'INVALID'
break;
case 120:console.log(yy_.yytext);
break;
}
},
rules: [/^(?:\s+|#[^\n\r]*)/i,/^(?:BASE)/i,/^(?:PREFIX)/i,/^(?:SELECT)/i,/^(?:DISTINCT)/i,/^(?:REDUCED)/i,/^(?:\()/i,/^(?:AS)/i,/^(?:\))/i,/^(?:\*)/i,/^(?:CONSTRUCT)/i,/^(?:WHERE)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:DESCRIBE)/i,/^(?:ASK)/i,/^(?:FROM)/i,/^(?:NAMED)/i,/^(?:GROUP)/i,/^(?:BY)/i,/^(?:HAVING)/i,/^(?:ORDER)/i,/^(?:ASC)/i,/^(?:DESC)/i,/^(?:LIMIT)/i,/^(?:OFFSET)/i,/^(?:VALUES)/i,/^(?:;)/i,/^(?:LOAD)/i,/^(?:SILENT)/i,/^(?:INTO)/i,/^(?:CLEAR)/i,/^(?:DROP)/i,/^(?:CREATE)/i,/^(?:ADD)/i,/^(?:TO)/i,/^(?:MOVE)/i,/^(?:COPY)/i,/^(?:INSERT\s+DATA)/i,/^(?:DELETE\s+DATA)/i,/^(?:DELETE\s+WHERE)/i,/^(?:WITH)/i,/^(?:DELETE)/i,/^(?:INSERT)/i,/^(?:USING)/i,/^(?:DEFAULT)/i,/^(?:GRAPH)/i,/^(?:ALL)/i,/^(?:\.)/i,/^(?:OPTIONAL)/i,/^(?:SERVICE)/i,/^(?:BIND)/i,/^(?:UNDEF)/i,/^(?:MINUS)/i,/^(?:UNION)/i,/^(?:FILTER)/i,/^(?:,)/i,/^(?:a)/i,/^(?:\|)/i,/^(?:\/)/i,/^(?:\^)/i,/^(?:\?)/i,/^(?:\+)/i,/^(?:!)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\|\|)/i,/^(?:&&)/i,/^(?:=)/i,/^(?:!=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:IN)/i,/^(?:NOT)/i,/^(?:-)/i,/^(?:BOUND)/i,/^(?:BNODE)/i,/^(?:(RAND|NOW|UUID|STRUUID))/i,/^(?:(LANG|DATATYPE|IRI|URI|ABS|CEIL|FLOOR|ROUND|STRLEN|STR|UCASE|LCASE|ENCODE_FOR_URI|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|MD5|SHA1|SHA256|SHA384|SHA512|isIRI|isURI|isBLANK|isLITERAL|isNUMERIC))/i,/^(?:(LANGMATCHES|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|STRLANG|STRDT|sameTerm))/i,/^(?:CONCAT)/i,/^(?:COALESCE)/i,/^(?:IF)/i,/^(?:REGEX)/i,/^(?:SUBSTR)/i,/^(?:REPLACE)/i,/^(?:EXISTS)/i,/^(?:COUNT)/i,/^(?:SUM|MIN|MAX|AVG|SAMPLE)/i,/^(?:GROUP_CONCAT)/i,/^(?:SEPARATOR)/i,/^(?:\^\^)/i,/^(?:true)/i,/^(?:false)/i,/^(?:(<([^<>\"\{\}\|\^`\\\u0000-\u0020])*>))/i,/^(?:((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:))/i,/^(?:(((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:)((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))))?)))/i,/^(?:(_:(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?))/i,/^(?:([\?\$]((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])*)))/i,/^(?:(@[a-zA-Z]+(-[a-zA-Z0-9]+)*))/i,/^(?:([0-9]+))/i,/^(?:([0-9]*\.[0-9]+))/i,/^(?:([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+)))/i,/^(?:(\+([0-9]+)))/i,/^(?:(\+([0-9]*\.[0-9]+)))/i,/^(?:(\+([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:(-([0-9]+)))/i,/^(?:(-([0-9]*\.[0-9]+)))/i,/^(?:(-([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:([eE][+-]?[0-9]+))/i,/^(?:('(([^\u0027\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/i,/^(?:("(([^\u0022\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/i,/^(?:('''(('|'')?([^'\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/i,/^(?:("""(("|"")?([^\"\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/i,/^(?:(\((\u0020|\u0009|\u000D|\u000A)*\)))/i,/^(?:(\[(\u0020|\u0009|\u000D|\u000A)*\]))/i,/^(?:$)/i,/^(?:.)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = SparqlParser;
exports.Parser = SparqlParser.Parser;
exports.parse = function () { return SparqlParser.parse.apply(SparqlParser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":2,"fs":2,"path":2}],8:[function(require,module,exports){
var Parser = require('./lib/SparqlParser').Parser;
var Generator = require('./lib/SparqlGenerator');

module.exports = {
  /**
   * Creates a SPARQL parser with the given pre-defined prefixes and base IRI
   * @param prefixes { [prefix: string]: string }
   * @param baseIRI string
   */
  Parser: function (prefixes, baseIRI) {
    // Create a copy of the prefixes
    var prefixesCopy = {};
    for (var prefix in prefixes || {})
      prefixesCopy[prefix] = prefixes[prefix];

    // Create a new parser with the given prefixes
    // (Workaround for https://github.com/zaach/jison/issues/241)
    var parser = new Parser();
    parser.parse = function () {
      Parser.base = baseIRI || '';
      Parser.prefixes = Object.create(prefixesCopy);
      return Parser.prototype.parse.apply(parser, arguments);
    };
    parser._resetBlanks = Parser._resetBlanks;
    return parser;
  },
  Generator: Generator,
};

},{"./lib/SparqlGenerator":6,"./lib/SparqlParser":7}],9:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[6,14,62,65,72,79,86,91,134,144,147,149,150,159,160,165,330,331,332,333,334],$V1=[16,83,94],$V2=[1,17],$V3=[1,19],$V4=[1,18],$V5=[2,287],$V6=[1,26],$V7=[1,30],$V8=[6,16,19,29,31,32,36,38,41,43,54,63,66,77,83,94,107,110,117,118,119,121,127,143,146,159,160,162,167,194,195,197,200,201,202,220,241,246,248,249,251,252,256,260,264,279,281,282,283,284,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,336,339,340,342,343,344,345,346,347,348,349,350,351,352,353,354],$V9=[6,19,46,49,107,110,117,119,121],$Va=[2,289],$Vb=[1,35],$Vc=[1,37],$Vd=[63,66,316],$Ve=[19,29,32,36,38,41,54,63,66,118,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,349,350,351,352,353,354],$Vf=[31,54],$Vg=[6,46,49],$Vh=[1,44],$Vi=[6,19,46,49,110,117,119,121],$Vj=[29,54,63,66,118,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316],$Vk=[2,373],$Vl=[2,365],$Vm=[1,73],$Vn=[1,72],$Vo=[1,70],$Vp=[1,71],$Vq=[1,64],$Vr=[1,69],$Vs=[1,85],$Vt=[1,75],$Vu=[1,76],$Vv=[1,77],$Vw=[1,78],$Vx=[1,80],$Vy=[1,81],$Vz=[2,465],$VA=[1,92],$VB=[1,93],$VC=[1,94],$VD=[1,86],$VE=[1,87],$VF=[1,90],$VG=[1,91],$VH=[1,101],$VI=[1,102],$VJ=[1,103],$VK=[1,104],$VL=[1,105],$VM=[1,106],$VN=[1,107],$VO=[1,108],$VP=[1,109],$VQ=[1,110],$VR=[1,100],$VS=[1,95],$VT=[1,96],$VU=[1,97],$VV=[1,98],$VW=[1,99],$VX=[6,49],$VY=[6,19,46,49,117,119,121],$VZ=[1,131],$V_=[1,132],$V$=[16,19,121,146,194,195,197,200,201],$V01=[29,54,325],$V11=[1,150],$V21=[1,144],$V31=[1,149],$V41=[1,151],$V51=[1,147],$V61=[1,148],$V71=[29,54,63,66,118,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,349,350,351,352,353,354],$V81=[2,458],$V91=[1,165],$Va1=[1,166],$Vb1=[1,167],$Vc1=[6,16,19,29,31,32,36,38,41,43,46,49,54,63,66,77,107,110,113,114,117,118,119,121,146,194,195,197,200,201,202,248,251,252,256,260,264,279,281,282,283,284,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,336,340,343,344,345,346,347,348,349,350,351,352,353,354],$Vd1=[1,174],$Ve1=[1,173],$Vf1=[1,180],$Vg1=[1,179],$Vh1=[16,19,29,31,32,36,38,41,43,54,63,66,77,118,121,127,146,194,195,197,200,201,202,220,241,246,248,249,251,252,256,260,264,279,281,282,283,284,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,336,340,343,344,345,346,347,348,349,350,351,352,353,354],$Vi1=[29,202],$Vj1=[16,19,29,31,32,36,38,41,43,54,63,66,77,118,121,127,146,194,195,197,200,201,202,220,241,246,248,249,251,252,256,260,264,279,281,282,283,284,285,287,288,290,291,294,296,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,336,340,343,344,345,346,347,348,349,350,351,352,353,354],$Vk1=[6,16,19,29,46,49,54,63,66,118,121,146,194,195,197,200,201,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,336],$Vl1=[6,19,46,49,121],$Vm1=[6,19,29,46,49,63,66,110,117,119,121,281,282,283,285,287,288,290,291,294,296,316,349,350,351,352,353,354],$Vn1=[6,16,19,29,46,49,54,63,66,110,113,114,117,118,119,121,146,194,195,197,200,201,202,248,251,252,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,336,349,350,351,352,353,354],$Vo1=[6,19,29,46,49,54,63,66,107,110,117,119,121,281,282,283,285,287,288,290,291,294,296,316,349,350,351,352,353,354],$Vp1=[6,16,19,29,31,32,36,38,41,43,46,49,54,63,66,77,107,110,113,114,117,118,119,121,146,194,195,197,200,201,202,248,251,252,256,260,264,279,281,282,283,284,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,336,337,340,343,344,345,346,347,348,349,350,351,352,353,354],$Vq1=[1,214],$Vr1=[1,213],$Vs1=[29,63,66,220,241,246,316],$Vt1=[2,415],$Vu1=[1,220],$Vv1=[16,19,121,146,194,195,197,200,201,336],$Vw1=[16,19,29,31,41,54,63,66,118,121,146,194,195,197,200,201,202,220,241,246,248,249,251,252,284,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,336],$Vx1=[19,29,32,36,38,54,63,66,118,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,349,350,351,352,353,354],$Vy1=[31,41,77,256,284],$Vz1=[31,41,77,256,260,284],$VA1=[31,41,43,77,256,260,264,279,284,310,311,312,313,314,315,343,344,345,346,347,348,349],$VB1=[31,41,43,77,256,260,264,279,284,310,311,312,313,314,315,325,340,343,344,345,346,347,348,349],$VC1=[1,253],$VD1=[29,54,63,66,118,241,279,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,343,349,350,351,352,353,354],$VE1=[29,54,63,66,118,241,279,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,343,349,350,351,352,353,354],$VF1=[19,63,66,118,127,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316],$VG1=[1,286],$VH1=[1,283],$VI1=[1,284],$VJ1=[16,19,29,54,63,66,118,121,146,194,195,197,200,201,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316],$VK1=[54,63,66,316],$VL1=[16,19,29,54,63,66,118,121,146,194,195,197,200,201,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,336],$VM1=[16,29,54,83,94],$VN1=[2,376],$VO1=[29,31,54,63,66,118,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316],$VP1=[16,19,29,31,41,54,63,66,118,121,146,194,195,197,200,201,202,248,249,251,252,284,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,336],$VQ1=[19,29,36,38,41,54,63,66,118,281,282,283,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,349,350,351,352,353,354],$VR1=[1,331],$VS1=[1,332],$VT1=[19,319],$VU1=[1,352],$VV1=[6,19,29,46,49,54,63,66,113,114,117,119,121,281,282,283,285,287,288,290,291,294,296,316,349,350,351,352,353,354],$VW1=[2,371],$VX1=[29,63,66,220,241,316],$VY1=[19,31,63,66,118,127,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316],$VZ1=[19,29],$V_1=[16,19,41,121,146,194,195,197,200,201,249,336],$V$1=[29,31,54,63,66,118,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,339,340],$V02=[29,31,54,63,66,118,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,339,340,342,343],$V12=[1,443],$V22=[1,444],$V32=[31,63,66,118,127,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316],$V42=[31,63,66,220,246,316],$V52=[2,403],$V62=[1,470],$V72=[1,471],$V82=[54,63,66,220,316],$V92=[16,19,29,31,41,54,63,66,118,121,146,194,195,197,200,201,202,220,248,249,251,252,284,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,336],$Va2=[41,54,63,66,220,316];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"WithPrologue":3,"Prologue":4,"Template":5,"EOF":6,"TemplateClause":7,"Template_repetition0":8,"WhereClause":9,"SolutionModifier":10,"Template_option0":11,"Template_option1":12,"Template_repetition1":13,"TEMPLATE":14,"TemplateClause_option0":15,"{":16,"TemplateClause_repetition0":17,"TemplateClause_option1":18,"}":19,"TExpression":20,"TPrimaryExpression":21,"Box":22,"Format":23,"Group":24,"NameArg":25,"iri":26,"NameArg_option0":27,"VarList":28,"(":29,"VarList_repetition0":30,")":31,"GROUP":32,"Group_option0":33,"Group_repetition0":34,"Group_option1":35,"BOX":36,"Box_repetition0":37,"FORMAT":38,"Format_repetition_plus0":39,"Separator":40,";":41,"SEPARATOR":42,"=":43,"String":44,"Pragma":45,"PRAGMA":46,"Pragma_repetition_plus0":47,"Function":48,"FUNCTION":49,"BrackettedExpression":50,"BuiltInCall":51,"FunctionCall":52,"Literal":53,"VAR":54,"QueryOrUpdate":55,"QueryOrUpdate_group0":56,"Prologue_repetition0":57,"Query":58,"Query_group0":59,"Query_option0":60,"BaseDecl":61,"BASE":62,"IRIREF":63,"PrefixDecl":64,"PREFIX":65,"PNAME_NS":66,"SelectQuery":67,"SelectClause":68,"SelectQuery_repetition0":69,"SubSelect":70,"SubSelect_option0":71,"SELECT":72,"SelectClause_option0":73,"SelectClause_group0":74,"SelectClauseItem":75,"Expression":76,"AS":77,"ConstructQuery":78,"CONSTRUCT":79,"ConstructTemplate":80,"ConstructQuery_repetition0":81,"ConstructQuery_repetition1":82,"WHERE":83,"ConstructQuery_option0":84,"DescribeQuery":85,"DESCRIBE":86,"DescribeQuery_group0":87,"DescribeQuery_repetition0":88,"DescribeQuery_option0":89,"AskQuery":90,"ASK":91,"AskQuery_repetition0":92,"DatasetClause":93,"FROM":94,"DatasetClause_option0":95,"WhereClause_option0":96,"GroupGraphPattern":97,"SolutionModifier_option0":98,"SolutionModifier_option1":99,"SolutionModifier_option2":100,"SolutionModifier_option3":101,"GroupClause":102,"BY":103,"GroupClause_repetition_plus0":104,"GroupCondition":105,"HavingClause":106,"HAVING":107,"HavingClause_repetition_plus0":108,"OrderClause":109,"ORDER":110,"OrderClause_repetition_plus0":111,"OrderCondition":112,"ASC":113,"DESC":114,"Constraint":115,"LimitOffsetClauses":116,"LIMIT":117,"INTEGER":118,"OFFSET":119,"ValuesClause":120,"VALUES":121,"InlineData":122,"InlineData_repetition0":123,"InlineData_repetition1":124,"InlineData_repetition2":125,"DataBlockValue":126,"UNDEF":127,"DataBlockValueList":128,"DataBlockValueList_repetition0":129,"Update":130,"Update_repetition0":131,"Update1":132,"Update_option0":133,"LOAD":134,"Update1_option0":135,"Update1_option1":136,"Update1_group0":137,"Update1_option2":138,"GraphRefAll":139,"Update1_group1":140,"Update1_option3":141,"GraphOrDefault":142,"TO":143,"CREATE":144,"Update1_option4":145,"GRAPH":146,"INSERTDATA":147,"QuadPattern":148,"DELETEDATA":149,"DELETEWHERE":150,"Update1_option5":151,"InsertClause":152,"Update1_option6":153,"Update1_repetition0":154,"Update1_option7":155,"DeleteClause":156,"Update1_option8":157,"Update1_repetition1":158,"DELETE":159,"INSERT":160,"UsingClause":161,"USING":162,"UsingClause_option0":163,"WithClause":164,"WITH":165,"IntoGraphClause":166,"INTO":167,"DEFAULT":168,"GraphOrDefault_option0":169,"GraphRefAll_group0":170,"QuadPattern_option0":171,"QuadPattern_repetition0":172,"QuadsNotTriples":173,"QuadsNotTriples_group0":174,"QuadsNotTriples_option0":175,"QuadsNotTriples_option1":176,"QuadsNotTriples_option2":177,"TriplesTemplate":178,"TriplesTemplate_repetition0":179,"TriplesSameSubject":180,"TriplesTemplate_option0":181,"GroupGraphPatternSub":182,"GroupGraphPatternSub_option0":183,"GroupGraphPatternSub_repetition0":184,"GroupGraphPatternSubTail":185,"GraphPatternNotTriples":186,"GroupGraphPatternSubTail_option0":187,"GroupGraphPatternSubTail_option1":188,"TriplesBlock":189,"TriplesBlock_repetition0":190,"TriplesSameSubjectPath":191,"TriplesBlock_option0":192,"GraphPatternNotTriples_repetition0":193,"OPTIONAL":194,"MINUS":195,"GraphPatternNotTriples_group0":196,"SERVICE":197,"GraphPatternNotTriples_option0":198,"GraphPatternNotTriples_group1":199,"FILTER":200,"BIND":201,"NIL":202,"FunctionCall_option0":203,"FunctionCall_repetition0":204,"ExpressionList":205,"ExpressionList_repetition0":206,"ConstructTemplate_option0":207,"ConstructTriples":208,"ConstructTriples_repetition0":209,"ConstructTriples_option0":210,"VarOrTerm":211,"PropertyListNotEmpty":212,"TriplesNode":213,"PropertyList":214,"PropertyList_option0":215,"PropertyListNotEmpty_repetition0":216,"VerbObjectList":217,"Verb":218,"ObjectList":219,"a":220,"ObjectList_repetition0":221,"GraphNode":222,"PropertyListPathNotEmpty":223,"TriplesNodePath":224,"TriplesSameSubjectPath_option0":225,"PropertyListPathNotEmpty_group0":226,"PropertyListPathNotEmpty_repetition0":227,"GraphNodePath":228,"PropertyListPathNotEmpty_repetition1":229,"PropertyListPathNotEmptyTail":230,"PropertyListPathNotEmptyTail_group0":231,"Path":232,"Path_repetition0":233,"PathSequence":234,"PathSequence_repetition0":235,"PathEltOrInverse":236,"PathElt":237,"PathPrimary":238,"PathElt_option0":239,"PathEltOrInverse_option0":240,"!":241,"PathNegatedPropertySet":242,"PathOneInPropertySet":243,"PathNegatedPropertySet_repetition0":244,"PathNegatedPropertySet_option0":245,"^":246,"TriplesNode_repetition_plus0":247,"[":248,"]":249,"TriplesNodePath_repetition_plus0":250,"BLANK_NODE_LABEL":251,"ANON":252,"ConditionalAndExpression":253,"Expression_repetition0":254,"ExpressionTail":255,"||":256,"RelationalExpression":257,"ConditionalAndExpression_repetition0":258,"ConditionalAndExpressionTail":259,"&&":260,"AdditiveExpression":261,"RelationalExpression_group0":262,"RelationalExpression_option0":263,"IN":264,"MultiplicativeExpression":265,"AdditiveExpression_repetition0":266,"AdditiveExpressionTail":267,"AdditiveExpressionTail_group0":268,"NumericLiteralPositive":269,"AdditiveExpressionTail_repetition0":270,"NumericLiteralNegative":271,"AdditiveExpressionTail_repetition1":272,"UnaryExpression":273,"MultiplicativeExpression_repetition0":274,"MultiplicativeExpressionTail":275,"MultiplicativeExpressionTail_group0":276,"UnaryExpression_option0":277,"PrimaryExpression":278,"-":279,"Aggregate":280,"FUNC_ARITY0":281,"FUNC_ARITY1":282,"FUNC_ARITY2":283,",":284,"IF":285,"BuiltInCall_group0":286,"BOUND":287,"BNODE":288,"BuiltInCall_option0":289,"EXISTS":290,"COUNT":291,"Aggregate_option0":292,"Aggregate_group0":293,"FUNC_AGGREGATE":294,"Aggregate_option1":295,"GROUP_CONCAT":296,"Aggregate_option2":297,"Aggregate_option3":298,"GroupConcatSeparator":299,"LANGTAG":300,"^^":301,"DECIMAL":302,"DOUBLE":303,"true":304,"false":305,"STRING_LITERAL1":306,"STRING_LITERAL2":307,"STRING_LITERAL_LONG1":308,"STRING_LITERAL_LONG2":309,"INTEGER_POSITIVE":310,"DECIMAL_POSITIVE":311,"DOUBLE_POSITIVE":312,"INTEGER_NEGATIVE":313,"DECIMAL_NEGATIVE":314,"DOUBLE_NEGATIVE":315,"PNAME_LN":316,"DISTINCT":317,"Group_repetition0_group0":318,"Triple":319,"QueryOrUpdate_group0_option0":320,"Prologue_repetition0_group0":321,"SelectClause_option0_group0":322,"REDUCED":323,"SelectClause_group0_repetition_plus0":324,"*":325,"DescribeQuery_group0_repetition_plus0_group0":326,"DescribeQuery_group0_repetition_plus0":327,"NAMED":328,"SILENT":329,"CLEAR":330,"DROP":331,"ADD":332,"MOVE":333,"COPY":334,"ALL":335,".":336,"UNION":337,"PropertyListNotEmpty_repetition0_repetition_plus0":338,"|":339,"/":340,"PathElt_option0_group0":341,"?":342,"+":343,"!=":344,"<":345,">":346,"<=":347,">=":348,"NOT":349,"CONCAT":350,"COALESCE":351,"SUBSTR":352,"REGEX":353,"REPLACE":354,"$accept":0,"$end":1},
terminals_: {2:"error",6:"EOF",14:"TEMPLATE",16:"{",19:"}",29:"(",31:")",32:"GROUP",36:"BOX",38:"FORMAT",41:";",42:"SEPARATOR",43:"=",46:"PRAGMA",49:"FUNCTION",54:"VAR",62:"BASE",63:"IRIREF",65:"PREFIX",66:"PNAME_NS",72:"SELECT",77:"AS",79:"CONSTRUCT",83:"WHERE",86:"DESCRIBE",91:"ASK",94:"FROM",103:"BY",107:"HAVING",110:"ORDER",113:"ASC",114:"DESC",117:"LIMIT",118:"INTEGER",119:"OFFSET",121:"VALUES",127:"UNDEF",134:"LOAD",143:"TO",144:"CREATE",146:"GRAPH",147:"INSERTDATA",149:"DELETEDATA",150:"DELETEWHERE",159:"DELETE",160:"INSERT",162:"USING",165:"WITH",167:"INTO",168:"DEFAULT",194:"OPTIONAL",195:"MINUS",197:"SERVICE",200:"FILTER",201:"BIND",202:"NIL",220:"a",241:"!",246:"^",248:"[",249:"]",251:"BLANK_NODE_LABEL",252:"ANON",256:"||",260:"&&",264:"IN",279:"-",281:"FUNC_ARITY0",282:"FUNC_ARITY1",283:"FUNC_ARITY2",284:",",285:"IF",287:"BOUND",288:"BNODE",290:"EXISTS",291:"COUNT",294:"FUNC_AGGREGATE",296:"GROUP_CONCAT",300:"LANGTAG",301:"^^",302:"DECIMAL",303:"DOUBLE",304:"true",305:"false",306:"STRING_LITERAL1",307:"STRING_LITERAL2",308:"STRING_LITERAL_LONG1",309:"STRING_LITERAL_LONG2",310:"INTEGER_POSITIVE",311:"DECIMAL_POSITIVE",312:"DOUBLE_POSITIVE",313:"INTEGER_NEGATIVE",314:"DECIMAL_NEGATIVE",315:"DOUBLE_NEGATIVE",316:"PNAME_LN",317:"DISTINCT",319:"Triple",323:"REDUCED",325:"*",328:"NAMED",329:"SILENT",330:"CLEAR",331:"DROP",332:"ADD",333:"MOVE",334:"COPY",335:"ALL",336:".",337:"UNION",339:"|",340:"/",342:"?",343:"+",344:"!=",345:"<",346:">",347:"<=",348:">=",349:"NOT",350:"CONCAT",351:"COALESCE",352:"SUBSTR",353:"REGEX",354:"REPLACE"},
productions_: [0,[3,3],[5,7],[7,6],[20,1],[20,1],[20,1],[20,1],[25,2],[28,3],[24,6],[22,4],[23,5],[40,4],[45,4],[48,6],[21,1],[21,1],[21,1],[21,1],[21,1],[55,3],[4,1],[58,2],[61,2],[64,3],[67,4],[70,4],[68,3],[75,1],[75,5],[78,5],[78,7],[85,5],[90,4],[93,3],[9,2],[10,4],[102,3],[105,1],[105,1],[105,3],[105,5],[105,1],[106,2],[109,3],[112,2],[112,2],[112,1],[112,1],[116,2],[116,2],[116,4],[116,4],[120,2],[122,4],[122,6],[126,1],[126,1],[126,1],[128,3],[130,3],[132,4],[132,3],[132,5],[132,4],[132,2],[132,2],[132,2],[132,6],[132,6],[156,2],[152,2],[161,3],[164,2],[166,3],[142,1],[142,2],[139,2],[139,1],[148,4],[173,7],[178,3],[97,3],[97,3],[182,2],[185,3],[189,3],[186,2],[186,2],[186,2],[186,3],[186,4],[186,2],[186,6],[186,1],[115,1],[115,1],[115,1],[52,2],[52,6],[205,1],[205,4],[80,3],[208,3],[180,2],[180,2],[214,1],[212,2],[217,2],[218,1],[218,1],[218,1],[219,2],[191,2],[191,2],[223,4],[230,1],[230,3],[232,2],[234,2],[237,2],[236,2],[238,1],[238,1],[238,2],[238,3],[242,1],[242,1],[242,4],[243,1],[243,1],[243,2],[243,2],[213,3],[213,3],[224,3],[224,3],[222,1],[222,1],[228,1],[228,1],[211,1],[211,1],[211,1],[211,1],[211,1],[211,1],[76,2],[255,2],[253,2],[259,2],[257,1],[257,3],[257,4],[261,2],[267,2],[267,2],[267,2],[265,2],[275,2],[273,2],[273,2],[273,2],[278,1],[278,1],[278,1],[278,1],[278,1],[278,1],[50,3],[51,1],[51,2],[51,4],[51,6],[51,8],[51,2],[51,4],[51,2],[51,4],[51,3],[280,5],[280,5],[280,6],[299,4],[53,1],[53,2],[53,3],[53,1],[53,1],[53,1],[53,1],[53,1],[53,1],[53,1],[44,1],[44,1],[44,1],[44,1],[269,1],[269,1],[269,1],[271,1],[271,1],[271,1],[26,1],[26,1],[26,1],[8,0],[8,2],[11,0],[11,1],[12,0],[12,1],[13,0],[13,2],[15,0],[15,1],[17,0],[17,2],[18,0],[18,1],[27,0],[27,1],[30,0],[30,2],[33,0],[33,1],[318,1],[318,1],[318,1],[34,0],[34,2],[35,0],[35,1],[37,0],[37,2],[39,1],[39,2],[47,1],[47,2],[320,0],[320,1],[56,1],[56,1],[321,1],[321,1],[57,0],[57,2],[59,1],[59,1],[59,1],[59,1],[60,0],[60,1],[69,0],[69,2],[71,0],[71,1],[322,1],[322,1],[73,0],[73,1],[324,1],[324,2],[74,1],[74,1],[81,0],[81,2],[82,0],[82,2],[84,0],[84,1],[326,1],[326,1],[327,1],[327,2],[87,1],[87,1],[88,0],[88,2],[89,0],[89,1],[92,0],[92,2],[95,0],[95,1],[96,0],[96,1],[98,0],[98,1],[99,0],[99,1],[100,0],[100,1],[101,0],[101,1],[104,1],[104,2],[108,1],[108,2],[111,1],[111,2],[123,0],[123,2],[124,0],[124,2],[125,0],[125,2],[129,0],[129,2],[131,0],[131,4],[133,0],[133,2],[135,0],[135,1],[136,0],[136,1],[137,1],[137,1],[138,0],[138,1],[140,1],[140,1],[140,1],[141,0],[141,1],[145,0],[145,1],[151,0],[151,1],[153,0],[153,1],[154,0],[154,2],[155,0],[155,1],[157,0],[157,1],[158,0],[158,2],[163,0],[163,1],[169,0],[169,1],[170,1],[170,1],[170,1],[171,0],[171,1],[172,0],[172,2],[174,1],[174,1],[175,0],[175,1],[176,0],[176,1],[177,0],[177,1],[179,0],[179,3],[181,0],[181,1],[183,0],[183,1],[184,0],[184,2],[187,0],[187,1],[188,0],[188,1],[190,0],[190,3],[192,0],[192,1],[193,0],[193,3],[196,1],[196,1],[198,0],[198,1],[199,1],[199,1],[203,0],[203,1],[204,0],[204,3],[206,0],[206,3],[207,0],[207,1],[209,0],[209,3],[210,0],[210,1],[215,0],[215,1],[338,1],[338,2],[216,0],[216,3],[221,0],[221,3],[225,0],[225,1],[226,1],[226,1],[227,0],[227,3],[229,0],[229,2],[231,1],[231,1],[233,0],[233,3],[235,0],[235,3],[341,1],[341,1],[341,1],[239,0],[239,1],[240,0],[240,1],[244,0],[244,3],[245,0],[245,1],[247,1],[247,2],[250,1],[250,2],[254,0],[254,2],[258,0],[258,2],[262,1],[262,1],[262,1],[262,1],[262,1],[262,1],[263,0],[263,1],[266,0],[266,2],[268,1],[268,1],[270,0],[270,2],[272,0],[272,2],[274,0],[274,2],[276,1],[276,1],[277,0],[277,1],[286,1],[286,1],[286,1],[286,1],[286,1],[289,0],[289,1],[292,0],[292,1],[293,1],[293,1],[295,0],[295,1],[297,0],[297,1],[298,0],[298,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

      $$[$0-1] = $$[$0-1] || {};
      if (Parser.base)
        $$[$0-1].base = Parser.base;
      Parser.base = base = basePath = baseRoot = '';
      $$[$0-1].prefixes = Parser.prefixes || {};
      Parser.prefixes = null;
      return $$[$0-1];
    
break;
case 2:
this.$ = extend({ type: 'query' }, $$[$0-6], $$[$0-5], $$[$0-4], $$[$0-3], $$[$0-2], $$[$0-1], $$[$0]);
break;
case 3:
this.$ = extend({ queryType: 'TEMPLATE', expression: { type: 'functionCall', function: 'http://ns.inria.fr/sparql-template/concat', args: $$[$0-2] } }, $$[$0-4], $$[$0-1]);
break;
case 8:
this.$ = { name: $$[$0-1], parameters: $$[$0] };
break;
case 9:
this.$ = $$[$0-1].map(toVar);
break;
case 10: case 11: case 14: case 15:
this.$ = {} /* TODO */;
break;
case 12:
this.$ = { type: 'format', pattern: $$[$0-2], args: $$[$0-1].map(unprocessed) };
break;
case 13:
 separator: $$[$0] 
break;
case 20:
this.$ = { type: 'functionCall', function: 'http://ns.inria.fr/sparql-template/process', args: [toVar($$[$0])] };
break;
case 21:

      $$[$0-1] = $$[$0-1] || {};
      if (Parser.base)
        $$[$0-1].base = Parser.base;
      Parser.base = base = basePath = baseRoot = '';
      $$[$0-1].prefixes = Parser.prefixes;
      Parser.prefixes = null;
      return $$[$0-1];
    
break;
case 23:
this.$ = extend($$[$0-1], $$[$0], { type: 'query' });
break;
case 24:

      Parser.base = resolveIRI($$[$0])
      base = basePath = baseRoot = '';
    
break;
case 25:

      if (!Parser.prefixes) Parser.prefixes = {};
      $$[$0-1] = $$[$0-1].substr(0, $$[$0-1].length - 1);
      $$[$0] = resolveIRI($$[$0]);
      Parser.prefixes[$$[$0-1]] = $$[$0];
    
break;
case 26:
this.$ = extend($$[$0-3], groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 27:
this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], { type: 'query' });
break;
case 28:
this.$ = extend({ queryType: 'SELECT', variables: $$[$0] === '*' ? ['*'] : $$[$0] }, $$[$0-1] && ($$[$0-2] = lowercase($$[$0-1]), $$[$0-1] = {}, $$[$0-1][$$[$0-2]] = true, $$[$0-1]));
break;
case 29: case 110: case 142: case 169:
this.$ = toVar($$[$0]);
break;
case 30: case 42:
this.$ = expression($$[$0-3], { variable: toVar($$[$0-1]) });
break;
case 31:
this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-3] }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 32:
this.$ = extend({ queryType: 'CONSTRUCT', template: $$[$0-2] = ($$[$0-2] ? $$[$0-2].triples : []) }, groupDatasets($$[$0-5]), { where: [ { type: 'bgp', triples: appendAllTo([], $$[$0-2]) } ] }, $$[$0]);
break;
case 33:
this.$ = extend({ queryType: 'DESCRIBE', variables: $$[$0-3] === '*' ? ['*'] : $$[$0-3].map(toVar) }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 34:
this.$ = extend({ queryType: 'ASK' }, groupDatasets($$[$0-2]), $$[$0-1], $$[$0]);
break;
case 35: case 73:
this.$ = { iri: $$[$0], named: !!$$[$0-1] };
break;
case 36:
this.$ = { where: $$[$0].patterns };
break;
case 37:
this.$ = extend($$[$0-3], $$[$0-2], $$[$0-1], $$[$0]);
break;
case 38:
this.$ = { group: $$[$0] };
break;
case 39: case 40: case 46: case 48:
this.$ = expression($$[$0]);
break;
case 41:
this.$ = expression($$[$0-1]);
break;
case 43: case 49:
this.$ = expression(toVar($$[$0]));
break;
case 44:
this.$ = { having: $$[$0] };
break;
case 45:
this.$ = { order: $$[$0] };
break;
case 47:
this.$ = expression($$[$0], { descending: true });
break;
case 50:
this.$ = { limit:  toInt($$[$0]) };
break;
case 51:
this.$ = { offset: toInt($$[$0]) };
break;
case 52:
this.$ = { limit: toInt($$[$0-2]), offset: toInt($$[$0]) };
break;
case 53:
this.$ = { limit: toInt($$[$0]), offset: toInt($$[$0-2]) };
break;
case 54:
this.$ = { type: 'values', values: $$[$0] };
break;
case 55:

      $$[$0-3] = toVar($$[$0-3]);
      this.$ = $$[$0-1].map(function(v) { var o = {}; o[$$[$0-3]] = v; return o; })
    
break;
case 56:

      var length = $$[$0-4].length;
      $$[$0-4] = $$[$0-4].map(toVar);
      this.$ = $$[$0-1].map(function (values) {
        if (values.length !== length)
          throw Error('Inconsistent VALUES length');
        var valuesObject = {};
        for(var i = 0; i<length; i++)
          valuesObject[$$[$0-4][i]] = values[i];
        return valuesObject;
      });
    
break;
case 59:
this.$ = undefined;
break;
case 60: case 103: case 126: case 170:
this.$ = $$[$0-1];
break;
case 61:
this.$ = { type: 'update', updates: appendTo($$[$0-2], $$[$0-1]) };
break;
case 62:
this.$ = extend({ type: 'load', silent: !!$$[$0-2], source: $$[$0-1] }, $$[$0] && { destination: $$[$0] });
break;
case 63:
this.$ = { type: lowercase($$[$0-2]), silent: !!$$[$0-1], graph: $$[$0] };
break;
case 64:
this.$ = { type: lowercase($$[$0-4]), silent: !!$$[$0-3], source: $$[$0-2], destination: $$[$0] };
break;
case 65:
this.$ = { type: 'create', silent: !!$$[$0-2], graph: $$[$0-1] };
break;
case 66:
this.$ = { updateType: 'insert',      insert: $$[$0] };
break;
case 67:
this.$ = { updateType: 'delete',      delete: $$[$0] };
break;
case 68:
this.$ = { updateType: 'deletewhere', delete: $$[$0] };
break;
case 69:
this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { insert: $$[$0-4] || [] }, { delete: $$[$0-3] || [] }, groupDatasets($$[$0-2]), { where: $$[$0].patterns });
break;
case 70:
this.$ = extend({ updateType: 'insertdelete' }, $$[$0-5], { delete: $$[$0-4] || [] }, { insert: $$[$0-3] || [] }, groupDatasets($$[$0-2]), { where: $$[$0].patterns });
break;
case 71: case 72: case 75: case 161:
this.$ = $$[$0];
break;
case 74:
this.$ = { graph: $$[$0] };
break;
case 76:
this.$ = { type: 'graph', default: true };
break;
case 77: case 78:
this.$ = { type: 'graph', name: $$[$0] };
break;
case 79:
 this.$ = {}; this.$[lowercase($$[$0])] = true; 
break;
case 80:
this.$ = $$[$0-2] ? unionAll($$[$0-1], [$$[$0-2]]) : unionAll($$[$0-1]);
break;
case 81:

      var graph = extend($$[$0-3] || { triples: [] }, { type: 'graph', name: toVar($$[$0-5]) });
      this.$ = $$[$0] ? [graph, $$[$0]] : [graph];
    
break;
case 82: case 87:
this.$ = { type: 'bgp', triples: unionAll($$[$0-2], [$$[$0-1]]) };
break;
case 83:
this.$ = { type: 'group', patterns: [ $$[$0-1] ] };
break;
case 84:
this.$ = { type: 'group', patterns: $$[$0-1] };
break;
case 85:
this.$ = $$[$0-1] ? unionAll([$$[$0-1]], $$[$0]) : unionAll($$[$0]);
break;
case 86:
this.$ = $$[$0] ? [$$[$0-2], $$[$0]] : $$[$0-2];
break;
case 88:

      if ($$[$0-1].length)
        this.$ = { type: 'union', patterns: unionAll($$[$0-1].map(degroupSingle), [degroupSingle($$[$0])]) };
      else
        this.$ = $$[$0];
    
break;
case 89:
this.$ = extend($$[$0], { type: 'optional' });
break;
case 90:
this.$ = extend($$[$0], { type: 'minus' });
break;
case 91:
this.$ = extend($$[$0], { type: 'graph', name: toVar($$[$0-1]) });
break;
case 92:
this.$ = extend($$[$0], { type: 'service', name: toVar($$[$0-1]), silent: !!$$[$0-2] });
break;
case 93:
this.$ = { type: 'filter', expression: $$[$0] };
break;
case 94:
this.$ = { type: 'bind', variable: toVar($$[$0-1]), expression: $$[$0-3] };
break;
case 99:
this.$ = { type: 'functionCall', function: $$[$0-1], args: [] };
break;
case 100:
this.$ = { type: 'functionCall', function: $$[$0-5], args: appendTo($$[$0-2], $$[$0-1]), distinct: !!$$[$0-3] };
break;
case 101: case 117: case 128: case 208: case 214: case 218: case 224: case 231: case 235: case 247: case 255: case 267: case 269: case 279: case 283: case 303: case 305: case 307: case 309: case 311: case 334: case 340: case 351: case 361: case 367: case 373: case 377: case 387: case 389: case 393: case 401: case 403: case 409: case 411: case 415: case 417: case 426: case 434: case 436: case 446: case 450: case 452: case 454:
this.$ = [];
break;
case 102:
this.$ = appendTo($$[$0-2], $$[$0-1]);
break;
case 104:
this.$ = unionAll($$[$0-2], [$$[$0-1]]);
break;
case 105: case 114:
this.$ = $$[$0].map(function (t) { return extend(triple($$[$0-1]), t); });
break;
case 106:
this.$ = appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
break;
case 108:
this.$ = unionAll($$[$0-1], [$$[$0]]);
break;
case 109:
this.$ = objectListToTriples($$[$0-1], $$[$0]);
break;
case 112: case 124: case 131:
this.$ = RDF_TYPE;
break;
case 113:
this.$ = appendTo($$[$0-1], $$[$0]);
break;
case 115:
this.$ = !$$[$0] ? $$[$0-1].triples : appendAllTo($$[$0].map(function (t) { return extend(triple($$[$0-1].entity), t); }), $$[$0-1].triples) /* the subject is a blank node, possibly with more triples */;
break;
case 116:
this.$ = objectListToTriples(toVar($$[$0-3]), appendTo($$[$0-2], $$[$0-1]), $$[$0]);
break;
case 118:
this.$ = objectListToTriples(toVar($$[$0-1]), $$[$0]);
break;
case 119:
this.$ = $$[$0-1].length ? path('|',appendTo($$[$0-1], $$[$0])) : $$[$0];
break;
case 120:
this.$ = $$[$0-1].length ? path('/', appendTo($$[$0-1], $$[$0])) : $$[$0];
break;
case 121:
this.$ = $$[$0] ? path($$[$0], [$$[$0-1]]) : $$[$0-1];
break;
case 122:
this.$ = $$[$0-1] ? path($$[$0-1], [$$[$0]]) : $$[$0];;
break;
case 125: case 132:
this.$ = path($$[$0-1], [$$[$0]]);
break;
case 129:
this.$ = path('|', appendTo($$[$0-2], $$[$0-1]));
break;
case 133:
this.$ = path($$[$0-1], [RDF_TYPE]);
break;
case 134: case 136:
this.$ = createList($$[$0-1]);
break;
case 135: case 137:
this.$ = createAnonymousObject($$[$0-1]);
break;
case 138:
this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNode */;
break;
case 140:
this.$ = { entity: $$[$0], triples: [] } /* for consistency with TriplesNodePath */;
break;
case 146:
this.$ = blank();
break;
case 147:
this.$ = RDF_NIL;
break;
case 148: case 150: case 155: case 159:
this.$ = createOperationTree($$[$0-1], $$[$0]);
break;
case 149:
this.$ = ['||', $$[$0]];
break;
case 151:
this.$ = ['&&', $$[$0]];
break;
case 153:
this.$ = operation($$[$0-1], [$$[$0-2], $$[$0]]);
break;
case 154:
this.$ = operation($$[$0-2] ? 'notin' : 'in', [$$[$0-3], $$[$0]]);
break;
case 156: case 160:
this.$ = [$$[$0-1], $$[$0]];
break;
case 157:
this.$ = ['+', createOperationTree($$[$0-1], $$[$0])];
break;
case 158:
this.$ = ['-', createOperationTree($$[$0-1].replace('-', ''), $$[$0])];
break;
case 162:
this.$ = operation($$[$0-1], [$$[$0]]);
break;
case 163:
this.$ = operation('UMINUS', [$$[$0]]);
break;
case 172:
this.$ = operation(lowercase($$[$0-1]));
break;
case 173:
this.$ = operation(lowercase($$[$0-3]), [$$[$0-1]]);
break;
case 174:
this.$ = operation(lowercase($$[$0-5]), [$$[$0-3], $$[$0-1]]);
break;
case 175:
this.$ = operation(lowercase($$[$0-7]), [$$[$0-5], $$[$0-3], $$[$0-1]]);
break;
case 176:
this.$ = operation(lowercase($$[$0-1]), $$[$0]);
break;
case 177:
this.$ = operation('bound', [toVar($$[$0-1])]);
break;
case 178:
this.$ = operation($$[$0-1], []);
break;
case 179:
this.$ = operation($$[$0-3], [$$[$0-1]]);
break;
case 180:
this.$ = operation($$[$0-2] ? 'notexists' :'exists', [degroupSingle($$[$0])]);
break;
case 181: case 182:
this.$ = expression($$[$0-1], { type: 'aggregate', aggregation: lowercase($$[$0-4]), distinct: !!$$[$0-2] });
break;
case 183:
this.$ = expression($$[$0-2], { type: 'aggregate', aggregation: lowercase($$[$0-5]), distinct: !!$$[$0-3], separator: $$[$0-1] || ' ' });
break;
case 184:
this.$ = $$[$0].substr(1, $$[$0].length - 2);
break;
case 186:
this.$ = $$[$0-1] + lowercase($$[$0]);
break;
case 187:
this.$ = $$[$0-2] + '^^' + $$[$0];
break;
case 188: case 202:
this.$ = createLiteral($$[$0], XSD_INTEGER);
break;
case 189: case 203:
this.$ = createLiteral($$[$0], XSD_DECIMAL);
break;
case 190: case 204:
this.$ = createLiteral(lowercase($$[$0]), XSD_DOUBLE);
break;
case 193:
this.$ = XSD_TRUE;
break;
case 194:
this.$ = XSD_FALSE;
break;
case 195: case 196:
this.$ = unescapeString($$[$0], 1);
break;
case 197: case 198:
this.$ = unescapeString($$[$0], 3);
break;
case 199:
this.$ = createLiteral($$[$0].substr(1), XSD_INTEGER);
break;
case 200:
this.$ = createLiteral($$[$0].substr(1), XSD_DECIMAL);
break;
case 201:
this.$ = createLiteral($$[$0].substr(1).toLowerCase(), XSD_DOUBLE);
break;
case 205:
this.$ = resolveIRI($$[$0]);
break;
case 206:

      var namePos = $$[$0].indexOf(':'),
          prefix = $$[$0].substr(0, namePos),
          expansion = Parser.prefixes[prefix];
      if (!expansion) throw new Error('Unknown prefix: ' + prefix);
      this.$ = resolveIRI(expansion + $$[$0].substr(namePos + 1));
    
break;
case 207:

      $$[$0] = $$[$0].substr(0, $$[$0].length - 1);
      if (!($$[$0] in Parser.prefixes)) throw new Error('Unknown prefix: ' + $$[$0]);
      this.$ = resolveIRI(Parser.prefixes[$$[$0]]);
    
break;
case 209: case 215: case 219: case 225: case 232: case 236: case 238: case 240: case 248: case 256: case 264: case 268: case 270: case 276: case 280: case 284: case 298: case 300: case 302: case 304: case 306: case 308: case 310: case 335: case 341: case 352: case 368: case 400: case 412: case 431: case 433: case 435: case 437: case 447: case 451: case 453: case 455:
$$[$0-1].push($$[$0]);
break;
case 237: case 239: case 263: case 275: case 297: case 299: case 301: case 399: case 430: case 432:
this.$ = [$$[$0]];
break;
case 312:
$$[$0-3].push($$[$0-2]);
break;
case 362: case 374: case 378: case 388: case 390: case 394: case 402: case 404: case 410: case 416: case 418: case 427:
$$[$0-2].push($$[$0-1]);
break;
}
},
table: [o($V0,[2,247],{3:1,4:2,57:3}),{1:[3]},{5:4,7:5,14:[1,6]},o([6,14,72,79,86,91,134,144,147,149,150,159,160,165,330,331,332,333,334],[2,22],{321:7,61:8,64:9,62:[1,10],65:[1,11]}),{6:[1,12]},o($V1,[2,208],{8:13}),{15:14,16:[2,216],25:15,26:16,63:$V2,66:$V3,316:$V4},o($V0,[2,248]),o($V0,[2,245]),o($V0,[2,246]),{63:[1,20]},{66:[1,21]},{1:[2,1]},{9:22,16:$V5,83:$V6,93:23,94:[1,25],96:24},{16:[1,27]},{16:[2,217]},{16:[2,222],27:28,28:29,29:$V7},o($V8,[2,205]),o($V8,[2,206]),o($V8,[2,207]),o($V0,[2,24]),{63:[1,31]},o($V9,$Va,{10:32,98:33,102:34,32:$Vb}),o($V1,[2,209]),{16:$Vc,97:36},o($Vd,[2,285],{95:38,328:[1,39]}),{16:[2,288]},o($Ve,[2,218],{17:40}),{16:[2,8]},{16:[2,223]},o($Vf,[2,224],{30:41}),o($V0,[2,25]),o($Vg,[2,210],{11:42,120:43,121:$Vh}),o($Vi,[2,291],{99:45,106:46,107:[1,47]}),o($V9,[2,290]),{103:[1,48]},o([6,19,32,46,49,107,110,117,119,121],[2,36]),o($Vj,$Vk,{70:49,182:50,68:51,183:52,189:54,190:55,16:$Vl,19:$Vl,121:$Vl,146:$Vl,194:$Vl,195:$Vl,197:$Vl,200:$Vl,201:$Vl,72:[1,53]}),{26:56,63:$V2,66:$V3,316:$V4},o($Vd,[2,286]),{18:57,19:[2,220],20:58,21:60,22:61,23:62,24:63,26:83,29:$Vm,32:$Vn,36:$Vo,38:$Vp,40:59,41:$Vq,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{31:[1,111],54:[1,112]},o($VX,[2,212],{12:113,45:114,46:[1,115]}),o($Vg,[2,211]),{29:[1,118],54:[1,117],122:116},o($VY,[2,293],{100:119,109:120,110:[1,121]}),o($Vi,[2,292]),{26:83,29:$Vm,50:124,51:125,52:126,63:$V2,66:$V3,108:122,115:123,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{26:83,29:$VZ,51:129,52:130,54:$V_,63:$V2,66:$V3,104:127,105:128,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{19:[1,133]},{19:[1,134]},{9:135,16:$V5,83:$V6,96:24},o($V$,[2,367],{184:136}),o($V01,[2,261],{73:137,322:138,317:[1,139],323:[1,140]}),o($V$,[2,366]),{26:145,29:$V11,44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,191:141,202:$V31,211:142,224:143,248:$V41,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o([6,16,32,83,94,107,110,117,119,121],[2,35]),{19:[1,152]},o($Ve,[2,219]),{19:[2,221]},o($Ve,[2,4]),o($Ve,[2,5]),o($Ve,[2,6]),o($Ve,[2,7]),{42:[1,153]},o($Ve,[2,16]),o($Ve,[2,17]),o($Ve,[2,18]),o($Ve,[2,19]),o($Ve,[2,20]),{16:[1,154]},{16:[1,155]},{16:[2,226],33:156,317:[1,157]},o($V71,$V81,{76:158,253:159,257:160,261:161,265:162,273:163,277:164,241:$V91,279:$Va1,343:$Vb1}),o($Vc1,[2,171]),{202:[1,168]},{29:[1,169]},{29:[1,170]},{29:[1,171]},{29:$Vd1,202:$Ve1,205:172},{29:[1,175]},{29:[1,177],202:[1,176]},{290:[1,178]},{29:$Vf1,202:$Vg1},o($Vh1,[2,185],{300:[1,181],301:[1,182]}),o($Vh1,[2,188]),o($Vh1,[2,189]),o($Vh1,[2,190]),o($Vh1,[2,191]),o($Vh1,[2,192]),o($Vh1,[2,193]),o($Vh1,[2,194]),{29:[1,183]},{29:[1,184]},{29:[1,185]},o($Vi1,[2,460]),o($Vi1,[2,461]),o($Vi1,[2,462]),o($Vi1,[2,463]),o($Vi1,[2,464]),{290:[2,466]},o($Vj1,[2,195]),o($Vj1,[2,196]),o($Vj1,[2,197]),o($Vj1,[2,198]),o($Vh1,[2,199]),o($Vh1,[2,200]),o($Vh1,[2,201]),o($Vh1,[2,202]),o($Vh1,[2,203]),o($Vh1,[2,204]),{16:[2,9]},o($Vf,[2,225]),o($VX,[2,214],{13:186}),o($VX,[2,213]),{16:[1,187]},o($Vk1,[2,54]),{16:[1,188]},o($Vf,[2,305],{124:189}),o($Vl1,[2,295],{101:190,116:191,117:[1,192],119:[1,193]}),o($VY,[2,294]),{103:[1,194]},o($Vi,[2,44],{280:74,286:79,289:82,26:83,50:124,51:125,52:126,115:195,29:$Vm,63:$V2,66:$V3,281:$Vt,282:$Vu,283:$Vv,285:$Vw,287:$Vx,288:$Vy,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW}),o($Vm1,[2,299]),o($Vn1,[2,96]),o($Vn1,[2,97]),o($Vn1,[2,98]),o($V9,[2,38],{280:74,286:79,289:82,26:83,51:129,52:130,105:196,29:$VZ,54:$V_,63:$V2,66:$V3,281:$Vt,282:$Vu,283:$Vv,285:$Vw,287:$Vx,288:$Vy,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW}),o($Vo1,[2,297]),o($Vo1,[2,39]),o($Vo1,[2,40]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:197,241:$V91,279:$Va1,343:$Vb1}),o($Vo1,[2,43]),o($Vp1,[2,83]),o($Vp1,[2,84]),o($V9,$Va,{98:33,102:34,10:198,32:$Vb}),{16:[2,377],19:[2,85],120:208,121:$Vh,146:[1,204],185:199,186:200,193:201,194:[1,202],195:[1,203],197:[1,205],200:[1,206],201:[1,207]},{29:$Vq1,54:$Vr1,74:209,75:212,324:210,325:[1,211]},o($V01,[2,262]),o($V01,[2,259]),o($V01,[2,260]),o($V$,[2,375],{192:215,336:[1,216]}),o($Vs1,$Vt1,{223:217,226:218,232:219,233:221,54:$Vu1}),o($Vv1,[2,405],{226:218,232:219,233:221,225:222,223:223,29:$Vt1,63:$Vt1,66:$Vt1,220:$Vt1,241:$Vt1,246:$Vt1,316:$Vt1,54:$Vu1}),o($Vw1,[2,142]),o($Vw1,[2,143]),o($Vw1,[2,144]),o($Vw1,[2,145]),o($Vw1,[2,146]),o($Vw1,[2,147]),{26:145,29:$V11,44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,202:$V31,211:226,224:227,228:225,248:$V41,250:224,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o($Vs1,$Vt1,{226:218,232:219,233:221,223:228,54:$Vu1}),o($V1,[2,3]),{43:[1,229]},o($Vx1,[2,235],{37:230}),{21:231,26:83,29:$Vm,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{16:[1,232]},{16:[2,227]},{31:[1,233]},o($Vy1,[2,434],{254:234}),o($Vz1,[2,436],{258:235}),o($Vz1,[2,152],{262:236,263:237,43:[1,238],264:[2,444],344:[1,239],345:[1,240],346:[1,241],347:[1,242],348:[1,243],349:[1,244]}),o($VA1,[2,446],{266:245}),o($VB1,[2,454],{274:246}),{26:250,29:$Vm,44:84,50:248,51:249,52:251,53:252,54:$VC1,63:$V2,66:$V3,118:$Vs,269:88,271:89,278:247,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{26:250,29:$Vm,44:84,50:248,51:249,52:251,53:252,54:$VC1,63:$V2,66:$V3,118:$Vs,269:88,271:89,278:254,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{26:250,29:$Vm,44:84,50:248,51:249,52:251,53:252,54:$VC1,63:$V2,66:$V3,118:$Vs,269:88,271:89,278:255,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},o($V71,[2,459]),o($Vc1,[2,172]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:256,241:$V91,279:$Va1,343:$Vb1}),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:257,241:$V91,279:$Va1,343:$Vb1}),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:258,241:$V91,279:$Va1,343:$Vb1}),o($Vc1,[2,176]),o($Vc1,[2,101]),o($VD1,[2,389],{206:259}),{54:[1,260]},o($Vc1,[2,178]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:261,241:$V91,279:$Va1,343:$Vb1}),{16:$Vc,97:262},o($Vc1,[2,99]),o($VD1,[2,385],{203:263,317:[1,264]}),o($Vh1,[2,186]),{26:265,63:$V2,66:$V3,316:$V4},o($VE1,[2,467],{292:266,317:[1,267]}),o($VD1,[2,471],{295:268,317:[1,269]}),o($VD1,[2,473],{297:270,317:[1,271]}),{6:[2,2],48:272,49:[1,273]},{47:274,319:[1,275]},o($VF1,[2,303],{123:276}),{31:[1,277],54:[1,278]},o($Vl1,[2,37]),o($Vl1,[2,296]),{118:[1,279]},{118:[1,280]},{26:83,29:$Vm,50:124,51:125,52:126,54:$VG1,63:$V2,66:$V3,111:281,112:282,113:$VH1,114:$VI1,115:285,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},o($Vm1,[2,300]),o($Vo1,[2,298]),{31:[1,287],77:[1,288]},{19:[2,257],71:289,120:290,121:$Vh},o($V$,[2,368]),o($VJ1,[2,369],{187:291,336:[1,292]}),{16:$Vc,97:293},{16:$Vc,97:294},{16:$Vc,97:295},{26:298,54:[1,297],63:$V2,66:$V3,196:296,316:$V4},o($VK1,[2,381],{198:299,329:[1,300]}),{26:83,29:$Vm,50:124,51:125,52:126,63:$V2,66:$V3,115:301,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{29:[1,302]},o($VL1,[2,95]),o($V1,[2,28]),o($V1,[2,265],{75:303,29:$Vq1,54:$Vr1}),o($V1,[2,266]),o($VM1,[2,263]),o($VM1,[2,29]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:304,241:$V91,279:$Va1,343:$Vb1}),o($V$,[2,87]),o($Vj,[2,374],{16:$VN1,19:$VN1,121:$VN1,146:$VN1,194:$VN1,195:$VN1,197:$VN1,200:$VN1,201:$VN1}),o($Vv1,[2,114]),o($Vj,[2,409],{227:305}),o($Vj,[2,407]),o($Vj,[2,408]),o($Vs1,[2,417],{234:306,235:307}),o($Vv1,[2,115]),o($Vv1,[2,406]),{26:145,29:$V11,31:[1,308],44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,202:$V31,211:226,224:227,228:309,248:$V41,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o($VO1,[2,432]),o($VP1,[2,140]),o($VP1,[2,141]),{249:[1,310]},{44:311,306:$VH,307:$VI,308:$VJ,309:$VK},{19:[1,312],20:313,21:60,22:61,23:62,24:63,26:83,29:$Vm,32:$Vn,36:$Vo,38:$Vp,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},{20:315,21:60,22:61,23:62,24:63,26:83,29:$Vm,32:$Vn,36:$Vo,38:$Vp,39:314,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},o($VQ1,[2,231],{34:316}),o([6,16,19,29,31,32,36,38,41,43,46,49,54,63,66,77,110,113,114,117,118,119,121,146,194,195,197,200,201,202,248,251,252,256,260,264,279,281,282,283,284,285,287,288,290,291,294,296,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,325,336,340,343,344,345,346,347,348,349,350,351,352,353,354],[2,170]),o([31,41,77,284],[2,148],{255:317,256:[1,318]}),o($Vy1,[2,150],{259:319,260:[1,320]}),o($V71,$V81,{265:162,273:163,277:164,261:321,241:$V91,279:$Va1,343:$Vb1}),{264:[1,322]},o($VD1,[2,438]),o($VD1,[2,439]),o($VD1,[2,440]),o($VD1,[2,441]),o($VD1,[2,442]),o($VD1,[2,443]),{264:[2,445]},o([31,41,43,77,256,260,264,284,344,345,346,347,348,349],[2,155],{267:323,268:324,269:325,271:326,279:[1,328],310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,343:[1,327]}),o($VA1,[2,159],{275:329,276:330,325:$VR1,340:$VS1}),o($VB1,[2,161]),o($VB1,[2,164]),o($VB1,[2,165]),o($VB1,[2,166],{29:$Vf1,202:$Vg1}),o($VB1,[2,167]),o($VB1,[2,168]),o($VB1,[2,169]),o($VB1,[2,162]),o($VB1,[2,163]),{31:[1,333]},{284:[1,334]},{284:[1,335]},o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:336,241:$V91,279:$Va1,343:$Vb1}),{31:[1,337]},{31:[1,338]},o($Vc1,[2,180]),o($VD1,[2,387],{204:339}),o($VD1,[2,386]),o($Vh1,[2,187]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,293:340,76:342,241:$V91,279:$Va1,325:[1,341],343:$Vb1}),o($VE1,[2,468]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:343,241:$V91,279:$Va1,343:$Vb1}),o($VD1,[2,472]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:344,241:$V91,279:$Va1,343:$Vb1}),o($VD1,[2,474]),o($VX,[2,215]),{26:345,63:$V2,66:$V3,316:$V4},{19:[1,346],319:[1,347]},o($VT1,[2,239]),{19:[1,348],26:350,44:84,53:351,63:$V2,66:$V3,118:$Vs,126:349,127:$VU1,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},{16:[1,353]},o($Vf,[2,306]),o($Vl1,[2,50],{119:[1,354]}),o($Vl1,[2,51],{117:[1,355]}),o($VY,[2,45],{280:74,286:79,289:82,26:83,50:124,51:125,52:126,115:285,112:356,29:$Vm,54:$VG1,63:$V2,66:$V3,113:$VH1,114:$VI1,281:$Vt,282:$Vu,283:$Vv,285:$Vw,287:$Vx,288:$Vy,290:$Vz,291:$VA,294:$VB,296:$VC,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW}),o($VV1,[2,301]),{29:$Vm,50:357},{29:$Vm,50:358},o($VV1,[2,48]),o($VV1,[2,49]),o($Vo1,[2,41]),{54:[1,359]},{19:[2,27]},{19:[2,258]},o($Vj,$Vk,{190:55,188:360,189:361,16:$VW1,19:$VW1,121:$VW1,146:$VW1,194:$VW1,195:$VW1,197:$VW1,200:$VW1,201:$VW1}),o($VJ1,[2,370]),o($VL1,[2,88],{337:[1,362]}),o($VL1,[2,89]),o($VL1,[2,90]),{16:$Vc,97:363},{16:[2,379]},{16:[2,380]},{26:366,54:[1,365],63:$V2,66:$V3,199:364,316:$V4},o($VK1,[2,382]),o($VL1,[2,93]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:367,241:$V91,279:$Va1,343:$Vb1}),o($VM1,[2,264]),{77:[1,368]},{26:145,29:$V11,44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,202:$V31,211:226,224:227,228:369,248:$V41,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o($VO1,[2,119],{339:[1,370]}),o($VX1,[2,424],{236:371,240:372,246:[1,373]}),o($Vw1,[2,136]),o($VO1,[2,433]),o($Vw1,[2,137]),{19:[2,13]},o($Ve,[2,11]),o($Vx1,[2,236]),{19:[1,374],20:375,21:60,22:61,23:62,24:63,26:83,29:$Vm,32:$Vn,36:$Vo,38:$Vp,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},o($Vx1,[2,237]),{19:[2,233],21:379,22:380,23:381,26:83,29:$Vm,35:376,36:$Vo,38:$Vp,40:378,41:$Vq,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,318:377,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},o($Vy1,[2,435]),o($V71,$V81,{257:160,261:161,265:162,273:163,277:164,253:382,241:$V91,279:$Va1,343:$Vb1}),o($Vz1,[2,437]),o($V71,$V81,{261:161,265:162,273:163,277:164,257:383,241:$V91,279:$Va1,343:$Vb1}),o($Vz1,[2,153]),{29:$Vd1,202:$Ve1,205:384},o($VA1,[2,447]),o($V71,$V81,{273:163,277:164,265:385,241:$V91,279:$Va1,343:$Vb1}),o($VB1,[2,450],{270:386}),o($VB1,[2,452],{272:387}),o($VD1,[2,448]),o($VD1,[2,449]),o($VB1,[2,455]),o($V71,$V81,{277:164,273:388,241:$V91,279:$Va1,343:$Vb1}),o($VD1,[2,456]),o($VD1,[2,457]),o($Vc1,[2,173]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:389,241:$V91,279:$Va1,343:$Vb1}),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:390,241:$V91,279:$Va1,343:$Vb1}),{31:[1,391],284:[1,392]},o($Vc1,[2,177]),o($Vc1,[2,179]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:393,241:$V91,279:$Va1,343:$Vb1}),{31:[1,394]},{31:[2,469]},{31:[2,470]},{31:[1,395]},{31:[2,475],41:[1,398],298:396,299:397},{28:399,29:$V7},o($VX,[2,14]),o($VT1,[2,240]),o($Vk1,[2,55]),o($VF1,[2,304]),o($VY1,[2,57]),o($VY1,[2,58]),o($VY1,[2,59]),o($VZ1,[2,307],{125:400}),{118:[1,401]},{118:[1,402]},o($VV1,[2,302]),o($VV1,[2,46]),o($VV1,[2,47]),{31:[1,403]},o($V$,[2,86]),o($V$,[2,372]),{16:[2,378]},o($VL1,[2,91]),{16:$Vc,97:404},{16:[2,383]},{16:[2,384]},{77:[1,405]},{54:[1,406]},o($V_1,[2,411],{229:407,284:[1,408]}),o($Vs1,[2,416]),o([29,31,54,63,66,118,202,248,251,252,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,339],[2,120],{340:[1,409]}),{26:412,29:[1,415],63:$V2,66:$V3,220:[1,413],237:410,238:411,241:[1,414],316:$V4},o($VX1,[2,425]),o($Ve,[2,12]),o($Vx1,[2,238]),{19:[1,416]},o($VQ1,[2,232]),{19:[2,234]},o($VQ1,[2,228]),o($VQ1,[2,229]),o($VQ1,[2,230]),o($Vy1,[2,149]),o($Vz1,[2,151]),o($Vz1,[2,154]),o($VA1,[2,156]),o($VA1,[2,157],{276:330,275:417,325:$VR1,340:$VS1}),o($VA1,[2,158],{276:330,275:418,325:$VR1,340:$VS1}),o($VB1,[2,160]),{31:[1,419]},{284:[1,420]},o($Vc1,[2,102]),o($VD1,[2,390]),{31:[1,421],284:[1,422]},o($Vc1,[2,181]),o($Vc1,[2,182]),{31:[1,423]},{31:[2,476]},{42:[1,424]},{16:[1,425]},{19:[1,426],29:[1,428],128:427},o($Vl1,[2,52]),o($Vl1,[2,53]),o($Vo1,[2,42]),o($VL1,[2,92]),{54:[1,429]},{31:[1,430]},o([16,19,121,146,194,195,197,200,201,249,336],[2,116],{230:431,41:[1,432]}),o($Vj,[2,410]),o($Vs1,[2,418]),o($V$1,[2,122]),o($V$1,[2,422],{239:433,341:434,325:[1,436],342:[1,435],343:[1,437]}),o($V02,[2,123]),o($V02,[2,124]),{26:442,29:[1,441],63:$V2,66:$V3,202:[1,440],220:$V12,242:438,243:439,246:$V22,316:$V4},o($Vs1,$Vt1,{233:221,232:445}),o($Ve,[2,10]),o($VB1,[2,451]),o($VB1,[2,453]),o($Vc1,[2,174]),o($V71,$V81,{253:159,257:160,261:161,265:162,273:163,277:164,76:446,241:$V91,279:$Va1,343:$Vb1}),o($Vc1,[2,100]),o($VD1,[2,388]),o($Vc1,[2,183]),{43:[1,447]},{21:448,26:83,29:$Vm,44:84,50:65,51:66,52:67,53:68,54:$Vr,63:$V2,66:$V3,118:$Vs,269:88,271:89,280:74,281:$Vt,282:$Vu,283:$Vv,285:$Vw,286:79,287:$Vx,288:$Vy,289:82,290:$Vz,291:$VA,294:$VB,296:$VC,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4,349:$VR,350:$VS,351:$VT,352:$VU,353:$VV,354:$VW},o($Vk1,[2,56]),o($VZ1,[2,308]),o($V32,[2,309],{129:449}),{31:[1,450]},o($VM1,[2,30]),o($V_1,[2,412]),o($V_1,[2,117],{233:221,231:451,232:452,29:$Vt1,63:$Vt1,66:$Vt1,220:$Vt1,241:$Vt1,246:$Vt1,316:$Vt1,54:[1,453]}),o($V$1,[2,121]),o($V$1,[2,423]),o($V$1,[2,419]),o($V$1,[2,420]),o($V$1,[2,421]),o($V02,[2,125]),o($V02,[2,127]),o($V02,[2,128]),o($V42,[2,426],{244:454}),o($V02,[2,130]),o($V02,[2,131]),{26:455,63:$V2,66:$V3,220:[1,456],316:$V4},{31:[1,457]},{31:[1,458]},{44:459,306:$VH,307:$VI,308:$VJ,309:$VK},{19:[1,460]},{26:350,31:[1,461],44:84,53:351,63:$V2,66:$V3,118:$Vs,126:462,127:$VU1,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o($VL1,[2,94]),o($Vj,$V52,{219:463,221:464}),o($Vj,[2,413]),o($Vj,[2,414]),{26:442,31:[2,428],63:$V2,66:$V3,220:$V12,243:466,245:465,246:$V22,316:$V4},o($V02,[2,132]),o($V02,[2,133]),o($V02,[2,126]),o($Vc1,[2,175]),{31:[2,184]},o($VX,[2,15]),o($VZ1,[2,60]),o($V32,[2,310]),o($V_1,[2,118]),{26:145,29:$V62,44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,202:$V31,211:468,213:469,222:467,248:$V72,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},{31:[1,472]},{31:[2,429],339:[1,473]},o($V_1,[2,113],{284:[1,474]}),o($VP1,[2,138]),o($VP1,[2,139]),{26:145,29:$V62,44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,202:$V31,211:468,213:469,222:476,247:475,248:$V72,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o($V82,[2,401],{212:477,216:478}),o($V02,[2,129]),o($V42,[2,427]),o($Vj,[2,404]),{26:145,29:$V62,31:[1,479],44:84,53:146,54:$V21,63:$V2,66:$V3,118:$Vs,202:$V31,211:468,213:469,222:480,248:$V72,251:$V51,252:$V61,269:88,271:89,302:$VD,303:$VE,304:$VF,305:$VG,306:$VH,307:$VI,308:$VJ,309:$VK,310:$VL,311:$VM,312:$VN,313:$VO,314:$VP,315:$VQ,316:$V4},o($VO1,[2,430]),{249:[1,481]},{26:485,54:[1,484],63:$V2,66:$V3,217:482,218:483,220:[1,486],316:$V4},o($V92,[2,134]),o($VO1,[2,431]),o($V92,[2,135]),o([19,146,249,336],[2,108],{338:487,41:[1,488]}),o($Vj,$V52,{221:464,219:489}),o($Vj,[2,110]),o($Vj,[2,111]),o($Vj,[2,112]),o($V82,[2,402],{41:[1,490]}),o($Va2,[2,399]),o([19,41,146,249,336],[2,109]),o($Va2,[2,400])],
defaultActions: {12:[2,1],15:[2,217],26:[2,288],28:[2,8],29:[2,223],59:[2,221],100:[2,466],111:[2,9],157:[2,227],244:[2,445],289:[2,27],290:[2,258],297:[2,379],298:[2,380],311:[2,13],341:[2,469],342:[2,470],362:[2,378],365:[2,383],366:[2,384],378:[2,234],397:[2,476],459:[2,184]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

  /*
    STTL parser in the Jison parser generator format.
	Derived from: https://github.com/RubenVerborgh/SPARQL.js
  */

  // Common namespaces and entities
  var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      RDF_TYPE  = RDF + 'type',
      RDF_FIRST = RDF + 'first',
      RDF_REST  = RDF + 'rest',
      RDF_NIL   = RDF + 'nil',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean',
      XSD_TRUE =  '"true"^^'  + XSD_BOOLEAN,
      XSD_FALSE = '"false"^^' + XSD_BOOLEAN;

  var base = '', basePath = '', baseRoot = '';

  // Returns a lowercase version of the given string
  function lowercase(string) {
    return string.toLowerCase();
  }

  // Appends the item to the array and returns the array
  function appendTo(array, item) {
    return array.push(item), array;
  }

  // Appends the items to the array and returns the array
  function appendAllTo(array, items) {
    return array.push.apply(array, items), array;
  }

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (var name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    var union = [];
    for (var i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // Resolves an IRI against a base path
  function resolveIRI(iri) {
    // Strip off possible angular brackets
    if (iri[0] === '<')
      iri = iri.substring(1, iri.length - 1);
    // Return absolute IRIs unmodified
    if (/^[a-z]+:/.test(iri))
      return iri;
    if (!Parser.base)
      throw new Error('Cannot resolve relative IRI ' + iri + ' because no base IRI was set.');
    if (!base) {
      base = Parser.base;
      basePath = base.replace(/[^\/:]*$/, '');
      baseRoot = base.match(/^(?:[a-z]+:\/*)?[^\/]*/)[0];
    }
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined:
      return base;
    // Resolve relative fragment IRIs against the base IRI
    case '#':
      return base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?':
      return base.replace(/(?:\?.*)?$/, iri);
    // Resolve root relative IRIs at the root of the base IRI
    case '/':
      return baseRoot + iri;
    // Resolve all other IRIs at the base IRI's path
    default:
      return basePath + iri;
    }
  }

  // If the item is a variable, ensures it starts with a question mark
  function toVar(variable) {
    if (variable) {
      var first = variable[0];
      if (first === '?') return variable;
      if (first === '$') return '?' + variable.substr(1);
    }
    return variable;
  }

  // Creates an operation with the given name and arguments
  function operation(operatorName, args) {
    return { type: 'operation', operator: operatorName, args: args || [] };
  }

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    var expression = { expression: expr };
    if (attr)
      for (var a in attr)
        expression[a] = attr[a];
    return expression;
  }

  // Creates a path with the given type and items
  function path(type, items) {
    return { type: 'path', pathType: type, items: items };
  }

  // Transforms a list of operations types and arguments into a tree of operations
  function createOperationTree(initialExpression, operationList) {
    for (var i = 0, l = operationList.length, item; i < l && (item = operationList[i]); i++)
      initialExpression = operation(item[0], [initialExpression, item[1]]);
    return initialExpression;
  }

  // Group datasets by default and named
  function groupDatasets(fromClauses) {
    var defaults = [], named = [], l = fromClauses.length, fromClause;
    for (var i = 0; i < l && (fromClause = fromClauses[i]); i++)
      (fromClause.named ? named : defaults).push(fromClause.iri);
    return l ? { from: { default: defaults, named: named } } : null;
  }

  // Converts the number to a string
  function toInt(string) {
    return parseInt(string, 10);
  }

  // Transforms a possibly single group into its patterns
  function degroupSingle(group) {
    return group.type === 'group' && group.patterns.length === 1 ? group.patterns[0] : group;
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return '"' + value + '"^^' + type;
  }

  // Creates a triple with the given subject, predicate, and object
  function triple(subject, predicate, object) {
    var triple = {};
    if (subject   != null) triple.subject   = subject;
    if (predicate != null) triple.predicate = predicate;
    if (object    != null) triple.object    = object;
    return triple;
  }

  // Creates a new blank node identifier
  function blank() {
    return '_:b' + blankId++;
  };
  var blankId = 0;
  Parser._resetBlanks = function () { blankId = 0; }

  // Regular expression and replacement strings to escape strings
  var escapeSequence = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{8})|\\(.)/g,
      escapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                             't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      fromCharCode = String.fromCharCode;

  // Translates escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    try {
      string = string.replace(escapeSequence, function (sequence, unicode4, unicode8, escapedChar) {
        var charCode;
        if (unicode4) {
          charCode = parseInt(unicode4, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          return fromCharCode(charCode);
        }
        else if (unicode8) {
          charCode = parseInt(unicode8, 16);
          if (isNaN(charCode)) throw new Error(); // can never happen (regex), but helps performance
          if (charCode < 0xFFFF) return fromCharCode(charCode);
          return fromCharCode(0xD800 + ((charCode -= 0x10000) >> 10), 0xDC00 + (charCode & 0x3FF));
        }
        else {
          var replacement = escapeReplacements[escapedChar];
          if (!replacement) throw new Error();
          return replacement;
        }
      });
    }
    catch (error) { return ''; }
    return '"' + string + '"';
  }

  // Creates a list, collecting its (possibly blank) items and triples associated with those items
  function createList(objects) {
    var list = blank(), head = list, listItems = [], listTriples, triples = [];
    objects.forEach(function (o) { listItems.push(o.entity); appendAllTo(triples, o.triples); });

    // Build an RDF list out of the items
    for (var i = 0, j = 0, l = listItems.length, listTriples = Array(l * 2); i < l;)
      listTriples[j++] = triple(head, RDF_FIRST, listItems[i]),
      listTriples[j++] = triple(head, RDF_REST,  head = ++i < l ? blank() : RDF_NIL);

    // Return the list's identifier, its triples, and the triples associated with its items
    return { entity: list, triples: appendAllTo(listTriples, triples) };
  }

  // Creates a blank node identifier, collecting triples with that blank node as subject
  function createAnonymousObject(propertyList) {
    var entity = blank();
    return {
      entity: entity,
      triples: propertyList.map(function (t) { return extend(triple(entity), t); })
    };
  }

  // Collects all (possibly blank) objects, and triples that have them as subject
  function objectListToTriples(predicate, objectList, otherTriples) {
    var objects = [], triples = [];
    objectList.forEach(function (l) {
      objects.push(triple(null, predicate, l.entity));
      appendAllTo(triples, l.triples);
    });
    return unionAll(objects, otherTriples || [], triples);
  }

  // Simplifies groups by merging adjacent BGPs
  function mergeAdjacentBGPs(groups) {
    var merged = [], currentBgp;
    for (var i = 0, group; group = groups[i]; i++) {
      switch (group.type) {
        // Add a BGP's triples to the current BGP
        case 'bgp':
          if (group.triples.length) {
            if (!currentBgp)
              appendTo(merged, currentBgp = group);
            else
              appendAllTo(currentBgp.triples, group.triples);
          }
          break;
        // All other groups break up a BGP
        default:
          // Only add the group if its pattern is non-empty
          if (!group.patterns || group.patterns.length > 0) {
            appendTo(merged, group);
            currentBgp = null;
          }
      }
    }
    return merged;
  }
  
  // if st:process(exp), returns exp
  function unprocessed(exp) {
	  if (exp.type === 'functionCall'
		&& exp.function === 'http://ns.inria.fr/sparql-template/process') {
		  return exp.args[0];
	  } else {
		  return exp;
	  }
  }
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"flex":true,"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* ignore */
break;
case 1:return 14
break;
case 2:return 36
break;
case 3:return 38
break;
case 4:return 46
break;
case 5:return 49
break;
case 6:return 62
break;
case 7:return 65
break;
case 8:return 72
break;
case 9:return 317
break;
case 10:return 323
break;
case 11:return 29
break;
case 12:return 77
break;
case 13:return 31
break;
case 14:return 325
break;
case 15:return 79
break;
case 16:return 83
break;
case 17:return 16
break;
case 18:return 19
break;
case 19:return 86
break;
case 20:return 91
break;
case 21:return 94
break;
case 22:return 328
break;
case 23:return 32
break;
case 24:return 103
break;
case 25:return 107
break;
case 26:return 110
break;
case 27:return 113
break;
case 28:return 114
break;
case 29:return 117
break;
case 30:return 119
break;
case 31:return 121
break;
case 32:return 41
break;
case 33:return 134
break;
case 34:return 329
break;
case 35:return 167
break;
case 36:return 330
break;
case 37:return 331
break;
case 38:return 144
break;
case 39:return 332
break;
case 40:return 143
break;
case 41:return 333
break;
case 42:return 334
break;
case 43:return 147
break;
case 44:return 149
break;
case 45:return 150
break;
case 46:return 165
break;
case 47:return 159
break;
case 48:return 160
break;
case 49:return 162
break;
case 50:return 168
break;
case 51:return 146
break;
case 52:return 335
break;
case 53:return 336
break;
case 54:return 194
break;
case 55:return 197
break;
case 56:return 201
break;
case 57:return 127
break;
case 58:return 195
break;
case 59:return 337
break;
case 60:return 200
break;
case 61:return 284
break;
case 62:return 220
break;
case 63:return 339
break;
case 64:return 340
break;
case 65:return 246
break;
case 66:return 342
break;
case 67:return 343
break;
case 68:return 241
break;
case 69:return 248
break;
case 70:return 249
break;
case 71:return 256
break;
case 72:return 260
break;
case 73:return 43
break;
case 74:return 344
break;
case 75:return 345
break;
case 76:return 346
break;
case 77:return 347
break;
case 78:return 348
break;
case 79:return 264
break;
case 80:return 349
break;
case 81:return 279
break;
case 82:return 287
break;
case 83:return 288
break;
case 84:return 281
break;
case 85:return 282
break;
case 86:return 283
break;
case 87:return 350
break;
case 88:return 351
break;
case 89:return 285
break;
case 90:return 353
break;
case 91:return 352
break;
case 92:return 354
break;
case 93:return 290
break;
case 94:return 291
break;
case 95:return 294
break;
case 96:return 296
break;
case 97:return 42
break;
case 98:return 301
break;
case 99:return 304
break;
case 100:return 305
break;
case 101:return 63
break;
case 102:return 66
break;
case 103:return 316
break;
case 104:return 251
break;
case 105:return 54
break;
case 106:return 300
break;
case 107:return 118
break;
case 108:return 302
break;
case 109:return 303
break;
case 110:return 310
break;
case 111:return 311
break;
case 112:return 312
break;
case 113:return 313
break;
case 114:return 314
break;
case 115:return 315
break;
case 116:return 'EXPONENT'
break;
case 117:return 306
break;
case 118:return 307
break;
case 119:return 308
break;
case 120:return 309
break;
case 121:return 202
break;
case 122:return 252
break;
case 123:return 6
break;
case 124:return 'INVALID'
break;
case 125:console.log(yy_.yytext);
break;
}
},
rules: [/^(?:\s+|#[^\n\r]*)/i,/^(?:TEMPLATE)/i,/^(?:BOX)/i,/^(?:FORMAT)/i,/^(?:PRAGMA)/i,/^(?:FUNCTION)/i,/^(?:BASE)/i,/^(?:PREFIX)/i,/^(?:SELECT)/i,/^(?:DISTINCT)/i,/^(?:REDUCED)/i,/^(?:\()/i,/^(?:AS)/i,/^(?:\))/i,/^(?:\*)/i,/^(?:CONSTRUCT)/i,/^(?:WHERE)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:DESCRIBE)/i,/^(?:ASK)/i,/^(?:FROM)/i,/^(?:NAMED)/i,/^(?:GROUP)/i,/^(?:BY)/i,/^(?:HAVING)/i,/^(?:ORDER)/i,/^(?:ASC)/i,/^(?:DESC)/i,/^(?:LIMIT)/i,/^(?:OFFSET)/i,/^(?:VALUES)/i,/^(?:;)/i,/^(?:LOAD)/i,/^(?:SILENT)/i,/^(?:INTO)/i,/^(?:CLEAR)/i,/^(?:DROP)/i,/^(?:CREATE)/i,/^(?:ADD)/i,/^(?:TO)/i,/^(?:MOVE)/i,/^(?:COPY)/i,/^(?:INSERT\s+DATA)/i,/^(?:DELETE\s+DATA)/i,/^(?:DELETE\s+WHERE)/i,/^(?:WITH)/i,/^(?:DELETE)/i,/^(?:INSERT)/i,/^(?:USING)/i,/^(?:DEFAULT)/i,/^(?:GRAPH)/i,/^(?:ALL)/i,/^(?:\.)/i,/^(?:OPTIONAL)/i,/^(?:SERVICE)/i,/^(?:BIND)/i,/^(?:UNDEF)/i,/^(?:MINUS)/i,/^(?:UNION)/i,/^(?:FILTER)/i,/^(?:,)/i,/^(?:a)/i,/^(?:\|)/i,/^(?:\/)/i,/^(?:\^)/i,/^(?:\?)/i,/^(?:\+)/i,/^(?:!)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\|\|)/i,/^(?:&&)/i,/^(?:=)/i,/^(?:!=)/i,/^(?:<)/i,/^(?:>)/i,/^(?:<=)/i,/^(?:>=)/i,/^(?:IN)/i,/^(?:NOT)/i,/^(?:-)/i,/^(?:BOUND)/i,/^(?:BNODE)/i,/^(?:(RAND|NOW|UUID|STRUUID))/i,/^(?:(LANG|DATATYPE|IRI|URI|ABS|CEIL|FLOOR|ROUND|STRLEN|STR|UCASE|LCASE|ENCODE_FOR_URI|YEAR|MONTH|DAY|HOURS|MINUTES|SECONDS|TIMEZONE|TZ|MD5|SHA1|SHA256|SHA384|SHA512|isIRI|isURI|isBLANK|isLITERAL|isNUMERIC))/i,/^(?:(LANGMATCHES|CONTAINS|STRSTARTS|STRENDS|STRBEFORE|STRAFTER|STRLANG|STRDT|sameTerm))/i,/^(?:CONCAT)/i,/^(?:COALESCE)/i,/^(?:IF)/i,/^(?:REGEX)/i,/^(?:SUBSTR)/i,/^(?:REPLACE)/i,/^(?:EXISTS)/i,/^(?:COUNT)/i,/^(?:SUM|MIN|MAX|AVG|SAMPLE)/i,/^(?:GROUP_CONCAT)/i,/^(?:SEPARATOR)/i,/^(?:\^\^)/i,/^(?:true)/i,/^(?:false)/i,/^(?:(<([^<>\"\{\}\|\^`\\\u0000-\u0020])*>))/i,/^(?:((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:))/i,/^(?:(((([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?)?:)((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|:|[0-9]|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%))))*((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|:|((%([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))|(\\(_|~|\.|-|!|\$|&|'|\(|\)|\*|\+|,|;|=|\/|\?|#|@|%)))))?)))/i,/^(?:(_:(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])|\.)*(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|-|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]))?))/i,/^(?:([\?\$]((((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9])(((?:([A-Z]|[a-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])|_))|[0-9]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040])*)))/i,/^(?:(@[a-zA-Z]+(-[a-zA-Z0-9]+)*))/i,/^(?:([0-9]+))/i,/^(?:([0-9]*\.[0-9]+))/i,/^(?:([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+)))/i,/^(?:(\+([0-9]+)))/i,/^(?:(\+([0-9]*\.[0-9]+)))/i,/^(?:(\+([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:(-([0-9]+)))/i,/^(?:(-([0-9]*\.[0-9]+)))/i,/^(?:(-([0-9]+\.[0-9]*([eE][+-]?[0-9]+)|\.([0-9])+([eE][+-]?[0-9]+)|([0-9])+([eE][+-]?[0-9]+))))/i,/^(?:([eE][+-]?[0-9]+))/i,/^(?:('(([^\u0027\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*'))/i,/^(?:("(([^\u0022\u005C\u000A\u000D])|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])))*"))/i,/^(?:('''(('|'')?([^'\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*'''))/i,/^(?:("""(("|"")?([^\"\\]|(\\[tbnrf\\\"']|\\u([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])|\\U([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f])([0-9]|[A-F]|[a-f]))))*"""))/i,/^(?:(\((\u0020|\u0009|\u000D|\u000A)*\)))/i,/^(?:(\[(\u0020|\u0009|\u000D|\u000A)*\]))/i,/^(?:$)/i,/^(?:.)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":4,"fs":1,"path":3}],10:[function(require,module,exports){
const sparqljs = require('sparqljs');
const fetch = require('node-fetch');

const parser = require('./parser.js');
const generator = new sparqljs.Generator();

// SPARQL configuration
let endpoint = 'http://localhost';
let fn = null;

function sparql(q) {
	if (fn) {
		let res = fn(q);
		return (res instanceof Promise) ? res : Promise.resolve(res);
	} else if (endpoint) {
		return fetch(endpoint, {
			body: q,
			method: 'POST',
			headers: {
				'content-type': 'application/sparql-query',
				'accept': 'application/sparql-results+json'
			}
		}).then(resp => resp.json());
	} else {
		let m = 'No suitable SPARQL configuration found';
		return Promise.reject(new Error(m));
	}
}

/**
 * collection of templates tested by applyTemplates()
 */
let directory = [];

/**
 * merged prefixes from all templates
 */
let prefixes = {};

function expressionType(exp) {
	if (typeof exp === 'string') {
		if (exp.startsWith('?')) return 'variable';
		if (exp.match(/".*"/)) return 'literal';
		if (exp.startsWith('_:')) return 'bnode';
		return 'uri';
	} else if (typeof exp === 'object' && exp.type) {
		return exp.type;
	} else {
		return '';
	}
}

function literal(str) {
	return {
		type: 'literal',
		value: str
	};
}

/**
 * from SPARQL JSON format to plain string
 * note: looks like Turtle but not exactly...
 */
function plain(term) {
	if (!term) return '';
	
	switch (term.type) {
		case 'literal':
			return '"' + term.value + '"'
				+ (term.lang ? '@' + term.lang : '')
				+ (term.datatype ? '^^' + term.datatype : '');
		case 'bnode':
			return '_:' + term.value;
		case 'uri':
			return term.value;
		default:
			return '';
	}
}

/**
 * inverse transformation of plain()
 */
function term(plain) {
	if (!plain || typeof plain != 'string') return '';
	
	let capture = null;
	if (capture = plain.match(/"(.*)"(@.*)?(\^\^(.*))?/)) {
		let [str, lit, lang, suffix, datatype] = capture;
		return {
			type: 'literal',
			value: lit,
			lang: lang,
			datatype: datatype
		}
	} else if (plain.match(/^(([^:\/?#]+):)(\/\/([^\/?#]*))([^?#]*)(\?([^#]*))?(#(.*))?/)) {
		return {
			type: 'uri',
			value: plain
		};
	} else if (capture = plain.match(/(\w*):(.*)/)) {
		let [str, prefix, name] = capture; 
		return {
			type: 'uri',
			value: prefixes[prefix] + name
		};
	} else if (plain.match(/_:(.*)/)) {
		let [str, name] = capture; 
		return {
			type: 'bnode',
			value: name
		}
	} else {
		return {};
	}
}

function turtle(term) {
	if (!term) return '';
	
	switch (term.type) {
		case 'uri':
			for (p in prefixes) {
				let uri = term.value;
				let ns = prefixes[p];
				if (uri.startsWith(ns)) {
					let name = uri.substring(ns.length);
					return p + ':' + name;
				}
			}
			return '<' + term.value + '>';
		case 'bnode':
			return '_:' + term.value;
		case 'literal':
			// TODO numeric values (no quote)
			return '"' + term.value + '"'
				+ (term.lang ? '@' + term.lang : '')
				+ (term.datatype ? '^^' + turtle(term.datatype) : '');
		default:
			return '';
	}
}

function process(term) {
	return turtle(term);
}

/**
 * Function map for the st: namespace 
 */
const functions = {
	'http://ns.inria.fr/sparql-template/apply-templates': applyTemplates,
	'http://ns.inria.fr/sparql-template/call-template': (t, ...args) => callTemplate(t.value, ...args),
	'http://ns.inria.fr/sparql-template/concat': (...args) => args.map(t => t.value).join(''),
	'http://ns.inria.fr/sparql-template/process': turtle
}

/**
 * Calls JS function with provided arguments
 */
function evaluateFunctionCall(exp, binding) {
	let uri = exp.function;
	let fn = functions[uri];

	if (!fn) {
		let m = 'Function <' + uri + '> undefined';
		return Promise.reject(new Error(m));
	}
	
	let evaluated = exp.args.map(arg => evaluateExpression(arg, binding));
	return Promise.all(evaluated)
		.then(terms => fn(...terms))
		.then(str => literal(str));
}

/**
 * Delegates evaluation to SPARQL endpoint
 */
function evaluateOperation(exp, binding) {
	if (exp.operator === 'if') {
		let [condition, first, second] = exp.args;
		
		return evaluateExpression(condition, binding).then(t => {
			let bool =
				t.datatype === 'http://www.w3.org/2001/XMLSchema#boolean'
				&& t.value === 'true';
			return evaluateExpression(bool ? first : second, binding);
		});
	} else {
		let evaluated = exp.args.map(arg => evaluateExpression(arg, binding));
		
		return Promise.all(evaluated).then(args => {
			let jq = {
				type: 'query',
				queryType: 'SELECT',
				variables: ['?exp'],
				where: [{
					type: 'bind',
					variable: '?exp',
					expression: {
						type: 'operation',
						operator: exp.operator,
						args: args.map(plain)
					}
				}]
			};
			
			let q = generator.stringify(jq);
			
			return sparql(q).then(resp => {
				let b = resp.results.bindings;
				return b[0].exp;
			});
		});
	}
}

function evaluateFormat(exp, binding) {
	switch (expressionType(exp.pattern)) {
		case 'literal':
			let evaluated = exp.args.map(arg => evaluateExpression(arg, binding));
			return Promise.all(evaluated).then(args => {
				let pattern = term(exp.pattern);
				return {
					type: 'literal',
					// TODO error if arg not literal
					value: args.reduce((v, arg) => v.replace('%s', arg.value), pattern.value)
				}
			});
		case 'uri':
			let m = 'Dereferencing IRI in FORMAT pattern is not supported';
			return Promise.reject(new Error(m));
		default:
			return Promise.resolve({});
	}
}

/**
 * Returns a term (SPARQL JSON format)
 */
function evaluateExpression(exp, binding) {
	switch (expressionType(exp)) {
		case 'functionCall':
			return evaluateFunctionCall(exp, binding);
		case 'operation':
			return evaluateOperation(exp, binding);
		case 'format':
			return evaluateFormat(exp, binding);
		case 'literal':
		case 'uri':
		case 'bnode':
			return Promise.resolve(term(exp));
		case 'variable':
			let t = binding[exp.substring(1)];
			return Promise.resolve(t);
		default:
			return Promise.resolve({});
	}
}

function variables(exp) {
	switch (expressionType(exp)) {
		case 'functionCall':
		case 'operation':
		case 'format':
			return exp.args.reduce((v, arg) => v.concat(variables(arg)), []);
		case 'variable':
			return [exp];
		default:
			return [];
	}
}

/**
 * Returns a plain string (always a literal)
 */
function applyTemplate(tpl, binding) {
	if (!tpl || tpl.queryType != 'TEMPLATE') {
		let m = 'Input argument is not a SPARQL template';
		return Promise.reject(new Error(m));
	}
	
	let patterns = [];
	if (binding) {
		patterns = Object.entries(binding)
			.filter(([v, t]) => t.type === 'uri' || t.type === 'literal')
			.map(([v, t]) => ({
				type: 'bind',
				variable: '?' + v,
				expression: plain(t)
			}));
	}
	
	let jsonQuery = {
		type: 'query',
		queryType: 'SELECT',
		prefixes: tpl.prefixes,
		variables: variables(tpl.expression),
		where: patterns.concat(tpl.where),
		distinct: true
	}
	
	let query = generator.stringify(jsonQuery);
	
	return sparql(query).then(resp => {
		let bindings = resp.results.bindings;
		// TODO if no binding but all template variables bound, then evaluate
		let group = bindings.map(b => evaluateExpression(tpl.expression, b));
		
		let sep = tpl.separator || '\n';
		return Promise.all(group).then(g => g.map(t => t.value).join(sep));
	});
}

function applyTemplatesAll(term) {
	let b = term ? { 'in': term } : null;
	
	let zeroParams = directory.filter(tpl => (tpl.parameters || []).length === 0);
	return Promise.all(zeroParams.map(tpl => applyTemplate(tpl, b))).then(str => {
		return str.join('');
	});
}

function applyTemplates(term) {
	// TODO detect loop in template selecion (pair <focus node, template>)
	let b = term ? { 'in': term } : null;
	
	let zeroParams = directory.filter(tpl => (tpl.parameters || []).length === 0);
	return zeroParams.reduce((application, tpl) => {
		return application.then(str => str || applyTemplate(tpl, b));
	}, Promise.resolve('')).then(str => {
		return str || turtle(term);
	});
}

function callTemplate(uri, ...terms) {
	let tpl = directory.find(tpl => tpl.name === uri);
	if (!tpl) {
		let m = 'Template <' + uri + '> not found';
		return Promise.reject(new Error(m));
	};
	
	let b = tpl.parameters.reduce((b, p, i) => {
		b[p.substring(1)] = terms[i];
		return b;
	}, {});
	return applyTemplate(tpl, b);
}

module.exports = {
	// http://ns.inria.fr/sparql-template/apply-templates
	applyTemplates: applyTemplates,
	// http://ns.inria.fr/sparql-template/call-template
	callTemplate: callTemplate,
	
	// general configuration
	connect: arg => {
		if (typeof arg === 'string') endpoint = arg;
		else if (typeof arg === 'function') fn = arg;
	},
	register: str => {
		let tpl = parser.parse(str);
		if (!tpl) throw new Error('Template cannot be parsed: ' + str);
		directory.push(tpl);
		for (p in tpl.prefixes) prefixes[p] = tpl.prefixes[p];
	},
	clear: () => {
		directory = [];
		prefixes = {};
	}
};

},{"./parser.js":9,"node-fetch":5,"sparqljs":8}]},{},[10])(10)
});
