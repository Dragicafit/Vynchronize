function syncVideo(roomnum) {
    var currTime = getTime();
    var state = isPlay();
    var videoId = id;
    console.log("I am host and my current time is " + currTime + state);

    socket.emit('sync video', {
        room: roomnum,
        time: currTime,
        state: state,
        videoId: videoId
    });
}

function idParse() {
    var pathname = window.location.href.match(parseUrlWakanim);
    return pathname != null ? pathname[2] : null;
}

function changeVideoParse(roomnum) {
    changeVideo(roomnum, idParse());
}

function changeVideo(roomnum, videoId) {
    console.log("change video to " + videoId);
    var time = getTime();
    console.log("The time is this man: " + time);
    socket.emit('changeVideoServer', {
        room: roomnum,
        videoId: videoId,
        time: time
    });
}

socket.on('getData', _ => {
    console.log("Hi im the host, you called?");
    socket.emit('syncClient');
});

socket.on('changeVideoClient', data => {
    console.log("video id is: " + videoId);
    var videoId = data.videoId;
    id = videoId;

    var pathname = window.location.href.match(parseUrlWakanim);

    if (pathname != null && pathname[2] === videoId)
        return;

    document.dispatchEvent(new CustomEvent('changeVideoClient', {
        detail: JSON.stringify({
            videoId: videoId,
            location: pathname[1] ? pathname[1] : "fr"
        })
    }));
});