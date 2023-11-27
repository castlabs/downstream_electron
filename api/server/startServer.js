const express = require('express');
const cors = require('cors');

(function () {

  process.send({cmd: 'log',
                log: 'Starting HTTP server'});
  let server = express();
  server.use(cors());

  // listen for messages
  process.on('message', function (data) {

    // handles init message
    if (data.cmd === 'init') {
      // add content route
      require('./contentRoute')(server, data.routeName);
      // start http server
      server.listen(data.port, function () {
        // http server is listening => send back listening port
        process.send({cmd: 'listening_port', port: data.port});
      });
    }
  });
}());
