function seekOther(currTime, state) {
    socket.emit('changeStateServer', {
        time: currTime,
        state: state
    });
}

socket.on('changeStateClient', data => {
    if (typeof jwplayer === 'undefined')
        return;

    var currTime = data.time;
    var state = data.state;
    var clientTime = jwplayer().getPosition();
    var clientState = isPause();

    console.log("current time is: " + currTime);
    console.log("current state is: " + state);

    if (clientTime < currTime - .2 || clientTime > currTime + .2) {
        jwplayer().seek(currTime);
    }

    if (clientState === state)
        return;
    if (state)
        jwplayer().pause();
    else
        jwplayer().play();

});