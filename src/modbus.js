/*!
 * Copyright (c) 2017 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

function Modbus(option) {
    option = option || Object.create(null);
    if (option.parseSlaveData === undefined) {
        this._parseSlaveData = true;
    } else {
        this._parseSlaveData = option.parseSlaveData;
    }
}

// read slave data common handler
Modbus.prototype._genReadSlaveData = function (slaveAddress, functionCode, startAddress, quantity) {
    var buffer = Buffer.alloc(6);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(functionCode, 1);
    buffer.writeUInt16BE(startAddress, 2);
    buffer.writeUInt16BE(quantity, 4);
    return buffer;
};

// Request Modbus "Read Coil Status" (FC=0x01)
Modbus.prototype.genFC01Request = function (slaveAddress, startAddress, quantity) {
    return this._genReadSlaveData(slaveAddress, 0x01, startAddress, quantity);
};

// Request Modbus "Read Input Status" (FC=0x02)
Modbus.prototype.genFC02Request = function (slaveAddress, startAddress, quantity) {
    return this._genReadSlaveData(slaveAddress, 0x02, startAddress, quantity);
};

// Request Modbus "Read Holding Registers" (FC=0x03)
Modbus.prototype.genFC03Request = function (slaveAddress, startAddress, quantity) {
    return this._genReadSlaveData(slaveAddress, 0x03, startAddress, quantity);
};

// Request Modbus "Read Input Registers" (FC=0x04)
Modbus.prototype.genFC04Request = function (slaveAddress, startAddress, quantity) {
    return this._genReadSlaveData(slaveAddress, 0x04, startAddress, quantity);
};

// write single common handler
Modbus.prototype._genWriteSlaveSingle = function (slaveAddress, functionCode, address, value) {
    var buffer = Buffer.alloc(6);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(functionCode, 1);
    buffer.writeUInt16BE(address, 2);
    buffer.writeUInt16BE(value, 4);
    return buffer;
};

// Request Modbus "Write Single Coil" (FC=0x05)
Modbus.prototype.genFC05Request = function (slaveAddress, address, state) {
    var value = state ? 0xFF00 : 0x0000;
    return this._genWriteSlaveSingle(slaveAddress, 0x05, address, value);
};

// Request Modbus "Write Single Register " (FC=0x06)
Modbus.prototype.genFC06Request = function (slaveAddress, address, value) {
    return this._genWriteSlaveSingle(slaveAddress, 0x06, address, value);
};

// Request Modbus "Write Multiple Coils" (FC=0x0F)
Modbus.prototype.genFC0FRequest = function (slaveAddress, startAddress, states) {
    var buffer = Buffer.alloc(6);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(0x0F, 1);
    buffer.writeUInt16BE(startAddress, 2);
    buffer.writeUInt16BE(states.length, 4);
    return Buffer.concat([buffer, bitsToBuffer(states)]);
};

// Request Modbus "Write Multiple Registers" (FC=0x10)
Modbus.prototype.genFC10Request = function (slaveAddress, address, values) {
    var buffer = Buffer.alloc(7 + 2 * values.length);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(0x10, 1);
    buffer.writeUInt16BE(address, 2);
    buffer.writeUInt16BE(values.length, 4);
    buffer.writeUInt8(values.length * 2, 6);
    for (var i = 0; i < values.length; i++) {
        buffer.writeUInt16BE(values[i], 7 + 2 * i);
    }
    return buffer;
};

// Response Exception
Modbus.prototype.genErrorResponse = function (slaveAddress, functionCode, exceptionCode) {
    var buffer = Buffer.alloc(3);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(functionCode + 0x80, 1);
    buffer.writeUInt8(exceptionCode, 2);
    return buffer;
};

Modbus.prototype._genReadBitsResponse = function (slaveAddress, functionCode, bits) {
    var buffer = Buffer.alloc(2);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(functionCode, 1);
    return Buffer.concat([buffer, bitsToBuffer(bits)]);
};

Modbus.prototype._genReadRegistersResponse = function (slaveAddress, functionCode, registers) {
    var buffer = Buffer.alloc(2);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(functionCode, 1);
    return Buffer.concat([buffer, registersToBuffer(registers)]);
};

// Response Modbus "Read Coil Status" (FC=0x01)
Modbus.prototype.genFC01Response = function (slaveAddress, coilStatus) {
    return this._genReadBitsResponse(slaveAddress, 0x01, coilStatus);
};
// Response Modbus "Read Input Status" (FC=0x02)
Modbus.prototype.genFC02Response = function (slaveAddress, discreteInputs) {
    return this._genReadBitsResponse(slaveAddress, 0x02, discreteInputs);
};
// Response Modbus "Read Holding Registers" (FC=0x03)
Modbus.prototype.genFC03Response = function (slaveAddress, holdingRegisters) {
    return this._genReadRegistersResponse(slaveAddress, 0x03, holdingRegisters);
};
// Response Modbus "Read Input Registers" (FC=0x04)
Modbus.prototype.genFC04Response = function (slaveAddress, InputRegisters) {
    return this._genReadRegistersResponse(slaveAddress, 0x04, InputRegisters);
};

// Response Modbus "Write Single Coil" (FC=0x05), the same as request
Modbus.prototype.genFC05Response = function (slaveAddress, address, state) {
    var value = state ? 0xFF00 : 0x0000;
    return this._genWriteSlaveSingle(slaveAddress, 0x05, address, value);
};

// Response Modbus "Write Single Register " (FC=0x06), the same as request
Modbus.prototype.genFC06Response = function (slaveAddress, address, value) {
    return this._genWriteSlaveSingle(slaveAddress, 0x06, address, value);
};

Modbus.prototype._genWriteMultipleResponse = function (slaveAddress, functionCode, startAddress, quantity) {
    var buffer = Buffer.alloc(6);
    buffer.writeUInt8(slaveAddress, 0);
    buffer.writeUInt8(functionCode, 1);
    buffer.writeUInt16BE(startAddress, 2);
    buffer.writeUInt16BE(quantity, 4);
    return buffer;
};

// Response Modbus "Write Multiple Coils" (FC=0x0F)
Modbus.prototype.genFC0FResponse = function (slaveAddress, startAddress, quantity) {
    return this._genWriteMultipleResponse(slaveAddress, 0x0F, startAddress, quantity);
};

// Response Modbus "Write Multiple Registers" (FC=0x10)
Modbus.prototype.genFC10Response = function (slaveAddress, startAddress, quantity) {
    return this._genWriteMultipleResponse(slaveAddress, 0x10, startAddress, quantity);
};

// parse read status common handler
Modbus.prototype._parseReadStatusResponse = function (quantity, buffer, expectFunctionCode, convertHandler) {
    var slaveAddress = buffer.readUInt8(0);
    var functionCode = buffer.readUInt8(1);
    if (functionCode === expectFunctionCode) {
        var byteCount = buffer.readUInt8(2);
        var statusBuffer = buffer.slice(2);
        var status = this._parseSlaveData ? convertHandler(statusBuffer).slice(0, quantity) : statusBuffer.slice(1);
        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            byteCount: byteCount,
            status: status
        };
    } else if (functionCode === (expectFunctionCode | 0x80)) {
        var exceptionCode = buffer.readUInt8(2);
        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            exceptionCode: exceptionCode
        };
    } else {
        throw new Error('Invalid function code to be parsed');
    }
};

// Parse "Read Coil Status" (FC=0x01) Response
Modbus.prototype.parseFC01Response = function (quantity, buffer) {
    return this._parseReadStatusResponse(quantity, buffer, 0x01, bufferToBits);
};
// Parse "Read Input Status" (FC=0x02) Response
Modbus.prototype.parseFC02Response = function (quantity, buffer) {
    return this._parseReadStatusResponse(quantity, buffer, 0x02, bufferToBits);
};
// Parse "Read Holding Registers" (FC=0x03) Response
Modbus.prototype.parseFC03Response = function (quantity, buffer) {
    return this._parseReadStatusResponse(quantity * 2, buffer, 0x03, bufferToRegisters);
};
// Parse "Read Input Registers" (FC=0x04) Response
Modbus.prototype.parseFC04Response = function (quantity, buffer) {
    return this._parseReadStatusResponse(quantity * 2, buffer, 0x04, bufferToRegisters);
};

// Parse "Write Single Coil" (FC=0x05) Response
Modbus.prototype.parseFC05Response = function (buffer) {
    var slaveAddress = buffer.readUInt8(0);
    var functionCode = buffer.readUInt8(1);

    if (functionCode === 0x05) {
        var address = buffer.readUInt16BE(2);
        var state;
        if (this._parseSlaveData) {
            state = buffer.readUInt16BE(4) === 0xFF00 ? 1 : 0;
        } else {
            state = buffer.slice(4, 6);
        }

        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            address: address,
            state: state
        };
    } else if (functionCode === 0x85) {
        var exceptionCode = buffer.readUInt8(2);
        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            exceptionCode: exceptionCode
        };
    } else {
        throw new Error('Invalid function code to be parsed');
    }
};
// Parse "Write Single Register " (FC=0x06) Response
Modbus.prototype.parseFC06Response = function (buffer) {
    var slaveAddress = buffer.readUInt8(0);
    var functionCode = buffer.readUInt8(1);

    if (functionCode === 0x06) {
        var address = buffer.readUInt16BE(2);
        var value = this._parseSlaveData ? buffer.readUInt16BE(4) : buffer.slice(4, 6);

        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            address: address,
            value: value
        };
    } else if (functionCode === 0x86) {
        var exceptionCode = buffer.readUInt8(2);
        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            exceptionCode: exceptionCode
        };
    } else {
        throw new Error('Invalid function code to be parsed');
    }
};

// parse write multiple common handler
Modbus.prototype._parseWriteMultipleResponse = function (buffer, expectFunctionCode) {
    var slaveAddress = buffer.readUInt8(0);
    var functionCode = buffer.readUInt8(1);

    if (functionCode === expectFunctionCode) {
        var startAddress = buffer.readUInt16BE(2);
        var quantity = buffer.readUInt16BE(4);

        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            startAddress: startAddress,
            quantity: quantity
        };
    } else if (functionCode === (expectFunctionCode | 0x80)) {
        var exceptionCode = buffer.readUInt8(2);
        return {
            slaveAddress: slaveAddress,
            functionCode: functionCode,
            exceptionCode: exceptionCode
        };
    } else {
        throw new Error('Invalid function code to be parsed');
    }
};

// Parse "Write Multiple Coils" (FC=0x0F) Response
Modbus.prototype.parseFC0FResponse = function (buffer) {
    return this._parseWriteMultipleResponse(buffer, 0x0F);
};
// Parse "Write Multiple Registers" (FC=0x10) Response
Modbus.prototype.parseFC10Response = function (buffer) {
    return this._parseWriteMultipleResponse(buffer, 0x10);
};

function bitsToBuffer(bits) {
    var buffer = Buffer.alloc(Math.ceil(bits.length / 8) + 1);
    var i;
    buffer.fill(0x00);
    buffer.writeUInt8(buffer.length - 1, 0);

    for (var index = 0; index < bits.length; index++) {
        i = Math.floor(index / 8) + 1;

        buffer.writeUInt8(buffer.readUInt8(i) >> 1, i);
        if (bits[index]) {
            buffer.writeUInt8(buffer.readUInt8(i) | 0x80, i);
        }
    }

    i = bits.length - (Math.floor(bits.length / 8) * 8);
    if (i > 0) {
        i = 8 - i;
        while (i > 0) {
            buffer.writeUInt8(buffer.readUInt8(buffer.length - 1) >> 1, buffer.length - 1);
            i -= 1;
        }
    }

    return buffer;
}

function bufferToBits(buffer) {
    var bits = [];
    for (var i = 1; i < Math.min(buffer.length, buffer.readUInt8(0) + 1); i++) {
        for (var j = 0; j < 8; j++) {
            bits.push((buffer.readUInt8(i) >> j) & 0x1);
        }
    }
    return bits;
}

function bufferToRegisters(buffer) {
    var total = buffer.readUInt8(0) / 2;
    var registers = [];
    for (var i = 0; i < total; i++) {
        registers.push(buffer.readUInt16BE(1 + 2 * i));
    }
    return registers;
}

function registersToBuffer(registers) {
    var buffer = Buffer.alloc(registers.length * 2 + 1);
    buffer.writeUInt8(registers.length * 2, 0);
    for (var i = 0; i < registers.length; i++) {
        buffer.writeUInt16BE(registers[i], 1 + 2 * i);
    }
    return buffer;
}

module.exports = Modbus;
