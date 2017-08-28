# myipc

## Light weight IPC on node js

myipc is simple and light weight IPC server and client with acknowledgement


# installing 

``` npm install --save myipc```

# server

```var logger = require('mylogger');
var ipcServer = require('myipc/server');
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
 ```
 
 # Client
 ```
var ipcClient = require('myipc/client');
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
}); ```
