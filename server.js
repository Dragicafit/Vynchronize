require('dotenv').config();

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
connections = [];
rooms = [];
// Store all of the sockets and their respective room numbers
userrooms = {}

// Set given room for url parameter
var given_room = ""

app.use(express.static(__dirname + '/'));

server.listen(process.env.PORT || 3000);
console.log('Server Started . . .');


// app.param('room', function(req,res, next, room){
//     console.log("testing")
//     console.log(room)
//     given_room = room
// res.sendFile(__dirname + '/index.html');
// });


app.get('/:room', function (req, res) {
    given_room = req.params.room
    res.sendFile(__dirname + '/index.html');
});


//var roomno = 1;
/*
io.on('connection', function(socket) {

   //Increase roomno 2 clients are present in a room.
   //if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) roomno++;

   // For now have it be the same room for everyone!
   socket.join("room-"+roomno);

   //Send this event to everyone in the room.
   io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
})*/

io.sockets.on('connection', function (socket) {
    // Connect Socket
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Set default room, if provided in url
    socket.emit('set id', {
        id: given_room
    })

    // io.sockets.emit('broadcast',{ description: connections.length + ' clients connected!'});

    // For now have it be the same room for everyone!
    //socket.join("room-"+roomno);

    //Send this event to everyone in the room.
    //io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);

    // reset url parameter
    // Workaround because middleware was not working right
    socket.on('reset url', function (data) {
        given_room = ""
    });

    // Disconnect
    socket.on('disconnect', function (data) {

        // If socket username is found
        if (users.indexOf(socket.username) != -1) {
            users.splice((users.indexOf(socket.username)), 1);
            updateUsernames();
        }

        connections.splice(connections.indexOf(socket), 1);
        console.log(socket.id + ' Disconnected: %s sockets connected', connections.length);
        // console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])
        // console.log(socket.roomnum)


        // HOST DISCONNECT
        // Need to check if current socket is the host of the roomnum
        // If it is the host, needs to auto assign to another socket in the room

        // Grabs room from userrooms data structure
        var id = socket.id
        var roomnum = userrooms[id]
        var room = io.sockets.adapter.rooms['room-' + roomnum]

        // If you are not the last socket to leave
        if (room !== undefined) {
            // If you are the host
            if (socket.id == room.host) {
                // Reassign
                room.host = undefined
                /*console.log("hello i am the host " + socket.id + " and i am leaving my responsibilities to " + Object.keys(room.sockets)[0])
                io.to(Object.keys(room.sockets)[0]).emit('autoHost', {
                    roomnum: roomnum
                })*/
            }

            // Remove from users list
            // If socket username is found
            if (room.users.indexOf(socket.username) != -1) {
                room.users.splice((room.users.indexOf(socket.username)), 1);
                updateRoomUsers(roomnum);
            }
        }

        // Delete socket from userrooms
        delete userrooms[id]

    });

    // ------------------------------------------------------------------------
    // New room
    socket.on('new room', function (data, callback) {
        //callback(true);
        // Roomnum passed through
        socket.roomnum = data;

        // This stores the room data for all sockets
        userrooms[socket.id] = data

        var host = null
        var init = false

        // Sets default room value to 1
        if (socket.roomnum == null || socket.roomnum == "") {
            socket.roomnum = '1'
            userrooms[socket.id] = '1'
        }

        // Adds the room to a global array
        if (!rooms.includes(socket.roomnum)) {
            rooms.push(socket.roomnum);
        }

        // Checks if the room exists or not
        // console.log(io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined)
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] === undefined || io.sockets.adapter.rooms['room-' + socket.roomnum].host === undefined) {
            socket.send(socket.id)
            // Sets the first socket to join as the host
            host = socket.id
            init = true

            // Set the host on the client side
            //console.log(socket.id)
        } else {
            console.log(socket.roomnum)
            host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
        }

        // Actually join the room
        console.log(socket.username + " connected to room-" + socket.roomnum)
        socket.join("room-" + socket.roomnum);

        // Sets the default values when first initializing
        if (init) {
            // Sets the host
            io.sockets.adapter.rooms['room-' + socket.roomnum].host = host
            // Default video
            io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo = {
                jwplayer: '11396'
            }
            // Host username
            io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username
            // Keep list of online users
            io.sockets.adapter.rooms['room-' + socket.roomnum].users = [socket.username]
        }

        // Set Host label
        io.sockets.in("room-" + socket.roomnum).emit('changeHostLabel', {
            username: io.sockets.adapter.rooms['room-' + socket.roomnum].hostName
        })

        // Gets current video from room variable
        var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.jwplayer

        // Change the video player to current One
        io.sockets.in("room-" + socket.roomnum).emit('createJwplayer', {});

        // Change the video to the current one
        //socket.emit('changeVideoClient', {
        //    videoId: currVideo
        //});

        // Get time from host which calls change time for that socket
        if (socket.id != host) {
            //socket.broadcast.to(host).emit('getTime', { id: socket.id });
            console.log("call the damn host " + host)

            // Set a timeout so the video can load before it syncs
            setTimeout(function () {
                socket.broadcast.to(host).emit('getData');
            }, 1000);
            //socket.broadcast.to(host).emit('getData');

            // Push to users in the room
            io.sockets.adapter.rooms['room-' + socket.roomnum].users.push(socket.username)

            socket.emit('changeVideoClient', {
                videoId: currVideo
            });

            // This calls back the function on the host client
            //callback(true)

            // DISABLE CONTROLS - DEPRECATED
            // socket.emit('hostControls');
        } else {
            console.log("I am the host")
            //socket.emit('auto sync');

            // Auto syncing is not working atm
            // socket.broadcast.to(host).emit('auto sync');
        }

        // Update online users
        updateRoomUsers(socket.roomnum)

        // This is all of the rooms
        // io.sockets.adapter.rooms['room-1'].currVideo = "this is the video"
        // console.log(io.sockets.adapter.rooms['room-1']);

        callback({
            roomnum: socket.roomnum,
            host: init
        });
    });
    // ------------------------------------------------------------------------



    // ------------------------------------------------------------------------
    // ------------------------- Socket Functions -----------------------------
    // ------------------------------------------------------------------------

    // Play video
    socket.on('play video', function (data) {
        var roomnum = data.room
        io.sockets.in("room-" + roomnum).emit('playVideoClient');
    });

    // Event Listener Functions
    // Broadcast so host doesn't continuously call it on itself!
    socket.on('play other', function (data) {
        var roomnum = data.room
        socket.broadcast.to("room-" + roomnum).emit('justPlay');
    });

    socket.on('pause other', function (data) {
        var roomnum = data.room
        socket.broadcast.to("room-" + roomnum).emit('justPause');
    });

    socket.on('seek other', function (data) {
        var roomnum = data.room
        var currTime = data.time
        socket.broadcast.to("room-" + roomnum).emit('justSeek', {
            time: currTime
        });

        // Sync up
        // host = io.sockets.adapter.rooms['room-' + roomnum].host
        // console.log("let me sync "+host)
        // socket.broadcast.to(host).emit('getData');
    });

    // Sync video
    socket.on('sync video', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var currTime = data.time
            var state = data.state
            var videoId = data.videoId
            // var videoId = io.sockets.adapter.rooms['room-'+roomnum].currVideo
            io.sockets.in("room-" + roomnum).emit('syncVideoClient', {
                time: currTime,
                state: state,
                videoId: videoId
            })
        }
    });

    // Change video
    socket.on('change video', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var videoId = data.videoId
            var time = data.time
            var host = io.sockets.adapter.rooms['room-' + socket.roomnum].host

            // This changes the room variable to the video id
            // io.sockets.adapter.rooms['room-' + roomnum].currVideo = videoId
            // Set new video id
            io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.jwplayer = videoId

            io.sockets.in("room-" + roomnum).emit('changeVideoClient', {
                videoId: videoId
            });
        }

        // Auto sync with host after 1000ms of changing video
        // NOT NEEDED ANYMORE, IN THE CHANGEVIDEOCLIENT FUNCTION
        // setTimeout(function() {
        //     socket.broadcast.to(host).emit('getData');
        // }, 1000);

        // console.log(io.sockets.adapter.rooms['room-1'])
    });

    // Get video id based on player
    socket.on('get video', function (callback) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            // Gets current video from room variable
            var currVideo = io.sockets.adapter.rooms['room-' + socket.roomnum].currVideo.jwplayer
            // Call back to return the video id
            callback(currVideo)
        }
    })

    // New User
    socket.on('new user', function (data, callback) {
        if (!socket.username) {
            // Data is username
            var encodedUser = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            socket.username = encodedUser;
            //console.log(socket.username)
            if (!users.includes(socket.username))
                users.push(socket.username);
            updateUsernames();
        }
        callback({
            username: socket.username
        });
    });

    // Changes time for a specific socket
    socket.on('change time', function (data) {
        // console.log(data);
        var caller = data.id
        var time = data.time
        socket.broadcast.to(caller).emit('changeTime', {
            time: time
        });
    });

    // This just calls the syncHost function
    socket.on('sync host', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            //socket.broadcast.to(host).emit('syncVideoClient', { time: time, state: state, videoId: videoId });
            var host = io.sockets.adapter.rooms['room-' + socket.roomnum].host
            // If not host, recall it on host
            if (socket.id != host) {
                socket.broadcast.to(host).emit('getData')
            } else {
                socket.emit('syncHost')
            }
        }
    })

    // Change host
    socket.on('change host', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])
            var roomnum = data.room
            var newHost = socket.id
            var currHost = io.sockets.adapter.rooms['room-' + socket.roomnum].host

            // If socket is already the host!
            if (newHost != currHost) {
                console.log("I want to be the host and my socket id is: " + newHost);
                //console.log(io.sockets.adapter.rooms['room-' + socket.roomnum])

                // Broadcast to current host and set false
                socket.broadcast.to(currHost).emit('unSetHost')
                // Reset host
                io.sockets.adapter.rooms['room-' + socket.roomnum].host = newHost
                // Broadcast to new host and set true
                socket.emit('setHost')

                io.sockets.adapter.rooms['room-' + socket.roomnum].hostName = socket.username
                // Update host label in all sockets
                io.sockets.in("room-" + roomnum).emit('changeHostLabel', {
                    username: socket.username
                })
                // Notify alert
                socket.emit('notify alerts', {
                    alert: 1,
                    user: socket.username
                })
            }
        }
    })

    // Get host data
    socket.on('get host data', function (data) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomnum = data.room
            var host = io.sockets.adapter.rooms['room-' + roomnum].host

            // Broadcast to current host and set false
            // Call back not supported when broadcasting

            // Checks if it has the data, if not get the data and recursively call again
            if (data.currTime === undefined) {
                // Saves the original caller so the host can send back the data
                var caller = socket.id
                socket.broadcast.to(host).emit('getPlayerData', {
                    room: roomnum,
                    caller: caller
                })
            } else {
                var caller = data.caller
                // Call necessary function on the original caller
                socket.broadcast.to(caller).emit('compareHost', data);
            }
        }

    })

    // Calls notify functions
    socket.on('notify alerts', function (data) {
        var alert = data.alert
        console.log("entered notify alerts")
        var encodedUser = ""
        if (data.user) {
            encodedUser = data.user.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }

        switch (alert) {
            // Enqueue alert
            case 0:
                var encodedTitle = ""
                if (data.title) {
                    encodedTitle = data.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                }
                io.sockets.in("room-" + socket.roomnum).emit('enqueueNotify', {
                    user: encodedUser,
                    title: encodedTitle
                })
                break;
            // Host Change Alert
            case 1:
                io.sockets.in("room-" + socket.roomnum).emit('changeHostNotify', {
                    user: encodedUser
                })
                break;
            // Empty Queue Alert
            case 2:
                io.sockets.in("room-" + socket.roomnum).emit('emptyQueueNotify', {
                    user: encodedUser
                })
                break;
            // Beta Message Alert
            case 3:
                console.log("yoyoyoyoyo")
                io.sockets.in("room-" + socket.roomnum).emit('betaNotify', {})
                break;
            default:
                console.log("Error alert id")
        }
    })

    // Some update functions --------------------------------------------------
    // Update all users
    function updateUsernames() {
        // io.sockets.emit('get users', users);
        // console.log(users)
    }

    // Update the room usernames
    function updateRoomUsers(roomnum) {
        if (io.sockets.adapter.rooms['room-' + socket.roomnum] !== undefined) {
            var roomUsers = io.sockets.adapter.rooms['room-' + socket.roomnum].users
            io.sockets.in("room-" + roomnum).emit('get users', roomUsers)
        }
    }
})
