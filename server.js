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
        userrooms[socket.id] = socket.roomnum;

        var init = io.sockets.adapter.rooms['room-' + socket.roomnum] == null;

        socket.join("room-" + socket.roomnum, (err) => {
            if (err)
                return console.error("join fail");
            console.log(socket.username + " connected to room-" + socket.roomnum);

            var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
            if (room.host == null) {
                room.host = socket.id;
                room.hostName = socket.username;

                io.sockets.in("room-" + socket.roomnum).emit('changeHostLabel', {
                    username: room.hostName
                });
            }
            if (init) {
                room.currVideo = '11396';
                room.users = [socket.username];
            }

            if (socket.id != room.host) {
                console.log("call the damn host " + room.host);

                setTimeout(function () {
                    socket.broadcast.to(room.host).emit('getData');
                }, 1000);

                if (!room.users.includes(socket.username))
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
                host: socket.id == room.host
            });
        });
    });

    socket.on('play other', function () {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id != room.host)
            return;

        socket.broadcast.to("room-" + socket.roomnum).emit('justPlay');
    });

    socket.on('pause other', function () {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id != room.host)
            return;

        socket.broadcast.to("room-" + socket.roomnum).emit('justPause');
    });

    socket.on('seek other', function (data) {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id != room.host)
            return;

        var currTime = data.time;
        socket.broadcast.to("room-" + socket.roomnum).emit('justSeek', {
            time: currTime
        });
    });

    socket.on('sync video', function (data) {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id != room.host)
            return;

        var currTime = data.time;
        var state = data.state;
        var videoId = data.videoId;
        io.sockets.in("room-" + socket.roomnum).emit('syncVideoClient', {
            time: currTime,
            state: state,
            videoId: videoId
        });
    });

    socket.on('change video', function (data) {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id != room.host)
            return;

        room.currVideo = data.videoId;
        io.sockets.in("room-" + socket.roomnum).emit('changeVideoClient', {
            videoId: room.currVideo
        });
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

    socket.on('sync host', function () {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id != room.host)
            return socket.broadcast.to(host).emit('getData');
        socket.emit('syncHost');
    });

    /*socket.on('change host', function (data) {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
           return;
        if (socket.id != room.host)
            return;

        console.log(io.sockets.adapter.rooms['room-' + socket.roomnum]);
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
    });
*/
    socket.on('get host data', function (data) {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        if (socket.id == room.host)
            return;

        socket.broadcast.to(room.host).emit('getPlayerData', {
            room: roomnum,
            caller: socket.id
        });
    });

    function updateRoomUsers() {
        if (socket.roomnum == null)
            return;
        var room = io.sockets.adapter.rooms['room-' + socket.roomnum];
        if (room == null)
            return;
        io.sockets.in("room-" + socket.roomnum).emit('get users', room.users);
    }
});
