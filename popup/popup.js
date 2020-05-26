var roomnum = "";
var tab;
var regexUsername = /^[\w-]{5,30}$/;
var regexRoom = /^[\w-]{1,30}$/;

function chat() {
    $(function () {
        var $userForm = $('#userForm');
        var $username = $('#username');
        var $roomnum = $('#roomnum');

        function check(nosymbols) {
            this.setCustomValidity('');

            var value = $(this).val();

            if (value === "") {
                this.setCustomValidity('Enter a value');
                return;
            }
            if (value.length > 30) {
                this.setCustomValidity("30 characters max");
                return;
            }
            if (value.length < 5) {
                this.setCustomValidity("5 characters min");
                return;
            }
            if (!nosymbols.test(value)) {
                this.setCustomValidity("0-9, a-Z and - only");
                return;
            }
        }

        $username.on("input", _ => check(regexUsername));
        $roomnum.on("input", _ => check(regexRoom));

        $userForm.submit((e) => {
            e.preventDefault();

            var newUser = $username.val();
            var newRoom = $roomnum.val();

            if (!regexUsername.test(newUser)) {
                console.log("ENTER A PROPER NAME");
                return;
            }
            if (!regexRoom.test(newRoom)) {
                console.log("ENTER A PROPER ROOM");
                return;
            }
            chrome.tabs.sendMessage(tab, {
                command: 'joinRoom',
                roomnum: newRoom,
                username: newUser
            });
        });

        chrome.runtime.onMessage.addListener(message => {
            if (message.command === 'send info') {
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
    if (message.command === 'scipt loaded') {
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
    if (tabs.length === 0) {
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