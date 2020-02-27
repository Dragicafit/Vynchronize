// Gets all the player data
socket.on('getPlayerData', function (data) {
    var roomnum = data.room
    var caller = data.caller

    var currTime = jwplayer().getPosition()
    var state = jwplayer().getState() == 'paused'
    socket.emit('get host data', {
        room: roomnum,
        currTime: currTime,
        state: state,
        caller: caller
    });
});
/*
// Create jwplayer Player
socket.on('createJwplayer', function (data) {
    if (currPlayer != 4) {

        var jwplayer = document.getElementById('jwplayerArea');
        jwplayer.style.display = 'block';
        currPlayer = 4


        document.getElementById('visual-queue').style.display = 'none'
        document.getElementById('queue-arrows').style.display = 'none'
        document.getElementById('beta-message').style.display = 'block'
        document.getElementById('enqueueButton').style.display = 'none'
        document.getElementById('emptyButton').style.display = 'none'
        document.getElementById('nextButton').style.display = 'none'
        document.getElementById('loveButton').style.display = 'none'
        // document.getElementById('html5-input').style.display = 'block'
        document.getElementById('inputVideoId').placeholder = 'Direct mp4/webm URL'
        // document.getElementById('html5-message').style.display = 'block'

        betaAlert()
    }
});
*/

undefined;