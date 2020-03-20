var roomnum = ""
var username = ""
var tab = ""

browser.runtime.onMessage.addListener((message, sender) => {
    if (message.command == 'changeVideoClient') {
        console.log("change video client")

        var tabId = sender.tab.id;
        if (tabId != tab)
            return;

        browser.tabs.update(tabId, { active: true, url: "https://www.wakanim.tv/" + message.location + "/v2/catalogue/reactivate/" + message.videoId }).then(_ => {
            insertScript(tabId);
        });
    } else if (message.command == 'createVideoClient') {
        console.log("create video client")
        tab = message.tab
    } else if (message.command == 'send info') {
        console.log("get info")

        if (message.username)
            username = message.username
        if (message.roomnum)
            roomnum = message.roomnum
    }
});

function sendInfo(tabId) {
    console.log("send info")
    browser.tabs.sendMessage(tabId,
        {
            command: 'new user',
            username: username,
        }).catch(reportError);
    browser.tabs.sendMessage(tabId,
        {
            command: 'new room',
            roomnum: roomnum
        }).catch(reportError);
}

function insertScript(tabId) {
    var listener = message => {
        if (message.command == 'scipt loaded') {
            console.log("scipt loaded");
            browser.runtime.onMessage.removeListener(listener);
            sendInfo(tabId);
        }
    };
    browser.runtime.onMessage.addListener(listener);

    console.log("executeScript")
    browser.tabs.executeScript(tabId, {
        runAt: "document_end",
        file: "/js/listener.js"
    })
        .catch(reportError);
}

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (tabId === tab && changeInfo.url) {
        console.log("updated")
        insertScript(tabId)
    }
}, { urls: ["*://*.wakanim.tv/*/episode/*"] });

function reportError(error) {
    console.error(`Could not beastify: ${error}`);
}