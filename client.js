const Match = require('./match');
const Player = require('./player');

class Client {
    constructor(server, ws) {
        this.server = server;
        this.ws = ws;
    }

    onOpen(ws, req) {
        this.address = req.getHeader('x-forwarded-for');
        if (!this.address) {
            this.address = Buffer.from(ws.getRemoteAddress()).slice(-4, 16); // HACK: For some reason, uWS keeps returning full 16 byte IP addresses. Wtf?
        }

        this.setState('l'); // Login
    }

    onClose(ws, code, message) {
        console.log('Successfully closed connection!');
    }

    send(json) {
        this.ws.send(JSON.stringify(json))
    }

    login() {
        this.send({packets: [
            {name: this.player.name, team: this.player.team, skin: this.player.skin, type: "l01"}
        ], type: "s01"});
    }

    setState(state) {
        this.state = this.pendingState = state;
        this.send({packets: [
            {state: this.state, type: "s00"}
        ], type: "s01"});
    }

    onTextMessage(ws, message) {
        message = JSON.parse(message);

        switch (this.state) {
            case 'l':
                switch (message.type) {
                    case 'l00':
                        this.player = new Player(
                            this, new Match(this.server, true, '', 0),
                            'Mario', '',
                            0, 0
                        );

                        this.login();
                        this.setState('g'); // In-game
                        break;
                }
                break;

            case 'g':
                switch (message.type) {
                    case 'g00':
                        this.pendingState = null;
                        this.player.onEnterIngame();
                        break;
                }
                break;
        }
    }

    onBinaryMessage(ws, message) {
        var code = message[0];
        if (!(code in Client.CODE_LENGTH)) {
            console.log('PACKET NOT AVAILABLE ' + code);
            return;
        }

        var length = Client.CODE_LENGTH[code] + 1;
        if (message.length < length) {
            console.log('LENGTH CHECK FAILED');
            return;
        }

        message = message.slice(1);

        // TODO: https://github.com/gyorokpeter/mroyale-server/blob/baf04bf52031d1dee5e8fe6eb57eeffeaf0fe768/server.py#L487

        //this.player.handleBinary(code, message);

        console.log(`Binary message recieved: ${Buffer.from(message).toString('hex')}`);
    }
}

/* Constants */
Client.CODE_LENGTH = {0x10: 6, 0x11: 0, 0x12: 12, 0x13: 1, 0x17: 2, 0x18: 4, 0x19: 0, 0x20: 7, 0x30: 7};

module.exports = Client;