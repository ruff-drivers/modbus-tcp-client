/*!
 * Copyright (c) 2017 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

/*
MBAP(Modbus Application Protocol) Header format
| Transaction Identifier | Protocol Identifier | Length  | Unit Identifier |
|      2 bytes           |   2 bytes (0x0000)  | 2 bytes |   1 byte        |

Transaction Identifier: Identification of a MODBUS Request / Response transaction
Protocol Identifier: 0 = MODBUS protocol
Unit Identifier: Identification of a remote slave connected on a serial line or on other buses.

head in this file only contains the former 6 bytes
*/

var EventEmitter = require('events');
var util = require('util');
var State = {
    head: 0,
    body: 1
};
var HAED_LENGTH = 6;

function Parser() {
    EventEmitter.call(this);
    this.init();
}
util.inherits(Parser, EventEmitter);

Parser.prototype.feed = function (data) {
    this._buffer = Buffer.concat([this._buffer, data]);
    this._parser();
};

Parser.prototype.init = function () {
    this._state = State.head;
    this._buffer = Buffer.alloc(0);
    this._data = Object.create(null);
};

Parser.prototype._parser = function () {
    while (this._buffer.length) {
        var parsed;
        switch (this._state) {
            case State.head:
                parsed = this._parseHead();
                break;
            case State.body:
                parsed = this._parseBody();
                break;
            default:
                break;
        }

        if (!parsed) {
            break;
        }
    }
};

Parser.prototype._consume = function (length) {
    this._buffer = this._buffer.slice(length);
};

Parser.prototype._checkHead = function (data) {
    this._data.tid = data.readUInt16BE(0);
    if (data.readUInt16BE(2) === 0) { // protocol is modbus
        this._data.protocol = 'modbus';
    } else {
        this._data.protocol = 'unknow';
    }
    this._data.length = data.readUInt16BE(4);
};

Parser.prototype._parseHead = function () {
    if (this._buffer.length >= HAED_LENGTH) {
        this._checkHead(this._buffer.slice(0, HAED_LENGTH));
        this._consume(HAED_LENGTH);
        if (this._data.length > 0) {
            this._state = State.body;
        }
        return true;
    }
    return false;
};

Parser.prototype._parseBody = function () {
    if (this._buffer.length < this._data.length) {
        return false;
    }
    this._data.body = this._buffer.slice(0, this._data.length);
    if (this._data.protocol === 'modbus') {
        this.emit('data', this._data);
    }
    this._consume(this._data.length);
    this._state = State.head;
    return true;
};

module.exports = Parser;
