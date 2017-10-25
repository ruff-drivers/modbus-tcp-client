/*!
 * Copyright (c) 2017 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var assert = require('assert');
var ModbusTcpClient = require('../src/index');
var ModbusTcpServer = require('./modbus-tcp-server');
var TEST_PORT = 8181;

require('t');

describe('Test for connection', function () {
    var server;
    var client;
    beforeEach(function () {
        server = new ModbusTcpServer({
            port: TEST_PORT
        });
        client = new ModbusTcpClient({
            port: TEST_PORT
        });
        server.listen();
    });
    afterEach(function () {
        server.close();
    });
    it('should get `connect` event when connected to the server', function (done) {
        client.on('connect', function () {
            done();
        });
        client.connect();
    });

    it('should get `close` event when disconnected from the server', function (done) {
        client.on('close', function () {
            done();
        });
        client.connect();
        setTimeout(client.disconnect.bind(client), 200);
    });
});

describe('Test modbus request data in RTU mode', function () {
    var server;
    var client;
    var responseData;

    describe('Test for response data converted', function () {
        before(function (done) {
            server = new ModbusTcpServer({
                port: TEST_PORT
            });
            client = new ModbusTcpClient({
                port: TEST_PORT,
                parseSlaveData: true
            });
            server.listen();
            client.connect(done);
        });
        after(function () {
            server.close();
        });

        it('0x01 function `readCoils`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x01;
            var startAddress = 0x13;
            var quantity = 0x13;
            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x03,
                0xCD, 0x68, 0x05
            ]);
            var expectedStatus = [
                1, 0, 1, 1, 0, 0, 1, 1, // 0xCD
                0, 0, 0, 1, 0, 1, 1, 0, // 0x68
                1, 0, 1 // 0x05
            ];

            server.setModbusResponseData(responseData);
            client.readCoils(slaveAddress, startAddress, quantity, function (error, status) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(status, expectedStatus);
                done();
            });
        });

        it('0x02 function `readDiscreteInputs`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x02;
            var startAddress = 0xC4;
            var quantity = 0x16;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x03,
                0xAC, 0xDB, 0x35
            ]);

            var expectedStatus = [
                0, 0, 1, 1, 0, 1, 0, 1, // 0xAC
                1, 1, 0, 1, 1, 0, 1, 1, // 0xDB
                1, 0, 1, 0, 1, 1 // 0x35
            ];
            server.setModbusResponseData(responseData);
            client.readDiscreteInputs(slaveAddress, startAddress, quantity, function (error, status) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(status, expectedStatus);
                done();
            });
        });

        it('0x03 function `readHoldingRegisters`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x03;
            var startAddress = 0x6B;
            var quantity = 0x03;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                quantity * 2,
                0x02, 0x2B, // 0x022B
                0x00, 0x00, // 0x0000
                0x00, 0x64 // 0x0064
            ]);

            var expectedValues = [0x022B, 0x0000, 0x0064];
            server.setModbusResponseData(responseData);
            client.readHoldingRegisters(slaveAddress, startAddress, quantity, function (error, values) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(values, expectedValues);
                done();
            });
        });

        it('0x04 function `readInputRegisters`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x04;
            var startAddress = 0x08;
            var quantity = 0x01;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                quantity * 2,
                0x00, 0x0A // 0x000A
            ]);

            var expectedValues = [0x000A];
            server.setModbusResponseData(responseData);
            client.readInputRegisters(slaveAddress, startAddress, quantity, function (error, values) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(values, expectedValues);
                done();
            });
        });

        it('0x05 function `writeSingleCoil`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x05;
            var address = 0x00AC;
            var expectedState = 1;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x00, 0xAC, // address
                0xFF, 0x00 // expectedState
            ]);

            server.setModbusResponseData(responseData);
            client.writeSingleCoil(slaveAddress, address, expectedState, function (error, state) {
                if (error) {
                    done(error);
                    return;
                }
                assert.equal(state, expectedState);
                done();
            });
        });

        it('0x06 function `writeSingleRegister`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x06;
            var address = 0x0001;
            var expectedValue = 0x0003;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x00, 0x01, // address
                0x00, 0x03 // expectedValue
            ]);

            server.setModbusResponseData(responseData);
            client.writeSingleRegister(slaveAddress, address, expectedValue, function (error, state) {
                if (error) {
                    done(error);
                    return;
                }
                assert.equal(state, expectedValue);
                done();
            });
        });

        it('0x0F function `writeMultipleCoils`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x0F;
            var startAddress = 0x0013;
            var states = [
                1, 0, 1, 1, 0, 0, 1, 1,
                1, 0
            ];

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x00, 0x13, // startAddress
                0x00, 0x0A // length of states
            ]);

            server.setModbusResponseData(responseData);
            client.writeMultipleCoils(slaveAddress, startAddress, states, function (error, quantity) {
                if (error) {
                    done(error);
                    return;
                }
                assert.equal(states.length, quantity);
                done();
            });
        });

        it('0x10 function `writeMultipleRegisters`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x10;
            var startAddress = 0x0001;
            var values = [
                0x000A,
                0x0102
            ];

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x00, 0x01, // startAddress
                0x00, 0x02 // length of values
            ]);

            server.setModbusResponseData(responseData);
            client.writeMultipleRegisters(slaveAddress, startAddress, values, function (error, quantity) {
                if (error) {
                    done(error);
                    return;
                }
                assert.equal(values.length, quantity);
                done();
            });
        });
    });

    describe('Test for response data unconverted', function () {
        before(function (done) {
            server = new ModbusTcpServer({
                port: TEST_PORT
            });
            client = new ModbusTcpClient({
                port: TEST_PORT,
                parseSlaveData: false
            });
            server.listen();
            client.connect(done);
        });
        after(function () {
            server.close();
        });

        it('0x01 function `readCoils`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x01;
            var startAddress = 0x13;
            var quantity = 0x13;
            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x03,
                0xCD, 0x68, 0x05
            ]);
            var expectedStatus = [
                0xCD, 0x68, 0x05
            ];

            server.setModbusResponseData(responseData);
            client.readCoils(slaveAddress, startAddress, quantity, function (error, status) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(status, expectedStatus);
                done();
            });
        });
        it('0x02 function `readDiscreteInputs`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x02;
            var startAddress = 0xC4;
            var quantity = 0x16;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x03,
                0xAC, 0xDB, 0x35
            ]);

            var expectedStatus = [
                0xAC, 0xDB, 0x35
            ];
            server.setModbusResponseData(responseData);
            client.readDiscreteInputs(slaveAddress, startAddress, quantity, function (error, status) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(status, expectedStatus);
                done();
            });
        });
        it('0x03 function `readHoldingRegisters`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x03;
            var startAddress = 0x6B;
            var quantity = 0x03;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                quantity * 2,
                0x02, 0x2B, // 0x022B
                0x00, 0x00, // 0x0000
                0x00, 0x64 // 0x0064
            ]);

            var expectedValues = [0x02, 0x2B, 0x00, 0x00, 0x00, 0x64];
            server.setModbusResponseData(responseData);
            client.readHoldingRegisters(slaveAddress, startAddress, quantity, function (error, values) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(values, expectedValues);
                done();
            });
        });
        it('0x04 function `readInputRegisters`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x04;
            var startAddress = 0x08;
            var quantity = 0x01;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                quantity * 2,
                0x00, 0x0A // 0x000A
            ]);

            var expectedValues = [0x00, 0x0A];
            server.setModbusResponseData(responseData);
            client.readInputRegisters(slaveAddress, startAddress, quantity, function (error, values) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(values, expectedValues);
                done();
            });
        });
        it('0x05 function `writeSingleCoil`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x05;
            var address = 0x00AC;
            var expectedState = 1;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x00, 0xAC, // address
                0xFF, 0x00 // expectedState
            ]);

            server.setModbusResponseData(responseData);
            client.writeSingleCoil(slaveAddress, address, expectedState, function (error, state) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(state, [0xFF, 0x00]);
                done();
            });
        });
        it('0x06 function `writeSingleRegister`', function (done) {
            var slaveAddress = 0x01;
            var functionCode = 0x06;
            var address = 0x0001;
            var expectedValue = 0x0003;

            responseData = Buffer.from([
                slaveAddress,
                functionCode,
                0x00, 0x01, // address
                0x00, 0x03 // expectedValue
            ]);

            server.setModbusResponseData(responseData);
            client.writeSingleRegister(slaveAddress, address, expectedValue, function (error, state) {
                if (error) {
                    done(error);
                    return;
                }
                assert.deepEqual(state, [0x00, 0x03]);
                done();
            });
        });
    });
});
