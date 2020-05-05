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

function idParse(videoId) {
    if (videoId.includes("https://") || videoId.includes("http://") || videoId.includes(".com/")) {
        var myRegex = /.+episode\/([0-9]+)/g;
        var match = myRegex.exec(videoId);
        if (match != null) {
            console.log("You entered a link, but you really meant " + match[1]);
            return match[1];
        }
        videoId = "invalid";
    }
    return videoId;
}

function changeVideoParse(roomnum) {
    console.log("change video to " + roomnum);
    var pathname = window.location.pathname.split("/");

    if (pathname.length <= 5)
        return;

    var videoId = pathname[5];
    changeVideo(roomnum, videoId);
}

function changeVideo(roomnum, rawId) {
    var videoId = idParse(rawId);

    if (videoId != "invalid") {
        var time = getTime();
        console.log("The time is this man: " + time);
        socket.emit('changeVideoServer', {
            room: roomnum,
            videoId: videoId,
            time: time
        });
    } else {
        console.log("User entered an invalid video url :(");
        invalidURL();
    }
}

function changeVideoId(roomnum, id) {
    document.getElementById("inputVideoId").innerHTML = id;
    socket.emit('changeVideoServer', {
        room: roomnum,
        videoId: id
    });
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