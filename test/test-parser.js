'use strict';
require('t');
var assert = require('assert');
var Parser = require('../src/parser');

var data = Buffer.from([
    0x12, 0x34, // transaction id
    0x00, 0x00, // protocol id
    0x00, 0x06, // length
    0x01, // uint id
    0x03, 0x00, 0x10, 0x00, 0x02
]);

describe('Test EipParse', function () {
    var parser;
    beforeEach(function () {
        parser = new Parser();
    });
    it('should parse expected data', function (done) {
        parser.once('data', function (data) {
            assert(data.tid === 0x1234);
            assert(data.protocol === 'modbus');
            assert(data.length === 6);
            assert(data.body.equals(Buffer.from([
                0x01, // uint id
                0x03, 0x00, 0x10, 0x00, 0x02
            ])));
            done();
        });
        parser.feed(data);
    });
});
