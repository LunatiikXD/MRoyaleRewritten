class Player {
    constructor(client, match, name, team, skinId, gameMode, isDeveloper) {
        this.client = client;
        this.server = client.server;
        this.match = match;
        this.skinId = skinId;
        this.gameMode = gameMode;
        this.isDeveloper = isDeveloper;

        this.name = name; // TODO: Filter
        this.forceRenamed = false;
        this.team = team;
        if (this.team.length > 0 && !isDeveloper) { // TODO: Check curse
            this.name = '';
        }
        if (this.name.length == 0) {
            this.name = this.server.config.defaultName;
            if (this.client.username == '') { // if self.client.username != "" else self.server.defaultName
                this.name = this.server.config.defaultName;
            }
        }
        /*if not isDev and self.skin in [52]:
            self.skin = 0*/
        this.pendingWorld = null;
        this.level = 0;
        this.zone = 0;
        this.position = {x: 0, y: 0};
        this.dead = true;
        this.win = false;
        this.voted = false;
        this.loaded = false;
        this.lobbier = false;
        this.lastUpdatePacket = null;
        this.wins = 0;
        this.deaths = 0;
        this.kills = 0;
        this.coins = 0;
        this.hurryingUp = false;

        this.trustCount = 0;

        this.id = 0;
    }

    send(json) {
        this.client.send(json);
    }

    loadWorld(name, message) {
        this.dead = true;
        this.loaded = false;
        this.pendingWorld = name;
        this.send(message);
    }

    onEnterIngame() {
        this.loadWorld('', this.match.getLoadMessage());
        this.client.ws.send(new Uint8Array([0x02, 0x00, 0x00, 0x00, 0x00, 0x00]), true);
    }
}

module.exports = Player;