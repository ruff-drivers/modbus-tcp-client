/*!
 * Copyright (c) 2017 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var assert = require('assert');
var Modbus = require('../src/modbus');

require('t');

describe('Test modbus request data in RTU mode', function () {
    var modbus;

    beforeEach(function () {
        modbus = new Modbus();
    });

    it('should get expected data when invoke request 0x01 function `genFC01Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x01;
        var startAddress = 0x01;
        var quantity = 10;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(startAddress, 2);
        expectedData.writeUInt16BE(quantity, 4);
        assert(modbus.genFC01Request(slaveAddress, startAddress, quantity).equals(expectedData));
    });

    it('should get expected data when invoke request 0x02 function `genFC02Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x02;
        var startAddress = 0x01;
        var quantity = 10;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(startAddress, 2);
        expectedData.writeUInt16BE(quantity, 4);
        assert(modbus.genFC02Request(slaveAddress, startAddress, quantity).equals(expectedData));
    });

    it('should get expected data when invoke request 0x03 function `genFC03Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x03;
        var startAddress = 0x01;
        var quantity = 10;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(startAddress, 2);
        expectedData.writeUInt16BE(quantity, 4);
        assert(modbus.genFC03Request(slaveAddress, startAddress, quantity).equals(expectedData));
    });

    it('should get expected data when invoke request 0x04 function `genFC04Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x04;
        var startAddress = 0x01;
        var quantity = 10;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(startAddress, 2);
        expectedData.writeUInt16BE(quantity, 4);
        assert(modbus.genFC04Request(slaveAddress, startAddress, quantity).equals(expectedData));
    });

    it('should get expected data when invoke request 0x05 function `genFC05Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x05;
        var address = 0x01;
        var state = 1;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(address, 2);
        expectedData.writeUInt16BE(state ? 0xFF00 : 0x0000, 4);
        assert(modbus.genFC05Request(slaveAddress, address, state).equals(expectedData));
    });

    it('should get expected data when invoke request 0x06 function `genFC06Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x06;
        var address = 0x01;
        var value = 0x5555;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(address, 2);
        expectedData.writeUInt16BE(value, 4);
        assert(modbus.genFC06Request(slaveAddress, address, value).equals(expectedData));
    });

    it('should get expected data when invoke request 0x0F function `genFC0FRequest`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x0F;
        var startAddress = 0x01;
        var states = [1, 0, 1, 0, 0, 1, 0, 0, 0, 1];

        var expectedData = Buffer.alloc(9);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(startAddress, 2);
        expectedData.writeUInt16BE(10, 4);
        expectedData.writeUInt8(2, 6);
        expectedData.writeUInt16LE(0x0225, 7);
        assert(modbus.genFC0FRequest(slaveAddress, startAddress, states).equals(expectedData));
    });

    it('should send expected data when invoke request 0x10 function `genFC10Request`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x10;
        var startAddress = 0x01;
        var values = [1, 2, 3, 4];

        var expectedData = Buffer.alloc(15);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(startAddress, 2);
        expectedData.writeUInt16BE(values.length, 4);
        expectedData.writeUInt8(values.length * 2, 6);
        expectedData.writeUInt16BE(1, 7);
        expectedData.writeUInt16BE(2, 9);
        expectedData.writeUInt16BE(3, 11);
        expectedData.writeUInt16BE(4, 13);
        assert(modbus.genFC10Request(slaveAddress, startAddress, values).equals(expectedData));
    });
});

describe('Test modbus response data in RTU mode', function () {
    var modbus;

    beforeEach(function () {
        modbus = new Modbus();
    });
    it('should get expected data when invoke response 0x01 function `genFC01Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x01;
        // var startAddress = 0x03;
        // var coilStatus = 0x056BCD;
        var coilStatusArray = [
            1, 0, 1, 1,
            0, 0, 1, 1,
            1, 1, 0, 1,
            0, 1, 1, 0,
            1, 0, 1, 0,
            0, 0];

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt8(3, 2);
        expectedData.writeUInt16LE(0x6BCD, 3);
        expectedData.writeUInt8(0x05, 5);
        assert(modbus.genFC01Response(slaveAddress, coilStatusArray).equals(expectedData));
    });

    it('should get expected data when invoke response 0x02 function `genFC02Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x02;
        // var startAddress = 0x03;
        // var discreteInputs = 0x056BCD;
        var discreteInputsArray = [
            1, 0, 1, 1,
            0, 0, 1, 1,
            1, 1, 0, 1,
            0, 1, 1, 0,
            1, 0, 1, 0,
            0, 0];

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt8(3, 2);
        expectedData.writeUInt16LE(0x6BCD, 3);
        expectedData.writeUInt8(0x05, 5);
        assert(modbus.genFC02Response(slaveAddress, discreteInputsArray).equals(expectedData));
    });

    it('should get expected data when invoke response 0x03 function `genFC03Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x03;
        var holdingRegisters = [1, 2, 3, 4];

        var expectedData = Buffer.alloc(11);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt8(8, 2);
        for (var i = 0; i < holdingRegisters.length; ++i) {
            expectedData.writeUInt16BE(holdingRegisters[i], 3 + 2 * i);
        }
        assert(modbus.genFC03Response(slaveAddress, holdingRegisters).equals(expectedData));
    });
    it('should get expected data when invoke response 0x04 function `genFC04Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x04;
        var inputRegisters = [1, 2, 3, 4];

        var expectedData = Buffer.alloc(11);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt8(8, 2);
        for (var i = 0; i < inputRegisters.length; ++i) {
            expectedData.writeUInt16BE(inputRegisters[i], 3 + 2 * i);
        }
        assert(modbus.genFC04Response(slaveAddress, inputRegisters).equals(expectedData));
    });
    it('should get expected data when invoke response 0x05 function `genFC05Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x05;
        var address = 0x01;
        var state = 1;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(address, 2);
        expectedData.writeUInt16BE(state ? 0xFF00 : 0x0000, 4);
        assert(modbus.genFC05Response(slaveAddress, address, state).equals(expectedData));
    });
    it('should send expected data when invoke response 0x06 function `genFC06Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x06;
        var address = 0x01;
        var value = 0x5555;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(address, 2);
        expectedData.writeUInt16BE(value, 4);
        assert(modbus.genFC06Response(slaveAddress, address, value).equals(expectedData));
    });
    it('should send expected data when invoke response 0x0F function `genFC0FResponse`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x0F;
        var address = 0x01;
        var value = 0x5555;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(address, 2);
        expectedData.writeUInt16BE(value, 4);
        assert(modbus.genFC0FResponse(slaveAddress, address, value).equals(expectedData));
    });
    it('should send expected data when invoke response 0x10 function `genFC10Response`', function () {
        var slaveAddress = 0x01;
        var functionCode = 0x10;
        var address = 0x01;
        var value = 0x5555;

        var expectedData = Buffer.alloc(6);
        expectedData.writeUInt8(slaveAddress, 0);
        expectedData.writeUInt8(functionCode, 1);
        expectedData.writeUInt16BE(address, 2);
        expectedData.writeUInt16BE(value, 4);
        assert(modbus.genFC10Response(slaveAddress, address, value).equals(expectedData));
    });
});

describe('Test modbus parse request data in RTU mode', function () {
    var modbus;

    describe('Test response data converted', function () {
        beforeEach(function () {
            modbus = new Modbus();
        });

        it('Test 0x01 function `genFC01Response` and `parseFC01Response`', function () {
            var slaveAddress = 0x01;
            // var coilStatus = 0x056BCD;
            var coilStatusArray = [
                1, 0, 1, 1,
                0, 0, 1, 1,
                1, 1, 0, 1,
                0, 1, 1, 0,
                1, 0, 1, 0,
                0, 0];

            var responseData = modbus.genFC01Response(slaveAddress, coilStatusArray);
            var parsedData = modbus.parseFC01Response(coilStatusArray.length, responseData);
            assert.deepEqual(parsedData.status, coilStatusArray);
        });
        it('Test 0x02 function `genFC02Response` and `parseFC02Response`', function () {
            var slaveAddress = 0x01;
            // var discreteInput = 0x056BCD;
            var discreteInputArray = [
                1, 0, 1, 1,
                0, 0, 1, 1,
                1, 1, 0, 1,
                0, 1, 1, 0,
                1, 0, 1, 0,
                0, 0];

            var responseData = modbus.genFC02Response(slaveAddress, discreteInputArray);
            var parsedData = modbus.parseFC02Response(discreteInputArray.length, responseData);
            assert.deepEqual(parsedData.status, discreteInputArray);
        });
        it('Test 0x03 function `genFC03Response` and `parseFC03Response`', function () {
            var slaveAddress = 0x01;
            var holdingRegisters = [1, 2, 3, 4];

            var responseData = modbus.genFC03Response(slaveAddress, holdingRegisters);
            var parsedData = modbus.parseFC03Response(holdingRegisters.length, responseData);
            assert.deepEqual(parsedData.status, holdingRegisters);
        });
        it('Test 0x04 function `genFC04Response` and `parseFC04Response`', function () {
            var slaveAddress = 0x01;
            var inputRegisters = [1, 2, 3, 4];

            var responseData = modbus.genFC04Response(slaveAddress, inputRegisters);
            var parsedData = modbus.parseFC04Response(inputRegisters.length, responseData);
            assert.deepEqual(parsedData.status, inputRegisters);
        });
        it('Test 0x05 function `genFC05Response` and `parseFC05Response`', function () {
            var slaveAddress = 0x01;
            var address = 0x01;
            var state = 1;

            var responseData = modbus.genFC05Response(slaveAddress, address, state);
            var parsedData = modbus.parseFC05Response(responseData);
            assert.deepEqual(parsedData.state, state);
        });
        it('Test 0x06 function `genFC06Response` and `parseFC06Response`', function () {
            var slaveAddress = 0x01;
            var address = 0x01;
            var value = 0x5555;

            var responseData = modbus.genFC06Response(slaveAddress, address, value);
            var parsedData = modbus.parseFC06Response(responseData);
            assert.deepEqual(parsedData.value, value);
        });
        it('Test 0x0F function `genFC0FResponse` and `parseFC0FResponse`', function () {
            var slaveAddress = 0x01;
            var startAddress = 0x01;
            var states = [1, 0, 1, 0, 0, 1, 0, 0, 0, 1];

            var responseData = modbus.genFC0FResponse(slaveAddress, startAddress, states.length);
            var parsedData = modbus.parseFC0FResponse(responseData);
            assert.deepEqual(parsedData.quantity, states.length);
        });
        it('Test 0x10 function `genFC10Response` and `parseFC10Response`', function () {
            var slaveAddress = 0x01;
            var startAddress = 0x01;
            var values = [1, 2, 3, 4];

            var responseData = modbus.genFC10Response(slaveAddress, startAddress, values.length);
            var parsedData = modbus.parseFC10Response(responseData);
            assert.deepEqual(parsedData.quantity, values.length);
        });
    });

    describe('Test response data unconverted', function () {
        beforeEach(function () {
            modbus = new Modbus({
                parseSlaveData: false
            });
        });

        it('Test 0x01 function `genFC01Response` and `parseFC01Response`', function () {
            var slaveAddress = 0x01;
            // var coilStatus = 0x056BCD;
            var coilStatusArray = [
                1, 0, 1, 1,
                0, 0, 1, 1,
                1, 1, 0, 1,
                0, 1, 1, 0,
                1, 0, 1, 0,
                0, 0];

            var responseData = modbus.genFC01Response(slaveAddress, coilStatusArray);
            var parsedData = modbus.parseFC01Response(coilStatusArray.length, responseData);
            assert.deepEqual(parsedData.status, [0xCD, 0x6B, 0x05]);
        });
        it('Test 0x02 function `genFC02Response` and `parseFC02Response`', function () {
            var slaveAddress = 0x01;
            // var discreteInput = 0x056BCD;
            var discreteInputArray = [
                1, 0, 1, 1,
                0, 0, 1, 1,
                1, 1, 0, 1,
                0, 1, 1, 0,
                1, 0, 1, 0,
                0, 0];

            var responseData = modbus.genFC02Response(slaveAddress, discreteInputArray);
            var parsedData = modbus.parseFC02Response(discreteInputArray.length, responseData);
            assert.deepEqual(parsedData.status, [0xCD, 0x6B, 0x05]);
        });
        it('Test 0x03 function `genFC03Response` and `parseFC03Response`', function () {
            var slaveAddress = 0x01;
            var holdingRegisters = [1, 2, 3, 4];

            var responseData = modbus.genFC03Response(slaveAddress, holdingRegisters);
            var parsedData = modbus.parseFC03Response(holdingRegisters.length, responseData);
            assert.deepEqual(parsedData.status, [0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04]);
        });
        it('Test 0x04 function `genFC04Response` and `parseFC04Response`', function () {
            var slaveAddress = 0x01;
            var inputRegisters = [1, 2, 3, 4];

            var responseData = modbus.genFC04Response(slaveAddress, inputRegisters);
            var parsedData = modbus.parseFC04Response(inputRegisters.length, responseData);
            assert.deepEqual(parsedData.status, [0x00, 0x01, 0x00, 0x02, 0x00, 0x03, 0x00, 0x04]);
        });
        it('Test 0x05 function `genFC05Response` and `parseFC05Response`', function () {
            var slaveAddress = 0x01;
            var address = 0x01;
            var state = 1;

            var responseData = modbus.genFC05Response(slaveAddress, address, state);
            var parsedData = modbus.parseFC05Response(responseData);
            assert.deepEqual(parsedData.state, state ? [0xFF, 0x00] : [0x00, 0xFF]);
        });
        it('Test 0x06 function `genFC06Response` and `parseFC06Response`', function () {
            var slaveAddress = 0x01;
            var address = 0x01;
            var value = 0x5555;

            var responseData = modbus.genFC06Response(slaveAddress, address, value);
            var parsedData = modbus.parseFC06Response(responseData);
            assert.deepEqual(parsedData.value, [0x55, 0x55]);
        });
        it('Test 0x0F function `genFC0FResponse` and `parseFC0FResponse`', function () {
            var slaveAddress = 0x01;
            var startAddress = 0x01;
            var states = [1, 0, 1, 0, 0, 1, 0, 0, 0, 1];

            var responseData = modbus.genFC0FResponse(slaveAddress, startAddress, states.length);
            var parsedData = modbus.parseFC0FResponse(responseData);
            assert.deepEqual(parsedData.quantity, states.length);
        });
        it('Test 0x10 function `genFC10Response` and `parseFC10Response`', function () {
            var slaveAddress = 0x01;
            var startAddress = 0x01;
            var values = [1, 2, 3, 4];

            var responseData = modbus.genFC10Response(slaveAddress, startAddress, values.length);
            var parsedData = modbus.parseFC10Response(responseData);
            assert.deepEqual(parsedData.quantity, values.length);
        });
    });
});
