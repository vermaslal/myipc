var ipcClient = require('../client');
var logger = require('mylogger');
var client = new ipcClient('/tmp/sham1.sock');
client.connect(function () {
    logger.info('client connected to /tmp/sham1.sock')
//    setInterval(function () {
//        client.send('hello ', function (st) {
//            logger.log('data sent to server. got response from server:', st);
//        });
//    }, 1000)
    client.on('data', function (data, cb) {
        logger.log('sendig ack for received data:', data);
        cb({s: "received by client"});
    })
}); 
