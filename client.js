var net = require('net');
var util = require('util');
var uuid = require('uuid');
var events = require('events');
function ipcClient(sockPath) {
    this.sockPath = sockPath;
}
ipcClient.prototype.connect = function (sockPath, cb) {
    var self = this;
    events.EventEmitter.call(this);
    if (typeof sockPath === 'string') {
        this.sockPath = sockPath;
    } else if (typeof sockPath === 'function') {
        cb = sockPath;
    }
    this.socket = net.connect(this.sockPath, function () {
        self.socket.on('data', function (data) {
            try {
                self.parseResponse(JSON.parse(data));
            } catch (e) {
                throw e;
            }
        });
        cb()
    });
};
util.inherits(ipcClient, events.EventEmitter);
ipcClient.prototype.parseResponse = function (data) {
    var self = this;
    if (data.type === 'ack') {
        return this.emit('ack_' + data.id, data.data);
    }
    if (data.type === 'data') {
        return this.emit('data', data.data, function (data1) {
            self._write({type: 'ack', id: data.id, data: data1});
        });
    }
};
ipcClient.prototype.send = function (data, cb) {
    var sendId = uuid();
    if (typeof cb !== 'function') {
        return this._write(data);
    }
    this.on('ack_' + sendId, cb);
    this._write({type: 'data', id: sendId, data: data});
};
ipcClient.prototype._write = function (data, cb) {
    cb = cb || function () {};
    var strData = (typeof data === 'string') ? data : JSON.stringify(data);
    this.socket.write(strData, cb);
};
module.exports = ipcClient;
