if (typeof jwplayer !== 'undefined') {
    jwplayer().on('play', e => {
        console.log('jwplayer playing', e);
        if (!host) {
            if (e.playReason === "interaction" && e.reason === "playing")
                socket.emit('syncClient');
            return;
        }
        seekOther(getTime(), true);
    });

    jwplayer().on('pause', e => {
        console.log('jwplayer pausing', e);
        if (!host)
            return;
        seekOther(getTime(), false);
    });

    jwplayer().on('seek', e => {
        console.log('jwplayer seeking', e);
        if (!host)
            return;
        seekOther(e.offset, isPlay());
    });
}

function getTime() {
    if (typeof jwplayer === 'undefined')
        return 0;
    return jwplayer().getPosition();
}

function isPlay() {
    if (typeof jwplayer === 'undefined')
        return false;
    return jwplayer().getState() === 'playing';
}

function seekTo(time) {
    if (typeof jwplayer === 'undefined')
        return;
    jwplayer().seek(time);
}

function setState(state) {
    if (typeof jwplayer === 'undefined')
        return;
    if (state)
        jwplayer().play();
    else
        jwplayer().pause();
}