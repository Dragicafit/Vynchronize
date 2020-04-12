#!/usr/bin/env node
'use strict';

require('dotenv').config();

const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

var users = [];
var connections = 0;
var userrooms = {};
var nosymbols = /^[\w-]+$/;

server.listen(port, () => {
    console.log("Server listening at port %d", port);
});

io.on('connection', (socket) => {
    connections++;
    console.log("Connected: %s sockets connected", connections);

    socket.on('disconnect', function (data) {
        connections--;
        console.log(socket.id + "Disconnected: %s sockets connected", connections);

        const index = users.indexOf(socket.username);
        if (index > -1) {
            users.splice(index, 1);
        }

        var id = socket.id;
        var roomnum = userrooms[id];
        var room = io.sockets.adapter.rooms['room-' + roomnum];

        if (room != null) {
            if (socket.id == room.host) {
                room.host = undefined;
            }
            const index = room.users.indexOf(socket.username);
            if (index > -1) {
                room.users.splice(index, 1);
                updateRoomUsers(roomnum);
            }
        }
        delete userrooms[id];
    });

    socket.on('new room', function (data, callback) {
        console.log("New room");
        if (!nosymbols.test(data))
            return callback();

        socket.roomnum = data;
        userrooms[socket.id] = data;

        var host = null;
        var init = false;

        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];

        if (room == null || room.host == null) {
            socket.send(socket.id);
            host = socket.id;
            init = true;
        } else {
            console.log(socket.roomnum);
            host = room.host;
        }

        console.log(socket.username + " connected to room-" + socket.roomnum);
        socket.join("room-" + socket.roomnum, (err) => {
            if (err)
                return console.error("join fail");

            room = io.sockets.adapter.rooms['room-' + socket.roomnum];
            if (init) {
                room.host = host;
                room.currVideo = '11396';
                room.hostName = socket.username;
                room.users = [socket.username];
            }
            io.sockets.in("room-" + socket.roomnum).emit('changeHostLabel', {
                username: room.hostName
            });

            io.sockets.in("room-" + socket.roomnum).emit('createJwplayer', {});

            if (socket.id != host) {
                console.log("call the damn host " + host);
                setTimeout(function () {
                    socket.broadcast.to(host).emit('getData');
                }, 1000);
                room.users.push(socket.username);

                socket.emit('changeVideoClient', {
                    videoId: room.currVideo
                });
            } else {
                console.log("I am the host");
            }
            updateRoomUsers(socket.roomnum);
            callback({
                roomnum: socket.roomnum,
                host: init
            });
        });
    });

    socket.on('play other', function (data) {
        var roomnum = data.room;
        socket.broadcast.to("room-" + roomnum).emit('justPlay');
    });

    socket.on('pause other', function (data) {
        var roomnum = data.room;
        socket.broadcast.to("room-" + roomnum).emit('justPause');
    });

    socket.on('seek other', function (data) {
        var roomnum = data.room;
        var currTime = data.time;
        socket.broadcast.to("room-" + roomnum).emit('justSeek', {
            time: currTime
        });
    });

    socket.on('sync video', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] != null) {
            var roomnum = data.room;
            var currTime = data.time;
            var state = data.state;
            var videoId = data.videoId;
            io.sockets.in("room-" + roomnum).emit('syncVideoClient', {
                time: currTime,
                state: state,
                videoId: videoId
            });
        }
    });

    socket.on('change video', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] != null) {
            var roomnum = data.room;
            var videoId = data.videoId;

            io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo = videoId;

            io.sockets.in("room-" + roomnum).emit('changeVideoClient', {
                videoId: videoId
            });
        }
    });

    socket.on('new user', function (data, callback) {
        console.log("New user");
        if (!nosymbols.test(data))
            return callback();

        if (!socket.username) {
            socket.username = data;
            if (!users.includes(socket.username))
                users.push(socket.username);
        }
        callback({
            username: socket.username
        });
    });

    socket.on('sync host', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] != null) {
            var host = io.sockets.adapter.rooms['room-' + socket.roomnum].host;

            if (socket.id != host) {
                socket.broadcast.to(host).emit('getData');
            } else {
                socket.emit('syncHost');
            }
        }
    });

    socket.on('change host', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] != null) {
            console.log(io.sockets.adapter.rooms['room-' + socket.roomnum]);
            var roomnum = data.room;
            var newHost = socket.id;
            var currHost = io.sockets.adapter.rooms['room-' + socket.roomnum].host;

            if (newHost != currHost) {
                console.log("I want to be the host and my socket id is: " + newHost);

                socket.broadcast.to(currHost).emit('unSetHost');
                io.sockets.adapter.rooms['room-' + socket.roomnum].host = newHost;
                socket.emit('setHost');

                io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username;
                io.sockets.in("room-" + roomnum).emit('changeHostLabel', {
                    username: socket.username
                });
            }
        }
    });

    socket.on('get host data', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] != null) {
            var roomnum = data.room;
            var host = io.sockets.adapter.rooms['room-' + roomnum].host;

            if (data.currTime == null) {
                var caller = socket.id;
                socket.broadcast.to(host).emit('getPlayerData', {
                    room: roomnum,
                    caller: caller
                });
            } else {
                var caller = data.caller;
                socket.broadcast.to(caller).emit('compareHost', data);
            }
        }

    });

    function updateRoomUsers(roomnum) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] != null) {
            var roomUsers = io.sockets.adapter.rooms['room-' + socket.roomnum].users;
            io.sockets.in("room-" + roomnum).emit('get users', roomUsers);
        }
    }
});
