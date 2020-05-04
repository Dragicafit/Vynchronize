if (typeof jwplayer !== 'undefined') {
    jwplayer().on('play', e => {
        console.log('jwplayer playing', e);
        if (host) {
            currTime = jwplayer().getPosition();
            seekOther(roomnum, currTime);
            playOther(roomnum);
        }
        else {
            if (e.playReason === "interaction" && e.reason === "playing")
                socket.emit('sync host', {});
        }
    });

    jwplayer().on('pause', e => {
        console.log('jwplayer pausing', e);
        if (host) {
            currTime = jwplayer().getPosition();
            seekOther(roomnum, currTime);
            pauseOther(roomnum);
        }
    });

    jwplayer().on('seek', e => {
        console.log('jwplayer seeking', e);
        if (host) {
            currTime = e.offset;
            seekOther(roomnum, currTime);
        }
    });
}

function jwplayerLoadVideo(videoId) {
    console.log("changing video to: " + videoId);
    var pathname = window.location.pathname.split("/");

    if (pathname.length > 5 && pathname[5] == videoId)
        return;

    document.dispatchEvent(new CustomEvent('changeVideoClient', {
        detail: JSON.stringify({
            videoId: videoId,
            location: pathname.length > 0 ? pathname[1] : "fr",
            username: username,
            roomnum: roomnum
        })
    }));
}