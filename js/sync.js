function syncVideo(roomnum) {
    var currTime = jwplayer().getPosition();
    var state = jwplayer().getState() !== 'playing';
    var videoId = id;
    console.log("I am host and my current time is " + currTime + state);

    socket.emit('sync video', {
        room: roomnum,
        time: currTime,
        state: state,
        videoId: videoId
    });
}

function getTime() {
    return typeof jwplayer === 'undefined' ? 0 : jwplayer().getPosition();
}

function seekTo(time) {
    jwplayer().seek(currTime);
    jwplayer().play();
}

function idParse() {
    var pathname = window.location.pathname.match(parseUrlWakanim);
    return pathname[2];
}

function changeVideoParse(roomnum) {
    changeVideo(roomnum, idParse());
}

function changeVideo(roomnum, videoId) {
    console.log("change video to " + videoId);
    if (videoId == null) {
        console.log("User entered an invalid video url :(");
    } else {
        var time = getTime();
        console.log("The time is this man: " + time);
        socket.emit('changeVideoServer', {
            room: roomnum,
            videoId: videoId,
            time: time
        });
    }
}

socket.on('getData', data => {
    console.log("Hi im the host, you called?");
    socket.emit('syncClient');
});

socket.on('changeVideoClient', data => {
    var videoId = data.videoId;
    id = videoId;
    console.log("video id is: " + videoId);

    jwplayerLoadVideo(videoId);
});