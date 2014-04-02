describe('Object', function () {
    "use strict";

    describe("Object.keys", function () {
        var obj = {
            "str": "boz",
            "obj": { },
            "arr": [],
            "bool": true,
            "num": 42,
            "null": null,
            "undefined": undefined
        };

        var loopedValues = [];
        for (var k in obj) {
            loopedValues.push(k);
        }

        var keys = Object.keys(obj);
        it('should have correct length', function () {
            expect(keys.length).toBe(7);
        });

        it('should return an Array', function () {
            expect(Array.isArray(keys)).toBe(true);
        });

        it('should return names which are own properties', function () {
            keys.forEach(function (name) {
                expect(obj.hasOwnProperty(name)).toBe(true);
            });
        });

        it('should return names which are enumerable', function () {
            keys.forEach(function (name) {
                expect(loopedValues.indexOf(name)).toNotBe(-1);
            })
        });

        it('should throw error for non object', function () {
            var e = {};
            expect(function () {
                try {
                    Object.keys(42)
                } catch (err) {
                    throw e;
                }
            }).toThrow(e);
        });

        it('should not enumerate over non-enumerable properties', function () {
             var Foo = function () {};
             expect(Object.keys(Foo.prototype)).toEqual([]);
             expect(Object.keys(Boolean.prototype)).toEqual([]);
             expect(Object.keys(Object.prototype)).toEqual([]);
        });
    });

	describe("Object.isExtensible", function () {
        var obj = { };

        it('should return true if object is extensible', function () {
            expect(Object.isExtensible(obj)).toBe(true);
        });

        it('should return false if object is not extensible', function () {
            expect(Object.isExtensible(Object.preventExtensions(obj))).toBe(false);
        });

        it('should return false if object is seal', function () {
            expect(Object.isExtensible(Object.seal(obj))).toBe(false);
        });

        it('should return false if object is freeze', function () {
            expect(Object.isExtensible(Object.freeze(obj))).toBe(false);
        });

        it('should throw error for non object', function () {
            var e1 = {};
            expect(function () {
                try {
                    Object.isExtensible(42)
                } catch (err) {
                    throw e1;
                }
            }).toThrow(e1);
        });
    });

	describe("Object.defineProperty", function () {
        var obj;

        beforeEach(function() {
           obj = {};

           Object.defineProperty(obj, 'name', {
               value : 'Testing',
               configurable: true,
               enumerable: true,
               writable: true
           });
        });

        it('should return the initial value', function () {
            expect(obj.hasOwnProperty('name')).toBeTruthy();
            expect(obj.name).toBe('Testing');
        });

        it('should be setable', function () {
            obj.name = 'Other';
            expect(obj.name).toBe('Other');
        });

        it('should return the parent initial value', function () {
            var child = Object.create(obj, {});

            expect(child.name).toBe('Testing');
            expect(child.hasOwnProperty('name')).toBeFalsy();
        });

        it('should not override the parent value', function () {
            var child = Object.create(obj, {});

            Object.defineProperty(child, 'name', {
                value : 'Other'
            });

            expect(obj.name).toBe('Testing');
            expect(child.name).toBe('Other');
        });

        it('should throw error for non object', function () {
            expect(function () {
                Object.defineProperty(42, 'name', {});
            }).toThrow();
        });

      it('should throw error for property descriptors specify a value or be writable when a getter or setter has been specified', function () {
        expect(function() {
          Object.defineProperty(obj, 'name2', {
            value : 'Testing',
            configurable: true,
            enumerable: true,
            writable: true,
            get: function() {
              return this.name2
            }
          })
        }).toThrow();
      });

      it('should throw error for unExtensible object', function () {
        var obj = {};
        Object.preventExtensions(obj);
        expect(function () {
          obj.newProp = 50;
        }).toThrow();
      });

      it('should throw error for unFunction getter', function () {
        expect(function () {
          Object.defineProperty(obj, 'name2', {
            value: 'Testing',
            get: 1
          });
        }).toThrow();
      });
    });
  describe("Object.defineProperties", function () {
    it("should exists", function() {
      expect(typeof Object.defineProperties).toBe("function");
    });
  });

	describe("Object.getOwnPropertyDescriptor", function () {
        it('should return undefined because the object does not own the property', function () {
            var descr = Object.getOwnPropertyDescriptor({}, 'name');

            expect(descr).toBeUndefined()
        });

        it('should return a data descriptor', function () {
            var descr = Object.getOwnPropertyDescriptor({name: 'Testing'}, 'name');

            expect(descr).not.toBeUndefined();
            expect(descr.value).toBe('Testing');
            expect(descr.writable).toBe(true);
            expect(descr.enumerable).toBe(true);
            expect(descr.configurable).toBe(true);
        });

        it('should return undefined because the object does not own the property', function () {
            var descr = Object.getOwnPropertyDescriptor(Object.create({name: 'Testing'}, {}), 'name');

            expect(descr).toBeUndefined()
        });

        it('should return a data descriptor', function () {
            var obj = Object.create({}, {
                name: {
                    value : 'Testing',
                    configurable: true,
                    enumerable: true,
                    writable: true
                }
            });

            var descr = Object.getOwnPropertyDescriptor(obj, 'name');

            expect(descr).not.toBeUndefined();
            expect(descr.value).toBe('Testing');
            expect(descr.writable).toBe(true);
            expect(descr.enumerable).toBe(true);
            expect(descr.configurable).toBe(true);
        });

    	it('should throw error for non object', function () {
            expect(function () {
                Object.getOwnPropertyDescriptor(42, 'name');
            }).toThrow();
        });
    });

  describe("Object.create", function() {
    it("should exists", function() {
      expect(typeof Object.create).toBe("function");
    });
    it('should throw error for non object', function () {
      expect(function () {
        Object.create(42);
      }).toThrow();
    });
    it('should be null on nonPrototype object', function() {
      var obj = Object.create(null);
      expect(Object.getPrototypeOf(obj)).toBe(null)
    });
    it('should throw error for unFunction get on description', function () {
      expect(function () {
        Object.create(null, {
          get: true
        });
      }).toThrow();
    });
    it('should return value', function() {
      var newObj = Object.create(null, {
        size: {
          value: "large",
          enumerable: true
        }
      });
      expect(newObj.size).toBe('large');
    });
  });
  describe("Object.getPrototypeOf", function() {
    it("should exists", function() {
      expect(typeof Object.getPrototypeOf).toBe("function");
    });
    it("should return true", function() {
      function Pasta(grain, width) {
        this.grain = grain;
        this.width = width;
      }
      var spaghetti = new Pasta("wheat", 0.2);
      expect(Object.getPrototypeOf(spaghetti)).toBe(Pasta.prototype);
    });
  });
  describe("Object.getOwnPropertyNames", function() {
    it("should exists", function() {
      expect(typeof Object.getOwnPropertyNames).toBe("function");
    });
    it("should ", function() {
      var obj = {};
      obj.newDataProperty = "abc";
      var descriptor = Object.getOwnPropertyDescriptor(obj, "newDataProperty");
      descriptor.enumerable = false;
      Object.defineProperty(obj, 'newDataProperty', descriptor);
      expect(Object.getOwnPropertyNames(obj)[0]).toBe('newDataProperty');
    });
  });
  describe("Object.defineProperties", function() {
    it("should exists", function() {
      expect(typeof Object.defineProperties).toBe("function");
    });
  });
  describe("Object.freeze", function() {
    it("should exists", function() {
      expect(typeof Object.freeze).toBe("function");
    });
    it("should return true on a frozen object", function() {
      var obj = { a: 1 };
      Object.freeze(obj);
      expect(Object.isFrozen(obj)).toBeTruthy();
    });
  });
  describe("Object.preventExtensions", function() {
    it("should exists", function() {
      expect(typeof Object.preventExtensions).toBe("function");
    });

    var obj = {};
    Object.preventExtensions(obj);

    it('should throw error for non object', function () {
      expect(function () {
        Object.preventExtensions(42);
      }).toThrow();
    });

    it('should return false', function() {
      expect(Object.isExtensible(obj)).toBeFalsy();
    });

    it('should throw error', function() {
      expect(function() {
        obj.newProp = 50;
      }).toThrow();
    });
  });
  describe("Object.isSealed", function() {
    it("should exists", function() {
      expect(typeof Object.isSealed).toBe("function");
    });
    it("should return true on a sealed object", function() {
      var obj = { a: 1 };
      Object.seal(obj);
      expect(Object.isSealed(obj)).toBeTruthy();
    });
  });
  describe("Object.isFrozen", function() {
    it("should exists", function() {
      expect(typeof Object.isFrozen).toBe("function");
    });
    it("should return true on a frozen object", function() {
      var obj = { a: 1 };
      Object.freeze(obj);
      expect(Object.isFrozen(obj)).toBeTruthy();
    });
  });
  describe("Object.seal", function() {
    it("should exists", function() {
      expect(typeof Object.seal).toBe("function");
    });
    it("should seal an object and return true", function() {
      var obj = { a: 1 };
      Object.seal(obj);
      expect(Object.isSealed(obj)).toBeTruthy();
    });
    it('should throw error for non object', function () {
      expect(function () {
        Object.seal(42);
      }).toThrow();
    });
  });
});
