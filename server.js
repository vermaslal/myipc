var fs = require('fs');
var net = require('net');
var util = require('util');
var uuid = require('uuid');
var events = require('events');
function mySock(socket) {
    events.EventEmitter.call(this);
    var self = this;
    this.socket = socket;
    this.socket.on('data', function (data) {
        try {
            self.parseResponse(JSON.parse(data));
        } catch (e) {
            throw e;
        }
    });
    this.socket.on('end', function () {
        self.emit('end');
    });
    this.socket.on('error', function (err) {
        self.emit('error', err);
    })
}
util.inherits(mySock, events.EventEmitter);
mySock.prototype.parseResponse = function (data) {
    var self = this;
    if (data.type === 'ack') {
        return this.emit('ack_' + data.id, data.data);
    }
    if (data.type === 'data') {
        this.emit('data', data.data, function (data1) {
            self._write({type: 'ack', id: data.id, data: data1});
        });
    }
};
mySock.prototype.send = function (data, cb) {
    if (typeof cb !== 'function') {
        return this._write(data);
    }
    var sendId = uuid();
    this.on('ack_' + sendId, cb);
    this._write({type: 'data', id: sendId, data: data});
};
mySock.prototype._write = function (data, cb) {
    cb = cb || function () {};
    var strData = (typeof data === 'string') ? data : JSON.stringify(data);
    this.socket.write(strData, cb);
}
function ipcServer(sockPath) {
    this.sockPath = sockPath;
    events.EventEmitter.call(this);
}
util.inherits(ipcServer, events.EventEmitter);
ipcServer.prototype.createServer = function (sockPath, cb) {
    var self = this;
    if (typeof sockPath === 'string') {
        this.sockPath = sockPath;
    } else if (typeof sockPath === 'function') {
        cb = sockPath;
    }
    try {
        fs.unlinkSync(this.sockPath);
    } catch (e) {
        if (e.code !== 'ENOENT') {
            cb(e);
        }
    }
    net.createServer(function (socket) {
        var mysock = new mySock(socket);
        self.emit('connect', mysock);
    }).listen(this.sockPath, function (err) {
        cb(err);
    });
};

module.exports = ipcServer;
