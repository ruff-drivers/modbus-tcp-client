/*!
 * Copyright (c) 2017 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var net = require('net');
var util = require('util');
var EventEmitter = require('events');
var Modbus = require('./modbus');
var Parser = require('./parser');
var lib = require('./lib');

function ModbusTcpClient(options) {
    EventEmitter.call(this);
    var that = this;
    options = options || Object.create(null);
    this._debug = options.debug || false;
    this._host = options.host || '127.0.0.1';
    this._port = options.port || 502;
    this._cmdTimeout = options.cmdTimeout || 500;
    this._contextBuilder = new lib.Context(0);
    this._parser = new Parser();
    this._parser.on('data', this._parseModbusData.bind(this));
    this._modbus = new Modbus({
        parseSlaveData: options.parseSlaveData === undefined ? true : options.parseSlaveData
    });
    this._socket = new net.Socket();
    this._socket.on('error', function (error) {
        if (that._connected === true) {
            that.emit('error', error);
        } else {
            that._log(error);
        }
    });
    this._socket.on('data', function (data) {
        that._parser.feed(data);
    });
    this._socket.on('close', function () {
        if (that._connected === false) {
            that.emit('error', new Error('Connect failed'));
        } else {
            that.emit('close');
        }
    });
}
util.inherits(ModbusTcpClient, EventEmitter);

ModbusTcpClient.prototype._log = function () {
    if (this._debug) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[ModbusTcpClient]:');
        // eslint-disable-next-line no-console
        console.log.apply(this, args);
    }
};

ModbusTcpClient.prototype.connect = function (callback) {
    var that = this;
    if (this._connected === true) {
        setImmediate(function () {
            callback && callback(new Error('Already connected'));
        });
        return;
    }
    if (typeof callback === 'function') {
        this._socket.once('connect', function () {
            callback && callback();
        });
    }
    this._socket.connect(this._port, this._host, function () {
        that._log('connected to', that._host);
        that._connected = true;
        that.emit('connect');
    });
};

ModbusTcpClient.prototype.disconnect = function (callback) {
    var that = this;
    if (this._connected === false) {
        setImmediate(function () {
            callback && callback(new Error('Already disconnected'));
        });
        return;
    }
    if (typeof callback === 'function') {
        this._socket.once('close', function () {
            that._connected = false;
            callback && callback();
        });
    }
    this._socket.destroy();
};

ModbusTcpClient.prototype._parseModbusData = function (data) {
    if (this._tid !== data.tid) {
        this._log('unknow tid, data is', data);
        return;
    }
    clearTimeout(this._responseTimer);
    this._responseCallback(undefined, data.body);
};

ModbusTcpClient.prototype._request = function (data, callback) {
    this._tid = this._contextBuilder.next();
    this._responseCallback = callback || function () {};
    this._responseTimer = setTimeout(this._responseCallback.bind(this), this._cmdTimeout, new Error('response timeout'));
    this._socket.write(Buffer.concat([
        lib.genHeader(this._tid, data.length),
        data
    ]));
};

ModbusTcpClient.prototype._fcCommRequest = function (requestBuilder, parseResponseHandler, checkResponseHandler, callback) {
    this._request(requestBuilder(), function (error, data) {
        if (error) {
            callback(error);
            return;
        }
        checkResponseHandler(parseResponseHandler(data), callback);
    });
};

ModbusTcpClient.prototype._checkModbusResponse = function (slaveAddress, functionCode, propertyName, response, callback) {
    if (response.slaveAddress === slaveAddress) {
        if (response.functionCode === functionCode) {
            propertyName ? callback(undefined, response[propertyName]) : callback();
        } else if (response.functionCode === (functionCode | 0x80)) {
            callback(new Error('Exception code: ' + response.exceptionCode));
        } else {
            callback(new Error('Invalid function code: ' + response.functionCode));
        }
    } else {
        callback(new Error('Invalid slaveAddress: ' + response.slaveAddress));
    }
};

// Modbus "Read Coil Status" (FC=0x01)
ModbusTcpClient.prototype.readCoils = function (slaveAddress, startAddress, quantity, callback) {
    this._fcCommRequest(
        this._modbus.genFC01Request.bind(this._modbus, slaveAddress, startAddress, quantity),
        this._modbus.parseFC01Response.bind(this._modbus, quantity),
        this._checkModbusResponse.bind(this, slaveAddress, 0x01, 'status'),
        callback
    );
};

// Modbus "Read Input Status" (FC=0x02)
ModbusTcpClient.prototype.readDiscreteInputs = function (slaveAddress, startAddress, quantity, callback) {
    this._fcCommRequest(
        this._modbus.genFC02Request.bind(this._modbus, slaveAddress, startAddress, quantity),
        this._modbus.parseFC02Response.bind(this._modbus, quantity),
        this._checkModbusResponse.bind(this, slaveAddress, 0x02, 'status'),
        callback
    );
};

// Modbus "Read Holding Registers" (FC=0x03)
ModbusTcpClient.prototype.readHoldingRegisters = function (slaveAddress, startAddress, quantity, callback) {
    this._fcCommRequest(
        this._modbus.genFC03Request.bind(this._modbus, slaveAddress, startAddress, quantity),
        this._modbus.parseFC03Response.bind(this._modbus, quantity),
        this._checkModbusResponse.bind(this, slaveAddress, 0x03, 'status'),
        callback
    );
};

// Modbus "Read Input Registers" (FC=0x04)
ModbusTcpClient.prototype.readInputRegisters = function (slaveAddress, startAddress, quantity, callback) {
    this._fcCommRequest(
        this._modbus.genFC04Request.bind(this._modbus, slaveAddress, startAddress, quantity),
        this._modbus.parseFC04Response.bind(this._modbus, quantity),
        this._checkModbusResponse.bind(this, slaveAddress, 0x04, 'status'),
        callback
    );
};

// Modbus "Write Single Coil" (FC=0x05)
ModbusTcpClient.prototype.writeSingleCoil = function (slaveAddress, address, state, callback) {
    this._fcCommRequest(
        this._modbus.genFC05Request.bind(this._modbus, slaveAddress, address, state),
        this._modbus.parseFC05Response.bind(this._modbus),
        this._checkModbusResponse.bind(this, slaveAddress, 0x05, 'state'),
        callback
    );
};

// Modbus "Write Single Register" (FC=0x06)
ModbusTcpClient.prototype.writeSingleRegister = function (slaveAddress, address, value, callback) {
    this._fcCommRequest(
        this._modbus.genFC06Request.bind(this._modbus, slaveAddress, address, value),
        this._modbus.parseFC06Response.bind(this._modbus),
        this._checkModbusResponse.bind(this, slaveAddress, 0x06, 'value'),
        callback
    );
};

// Modbus "Write Multiple Coils" (FC=0x0F)
ModbusTcpClient.prototype.writeMultipleCoils = function (slaveAddress, startAddress, states, callback) {
    this._fcCommRequest(
        this._modbus.genFC0FRequest.bind(this._modbus, slaveAddress, startAddress, states),
        this._modbus.parseFC0FResponse.bind(this._modbus),
        this._checkModbusResponse.bind(this, slaveAddress, 0x0F, 'quantity'),
        callback
    );
};
// Modbus "Write Multiple Registers" (FC=0x10)
ModbusTcpClient.prototype.writeMultipleRegisters = function (slaveAddress, startAddress, values, callback) {
    this._fcCommRequest(
        this._modbus.genFC10Request.bind(this._modbus, slaveAddress, startAddress, values),
        this._modbus.parseFC10Response.bind(this._modbus),
        this._checkModbusResponse.bind(this, slaveAddress, 0x10, 'quantity'),
        callback
    );
};

module.exports = ModbusTcpClient;
