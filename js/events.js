// These functions just simply play or pause the player
// Created for event listeners

//-----------------------------------------------------------------------------
if (typeof jwplayer !== 'undefined') {
    function playOther(roomnum) {
        socket.emit('play other', {
            room: roomnum
        });
    }

    socket.on('justPlay', function (data) {
        console.log("currPlayer");
        jwplayer().play();
    });

    function pauseOther(roomnum) {
        socket.emit('pause other', {
            room: roomnum
        });
        //socket.broadcast.to("room-"+roomnum).emit('justPlay');
    }

    socket.on('justPause', function (data) {
        console.log("hiIamPausing!");
        jwplayer().pause();
    });

    function seekOther(roomnum, currTime) {
        socket.emit('seek other', {
            room: roomnum,
            time: currTime
        });
        // socket.emit('getData');
    }

    socket.on('justSeek', function (data) {
        console.log("Seeking Event!");
        currTime = data.time;
        var clientTime = jwplayer().getPosition();
        if (clientTime < currTime - .2 || clientTime > currTime + .2) {
            jwplayer().seek(currTime);
        }
        // playOther(roomnum)
    });
}