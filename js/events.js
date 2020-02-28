// These functions just simply play or pause the player
// Created for event listeners

//-----------------------------------------------------------------------------

function playOther(roomnum) {
    socket.emit('play other', {
        room: roomnum
    });
}

socket.on('justPlay', function (data) {
    console.log("currPlayer")
    jwplayer().play();
});

function pauseOther(roomnum) {
    socket.emit('pause other', {
        room: roomnum
    });
    //socket.broadcast.to("room-"+roomnum).emit('justPlay');
}

socket.on('justPause', function (data) {
    console.log("hiIamPausing!")
    jwplayer().pause()
});

function seekOther(roomnum, currTime) {
    socket.emit('seek other', {
        room: roomnum,
        time: currTime
    });
    // socket.emit('getData');
}

// Weird for YouTube because there is no built in seek event
// It seeks on an buffer event
// Only syncs if off by over .2 seconds
socket.on('justSeek', function (data) {
    console.log("Seeking Event!")
    currTime = data.time
    var clientTime = jwplayer().getPosition()
    if (clientTime < currTime - .2 || clientTime > currTime + .2) {
        jwplayer().seek(currTime)
    }
    // playOther(roomnum)
});

// Needs to grab the next video id and change the video
function playNext(roomnum) {
    socket.emit('play next', {}, function (data) {
        var videoId = data.videoId

        // IF queue is empty do not try to change
        if (videoId !== "QUEUE IS EMPTY") {
            // Change the video
            socket.emit('change video', {
                room: roomnum,
                videoId: videoId,
                time: 0
            })
        } else {
            playNextAlert()
        }
    })
}