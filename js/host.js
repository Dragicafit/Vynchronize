var host = false;

socket.on('setHost', function (data) {
    console.log("You are the new host!");
    host = true;
    changeVideoParse(roomnum);
});

socket.on('unSetHost', function (data) {
    console.log("Unsetting host");
    host = false;
});

socket.on('getData', function (data) {
    console.log("Hi im the host, you called?");
    socket.emit('sync host', {});
});

if (typeof jwplayer !== 'undefined') {
    socket.on('syncHost', function (data) {
        syncVideo(roomnum);
    });
}

function changeHost(roomnum) {
    if (!host) {
        socket.emit('change host', {
            room: roomnum
        });
    }
}

socket.on('autoHost', function (data) {
    changeHost(data.roomnum);
});

function getHostData(roomnum) {
    socket.emit('get host data', {
        room: roomnum
    });
}
if (typeof jwplayer !== 'undefined') {
    socket.on('compareHost', function (data) {
        var hostTime = data.currTime;

        var currTime = jwplayer().getPosition();

        console.log("curr: " + currTime + " Host: " + hostTime);
    });
}

function test() {
    document.getElementById('player').src = document.getElementById('player').src + '&controls=0';
}
