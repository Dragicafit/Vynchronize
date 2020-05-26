function syncVideo(roomnum) {
    var currTime = getTime();
    var state = isPlay();
    console.log("I am host and my current time is " + currTime + state);

    socket.emit('sync video', {
        room: roomnum,
        time: currTime,
        state: state,
        videoId: id
    });
}

function parseUrl() {
    var pathname = window.location.href.match(parseUrlWakanim);
    if (pathname == null)
        return { location: "fr" };
    return { videoId: Number.parseInt(pathname[2], 10), location: pathname[1] };
}

function idParse() {
    return parseUrl().videoId;
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
    console.log("video id is: " + data.videoId);
    id = data.videoId;

    var url = parseUrl();

    if (url.videoId === data.videoId)
        return;

    document.dispatchEvent(new CustomEvent('changeVideoClient', {
        detail: JSON.stringify({
            videoId: data.videoId,
            location: url.location
        })
    }));
});