// Play Event
jwplayer().on('play', function (e) {
    console.log('jwplayer playing', e);
    if (host) {
        playOther(roomnum)
    }
    else {
        getHostData(roomnum)
    }
});

// Pause Event
jwplayer().on('pause', function (e) {
    console.log('jwplayer pausing', e);
    if (host) {
        pauseOther(roomnum)
    }
});

// Seek Event
jwplayer().on('seeked', function (e) {
    console.log('jwplayer seeking', e);
    currTime = jwplayer().getPosition()
    if (host) {
        seekOther(roomnum, currTime)
    }
});

// Play/pause function
function jwplayerPlay() {
    if (jwplayer().getState() == 'paused') {
        jwplayer().play();
    } else {
        jwplayer().pause();
    }
}