// Calls the play video function on the server
function playVideo(roomnum) {
    // dailyPlayer.play();
    //vimeoPlayer.play()
    socket.emit('play video', {
        room: roomnum
    });

    // Doesn't work well unless called in server
    //io.sockets.in("room-"+roomnum).emit('playVideoClient');
}

// Calls the sync function on the server
function syncVideo(roomnum) {
    var currTime = 0
    var state
    var videoId = id

    // var syncText = document.getElementById("syncbutton")
    // console.log(syncText.innerHTML)
    // syncText.innerHTML = "<i class=\"fas fa-sync fa-spin\"></i> Sync"

    currTime = jwplayer().getPosition();
    state = jwplayer().getState() !== 'playing';
    console.log("I am host and my current time is " + currTime + state)

    socket.emit('sync video', {
        room: roomnum,
        time: currTime,
        state: state,
        videoId: videoId
    });
}

// This return the current time
function getTime() {
    return jwplayer().getPosition();
}

function seekTo(time) {
    jwplayer().seek(currTime)
    jwplayer().play()
}

// This parses the ID out of the video link
function idParse(videoId) {
    // If user enters a full link
    if (videoId.includes("https://") || videoId.includes("http://") || videoId.includes(".com/")) {
        // Do some string processing with regex
        var myRegex = /.+episode\/([0-9]+)/g
        var match = myRegex.exec(videoId)
        if (match != null) {
            console.log("You entered a link, but you really meant " + match[1])
            return match[1]
        }
        videoId = "invalid"
    }
    return videoId
}

function changeVideoParse(roomnum) {
    console.log("change video to " + roomnum)
    var pathname = window.location.pathname.split("/")

    if (pathname.length <= 5)
        return

    var videoId = pathname[5]
    changeVideo(roomnum, videoId)
}

// Change playVideo
function changeVideo(roomnum, rawId) {
    var videoId = idParse(rawId)

    if (videoId != "invalid") {
        var time = getTime()
        console.log("The time is this man: " + time)
        // Actually change the video!
        socket.emit('change video', {
            room: roomnum,
            videoId: videoId,
            time: time
        });
    } else {
        console.log("User entered an invalid video url :(")
        invalidURL()
    }
    //player.loadVideoById(videoId);
}

// Does this even work?
function changeVideoId(roomnum, id) {
    //var videoId = 'sjk7DiH0JhQ';
    document.getElementById("inputVideoId").innerHTML = id;
    socket.emit('change video', {
        room: roomnum,
        videoId: id
    });
    //player.loadVideoById(videoId);
}

// Change to previous video
function prevVideo(roomnum) {
    // This gets the previous video
    socket.emit('change previous video', {
        room: roomnum
    }, function (data) {
        // Actually change the video!
        var prevTime = data.time
        var time = getTime()
        socket.emit('change video', {
            room: roomnum,
            videoId: data.videoId,
            time: time,
            prev: true
        }, function (data) {
            // Set to the previous time
            setTimeout(function () {
                seekTo(prevTime)
            }, 1200);
        });
    });
}

// This just calls the sync host function in the server
socket.on('getData', function (data) {
    console.log("Hi im the host, you called?")
    socket.emit('sync host', {});
    //socket.emit('change video', { time: time });
});
/*
function changePlayer(roomnum, playerId) {
    if (playerId != currPlayer) {
        socket.emit('change player', {
            room: roomnum,
            playerId: playerId
        });
    }
}

// Change a single player
function changeSinglePlayer(playerId) {
    return new Promise((resolve, reject) => {
        if (playerId != currPlayer) {
            socket.emit('change single player', {
                playerId: playerId
            });
        }
        resolve("socket entered change single player function")
    })
}
*/


//------------------------------//
// Client Synchronization Stuff //
//------------------------------//

// Calls the play/pause function
socket.on('playVideoClient', function (data) {
    // Calls the proper play function for the player
    jwplayerPlay()
});

socket.on('pauseVideoClient', function (data) {
    jwplayer().pause()
});

// Syncs the video client
socket.on('syncVideoClient', function (data) {
    if (host)
        return
    var currTime = data.time
    var state = data.state
    var videoId = data.videoId
    console.log("current time is: " + currTime)
    console.log("curr vid id: " + id + " " + videoId)
    console.log("state" + state)

    // There should no longer be any need to sync a video change
    // Video should always be the same
    // if (id != videoId){
    //     console.log(id == videoId)
    //     changeVideoId(roomnum, videoId)
    // }

    // This switchs you to the correct player
    // Should only happen when a new socket joins late

    // Current issue: changePlayer is called asynchronously when we need this function to wait for it to finish
    // changeSinglePlayer(playerId)
    // currPlayer = playerId

    // This syncs the time and state
    var clientTime = jwplayer().getPosition()
    if (clientTime < currTime - .1 || clientTime > currTime + .1)
        jwplayer().seek(currTime)

    // Sync player state
    // IF parent player was paused
    if (state) {
        jwplayer().pause()
    } else {
        jwplayer().play()
    }
    //}

});

// Change video
socket.on('changeVideoClient', function (data) {
    var videoId = data.videoId;
    console.log("video id is: " + videoId)

    // Pause right before changing
    // pauseOther(roomnum)

    // This is getting the video id from the server
    // The original change video call updates the value for the room
    // This probably is more inefficient than just passing in the parameter but is safer?
    socket.emit('get video', function (id) {
        console.log("it really is " + id)
        videoId = id
        // This changes the video
        id = videoId

        jwplayerLoadVideo(videoId);
    })

});

// Change time
socket.on('changeTime', function (data) {
    var time = data.time
    jwplayer().seek(time);
});