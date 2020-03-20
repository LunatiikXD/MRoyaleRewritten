const fs = require('fs');

if (!fs.existsSync('./config.json')) {
    console.error('Configuration was not found, exiting...');
    return;
}

const config = require('./config.json');

const utils = require('./utils');

const uws = require('uWebSockets.js');
const app = uws.App();

const Client = require('./client');

var players = [];
var matches = [];

async function main(argv) {
    var server = this;

    app.ws('/*', {
        open: (ws, req) => {
            ws.client = new Client(server, ws);
            ws.client.onOpen(ws, req);
        },
        close: (ws, code, message) => { ws.client.onClose(ws, code, utils.bufferToString(message)) },
        message: (ws, message, isBinary) => {
            if (message.length == 0) {
                return;
            }

            if (!isBinary) {
                ws.client.onTextMessage(ws, utils.bufferToString(message));
            } else {
                ws.client.onBinaryMessage(ws, message)
            }
        }
    });

    app.listen(config.port, (listenSocket) => {
        if (listenSocket) {
            console.log(`Listening on port = ${config.port}`);
        }
    });
}

main(process.argv.slice(2));