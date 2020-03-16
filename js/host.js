//-----------------------------------------------------------------------------
// Host stuff
var host = false
var notifyfix = false

// Sets the host for the room
socket.on('setHost', function (data) {
    notifyfix = true
    console.log("You are the new host!")
    host = true
    changeVideoParse(roomnum)
});
// Unsets the host
socket.on('unSetHost', function (data) {
    console.log("Unsetting host")
    host = false
});

// This grabs data and calls sync FROM the host
socket.on('getData', function (data) {
    console.log("Hi im the host, you called?")
    socket.emit('sync host', {});
});
// Calls sync
socket.on('syncHost', function (data) {
    syncVideo(roomnum)
});

//Change the host
function changeHost(roomnum) {
    if (!host) {
        socket.emit('change host', {
            room: roomnum
        });
        socket.emit('notify alerts', {
            alert: 1,
            user: username
        })
    }
}
/*
// Change the host label
socket.on('changeHostLabel', function (data) {
    var user = data.username
    // Change label
    var hostlabel = document.getElementById('hostlabel')
    hostlabel.innerHTML = "<i class=\"fas fa-user\"></i> Current Host: " + user

    // Generate notify alert
    // CANNOT CALL IT HERE
    // socket.emit('notify alerts', {
    //     alert: 1,
    //     user: user
    // })
})
*/
// When the host leaves, the server calls this function on the next socket
socket.on('autoHost', function (data) {
    changeHost(data.roomnum)
})

// If user gets disconnected from the host, give warning!
function disconnected() {
    // boolean to prevent alert on join
    if (notifyfix) {
        disconnectedAlert()
    } else {
        notifyfix = true
    }
}

// Grab all host data
function getHostData(roomnum) {
    socket.emit('get host data', {
        room: roomnum
    });
}

// Uses the host data to compare
socket.on('compareHost', function (data) {
    // The host data
    var hostTime = data.currTime

    var currTime = jwplayer().getPosition()

    // If out of sync
    console.log("curr: " + currTime + " Host: " + hostTime)
    if (currTime < hostTime - 2 || currTime > hostTime + 2) {
        disconnected()
    }
});

function test() {
    document.getElementById('player').src = document.getElementById('player').src + '&controls=0'
}

//-----------------------------------------------------------------------------
