function seekOther(currTime, state) {
    socket.emit('changeStateServer', {
        time: currTime,
        state: state
    });
}

socket.on('changeStateClient', data => {
    var currTime = data.time;
    var state = data.state;
    var clientTime = getTime();
    var clientState = isPause();

    console.log("current time is: " + currTime);
    console.log("current state is: " + state);

    if (clientTime < currTime - .2 || clientTime > currTime + .2) {
        seekTo(currTime);
    }

    if (clientState === state)
        return;
    setState(state);
});