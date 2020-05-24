if (typeof jwplayer !== 'undefined') {
    jwplayer().on('play', e => {
        console.log('jwplayer playing', e);
        if (!host) {
            if (e.playReason === "interaction" && e.reason === "playing")
                socket.emit('syncClient');
            return;
        }
        currTime = getTime();
        seekOther(currTime, 0);
    });

    jwplayer().on('pause', e => {
        console.log('jwplayer pausing', e);
        if (!host)
            return;
        currTime = getTime();
        seekOther(currTime, 1);
    });

    jwplayer().on('seek', e => {
        console.log('jwplayer seeking', e);
        if (!host)
            return;
        currTime = e.offset;
        seekOther(currTime, isPause());
    });
}

function getTime() {
    if (typeof jwplayer !== 'undefined')
        return 0;
    return jwplayer().getPosition();
}

function isPause() {
    if (typeof jwplayer !== 'undefined')
        return false;
    return jwplayer().getState() !== 'playing';
}

function seekTo(time) {
    if (typeof jwplayer !== 'undefined')
        return;
    jwplayer().seek(time);
}

function setState(pause) {
    if (typeof jwplayer !== 'undefined')
        return;
    if (pause)
        jwplayer().pause();
    else
        jwplayer().play();
}

function jwplayerLoadVideo(videoId) {
    console.log("changing video to: " + videoId);
    var pathname = window.location.pathname.match(parseUrlWakanim);

    if (pathname[2] === videoId)
        return;

    document.dispatchEvent(new CustomEvent('changeVideoClient', {
        detail: JSON.stringify({
            videoId: videoId,
            location: pathname[1] ? pathname[1] : "fr",
            username: username,
            roomnum: roomnum
        })
    }));
}