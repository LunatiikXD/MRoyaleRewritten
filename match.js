const lobby = require('./lobby.json');

class Match {
    constructor(server, _private, team, gameMode) {
        this.server = server;

        this.forceLevel = '';
        this.customLevelData = {};
        this.isLobby = true;
        this.world = 'custom';
        this.team = team; // roomName
        this.closed = true;
        this.private = _private;
        this.gameMode = gameMode;
        this.levelMode = this.gameMode;
        if (this.gameMode == 'pvp') { // if self.gameMode != "pvp" else "royale"
            this.levelMode = 'royale';
        }
        this.playing = false;
        this.usingCustomLevel = false;
        this.autoStartOn = !this.private || (this.team != '' && this.server.config.match.enableAutoStartInMultiPrivate);
        this.autoStartTimer = null;
        this.autoStartTicks = 0;
        this.tickTimer = null;
        this.startTimer = 0;
        this.votes = 0;
        this.winners = 0;
        this.lastId = -1;
        this.players = []; // list()
        //this.getRandomLevel("lobby", null);
        //this.instantiateLevel();
        //this.initLevel();
    }

    getRandomLevel(type, mode) {
        // ...
    }

    getNextPlayerId() {
        this.lastId += 1;
        return this.lastId;
    }

    addPlayer(player) {
        this.players.push(player);
        return this.getNextPlayerId();
    }

    removePlayer(player) {
        if (!this.players[player]) {
            return;
        }

        delete this.players[player]; // This should work?

        if (this.players.length == 0) {
            // TODO: https://github.com/gyorokpeter/mroyale-server/blob/master/match.py#L58
            this.server.removeMatch(this);
            return;
        }

        // ...
    }

    instantiateLevel() {
        this.level = this.customLevelData; // deepcopy
        // TODO: Fix Z, W layers...
    }

    initLevel() {
        this.initObjects();
    }

    extractMainLayer(zone) {
        var data = zone['data'];
        var layers = zone['layers'];

        if (data) {
            return data;
        } else if (layers) {
            var mainLayers = [];

            layers.forEach((x) => { mainLayers.push(x['z'] == 0) });

            if (mainLayers.length != 1) {
                throw new Error('Invalid world, should have exactly one layer at depth 0.');
            }

            return mainLayers[0]['data'];
        } else {
            throw new Error('Invalid world, neither data or layers present.');
        }
    }

    // This shit code is sponsered by Python.
    initObjects() {
        // self.objects = [(lambda x:[(lambda x:{x["pos"]:x["type"] for x in x["obj"]})(x) for x in x["zone"]])(x) for x in self.level["world"]]
        this.objects = [];
        this.level['world'].forEach((x) => {
            var world = [];

            x['zone'].forEach((x) => {
                var zone = {};

                x['obj'].forEach((x) => { zone[x['pos']] = x['type'] });

                world.push(zone);
            });

            this.objects.push(world);
        });

        // self.allcoins = [(lambda x:[(lambda x:[y for y in x if x[y]==97])(x) for x in x])(x) for x in self.objects]
        this.allCoins = [];
        this.objects.forEach((x) => {
            var world = [];

            x.forEach((x) => {
                var zone = [];

                for (var y of Object.keys(x)) {
                    if (x[y] == 97) {
                        zone.push(y);
                    }
                }

                world.push(zone);
            });

            this.allCoins.push(world);
        });

        // self.tiles = [(lambda x:[self.extractMainLayer(x) for x in x["zone"]])(x) for x in self.level["world"]]
        this.tiles = [];
        this.level['world'].forEach((x) => {
            var world = [];

            x['zone'].forEach((x) => {
                world.push(this.extractMainLayer(x));
            });

            this.tiles.push(world);
        });

        // self.zoneHeight = [[len(y) for y in x] for x in self.tiles]
        this.zoneWidth = [];
        this.tiles.forEach((x) => {
            var world = [];

            x.forEach((y) => {
                world.push(y[0].length);
            });

            this.zoneWidth.push(world);
        });

        // self.zoneWidth = [[len(y[0]) for y in x] for x in self.tiles]
        this.zoneHeight = [];
        this.tiles.forEach((x) => {
            var world = [];

            x.forEach((y) => {
                world.push(y.length);
            });

            this.zoneHeight.push(world);
        });

        this.coins = this.allCoins; // deepcopy
        this.powerups = {};
    }

    getLoadMessage() {
        var packet = {game: this.world, type: "g01"};
        packet.levelData = JSON.stringify(lobby);
        return {packets: [packet], type: "s01"};
    }
}

module.exports = Match;