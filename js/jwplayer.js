if (typeof jwplayer !== 'undefined') {
    jwplayer().on('play', e => {
        console.log('jwplayer playing', e);
        if (!host) {
            if (e.playReason === "interaction" && e.reason === "playing")
                socket.emit('syncClient');
            return;
        }
        currTime = jwplayer().getPosition();
        seekOther(currTime, 0);
    });

    jwplayer().on('pause', e => {
        console.log('jwplayer pausing', e);
        if (!host)
            return;
        currTime = jwplayer().getPosition();
        seekOther(currTime, 1);
    });

    jwplayer().on('seek', e => {
        console.log('jwplayer seeking', e);
        if (!host)
            return;
        currTime = e.offset;
        seekOther(currTime, isPause());
    });

    function isPause() {
        return jwplayer().getState() != 'playing';
    }
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