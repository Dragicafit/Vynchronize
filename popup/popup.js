var roomnum = "";
var tab;
var nosymbols = /^[\w-]+$/;

function chat() {
    $(function () {
        var $roomArea = $('#roomArea');
        var $userFormArea = $('#userFormArea');
        var $userForm = $('#userForm');
        var $username = $('#username');
        var $roomnum = $('#roomnum');

        $userForm.submit(function (e) {
            e.preventDefault();
            if ($username.val() == "") {
                console.log("ENTER A NAME");
                var noname = document.getElementById('missinginfo');
                noname.innerHTML = "Surely you have a name right? Enter it below!";
            }
            else if ($username.val().length > 30) {
                console.log("NAME IS TOO LONG");
                var noname = document.getElementById('missinginfo');
                noname.innerHTML = "Your name can't possibly be over 30 characters!";
            }
            else if ($roomnum.val().length > 50) {
                console.log("ROOM NAME IS TOO LONG");
                var noname = document.getElementById('missinginfo');
                noname.innerHTML = "How are you going to remember a room code that has more than 50 characters?";
            }
            else if (!nosymbols.test($roomnum.val())) {
                console.log("ENTER A PROPER ROOMNUMBER");
                var noname = document.getElementById('missinginfo');
                noname.innerHTML = "";
                var noname2 = document.getElementById('missinginfo2');
                noname2.innerHTML = "Please enter a room ID without symbols or leading/trailing whitespace!";
            } else {
                browser.tabs.sendMessage(tab,
                    {
                        command: 'new user',
                        username: $username.val(),
                    });
                browser.tabs.sendMessage(tab,
                    {
                        command: 'new room',
                        roomnum: $roomnum.val()
                    });
                $username.val('');
            }
        });


        $('#roomnum').on('keypress', function (event) {
            var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            console.log(key);
            console.log(event.keyCode);
            
            if ($roomnum.val().length > 50 || !nosymbols.test(key) && event.keyCode != 13 && event.keyCode != 32 && event.keyCode != 45 && event.keyCode != 95) {
                event.preventDefault();
                return false;
            }
        });

        $('#username').on('keypress', function (event) {
            var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            if ($username.val().length > 30 || !nosymbols.test(key) && event.keyCode != 13 && event.keyCode != 32 && event.keyCode != 45 && event.keyCode != 95) {
                event.preventDefault();
                return false;
            }
        });

        browser.runtime.onMessage.addListener(message => {
            if (message.command == 'send info') {
                console.log("get info");

                if (message.username)
                    browser.storage.local.set({ username: message.username });
                if (message.roomnum)
                    roomnum = message.roomnum;

                document.getElementById("inv_input").value = "vynchronize.herokuapp.com/" + roomnum;
            }
        });
        console.log("ask info");
        browser.tabs.sendMessage(tab, {
            command: 'ask info'
        });
    });
}

function copyInvite() {
    var copyText = document.getElementById("inv_input");
    console.log(copyText);
    copyText.select();
    document.execCommand("Copy");
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied!";
}

function outFunc() {
    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copy to clipboard";
}

function randomroom() {
    document.getElementById('roomnum').value = Math.random().toString(36).substr(2, 12);
}

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}

var listener = message => {
    if (message.command == 'scipt loaded') {
        console.log("scipt loaded");
        browser.runtime.onMessage.removeListener(listener);
        chat();
    }
};
browser.runtime.onMessage.addListener(listener);

browser.tabs.query({
    currentWindow: true,
    active: true,
    url: "*://*.wakanim.tv/*"
}).then(tabs => {
    if (tabs.length == 0) {
        browser.tabs.create({ url: "https://www.wakanim.tv/" }).then(injectScript);
    } else {
        injectScript(tabs[0]);
    }
});

function injectScript(tabId) {
    console.log(tabId);
    tab = tabId.id;
    browser.tabs.executeScript(tab, {
        runAt: "document_end",
        file: "/js/listener.js"
    })
        .catch(reportError);
    browser.runtime.sendMessage({
        command: 'createVideoClient',
        'tab': tab
    });
}