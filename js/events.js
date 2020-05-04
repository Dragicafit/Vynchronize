if (typeof jwplayer !== 'undefined') {
    function playOther(roomnum) {
        socket.emit('play other', {
            room: roomnum
        });
    }

    socket.on('justPlay', _ => {
        console.log("currPlayer");
        jwplayer().play();
    });

    function pauseOther(roomnum) {
        socket.emit('pause other', {
            room: roomnum
        });
    }

    socket.on('justPause', _ => {
        console.log("hiIamPausing!");
        jwplayer().pause();
    });

    function seekOther(roomnum, currTime) {
        socket.emit('seek other', {
            room: roomnum,
            time: currTime
        });
    }

    socket.on('justSeek', data => {
        console.log("Seeking Event!");
        currTime = data.time;
        var clientTime = jwplayer().getPosition();
        if (clientTime < currTime - .2 || clientTime > currTime + .2) {
            jwplayer().seek(currTime);
        }
    });
}