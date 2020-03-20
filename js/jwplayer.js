if (typeof jwplayer !== 'undefined') {
    // Play Event
    jwplayer().on('play', function (e) {
        console.log('jwplayer playing', e);
        if (host) {
            currTime = jwplayer().getPosition()
            seekOther(roomnum, currTime)
            playOther(roomnum)
        }
        else {
            //getHostData(roomnum)
            if (e.playReason === "interaction" && e.reason === "playing")
                socket.emit('sync host', {});
        }
    });

    // Pause Event
    jwplayer().on('pause', function (e) {
        console.log('jwplayer pausing', e);
        if (host) {
            currTime = jwplayer().getPosition()
            seekOther(roomnum, currTime)
            pauseOther(roomnum)
        }
    });

    // Seek Event
    jwplayer().on('seek', function (e) {
        console.log('jwplayer seeking', e);
        if (host) {
            currTime = e.offset
            seekOther(roomnum, currTime)
        }
    });/*
jwplayer().on('seeked', function (e) {
    console.log('jwplayer seeked', e);
    if (host) {
        currTime = jwplayer().getPosition()
        seekOther(roomnum, currTime)
    }
});*/

    // Play/pause function
    function jwplayerPlay() {
        if (jwplayer().getState() !== 'playing') {
            jwplayer().play();
        } else {
            jwplayer().pause();
        }
    }
}

// Load video
function jwplayerLoadVideo(videoId) {
    console.log("changing video to: " + videoId)
    var pathname = window.location.pathname.split("/")

    if (pathname.length > 5 && pathname[5] == videoId)
        return;

    document.dispatchEvent(new CustomEvent('changeVideoClient', {
        detail: JSON.stringify({
            videoId: videoId,
            location: pathname.length > 0 ? pathname[1] : "fr",
            username: username,
            roomnum: roomnum
        })
    }))
}