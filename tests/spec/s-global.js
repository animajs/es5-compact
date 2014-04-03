describe('global methods', function () {
    'use strict';

    describe('parseInt', function () {
        it('accepts a radix', function () {
            for (var i = 2; i <= 36; ++i) {
                expect(parseInt('10', i)).toBe(i);
            }
        });

        it('defaults the radix to 10 when the number does not start with 0x or 0X', function () {
           [
               '01',
               '08',
               '10',
               '42'
           ].forEach(function (str) {
               expect(parseInt(str)).toBe(parseInt(str, 10));
           });
        });

        it('defaults the radix to 16 when the number starts with 0x or 0X', function () {
            expect(parseInt('0x16')).toBe(parseInt('0x16', 16));
            expect(parseInt('0X16')).toBe(parseInt('0X16', 16));
        });

        it('ignores leading whitespace', function () {
            expect(parseInt('  0x16')).toBe(parseInt('0x16', 16));
            expect(parseInt('  42')).toBe(parseInt('42', 10));
            expect(parseInt('  08')).toBe(parseInt('08', 10));

            var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
                "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
                "\u2029\uFEFF";
            expect(parseInt(ws + '08')).toBe(parseInt('08', 10));
            expect(parseInt(ws + '0x16')).toBe(parseInt('0x16', 16));
        });

       it('defaults the radix properly when not a true number', function () {
           var fakeZero = { valueOf: function () { return 0; } };
           expect(parseInt('08', fakeZero)).toBe(parseInt('08', 10));
           expect(parseInt('0x16', fakeZero)).toBe(parseInt('0x16', 16));
       });
    });
});

describe("new feature", function() {
  describe("Reserved words as property names", function() {
    'use strict';
    it("should support", function() {
      expect((function () {
        try {
          var obj = { };
          eval('obj = ({ if: 1 })');
          return obj['if'] === 1;
        } catch (e) {
          return false;
        }
      })()).toBeTruthy();
    });
  });
  describe("use strict", function() {
    'use strict';
    it("should support", function() {
      expect((function () {
        "use strict";
        return !this;
      }())).toBeTruthy();
    });
  });
  describe("getter", function() {
    'use strict';
    it("should support", function() {
      expect((function () {
        try {
          return eval('({ get x(){ return 1 } }).x === 1');
        } catch (e) {
          return false;
        }
      })()).toBeTruthy();
    });
  });
  describe("setter", function() {
    'use strict';
    it("should support", function() {
      expect((function () {
        try {
          var value;
          eval('({ set x(v){ value = v; } }).x = 1');
          return value === 1;
        } catch (e) {
          return false;
        }
      })()).toBeTruthy();
    });
  });
  describe("Zero-width chars in identifiers", function() {
    'use strict';
    it("should support", function() {
      expect(function () {
        try {
          return eval('_\u200c\u200d = true');
        } catch (e) { }
      }()).toBeTruthy();
    });
  });
  describe("Immutable undefined", function() {
    it("should support", function() {
      expect(function () {
        var result;
        try {
          undefined = 12345;
          result = typeof undefined == 'undefined';
          undefined = void 0;
        } catch (e) { }
        return result;
      }()).toBeTruthy();
    });
  });
  describe("json support", function() {
    it("#parse", function() {
      expect(function () {
        var result;
        try {
          result = JSON.parse('{"a":1}');
        } catch (e) { }
        return result;
      }()).toBeTruthy();
    });
    it("#stringify", function() {
      expect(function () {
        var result;
        try {
          result = JSON.stringify({"a":1});
        } catch (e) { }
        return result;
      }()).toBeTruthy();
    });
  });
});