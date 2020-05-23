var roomnum = "";
var tab;
var nosymbols = /^[\w-]{5,30}$/;

function chat() {
    $(function () {
        var $userForm = $('#userForm');
        var $username = $('#username');
        var $roomnum = $('#roomnum');

        function check() {
            this.setCustomValidity('');

            var value = $(this).val();

            if (value == "") {
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

        $username.on("input", check);
        $roomnum.on("input", check);

        $userForm.submit((e) => {
            e.preventDefault();

            var newUser = $username.val();
            var newRoom = $roomnum.val();

            if (!nosymbols.test(newUser)) {
                console.log("ENTER A PROPER NAME");
                return;
            }
            if (!nosymbols.test(newRoom)) {
                console.log("ENTER A PROPER ROOM");
                return;
            }
            browser.tabs.sendMessage(tab, {
                command: 'joinRoom',
                roomnum: newRoom,
                username: newUser
            });
        });

        browser.runtime.onMessage.addListener(message => {
            if (message.command == 'send info') {
                console.log("get info");

                if (message.username) {
                    browser.storage.local.set({ username: message.username });
                    document.getElementById("username").value = message.username;
                } else {
                    browser.storage.local.get('username').then(item => {
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
        browser.tabs.sendMessage(tab, {
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
    }).catch(reportError);
    browser.runtime.sendMessage({
        command: 'createVideoClient',
        'tab': tab
    });
}