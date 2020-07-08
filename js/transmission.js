window.addEventListener("message", event => {
    if (event.source !== window || !event.data.direction || event.data.direction !== "from-content-WWF")
        return;
    if (event.data.command === 'joinRoom') {
        socket.emit('joinRoom', event.data, data2 => {
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

            window.postMessage({
                direction: "from-script-WWF",
                command: 'send info',
                roomnum: roomnum,
                username: username
            }, "*");
        });
    } else if (event.data.command === 'ask info') {
        console.log("send info");

        window.postMessage({
            direction: "from-script-WWF",
            command: 'send info',
            roomnum: roomnum,
            username: username
        }, "*");
    }
});