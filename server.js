var fs = require('fs');
var net = require('net');
var util = require('util');
var uuid = require('uuid');
var events = require('events');
var logger = require('mylogger');
function ipcServer(sockPath) {
    this.sockPath = sockPath;
}
ipcServer.prototype.createServer = function (sockPath, cb) {
    var self = this;
    events.EventEmitter.call(this);
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
        self.emit('connect', socket);
        socket.on('data', function (data) {
            try {
                self.parseResponse(JSON.parse(data), socket);
            } catch (e) {
                throw e;
            }
        });
    }).listen(this.sockPath, function (err) {
        cb(err);
    });
};
util.inherits(ipcServer, events.EventEmitter);
ipcServer.prototype.parseResponse = function (socket, data) {
    var self = this;
    if (data.type === 'ack') {
        return socket.emit('ack_' + data.id, data.data);
    }
    if (data.type === 'data') {
        socket.emit('data', data.data, function (data1) {
            self._write({type: 'ack', id: data.id, data: data1});
        });
    }
};
ipcServer.prototype.send = function (socket, data, cb) {
    var sendId = uuid();
    var strData = (typeof data === 'string') ? data : JSON.stringify(data);
    if (typeof cb !== 'function') {
        return socket.write(data);
    }
    this.on('ack_' + sendId, cb);
    socket.write({type: 'message', id: sendId, data: data});
};

var server = new ipcServer();
server.createServer('/tmp/sham1.sock', function () {
    logger.info('server is listening on /tmp/sham1.sock');
    setInterval(function () {
        server.send('hello ', function (st) {
            logger.log('data sent to server', st);
        });
    }, 1000)
    server.on('data', function (data, cb, cb1) {
        logger.log('sending ack for received data :', data);
        cb({s: "received:" + Date.now()});
    })
});
 