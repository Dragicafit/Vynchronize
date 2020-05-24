function seekOther(currTime, state) {
    socket.emit('changeStateServer', {
        time: currTime,
        state: state
    });
}

socket.on('changeStateClient', data => {
    var clientTime = getTime();

    console.log("current time is: " + clientTime);
    console.log("current time server is: " + data.time);
    console.log("current state server is: " + data.state);

    setState(data.state);

    if (clientTime < data.time - .2 || clientTime > data.state + .2)
        seekTo(data.state);
});