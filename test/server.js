var logger = require('mylogger');
var ipcServer = require('../server');
var server = new ipcServer();
server.createServer('/tmp/sham1.sock', function () {
    logger.info('server is listening on /tmp/sham1.sock');
    server.on('connect', function (socket) {
        logger.log('server is connected with a client')

        socket.on('error', function (err) {
            logger.error('got error: ', err);
        })
        socket.on('end', function () {
            logger.error('connection end');
        })

        setInterval(function () {
            logger.log('sending data to client')
            socket.send('hello ', function (st) {
                logger.log('data sent to client', st);
            });
        }, 1000)
//        socket.on('data', function (data, cb) {
//            logger.log('sending ack for received data :', data);
//            cb({s: "received:" + Date.now()});
//        });
    });
});
 
