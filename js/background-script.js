browser.runtime.onMessage.addListener((message, sender) => {
    if (message.command == 'changeVideoClient') {
        console.log("change video client")

        var tabId = sender.tab.id;

        browser.tabs.update(tabId, { active: true, url: "https://www.wakanim.tv/" + message.location + "/v2/catalogue/reactivate/" + message.videoId }).then(_ => {
            var listener = message => {
                if (message.command == 'scipt loaded') {
                    console.log("scipt loaded");
                    browser.runtime.onMessage.removeListener(listener);
                    sendInfo();
                }
            };
            browser.runtime.onMessage.addListener(listener);

            console.log("executeScript")
            browser.tabs.executeScript(tabId, {
                runAt: "document_end", file: "/js/listener.js"
            })
                .catch(reportError);
        });

        function sendInfo() {
            console.log("send info")
            browser.tabs.sendMessage(tabId,
                {
                    command: 'new user',
                    username: message.username,
                }).catch(reportError);
            browser.tabs.sendMessage(tabId,
                {
                    command: 'new room',
                    roomnum: message.roomnum
                }).catch(reportError);
        }
    }
});

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}

browser.tabs.onUpdated.addListener()