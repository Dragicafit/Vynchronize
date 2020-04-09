document.addEventListener('new room', e => {
    var data = JSON.parse(e.detail);
    socket.emit('new room', data.roomnum, data2 => {
        if (data2) {
            roomnum = data2.roomnum;
            host = data2.host;
            if (host) {
                console.log("You are the new host!");
                changeVideoParse(roomnum);
            }

            console.log("send room number after new room " + roomnum);
            document.dispatchEvent(new CustomEvent('send info', {
                detail: JSON.stringify({
                    roomnum: roomnum
                })
            }));
        }
    });
});

document.addEventListener('new user', e => {
    var data = JSON.parse(e.detail);
    socket.emit('new user', data.username, data2 => {
        if (data2) {
            username = data2.username;

            console.log("send user name after new user " + username);
            document.dispatchEvent(new CustomEvent('send info', {
                detail: JSON.stringify({
                    username: username
                })
            }));
        }
    });
});

document.addEventListener('ask info', _ => {
    console.log("send info");
    document.dispatchEvent(new CustomEvent('send info', {
        detail: JSON.stringify({
            username: username,
            roomnum: roomnum
        })
    }));
});