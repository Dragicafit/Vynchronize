socket.on('getPlayerData', data => {
    var roomnum = data.room;
    var caller = data.caller;

    var currTime = getTime();
    var state = isPause();

    socket.emit('get host data', {
        room: roomnum,
        currTime: currTime,
        state: state,
        caller: caller
    });
});