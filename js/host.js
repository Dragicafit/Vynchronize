socket.on('setHost', _ => {
    console.log("You are the new host!");
    host = true;
    changeVideoParse(roomnum);
});

socket.on('unSetHost', _ => {
    console.log("Unsetting host");
    host = false;
});

socket.on('getData', _ => {
    console.log("Hi im the host, you called?");
    socket.emit('syncClient');
});

socket.on('syncHost', _ => {
    if (typeof jwplayer !== 'undefined')
        return;
    syncVideo(roomnum);
});

function changeHost(roomnum) {
    if (!host) {
        socket.emit('change host', {
            room: roomnum
        });
    }
}

socket.on('autoHost', data => {
    changeHost(data.roomnum);
});

function getHostData(roomnum) {
    socket.emit('get host data', {
        room: roomnum
    });
}

function test() {
    document.getElementById('player').src = document.getElementById('player').src + '&controls=0';
}
