
var rooms = [];
function Room(name) {
    this.name = name;
    this.players = [];
    this.screens = [];
}

function Player(socket) {
    this.socket = socket;
    this.active = false;
    this.number;
}

exports.start = function(io) {
    io.sockets.on('connection', connect);

    function connect(socket) {
        console.log("New Connection!");
        socket.on('join_game', function(data) { joinGame(socket, data); });
        socket.on('move', function(data) { sendMove(socket, data); });
        socket.on('assign_number', function(data) { activatePlayer(socket, data); });
        socket.on('disconnect', function(data) { disconnect(socket) });
    }
};

function disconnect(socket) {
    rooms.forEach(function(room) {
        room.players.forEach(function(player, i) {
            if(player.socket == socket) {
                var player_id = player.socket.id;
                room.players.splice(i, 1);
                broadcastDisconnectToRoom(room, "controller", player_id);
            }
        });
        room.screens.forEach(function(ascreen, i) {
            if(ascreen == socket) {
                room.screens.splice(i, 1);
                broadcastDisconnectToRoom(room, "screen", -1);
            }
        });
    });
}

function broadcastDisconnectToRoom(room, type, number) {
    room.players.forEach(function(player) {
        player.socket.emit("player_disconnected", {type: type, number: number });
    });

    room.screens.forEach(function(ascreen) {
        ascreen.emit("player_disconnected", {type: type, number: number });
    });
}

function activatePlayer(socket, data) {
    console.log(data.socket_id);
    findBySocketId(data.socket_id, function(player) {
        // console.log("activating Player:");
        // console.log(player);
        if(player) {
            player.active = true;
            player.number = data.number;
        } else {
            // console.log("Could not activate player...");
        }
    });
}

function findBySocketId(socket_id, cb) {
    var found = false;
    console.log('looking for socket_id:' + socket_id);
    rooms.forEach(function(room, i) {
        room.players.forEach(function(player, j) {
            console.log("This player's socket_id:" + player.socket.id);

            if(player.socket.id == socket_id) {
                console.log("Found a match!");
                found = true;
                cb(player);
            }

            if(i+1 == rooms.length && j+1 == room.players.length && !found) {
                console.log("Could not find a match");
                cb(null);
            }
        });
    });
}

function sendMove(socket, data) {
    // console.log("player trying to send move!");

    // find screens to send it to
    findScreensAndPlayerByController(socket, function(screens, player) {
        if(screens && player.active) {
            screens.forEach(function(ascreen) {
                ascreen.emit('move', { number: player.socket.id, dx: data.dx, dy: data.dy });
            });
        } else {
            if(!screens) {
                console.log("Could not find screens");
            }
            if(!player.active) {
                console.log("Player is not active yet");
            }
        }
    });
}

function findScreensAndPlayerByController(socket, cb) {
    var found = false;
    rooms.forEach(function(room, i) {
        room.players.forEach(function(player, j) {
            if(socket == player.socket) {
                found = true;
                // console.log("Found player!!!!!!");
                cb(room.screens, player);
            }

            if(i+1 == rooms.length && j+1 == room.players.length && !found) {
                cb(null, null);
            }

        });
    });
}

function joinGame(socket, data) {
    var player = new Player(socket);

    // check if room exists
    find_room(data.room, function(room) {
        // if it does, join room
        if(room) {
            if(data.type == "control") {
                room.players.push(player);
            } else if(data.type == "screen") {
                room.screens.push(socket);
            }

        // if it does not, create new room 
        } else {
            room = new Room(data.room);
            if(data.type == "control") {
                room.players.push(player);
            } else if(data.type == "screen") {
                room.screens.push(socket);
            }

            rooms.push(room);
        }

        if(data.type == "control") {
            room.screens.forEach(function(room) {
                room.emit('player_joined_game', { socket_id: socket.id });
                console.log("controller joined room: " + data.room + " socket_id:" + socket.id);
            });
        } else {
            console.log("screen joined room: " + data.room);
        }
    });
}

function find_room(name, cb) {
    rooms.forEach(function(room, i) {
        var found = false;
        if(room.name == name) {
            cb(room);
            found = true;
        }

        if(i+1 == rooms.length) {
            if(!found) {
                cb(null);
            }
        }
    });
    if(rooms.length == 0) {
        cb(null);
    }
}