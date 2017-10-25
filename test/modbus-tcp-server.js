'use strict';

var net = require('net');

function ModbusTcpServer(options) {
    var that = this;
    options = options || Object.create(null);
    this._port = options.port || 502;
    this._server = new net.Server();
    this._server.on('close', function () {
    });
    this._server.on('connection', function (socket) {
        socket.on('data', function (data) {
            var tid = data.slice(0, 2);
            socket.write(that._genResponseData(tid));
        });
    });
}

ModbusTcpServer.prototype.listen = function () {
    this._server.listen(this._port);
};

ModbusTcpServer.prototype.close = function () {
    this._server.close();
};

ModbusTcpServer.prototype.setModbusResponseData = function (data) {
    this._modbusResponseData = data;
};

ModbusTcpServer.prototype._genResponseData = function (tid) {
    var protocolBuffer = Buffer.alloc(2).fill(0);
    var lengthBuffer = Buffer.alloc(2);
    lengthBuffer.writeUInt16BE(this._modbusResponseData.length);
    return Buffer.concat([
        tid,
        protocolBuffer,
        lengthBuffer,
        this._modbusResponseData
    ]);
};

module.exports = ModbusTcpServer;
