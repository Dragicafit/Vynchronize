var socket = io.connect('http://localhost:3000');
var roomnum = 1
var id = "M7lc1UVf-VE"
var username = ""
// Don't allow trailing or leading whitespace!
var nosymbols = new RegExp("^(([a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-])|([a-zA-Z0-9_-]*))$");

// Chat stuff
$(function () {
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $roomArea = $('#roomArea');
    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username = $('#username');
    var $roomnum = $('#roomnum');

    var $vidlist = $('#vidlist');

    //   function send_message() {
    //       socket.emit('send message', $message.val());
    //       $message.val('');
    //   }
    //
    //   $(document).keyup(send_message());
    //   $("input").keypress(function(event) {
    //     if (event.which == 13) {
    //         event.preventDefault();
    //         send_message();
    //     }
    // });


    $messageForm.submit(function (e) {
        e.preventDefault();
        // console.log("Submitted");
        socket.emit('send message', $message.val());
        $message.val('');
    });

    socket.on('new message', function (data) {
        var last_div = $('.chat > div:last')[0]

        // This checks for the last user
        // If you are the last user, attach the message instead of creating a new div
        if (last_div !== undefined) {
            var myRegex = /.*<strong>(.+)<\/strong>.*/g
            var match = myRegex.exec(last_div.innerHTML)
            console.log(last_div.innerHTML)
            var last_user = ""
            if (match != null) {
                console.log("found the user!" + match[1])
                last_user = match[1]
            }
        }
        if (data.user != last_user) {
            $chat.append('<div class="well well-sm message-well"><strong>' + data.user + '</strong>: ' + data.msg + '</div>');
            // $vidlist.append('<div class="vid-item"><div class="thumb"><img src="http://img.youtube.com/vi/eg6kNoJmzkY/0.jpg"></div><div class="desc">Jessica Hernandez & the Deltas - Dead Brains</div></div>');
        }
        // If you sent the last message, append to previous
        else {
            last_div.innerHTML = last_div.innerHTML + " <br> " + data.msg
            // $vidlist.append('<div class="vid-item"><div class="thumb"><img src="http://img.youtube.com/vi/eg6kNoJmzkY/0.jpg"></div><div class="desc">Jessica Hernandez & the Deltas - Dead Brains</div></div>');
        }
        // $chat.scrollTop = $chat.scrollHeight;
        // Auto scroll on each message send!
        $('div#chat').scrollTop($('div#chat')[0].scrollHeight)
    });

    // Submit user form
    $userForm.submit(function (e) {
        e.preventDefault();
        // console.log("Submitted");
        // New User

        // Get rid of trailing/leading whitespace
        // var roomnum_val = $roomnum.val().trim();

        // If name not entered
        if ($username.val() == "") {
            console.log("ENTER A NAME")
            var noname = document.getElementById('missinginfo')
            noname.innerHTML = "Surely you have a name right? Enter it below!"
        }
        // If name is too long
        else if ($username.val().length > 30) {
            console.log("NAME IS TOO LONG")
            var noname = document.getElementById('missinginfo')
            noname.innerHTML = "Your name can't possibly be over 30 characters!"
        }
        // If roomnate
        else if ($roomnum.val().length > 50) {
            console.log("ROOM NAME IS TOO LONG")
            var noname = document.getElementById('missinginfo')
            noname.innerHTML = "How are you going to remember a room code that has more than 50 characters?"
        }
        // If Room contains symbols
        // Can only be reached if the user decided to be sneaky and paste them!
        else if (!nosymbols.test($roomnum.val())) {
            console.log("ENTER A PROPER ROOMNUMBER")
            var noname = document.getElementById('missinginfo')
            noname.innerHTML = ""
            var noname2 = document.getElementById('missinginfo2')
            noname2.innerHTML = "Please enter a room ID without symbols or leading/trailing whitespace!"
        } else {
            username = $username.val()
            socket.emit('new user', $username.val(), function (data) {
                if (data) {
                    $userFormArea.hide();
                    $roomArea.show();

                    // Move footer to correct position
                    document.getElementById('footer').style.position = 'relative';

                    // Show header buttons!
                    document.getElementById('chat-nav').style.display = 'block';
                    document.getElementById('about-nav').style.display = 'block';
                    document.getElementById('contact-nav').style.display = 'block';

                    // No longer using initarea
                    // var initStuff = document.getElementById("initArea")
                    // initStuff.innerHTML = ""

                    // This sets the room number on the client
                    if ($roomnum.val() != "") {
                        roomnum = $roomnum.val()
                    }

                    // Sets the invite link (roomnum)
                    // document.getElementById('invite').innerHTML = "vynchronize.herokuapp.com/" + roomnum
                    document.getElementById("inv_input").value = "vynchronize.herokuapp.com/" + roomnum
                    history.pushState('', 'Vynchronize', roomnum);

                }
            });
            // Join room
            socket.emit('new room', $roomnum.val(), function (data) {
                // This should only call back if the client is the host
                if (data) {
                    console.log("Host is syncing the new socket!")
                    syncVideo(roomnum)
                }
            });

            $username.val('');
        }
    });

    socket.on('get users', function (data) {
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += '<li style="padding-right: 10em;" class="list-group-item chat-users">' + data[i] + '</li>';
            // html += '<div class="well well-sm message-well">' + data[i] + '</div>';
            // <div class="well well-sm message-well"><strong>
        }

        $users.html(html)
    });

    // Updates the queue
    // Parameters - vidlist, currPlayer, videoId
    socket.on('get vidlist', function (data) {
        console.log("i am updating the queue")
        var yt = data.vidlist.yt
        var html = ''
        if (yt.length > 0) {
            for (i = 0; i < yt.length; i++) {
                html += '<li class="vid-item"><div class="thumb"><a href="javascript: removeAt(' + i + ')" class="ghost-button-full-color"><i class="far fa-times-circle"></i></a><a href="javascript: playAt(' + i +
                    ')"><img src="http://img.youtube.com/vi/' + yt[i].videoId + '/0.jpg"></a></div><a href="javascript: playAt(' + i + ')" class="desc">' + yt[i].title + '</a></li>'
            }
        } else {
            html += '<li class="vid-item"></li>'
        }

        $vidlist.html(html)
    });


    // Prevent special characters from being typed
    $('#roomnum').on('keypress', function (event) {
        var nosymbols = new RegExp("^[a-zA-Z0-9\s]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        console.log(key)
        console.log(event.keyCode)
        // Allow enters and spaces to be used still
        if ($roomnum.val().length > 50 || !nosymbols.test(key) && event.keyCode != 13 && event.keyCode != 32 && event.keyCode != 45 && event.keyCode != 95) {
            event.preventDefault();
            return false;
        }
    });

    // Prevent special characters from being typed
    $('#username').on('keypress', function (event) {
        var nosymbols = new RegExp("^[a-zA-Z0-9\s]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        // Allow enters and spaces to be used still
        if ($username.val().length > 30 || !nosymbols.test(key) && event.keyCode != 13 && event.keyCode != 32 && event.keyCode != 45 && event.keyCode != 95) {
            event.preventDefault();
            return false;
        }
    });

});

// Remove the video from the queue at idx
function removeAt(idx) {
    socket.emit('remove at', {
        idx: idx
    })
}

function playAt(idx) {
    socket.emit('play at', {
        idx: idx
    }, function (data) {
        var videoId = data.videoId

        // Change the video
        socket.emit('change video', {
            room: roomnum,
            videoId: videoId,
            time: 0
        })
    })
}

socket.on('set id', function (data) {
    if (data.id != "" && nosymbols.test(data.id)) {
        document.getElementById('roomnum').value = data.id
        console.log("You are joining room: " + data.id)
    }
    socket.emit('reset url')
});

function copyInvite() {
    var copyText = document.getElementById("inv_input");
    console.log(copyText)
    copyText.select();
    document.execCommand("Copy");
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied!";
}

function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

// Generate a random alphanumeric room id
function randomroom() {
    document.getElementById('roomnum').value = Math.random().toString(36).substr(2, 12)
}


browser.tabs.executeScript({
    // Bootstrap core JavaScript
    file: "/js/dependencies/jquery.min.js",
    file: "/js/dependencies/bootstrap.bundle.min.js",
    file: "/js/dependencies/scrolling-nav.js",
    file: "/js/dependencies/bootstrap-notify.min.js",
    // Plugin JavaScript
    file: "/js/dependencies/jquery.easing.min.js",
    // My JS files
    file: "/js/sync.js",
    file: "/js/player.js",
    file: "/js/host.js",
    file: "/js/events.js",
    file: "/js/notify.js",
    // Youtube
    file: "js/yt.js",
    // Daily Motion
    file: "https://api.dmcdn.net/all.js",
    file: "js/dm.js",
    // Vimeo
    file: "https://player.vimeo.com/api/player.js",
    file: "js/vimeo.js",
    // HTML5 Player
    file: "js/html5.js"

})