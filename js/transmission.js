document.addEventListener('joinRoom', e => {
    var data = JSON.parse(e.detail);
    socket.emit('joinRoom', data, data2 => {
        if (!data2) return;

        roomnum = data2.roomnum;
        username = data2.username;
        host = data2.host;

        if (host) {
            console.log("You are the new host!");
            changeVideoParse(roomnum);
        }
        console.log("send user name after new user " + username);
        console.log("send room number after joinRoom " + roomnum);

        document.dispatchEvent(new CustomEvent('send info', {
            detail: JSON.stringify({
                roomnum: roomnum,
                username: username
            })
        }));
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