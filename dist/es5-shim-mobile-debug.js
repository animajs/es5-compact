!function() {
    // ES5 15.9.4.2
    // http://es5.github.com/#x15.9.4.2
    // based on work shared by Daniel Friesen (dantman)
    // http://gist.github.com/303249
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = function(NativeDate) {
        // Date.length === 7
        function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length == 1 && String(Y) === Y ? // isString(Y)
                // We explicitly pass it through parse:
                new NativeDate(Date.parse(Y)) : // We have to manually make calls depending on argument
                // length here
                length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) : length >= 6 ? new NativeDate(Y, M, D, h, m, s) : length >= 5 ? new NativeDate(Y, M, D, h, m) : length >= 4 ? new NativeDate(Y, M, D, h) : length >= 3 ? new NativeDate(Y, M, D) : length >= 2 ? new NativeDate(Y, M) : length >= 1 ? new NativeDate(Y) : new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        }
        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp("^" + "(\\d{4}|[+-]\\d{6})" + // four-digit year capture or sign +
        // 6-digit extended year
        "(?:-(\\d{2})" + // optional month capture
        "(?:-(\\d{2})" + // optional day capture
        "(?:" + // capture hours:minutes:seconds.milliseconds
        "T(\\d{2})" + // hours capture
        ":(\\d{2})" + // minutes capture
        "(?:" + // optional :seconds.milliseconds
        ":(\\d{2})" + // seconds capture
        "(?:(\\.\\d{1,}))?" + // milliseconds capture
        ")?" + "(" + // capture UTC offset component
        "Z|" + // UTC capture
        "(?:" + // offset specifier +/-hours:minutes
        "([-+])" + // sign capture
        "(\\d{2})" + // hours offset capture
        ":(\\d{2})" + // minutes offset capture
        ")" + ")?)?)?)?" + "$");
        var months = [ 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365 ];
        function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return months[month] + Math.floor((year - 1969 + t) / 4) - Math.floor((year - 1901 + t) / 100) + Math.floor((year - 1601 + t) / 400) + 365 * (year - 1970);
        }
        function toUTC(t) {
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
        }
        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            Date[key] = NativeDate[key];
        }
        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;
        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]), month = Number(match[2] || 1) - 1, day = Number(match[3] || 1) - 1, hour = Number(match[4] || 0), minute = Number(match[5] || 0), second = Number(match[6] || 0), millisecond = Math.floor(Number(match[7] || 0) * 1e3), // When time zone is missed, local offset should be used
                // (ES 5.1 bug)
                // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                isLocalTime = Boolean(match[4] && !match[8]), signOffset = match[9] === "-" ? 1 : -1, hourOffset = Number(match[10] || 0), minuteOffset = Number(match[11] || 0), result;
                if (hour < (minute > 0 || second > 0 || millisecond > 0 ? 24 : 25) && minute < 60 && second < 60 && millisecond < 1e3 && month > -1 && month < 12 && hourOffset < 24 && minuteOffset < 60 && // detect invalid offsets
                day > -1 && day < dayFromMonth(year, month + 1) - dayFromMonth(year, month)) {
                    result = ((dayFromMonth(year, month) + day) * 24 + hour + hourOffset * signOffset) * 60;
                    result = ((result + minute + minuteOffset * signOffset) * 60 + second) * 1e3 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-864e13 <= result && result <= 864e13) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };
        return Date;
    }(Date);
    // ES5 15.9.5.43
    // http://es5.github.com/#x15.9.5.43
    // This function returns a String value represent the instance in time
    // represented by this Date object. The format of the String is the Date Time
    // string format defined in 15.9.1.15. All fields are present in the String.
    // The time zone is always UTC, denoted by the suffix Z. If the time value of
    // this object is not a finite Number a RangeError exception is thrown.
    var negativeDate = -621987552e5, negativeYearString = "-000001";
    if (!Date.prototype.toISOString || new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1) {
        Date.prototype.toISOString = function toISOString() {
            var result, length, value, year, month;
            if (!isFinite(this)) {
                throw new RangeError("Date.prototype.toISOString called on non-finite value.");
            }
            year = this.getUTCFullYear();
            month = this.getUTCMonth();
            // see https://github.com/es-shims/es5-shim/issues/111
            year += Math.floor(month / 12);
            month = (month % 12 + 12) % 12;
            // the date time string format is specified in 15.9.1.15.
            result = [ month + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds() ];
            year = (year < 0 ? "-" : year > 9999 ? "+" : "") + ("00000" + Math.abs(year)).slice(0 <= year && year <= 9999 ? -4 : -6);
            length = result.length;
            while (length--) {
                value = result[length];
                // pad months, days, hours, minutes, and seconds to have two
                // digits.
                if (value < 10) {
                    result[length] = "0" + value;
                }
            }
            // pad milliseconds to have three digits.
            return year + "-" + result.slice(0, 2).join("-") + "T" + result.slice(2).join(":") + "." + ("000" + this.getUTCMilliseconds()).slice(-3) + "Z";
        };
    }
    // ES5 15.9.5.44
    // http://es5.github.com/#x15.9.5.44
    // This function provides a String representation of a Date object for use by
    // JSON.stringify (15.12.3).
    var dateToJSONIsSupported = false;
    try {
        dateToJSONIsSupported = Date.prototype.toJSON && new Date(NaN).toJSON() === null && new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 && Date.prototype.toJSON.call({
            // generic
            toISOString: function() {
                return true;
            }
        });
    } catch (e) {}
    if (!dateToJSONIsSupported) {
        Date.prototype.toJSON = function toJSON(key) {
            // When the toJSON method is called with argument key, the following
            // steps are taken:
            // 1.  Let O be the result of calling ToObject, giving it the this
            // value as its argument.
            // 2. Let tv be toPrimitive(O, hint Number).
            var o = Object(this), tv = toPrimitive(o), toISO;
            // 3. If tv is a Number and is not finite, return null.
            if (typeof tv === "number" && !isFinite(tv)) {
                return null;
            }
            // 4. Let toISO be the result of calling the [[Get]] internal method of
            // O with argument "toISOString".
            toISO = o.toISOString;
            // 5. If IsCallable(toISO) is false, throw a TypeError exception.
            if (typeof toISO != "function") {
                throw new TypeError("toISOString property is not callable");
            }
            // 6. Return the result of calling the [[Call]] internal method of
            //  toISO with O as the this value and an empty argument list.
            return toISO.call(o);
        };
    }
    // ES5.1 15.7.4.5
    // http://es5.github.com/#x15.7.4.5
    if (!Number.prototype.toFixed || 8e-5.toFixed(3) !== "0.000" || .9.toFixed(0) === "0" || 1.255.toFixed(2) !== "1.25" || 0xde0b6b3a7640080.toFixed(0) !== "1000000000000000128") {
        // Hide these variables and functions
        (function() {
            var base, size, data, i;
            base = 1e7;
            size = 6;
            data = [ 0, 0, 0, 0, 0, 0 ];
            function multiply(n, c) {
                var i = -1;
                while (++i < size) {
                    c += n * data[i];
                    data[i] = c % base;
                    c = Math.floor(c / base);
                }
            }
            function divide(n) {
                var i = size, c = 0;
                while (--i >= 0) {
                    c += data[i];
                    data[i] = Math.floor(c / n);
                    c = c % n * base;
                }
            }
            function toString() {
                var i = size;
                var s = "";
                while (--i >= 0) {
                    if (s !== "" || i === 0 || data[i] !== 0) {
                        var t = String(data[i]);
                        if (s === "") {
                            s = t;
                        } else {
                            s += "0000000".slice(0, 7 - t.length) + t;
                        }
                    }
                }
                return s;
            }
            function pow(x, n, acc) {
                return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
            }
            function log(x) {
                var n = 0;
                while (x >= 4096) {
                    n += 12;
                    x /= 4096;
                }
                while (x >= 2) {
                    n += 1;
                    x /= 2;
                }
                return n;
            }
            Number.prototype.toFixed = function(fractionDigits) {
                var f, x, s, m, e, z, j, k;
                // Test for NaN and round fractionDigits down
                f = Number(fractionDigits);
                f = f !== f ? 0 : Math.floor(f);
                if (f < 0 || f > 20) {
                    throw new RangeError("Number.toFixed called with invalid number of decimals");
                }
                x = Number(this);
                // Test for NaN
                if (x !== x) {
                    return "NaN";
                }
                // If it is too big or small, return the string value of the number
                if (x <= -1e21 || x >= 1e21) {
                    return String(x);
                }
                s = "";
                if (x < 0) {
                    s = "-";
                    x = -x;
                }
                m = "0";
                if (x > 1e-21) {
                    // 1e-21 < x < 1e21
                    // -70 < log2(x) < 70
                    e = log(x * pow(2, 69, 1)) - 69;
                    z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
                    z *= 4503599627370496;
                    // Math.pow(2, 52);
                    e = 52 - e;
                    // -18 < e < 122
                    // x = z / 2 ^ e
                    if (e > 0) {
                        multiply(0, z);
                        j = f;
                        while (j >= 7) {
                            multiply(1e7, 0);
                            j -= 7;
                        }
                        multiply(pow(10, j, 1), 0);
                        j = e - 1;
                        while (j >= 23) {
                            divide(1 << 23);
                            j -= 23;
                        }
                        divide(1 << j);
                        multiply(1, 1);
                        divide(2);
                        m = toString();
                    } else {
                        multiply(0, z);
                        multiply(1 << -e, 0);
                        m = toString() + "0.00000000000000000000".slice(2, 2 + f);
                    }
                }
                if (f > 0) {
                    k = m.length;
                    if (k <= f) {
                        m = s + "0.0000000000000000000".slice(0, f - k + 2) + m;
                    } else {
                        m = s + m.slice(0, k - f) + "." + m.slice(k - f);
                    }
                } else {
                    m = s + m;
                }
                return m;
            };
        })();
    }
    // ES-5 15.3.4.5
    // http://es5.github.com/#x15.3.4.5
    function Empty() {}
    Function.prototype.bind = function bind(that) {
        // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = _Array_slice_.call(arguments, 1);
        // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var binder = function() {
            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.
                var result = target.apply(this, args.concat(_Array_slice_.call(arguments)));
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.
                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(that, args.concat(_Array_slice_.call(arguments)));
            }
        };
        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.
        var boundLength = Math.max(0, target.length - args.length);
        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push("$" + i);
        }
        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        var bound = Function("binder", "return function(" + boundArgs.join(",") + "){return binder.apply(this,arguments)}")(binder);
        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }
        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.
        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.
        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.
        // 22. Return F.
        return bound;
    };
    // Shortcut to an often accessed properties, in order to avoid multiple
    // dereference that costs universally.
    // _Please note: Shortcuts are defined after `Function.prototype.bind` as we
    // us it in defining shortcuts.
    var call = Function.prototype.call;
    var prototypeOfArray = Array.prototype;
    var prototypeOfObject = Object.prototype;
    var _Array_slice_ = prototypeOfArray.slice;
    // Having a toString local variable name breaks in Opera so use _toString.
    var _toString = call.bind(prototypeOfObject.toString);
    var owns = call.bind(prototypeOfObject.hasOwnProperty);
    // If JS engine supports accessors creating shortcuts.
    var defineGetter;
    var defineSetter;
    var lookupGetter;
    var lookupSetter;
    var supportsAccessors;
    if (supportsAccessors = owns(prototypeOfObject, "__defineGetter__")) {
        defineGetter = call.bind(prototypeOfObject.__defineGetter__);
        defineSetter = call.bind(prototypeOfObject.__defineSetter__);
        lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
        lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
    }
    // ES5 15.5.4.14
    // http://es5.github.com/#x15.5.4.14
    // [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
    // Many browsers do not split properly with regular expressions or they
    // do not perform the split correctly under obscure conditions.
    // See http://blog.stevenlevithan.com/archives/cross-browser-split
    // I've tested in many browsers and this seems to cover the deviant ones:
    //    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
    //    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
    //    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
    //       [undefined, "t", undefined, "e", ...]
    //    ''.split(/.?/) should be [], not [""]
    //    '.'.split(/()()/) should be ["."], not ["", "", "."]
    var string_split = String.prototype.split;
    if ("ab".split(/(?:ab)*/).length !== 2 || ".".split(/(.?)(.?)/).length !== 4 || "tesst".split(/(s)*/)[1] === "t" || "".split(/.?/).length || ".".split(/()()/).length > 1) {
        (function() {
            var compliantExecNpcg = /()??/.exec("")[1] === void 0;
            // NPCG: nonparticipating capturing group
            String.prototype.split = function(separator, limit) {
                var string = this;
                if (separator === void 0 && limit === 0) return [];
                // If `separator` is not a regex, use native split
                if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                    return string_split.apply(this, arguments);
                }
                var output = [], flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + (// Proposed for ES6
                separator.sticky ? "y" : ""), // Firefox 3+
                lastLastIndex = 0, // Make `global` and avoid `lastIndex` issues by working with a copy
                separator = new RegExp(separator.source, flags + "g"), separator2, match, lastIndex, lastLength;
                string += "";
                // Type-convert
                if (!compliantExecNpcg) {
                    // Doesn't need flags gy, but they don't hurt
                    separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
                }
                /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
                limit = limit === void 0 ? -1 >>> 0 : // Math.pow(2, 32) - 1
                limit >>> 0;
                // ToUint32(limit)
                while (match = separator.exec(string)) {
                    // `separator.lastIndex` is not reliable cross-browser
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        output.push(string.slice(lastLastIndex, match.index));
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for
                        // nonparticipating capturing groups
                        if (!compliantExecNpcg && match.length > 1) {
                            match[0].replace(separator2, function() {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (arguments[i] === void 0) {
                                        match[i] = void 0;
                                    }
                                }
                            });
                        }
                        if (match.length > 1 && match.index < string.length) {
                            Array.prototype.push.apply(output, match.slice(1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= limit) {
                            break;
                        }
                    }
                    if (separator.lastIndex === match.index) {
                        separator.lastIndex++;
                    }
                }
                if (lastLastIndex === string.length) {
                    if (lastLength || !separator.test("")) {
                        output.push("");
                    }
                } else {
                    output.push(string.slice(lastLastIndex));
                }
                return output.length > limit ? output.slice(0, limit) : output;
            };
        })();
    } else if ("0".split(void 0, 0).length) {
        String.prototype.split = function(separator, limit) {
            if (separator === void 0 && limit === 0) return [];
            return string_split.apply(this, arguments);
        };
    }
    function isPrimitive(input) {
        var type = typeof input;
        return input === null || type === "undefined" || type === "boolean" || type === "number" || type === "string";
    }
    function toPrimitive(input) {
        var val, valueOf, toString;
        if (isPrimitive(input)) {
            return input;
        }
        valueOf = input.valueOf;
        if (typeof valueOf === "function") {
            val = valueOf.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        toString = input.toString;
        if (typeof toString === "function") {
            val = toString.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError();
    }
    // ES5 15.5.4.20
    // whitespace from: http://es5.github.io/#x15.5.4.20
    var ws = "	\n\f\r   ᠎    " + "         　\u2028" + "\u2029";
    if (!String.prototype.trim || ws.trim()) {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        ws = "[" + ws + "]";
        var trimBeginRegexp = new RegExp("^" + ws + ws + "*"), trimEndRegexp = new RegExp(ws + ws + "*$");
        String.prototype.trim = function trim() {
            if (this === void 0 || this === null) {
                throw new TypeError("can't convert " + this + " to object");
            }
            return String(this).replace(trimBeginRegexp, "").replace(trimEndRegexp, "");
        };
    }
    define("es5-shim-mobile-debug", [], true);
}();
