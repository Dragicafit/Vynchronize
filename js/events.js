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
    var clientState = isPlay();

    console.log("current time is: " + clientTime);
    console.log("current time server is: " + currTime);
    console.log("current state is: " + clientState);
    console.log("current state server is: " + state);

    setState(state);

    if (clientTime < currTime - .2 || clientTime > currTime + .2)
        seekTo(currTime);
});