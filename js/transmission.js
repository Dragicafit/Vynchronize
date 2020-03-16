document.addEventListener('new room', e => {
    var data = JSON.parse(e.detail);
    socket.emit('new room', data.roomnum, data2 => {
        if (data2) {
            // This sets the room number on the client
            roomnum = data2.roomnum

            console.log("send room number after new room")
            document.dispatchEvent(new CustomEvent('send info', {
                detail: JSON.stringify({
                    roomnum: roomnum
                })
            }))
        }
    })
});

document.addEventListener('new user', e => {
    var data = JSON.parse(e.detail);
    socket.emit('new user', data.username, data2 => {
        if (data2) {
            // This sets the user name on the client
            username = data2.username

            console.log("send user name after new user")
            document.dispatchEvent(new CustomEvent('send info', {
                detail: JSON.stringify({
                    username: username
                })
            }))
        }
    })
});

document.addEventListener('ask info', _ => {
    console.log("send info")
    document.dispatchEvent(new CustomEvent('send info', {
        detail: JSON.stringify({
            username: username,
            roomnum: roomnum
        })
    }))
});