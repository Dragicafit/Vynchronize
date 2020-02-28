document.addEventListener('new room', e => {
    var data = JSON.parse(e.detail);
    socket.emit('new room', data.roomnum, data => {
        // This should only call back if the client is the host
        if (data) {
            console.log("Host is syncing the new socket!")
            syncVideo(roomnum)
        }
    })
});

document.addEventListener('new user', e => {
    var data = JSON.parse(e.detail);
    socket.emit('new user', data.username, data2 => {
        if (data2) {
            // This sets the room number on the client
            if (data.roomnum != "") {
                roomnum = data.roomnum
            }
        }
    })
});