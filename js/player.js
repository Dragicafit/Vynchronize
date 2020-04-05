// Gets all the player data
socket.on('getPlayerData', function (data) {
    var roomnum = data.room
    var caller = data.caller

    var currTime = jwplayer().getPosition()
    var state = jwplayer().getState() !== 'playing'

    socket.emit('get host data', {
        room: roomnum,
        currTime: currTime,
        state: state,
        caller: caller
    });
});