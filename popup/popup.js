var roomnum = 1
var id = "M7lc1UVf-VE"
var username = ""
// Don't allow trailing or leading whitespace!
var nosymbols = new RegExp("^(([a-zA-Z0-9_-][a-zA-Z0-9 _-]*[a-zA-Z0-9_-])|([a-zA-Z0-9_-]*))$");

// Chat stuff
function chat() {
    $(function () {
        var $roomArea = $('#roomArea');
        var $userFormArea = $('#userFormArea');
        var $userForm = $('#userForm');
        var $username = $('#username');
        var $roomnum = $('#roomnum');


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
                browser.tabs.query({
                    currentWindow: true,
                    active: true
                }).then(tabs => {
                    browser.tabs.sendMessage(tabs[0].id,
                        {
                            command: 'new user',
                            username: $username.val(),
                            roomnum: $roomnum.val()
                        }).then(_ => {
                            $userFormArea.hide();
                            $roomArea.show();

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
                        });
                }).catch(reportError);

                // Join room
                browser.tabs.query({
                    currentWindow: true,
                    active: true
                }).then(tabs => {
                    browser.tabs.sendMessage(tabs[0].id,
                        {
                            command: 'new room',
                            roomnum: $roomnum.val()
                        });
                }).catch(reportError);

                $username.val('');
            }
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
}

function copyInvite() {
    /* Get the text field */
    var copyText = document.getElementById("inv_input");
    console.log(copyText)
    /* Select the text field */
    copyText.select();
    /* Copy the text inside the text field */
    document.execCommand("Copy");
    /* Alert the copied text */
    // alert("Copied the text: " + copyText.value);
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

/**
 * Just log the error to the console.
 */
function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}

browser.tabs.executeScript({
    // Bootstrap core JavaScript
    file: "/js/dependencies/jquery.min.js",
})
    .then(_ => browser.tabs.executeScript({ file: "/js/dependencies/socket.io.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/dependencies/bootstrap.bundle.min.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/dependencies/scrolling-nav.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/dependencies/bootstrap-notify.min.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/dependencies/jquery.easing.min.js" }))
    .then(_ => browser.tabs.executeScript({ code: "var socket = io.connect(\"http://localhost:3000/\");" }))
    .then(_ => browser.tabs.executeScript({ code: "var host = false;" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/listener.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/sync.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/player.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/host.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/events.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/notify.js" }))
    //.then(_ => browser.tabs.executeScript({ file: "/js/yt.js" }))
    //.then(_ => browser.tabs.executeScript({ file: "/js/dm.js" }))
    //.then(_ => browser.tabs.executeScript({ file: "/js/vimeo.js" }))
    .then(_ => browser.tabs.executeScript({ file: "/js/html5.js" }))
    .then(chat)
    .catch(reportError);