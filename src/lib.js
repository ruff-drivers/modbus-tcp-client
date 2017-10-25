/*!
 * Copyright (c) 2017 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

function genHeader(tid, length) {
    var head = Buffer.alloc(6);
    head.fill(0);
    head.writeUInt16BE(tid, 0);
    head.writeUInt16BE(length, 4);
    return head;
}
exports.genHeader = genHeader;

function Context(seed) {
    if (seed === undefined) {
        this._seed = 0x1234;
    } else {
        this._seed = seed;
    }
}
Context.prototype.next = function () {
    this._seed++;
    if (this._seed > 0xFFFF) {
        this._seed = 0;
    }
    return this._seed;
};
exports.Context = Context;
