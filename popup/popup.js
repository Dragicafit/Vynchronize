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
                chrome.tabs.sendMessage(tab,
                    {
                        command: 'new user',
                        username: $username.val(),
                    });
                chrome.tabs.sendMessage(tab,
                    {
                        command: 'new room',
                        roomnum: $roomnum.val()
                    });
                $username.val('');
            }
        });

        chrome.runtime.onMessage.addListener(message => {
            if (message.command == 'send info') {
                console.log("get info");

                if (message.username) {
                    chrome.storage.local.set({ username: message.username });
                    document.getElementById("username").value = message.username;
                } else {
                    chrome.storage.local.get(['username'], item => {
                        if (item['username'] == null)
                            return;
                        document.getElementById("username").value = item['username'];
                    });
                }
                if (message.roomnum) {
                    roomnum = message.roomnum;
                    document.getElementById("roomnum").value = message.roomnum;
                }

            }
        });
        console.log("ask info");
        chrome.tabs.sendMessage(tab, {
            command: 'ask info'
        });
    });
}

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}

var listener = message => {
    if (message.command == 'scipt loaded') {
        console.log("scipt loaded");
        chrome.runtime.onMessage.removeListener(listener);
        chat();
    }
};
chrome.runtime.onMessage.addListener(listener);

chrome.tabs.query({
    currentWindow: true,
    active: true,
    url: "*://*.wakanim.tv/*"
}, tabs => {
    if (tabs.length == 0) {
        chrome.tabs.create({ url: "https://www.wakanim.tv/" }, injectScript);
    } else {
        injectScript(tabs[0]);
    }
});

function injectScript(tabId) {
    console.log(tabId);
    tab = tabId.id;
    chrome.tabs.executeScript(tab, {
        runAt: "document_end",
        file: "/js/listener.js"
    });
    chrome.runtime.sendMessage({
        command: 'createVideoClient',
        'tab': tab
    });
}